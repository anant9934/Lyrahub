"""
OKF (Organized Knowledge Framework) — lightweight knowledge retrieval.

The OKF sits BEFORE RAG in the pipeline. It answers:
  "Is there a known knowledge document for this query?"

Pipeline:
  query → SLM intent extract → OKF tag match → candidate docs → permission filter → return

This avoids RAG/embedding overhead for static institutional knowledge.

Documents are Markdown files with YAML frontmatter stored in /knowledge/.
"""

from __future__ import annotations

import hashlib
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import yaml

# Knowledge base root — relative to repo root
_REPO_ROOT = Path(__file__).resolve().parents[4]
_KNOWLEDGE_DIR = _REPO_ROOT / "knowledge"

# Fallback for deployment contexts
if not _KNOWLEDGE_DIR.exists():
    _KNOWLEDGE_DIR = Path(os.getenv("KNOWLEDGE_BASE_PATH", "/app/knowledge"))


@dataclass
class KnowledgeDoc:
    doc_id: str
    title: str
    category: str
    tags: list[str]
    summary: str
    access_scope: str          # public | student:own | faculty:department | hod:department | admin:global
    updated_at: str
    content_hash: str
    file_path: str
    content: str               # Full content for context injection

    def is_accessible(self, role: str) -> bool:
        """Check if the document is accessible for the given role."""
        scope = self.access_scope.lower()
        if scope == "public":
            return True
        role_l = role.lower()
        if scope == "admin:global" and role_l in ("admin", "super_admin"):
            return True
        if scope.startswith("hod:") and role_l in ("hod", "cos", "hos", "admin", "super_admin"):
            return True
        if scope.startswith("faculty:") and role_l in ("faculty", "teacher", "hod", "cos", "hos", "admin", "super_admin"):
            return True
        if scope.startswith("student:") and role_l != "alumni":
            return True
        return False


class OKFEngine:
    """
    Loads all knowledge documents from the knowledge/ directory and
    provides fast tag/category-based retrieval.

    Documents are loaded once on first access (lazy), then cached.
    """

    def __init__(self) -> None:
        self._docs: list[KnowledgeDoc] | None = None

    def _load_docs(self) -> list[KnowledgeDoc]:
        """Load and parse all Markdown files in the knowledge directory."""
        docs: list[KnowledgeDoc] = []
        if not _KNOWLEDGE_DIR.exists():
            return docs

        for md_file in _KNOWLEDGE_DIR.rglob("*.md"):
            if md_file.name == "index.md":
                continue
            try:
                raw = md_file.read_text(encoding="utf-8")
                meta, content = _parse_frontmatter(raw)
                if not meta:
                    continue

                # Generate deterministic doc_id from relative path
                rel = str(md_file.relative_to(_KNOWLEDGE_DIR))
                doc_id = rel.replace("/", ":").replace(".md", "")
                content_hash = hashlib.sha256(raw.encode()).hexdigest()[:16]

                # Extract first non-blank line as summary if not in frontmatter
                summary = meta.get("summary", "")
                if not summary:
                    for line in content.splitlines():
                        line = line.strip().lstrip("#").strip()
                        if line and not line.startswith("|") and not line.startswith("-"):
                            summary = line[:200]
                            break

                docs.append(KnowledgeDoc(
                    doc_id=doc_id,
                    title=meta.get("title", doc_id),
                    category=meta.get("category", "general"),
                    tags=meta.get("tags", []),
                    summary=summary,
                    access_scope=meta.get("access_scope", "public"),
                    updated_at=str(meta.get("updated_at", "")),
                    content_hash=content_hash,
                    file_path=str(md_file),
                    content=content,
                ))
            except Exception:
                continue

        return docs

    def get_all(self) -> list[KnowledgeDoc]:
        if self._docs is None:
            self._docs = self._load_docs()
        return self._docs

    def reload(self) -> None:
        """Force reload from disk — call when knowledge files change."""
        self._docs = None

    def search(
        self,
        query: str,
        role: str,
        max_results: int = 5,
    ) -> list[KnowledgeDoc]:
        """
        Find relevant knowledge documents for a query.

        Scoring:
          - Category match from query: +3
          - Tag match per tag: +2
          - Keyword match in title/summary: +1

        Returns top N docs after permission filtering.
        """
        query_tokens = set(re.sub(r"[^a-z0-9 ]", " ", query.lower()).split())
        scored: list[tuple[float, KnowledgeDoc]] = []

        for doc in self.get_all():
            if not doc.is_accessible(role):
                continue

            score = 0.0
            doc_tags_lower = [t.lower() for t in doc.tags]
            doc_title_lower = doc.title.lower()
            doc_summary_lower = doc.summary.lower()
            category_lower = doc.category.lower()

            # Category match
            if category_lower in query_tokens:
                score += 3.0

            # Tag overlap
            for tag in doc_tags_lower:
                if tag in query_tokens or any(t in tag for t in query_tokens if len(t) > 3):
                    score += 2.0

            # Title/summary keyword match
            for token in query_tokens:
                if len(token) < 3:
                    continue
                if token in doc_title_lower or token in doc_summary_lower:
                    score += 1.0

            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:max_results]]

    def get_by_category(self, category: str, role: str) -> list[KnowledgeDoc]:
        return [d for d in self.get_all() if d.category == category and d.is_accessible(role)]

    def get_by_id(self, doc_id: str, role: str) -> Optional[KnowledgeDoc]:
        for doc in self.get_all():
            if doc.doc_id == doc_id and doc.is_accessible(role):
                return doc
        return None

    def build_context(
        self,
        docs: list[KnowledgeDoc],
        max_chars: int = 4000,
    ) -> str:
        """
        Build a compact context string from retrieved docs to inject into a prompt.
        Respects max_chars budget — always includes title + truncated content.
        """
        parts: list[str] = []
        budget = max_chars
        for doc in docs:
            header = f"--- [{doc.category.upper()}] {doc.title} ---\n"
            content_budget = budget - len(header)
            if content_budget < 100:
                break
            content_snippet = doc.content[:content_budget].strip()
            chunk = header + content_snippet + "\n\n"
            parts.append(chunk)
            budget -= len(chunk)
            if budget < 100:
                break
        return "".join(parts)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _parse_frontmatter(raw: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from a Markdown string. Returns (meta, content)."""
    if not raw.startswith("---"):
        return {}, raw
    end = raw.find("---", 3)
    if end == -1:
        return {}, raw
    fm_str = raw[3:end].strip()
    content = raw[end + 3:].strip()
    try:
        meta = yaml.safe_load(fm_str) or {}
    except yaml.YAMLError:
        meta = {}
        for line in fm_str.splitlines():
            if ":" in line and not line.strip().startswith("-"):
                k, _, v = line.partition(":")
                meta[k.strip()] = v.strip().strip("\"'")
    return meta, content


# ── Module-level singleton ─────────────────────────────────────────────────────

_okf_engine: OKFEngine | None = None


def get_okf_engine() -> OKFEngine:
    global _okf_engine
    if _okf_engine is None:
        _okf_engine = OKFEngine()
    return _okf_engine
