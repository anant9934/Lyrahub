"""
AIDA AI module.

Phase 5 components:
  - intent_router: 7-level hybrid routing (deterministic → OKF → RAG → local LLM → cloud)
  - quota: Redis-based atomic cloud quota enforcement
  - provider_router: cloud LLM provider fallback chain
  - rag_service: pgvector document retrieval
  - okf_engine: OKF knowledge document retrieval
  - model_registry: model configuration registry
  - providers/: Ollama + future provider abstractions
"""

BROWSER_SLM_SIGNAL = "__BROWSER_SLM__"
CLOUD_REQUIRED_SIGNAL = "__CLOUD_REQUIRED__"
