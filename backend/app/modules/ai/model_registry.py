"""
AIDA Model Registry — single source of truth for all AI models.

Each model entry declares its provider, type, capabilities, and configuration.
The router selects the lowest-cost capable model for each request.

Registry is CONFIGURATION — never hardcode model names in routing logic.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


class ModelType(str, Enum):
    SLM = "slm"                   # Small routing/classification model
    EMBEDDING = "embedding"        # Vector embedding model
    LOCAL_LLM = "local_llm"       # Local generative model (Ollama)
    CLOUD_LLM = "cloud_llm"       # External cloud provider


class Provider(str, Enum):
    PATTERN = "pattern"            # Pure regex/rule-based (free, always available)
    OLLAMA = "ollama"              # Local Ollama
    TRANSFORMERS = "transformers"  # Browser / server transformers (future)
    GROQ = "groq"
    CEREBRAS = "cerebras"
    GEMINI = "gemini"
    OPENROUTER = "openrouter"
    MISTRAL = "mistral"
    SAMBANOVA = "sambanova"


class Capability(str, Enum):
    INTENT = "intent"                  # Intent classification
    EXTRACTION = "extraction"          # Entity extraction
    CLASSIFICATION = "classification"  # Text classification
    ROUTING = "routing"                # Query routing decisions
    SUMMARIZATION = "summarization"    # Summarize text
    REASONING = "reasoning"           # Multi-step reasoning
    STRUCTURED_OUTPUT = "structured_output"  # JSON / structured output
    RAG_SYNTHESIS = "rag_synthesis"    # Synthesize RAG results
    CODING = "coding"
    MATH = "math"


@dataclass
class ModelEntry:
    model_id: str
    provider: Provider
    model_type: ModelType
    capabilities: list[Capability]
    context_length: int
    quantization: Optional[str] = None
    enabled: bool = True
    priority: int = 0               # Lower = higher priority
    description: str = ""

    def has_capability(self, cap: Capability) -> bool:
        return cap in self.capabilities


# ─── Registry ─────────────────────────────────────────────────────────────────

_REGISTRY: list[ModelEntry] = [

    # ── Pattern Router (always available, zero cost) ─────────────────────────
    ModelEntry(
        model_id="pattern-router-v1",
        provider=Provider.PATTERN,
        model_type=ModelType.SLM,
        capabilities=[Capability.INTENT, Capability.ROUTING, Capability.EXTRACTION],
        context_length=0,
        enabled=True,
        priority=0,
        description="Regex + rule-based intent router. Always available.",
    ),

    # ── Local LLM: Ollama qwen2.5:1.5b-instruct-q4_K_M (1.5B Q4) ────────────
    # Small, fast instruct model. Low RAM. Handles classification + light synthesis.
    ModelEntry(
        model_id="qwen2.5:1.5b-instruct-q4_K_M",
        provider=Provider.OLLAMA,
        model_type=ModelType.LOCAL_LLM,
        capabilities=[
            Capability.INTENT,
            Capability.EXTRACTION,
            Capability.CLASSIFICATION,
            Capability.ROUTING,
            Capability.STRUCTURED_OUTPUT,
            Capability.SUMMARIZATION,
        ],
        context_length=8192,
        quantization="Q4_K_M",
        enabled=True,
        priority=10,
        description="Qwen2.5 1.5B Q4 via Ollama. Primary local SLM for routing and synthesis.",
    ),

    # ── Local LLM: Ollama phi3.5:3.8b-mini-instruct-q4_K_M (3.8B Q4) ────────
    # Microsoft Phi-3.5 mini — excellent for reasoning/RAG synthesis at 3.8B.
    ModelEntry(
        model_id="phi3.5:3.8b-mini-instruct-q4_K_M",
        provider=Provider.OLLAMA,
        model_type=ModelType.LOCAL_LLM,
        capabilities=[
            Capability.INTENT,
            Capability.EXTRACTION,
            Capability.CLASSIFICATION,
            Capability.ROUTING,
            Capability.STRUCTURED_OUTPUT,
            Capability.SUMMARIZATION,
            Capability.REASONING,
            Capability.RAG_SYNTHESIS,
        ],
        context_length=128000,
        quantization="Q4_K_M",
        enabled=True,
        priority=20,
        description="Phi-3.5 Mini 3.8B Q4 via Ollama. Secondary local LLM for RAG synthesis.",
    ),

    # ── Embedding model: nomic-embed-text (Ollama) ────────────────────────────
    ModelEntry(
        model_id="nomic-embed-text",
        provider=Provider.OLLAMA,
        model_type=ModelType.EMBEDDING,
        capabilities=[],
        context_length=8192,
        enabled=True,
        priority=0,
        description="Nomic Embed Text via Ollama. 768-dim embeddings for pgvector RAG.",
    ),

    # ── Cloud LLMs (fallback only) ────────────────────────────────────────────
    ModelEntry(
        model_id="llama-3.1-8b-instant",
        provider=Provider.GROQ,
        model_type=ModelType.CLOUD_LLM,
        capabilities=[
            Capability.REASONING, Capability.SUMMARIZATION, Capability.RAG_SYNTHESIS,
            Capability.STRUCTURED_OUTPUT, Capability.CODING,
        ],
        context_length=131072,
        enabled=True,
        priority=100,
        description="Groq Llama 3.1 8B — fast cloud fallback.",
    ),
    ModelEntry(
        model_id="llama3.1-8b",
        provider=Provider.CEREBRAS,
        model_type=ModelType.CLOUD_LLM,
        capabilities=[
            Capability.REASONING, Capability.SUMMARIZATION, Capability.RAG_SYNTHESIS,
        ],
        context_length=8192,
        enabled=True,
        priority=101,
        description="Cerebras Llama 3.1 8B — very fast cloud fallback.",
    ),
    ModelEntry(
        model_id="gemini-1.5-flash",
        provider=Provider.GEMINI,
        model_type=ModelType.CLOUD_LLM,
        capabilities=[
            Capability.REASONING, Capability.SUMMARIZATION, Capability.RAG_SYNTHESIS,
            Capability.STRUCTURED_OUTPUT, Capability.CODING, Capability.MATH,
        ],
        context_length=1000000,
        enabled=True,
        priority=102,
        description="Google Gemini 1.5 Flash — cloud fallback with large context.",
    ),
]


def get_registry() -> list[ModelEntry]:
    """Returns all enabled models in priority order."""
    return sorted([m for m in _REGISTRY if m.enabled], key=lambda m: m.priority)


def get_models_by_type(model_type: ModelType) -> list[ModelEntry]:
    return [m for m in get_registry() if m.model_type == model_type]


def get_models_by_provider(provider: Provider) -> list[ModelEntry]:
    return [m for m in get_registry() if m.provider == provider]


def get_primary_local_llm() -> Optional[ModelEntry]:
    """Returns the highest-priority available local LLM."""
    locals_llms = get_models_by_type(ModelType.LOCAL_LLM)
    for m in locals_llms:
        if m.provider == Provider.OLLAMA:
            return m
    return None


def get_embedding_model() -> Optional[ModelEntry]:
    """Returns the configured embedding model."""
    embs = get_models_by_type(ModelType.EMBEDDING)
    return embs[0] if embs else None


def get_pattern_router() -> ModelEntry:
    for m in get_registry():
        if m.provider == Provider.PATTERN:
            return m
    raise RuntimeError("Pattern router not in registry")
