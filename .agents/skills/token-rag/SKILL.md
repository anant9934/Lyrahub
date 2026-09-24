---
name: token-rag
description: Minimizes tokens in RAG pipelines while maximizing retrieval
  quality. Use when designing or tuning RAG for resumes, projects, or
  course content.
---

# RAG Token Optimization

## When to use
- Designing RAG pipeline.
- Retrieval returning too many tokens.
- Quality regression in RAG answers.
- Cost spike from RAG.

## Pipeline Optimization

```
Query → Pre-filter → Vector Search (top-20) → Rerank (top-5) → LLM
```

| Step | Default | Optimized | Saving |
|------|---------|-----------|--------|
| Chunk size | 1000 | 400 | 60% |
| Chunk overlap | 20% | 10% | 10% |
| Top-K | 20 | 5 | 75% |
| Rerank | No | Yes | 50% |
| Metadata filter | No | Yes | 40% |
| Hybrid search | No | Yes | 30% |

## Chunking Rules
- 300–500 tokens per chunk.
- 10% overlap (not 20%).
- Split on semantic boundaries (paragraphs, sections).
- Store metadata: owner_id, department, year, type.

## Retrieval Rules
1. Pre-filter by metadata (department, year) before vector search.
2. Retrieve top-20 candidates.
3. Rerank with cross-encoder to top-5.
4. Send only top-5 chunks to LLM.
5. Include chunk source for citations.

## Embedding Rules
1. BGE-small (768 dims) — not BGE-large.
2. Cache embeddings by content hash.
3. Batch embeddings nightly.
4. Never re-embed unchanged text.
5. Store embeddings in pgvector with HNSW index.

## Query Optimization
1. Rewrite query with synonyms for better recall.
2. Expand abbreviations.
3. Use hybrid search (BM25 + vector).
4. Cache results by query hash.

## Target Metrics
| Metric | Target |
|--------|--------|
| Tokens per retrieval | <2000 |
| Retrieval latency | <500ms |
| Hit rate | >80% |
| Precision@5 | >70% |

## Anti-Patterns
- ❌ Full-document injection
- ❌ Top-K = 20 sent to LLM
- ❌ No reranking
- ❌ No metadata filtering
- ❌ Large chunks
