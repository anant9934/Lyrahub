"""
RAG Service — pgvector-backed document retrieval.

Pipeline:
  query
    → embed query (Ollama nomic-embed-text)
    → pgvector cosine similarity search
    → permission filter
    → metadata filter (category, tags)
    → rerank top K
    → return chunks with sources

Design:
  - Never uses RAG for structured queries (CGPA, counts, rankings) — that's SQL
  - Only used for unstructured content (documents, reports, policies, bios)
  - Embedding cache: if content_hash unchanged, reuse existing embedding
  - Permission filter always applied BEFORE returning results to LLM
"""

from __future__ import annotations

import hashlib
import re
import time
from typing import Optional

from sqlalchemy import text, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeDocument, KnowledgeChunk
from app.modules.ai.providers.ollama_provider import get_ollama_provider

# Embedding dimension for nomic-embed-text
_EMBED_DIM = 768
_DEFAULT_TOP_K = 20
_RERANK_TOP_N = 5
_CHUNK_SIZE = 400          # tokens (approx 300-500 target)
_CHUNK_OVERLAP = 40        # tokens (~10% overlap)
_EMBED_MODEL = "nomic-embed-text"


# ─── Text Chunking ─────────────────────────────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """Approximate token count: ~4 chars per token."""
    return max(1, len(text) // 4)


def _chunk_text(text: str, chunk_size: int = _CHUNK_SIZE, overlap: int = _CHUNK_OVERLAP) -> list[str]:
    """
    Semantic-boundary chunking. Prefers paragraph breaks, then sentence breaks,
    then falls back to word boundaries.

    Args:
        text: input text
        chunk_size: target size in tokens (~4 chars/token)
        overlap: overlap tokens between chunks
    """
    # Convert tokens to chars
    chars_per_chunk = chunk_size * 4
    overlap_chars = overlap * 4

    # Split into paragraphs first
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for para in paragraphs:
        para_len = len(para)
        if current_len + para_len > chars_per_chunk and current:
            chunk_text = "\n\n".join(current)
            chunks.append(chunk_text)
            # Overlap: keep last paragraph(s) that fit in overlap window
            overlap_text = ""
            for p in reversed(current):
                if len(overlap_text) + len(p) < overlap_chars:
                    overlap_text = p + "\n\n" + overlap_text
                else:
                    break
            current = [overlap_text.strip()] if overlap_text.strip() else []
            current_len = len(overlap_text)

        current.append(para)
        current_len += para_len

    if current:
        chunks.append("\n\n".join(current))

    # Ensure no empty chunks
    return [c for c in chunks if c.strip()]


def _content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


# ─── Embedding ─────────────────────────────────────────────────────────────────

async def _embed_text(text: str) -> Optional[list[float]]:
    """
    Generate embedding via Ollama. Returns None if Ollama unavailable.
    """
    try:
        provider = get_ollama_provider()
        if not await provider.is_available():
            return None
        return await provider.embed(_EMBED_MODEL, text)
    except Exception:
        return None


# ─── Document Indexing ─────────────────────────────────────────────────────────

async def index_document(
    db: AsyncSession,
    title: str,
    content: str,
    category: str,
    source_type: str,
    access_scope: str = "public",
    source_path: Optional[str] = None,
    uploader_id=None,
    tags: Optional[list[str]] = None,
    metadata: Optional[dict] = None,
) -> dict:
    """
    Index a document into the RAG store.

    Pipeline:
      1. Hash content (dedup check)
      2. Create/update KnowledgeDocument record
      3. Chunk text
      4. For each chunk: hash → check existing → embed → store

    Returns status dict.
    """
    import uuid as _uuid

    doc_hash = _content_hash(content)

    # 1. Deduplication check
    existing_stmt = select(KnowledgeDocument).where(KnowledgeDocument.content_hash == doc_hash)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        return {
            "status": "duplicate",
            "document_id": str(existing.id),
            "message": "Document already indexed (content hash match).",
        }

    # 2. Create document record
    doc = KnowledgeDocument(
        title=title,
        category=category,
        source_type=source_type,
        source_path=source_path,
        access_scope=access_scope,
        content_hash=doc_hash,
        token_estimate=_estimate_tokens(content),
        embedding_model=_EMBED_MODEL,
        embedding_version="1",
        indexing_status="pending",
        uploader_id=uploader_id,
        tags=tags,
        meta_data=metadata,
    )
    db.add(doc)
    await db.flush()  # Get ID without committing

    # 3. Chunk and embed
    chunks = _chunk_text(content)
    embedded_count = 0
    ollama = get_ollama_provider()
    ollama_ok = await ollama.is_available()

    for idx, chunk_content in enumerate(chunks):
        chunk_hash = _content_hash(chunk_content)

        # Check if this exact chunk already exists (shared content)
        existing_chunk = (await db.execute(
            select(KnowledgeChunk).where(KnowledgeChunk.content_hash == chunk_hash)
        )).scalar_one_or_none()

        if existing_chunk:
            # Reuse embedding — just create link
            chunk = KnowledgeChunk(
                document_id=doc.id,
                chunk_index=idx,
                content=chunk_content,
                token_estimate=_estimate_tokens(chunk_content),
                content_hash=chunk_hash,
                embedding_model=_EMBED_MODEL,
                embedding_version="1",
                embedding_json=existing_chunk.embedding_json,
            )
        else:
            embedding = None
            embedding_json = None
            if ollama_ok:
                try:
                    embedding = await ollama.embed(_EMBED_MODEL, chunk_content)
                    embedding_json = embedding
                    embedded_count += 1
                except Exception:
                    pass

            chunk = KnowledgeChunk(
                document_id=doc.id,
                chunk_index=idx,
                content=chunk_content,
                token_estimate=_estimate_tokens(chunk_content),
                content_hash=chunk_hash,
                embedding_model=_EMBED_MODEL,
                embedding_version="1",
                embedding_json=embedding_json,
            )

        db.add(chunk)

    # 4. Update document status
    doc.chunk_count = len(chunks)
    doc.indexing_status = "indexed" if embedded_count > 0 or not ollama_ok else "indexed_no_embedding"

    # Store embeddings in pgvector column via raw SQL (avoids pgvector Python dep at import time)
    await db.commit()

    # Update pgvector embedding column for chunks that have embedding_json
    if ollama_ok and embedded_count > 0:
        try:
            await db.execute(text("""
                UPDATE knowledge_chunks
                SET embedding = embedding_json::text::vector
                WHERE document_id = :doc_id AND embedding_json IS NOT NULL AND embedding IS NULL
            """), {"doc_id": str(doc.id)})
            await db.commit()
        except Exception:
            pass  # pgvector may not be available in all environments

    return {
        "status": "indexed",
        "document_id": str(doc.id),
        "chunks": len(chunks),
        "embedded": embedded_count,
        "message": f"Indexed {len(chunks)} chunks, {embedded_count} with embeddings.",
    }


# ─── RAG Retrieval ─────────────────────────────────────────────────────────────

async def retrieve_chunks(
    db: AsyncSession,
    query: str,
    role: str,
    category: Optional[str] = None,
    top_k: int = _DEFAULT_TOP_K,
    rerank_n: int = _RERANK_TOP_N,
) -> list[dict]:
    """
    Retrieve relevant chunks for a query using hybrid search:
      1. Vector similarity (pgvector cosine) — requires Ollama embedding
      2. Keyword/lexical fallback — if embedding unavailable

    Permission filtering applied BEFORE returning results.

    Returns list of {content, title, category, doc_id, chunk_index, score, source}
    """
    # Permission scopes accessible by role
    accessible_scopes = _get_accessible_scopes(role)

    # Try vector search first
    query_embedding = await _embed_text(query)
    chunks: list[dict] = []

    if query_embedding:
        chunks = await _vector_search(db, query_embedding, accessible_scopes, category, top_k)

    if not chunks:
        # Fallback: keyword search
        chunks = await _keyword_search(db, query, accessible_scopes, category, top_k)

    # Rerank: simple relevance score (could be improved with cross-encoder)
    chunks = _rerank(chunks, query, rerank_n)
    return chunks


async def _vector_search(
    db: AsyncSession,
    query_embedding: list[float],
    accessible_scopes: list[str],
    category: Optional[str],
    top_k: int,
) -> list[dict]:
    """pgvector cosine similarity search."""
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    scope_clause = "AND kd.access_scope = ANY(:scopes)" if accessible_scopes else ""
    cat_clause = "AND kd.category = :category" if category else ""

    sql = f"""
        SELECT
            kc.id,
            kc.content,
            kc.chunk_index,
            kd.title,
            kd.category,
            kd.id as doc_id,
            kd.access_scope,
            1 - (kc.embedding <=> :embedding::vector) AS score
        FROM knowledge_chunks kc
        JOIN knowledge_documents kd ON kc.document_id = kd.id
        WHERE kc.embedding IS NOT NULL
            AND kd.indexing_status IN ('indexed', 'indexed_no_embedding')
            {scope_clause}
            {cat_clause}
        ORDER BY kc.embedding <=> :embedding::vector
        LIMIT :top_k
    """
    params: dict = {"embedding": embedding_str, "top_k": top_k}
    if accessible_scopes:
        params["scopes"] = accessible_scopes
    if category:
        params["category"] = category

    try:
        result = await db.execute(text(sql), params)
        rows = result.mappings().all()
        return [dict(r) for r in rows]
    except Exception:
        return []


async def _keyword_search(
    db: AsyncSession,
    query: str,
    accessible_scopes: list[str],
    category: Optional[str],
    top_k: int,
) -> list[dict]:
    """PostgreSQL full-text keyword search fallback."""
    tokens = " | ".join(
        re.sub(r"[^a-zA-Z0-9]", " ", query).split()[:8]
    )
    if not tokens:
        return []

    scope_clause = "AND kd.access_scope = ANY(:scopes)" if accessible_scopes else ""
    cat_clause = "AND kd.category = :category" if category else ""

    sql = f"""
        SELECT
            kc.id,
            kc.content,
            kc.chunk_index,
            kd.title,
            kd.category,
            kd.id as doc_id,
            kd.access_scope,
            ts_rank(to_tsvector('english', kc.content), to_tsquery('english', :tokens)) AS score
        FROM knowledge_chunks kc
        JOIN knowledge_documents kd ON kc.document_id = kd.id
        WHERE to_tsvector('english', kc.content) @@ to_tsquery('english', :tokens)
            AND kd.indexing_status IN ('indexed', 'indexed_no_embedding')
            {scope_clause}
            {cat_clause}
        ORDER BY score DESC
        LIMIT :top_k
    """
    params: dict = {"tokens": tokens, "top_k": top_k}
    if accessible_scopes:
        params["scopes"] = accessible_scopes
    if category:
        params["category"] = category

    try:
        result = await db.execute(text(sql), params)
        rows = result.mappings().all()
        return [dict(r) for r in rows]
    except Exception:
        return []


def _rerank(chunks: list[dict], query: str, n: int) -> list[dict]:
    """
    Simple lexical reranker — boosts chunks with more query word overlap.
    In production, replace with a cross-encoder reranker.
    """
    query_words = set(re.sub(r"[^a-z0-9]", " ", query.lower()).split())
    for chunk in chunks:
        content_words = set(re.sub(r"[^a-z0-9]", " ", chunk["content"].lower()).split())
        overlap = len(query_words & content_words)
        chunk["rerank_score"] = float(chunk.get("score", 0)) + overlap * 0.05

    chunks.sort(key=lambda x: x["rerank_score"], reverse=True)
    return chunks[:n]


def _get_accessible_scopes(role: str) -> list[str]:
    """Returns the list of access scopes accessible to this role."""
    role_l = role.lower()
    if role_l in ("admin", "super_admin"):
        return []  # Empty = all scopes (no filter in SQL)
    if role_l in ("hod", "cos", "hos"):
        return ["public", "student:own", "faculty:department", "hod:department"]
    if role_l in ("faculty", "teacher"):
        return ["public", "student:own", "faculty:department"]
    # student, alumni
    return ["public", "student:own"]


def format_sources(chunks: list[dict]) -> list[dict]:
    """Format chunk results as source citations for the AIDA response."""
    seen_docs: set[str] = set()
    sources: list[dict] = []
    for c in chunks:
        doc_id = str(c.get("doc_id", ""))
        if doc_id not in seen_docs:
            seen_docs.add(doc_id)
            sources.append({
                "document_id": doc_id,
                "title": c.get("title", "Unknown"),
                "category": c.get("category", ""),
                "chunk_index": c.get("chunk_index"),
            })
    return sources


def build_rag_context(chunks: list[dict], max_chars: int = 3000) -> str:
    """Build context string from retrieved chunks for LLM injection."""
    parts: list[str] = []
    budget = max_chars
    for i, chunk in enumerate(chunks):
        header = f"[Source {i+1}: {chunk.get('title', 'Document')}]\n"
        content = chunk.get("content", "")
        if len(header) + len(content) > budget:
            content = content[:budget - len(header) - 3] + "..."
        part = header + content + "\n\n"
        parts.append(part)
        budget -= len(part)
        if budget < 100:
            break
    return "".join(parts)
