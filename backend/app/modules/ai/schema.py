"""
AIDA API Schema — request/response Pydantic models.

Response contract (§41):
  {
    "request_id": "...",
    "answer": "...",
    "route": "deterministic|cache|browser_slm|okf|rag|local_llm|cloud_llm|fallback",
    "intent": "...",
    "ai_mode": "...",        # Human-readable label
    "data": {},              # Structured tabular data for frontend
    "sources": [],           # RAG source citations
    "visualization": null,
    "metadata": { "cached": false, "data_as_of": "..." },
    "cloud_calls_used": 2,
    "cloud_calls_limit": 5,
    "provider": "...",
    "tokens_in": ...,
    "tokens_out": ...,
    "latency_ms": ...
  }
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List


class AIDAQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    mode: Optional[str] = Field(default="hybrid")  # fast | knowledge | analytics | advanced | hybrid
    conversation_id: Optional[str] = None           # For conversation continuity


class AIDAQueryResponse(BaseModel):
    request_id: Optional[str] = None
    answer: Optional[str] = None
    source: Optional[str] = None
    route: Optional[str] = None         # deterministic|cache|browser_slm|okf|rag|local_llm|cloud_llm
    intent: Optional[str] = None        # Detected intent label
    ai_mode: str = "Unknown"            # Human-readable label for UI display
    signal: Optional[str] = None        # Frontend-only browser SLM handoff signal
    query: Optional[str] = None         # Echo query for browser SLM
    data: Optional[Dict[str, Any]] = None   # Tabular data for table rendering
    sources: Optional[List[Dict[str, Any]]] = None  # RAG source citations
    visualization: Optional[Dict[str, Any]] = None  # Chart config (future)
    metadata: Optional[Dict[str, Any]] = None       # cached, data_as_of, etc.
    cloud_calls_used: Optional[int] = None
    cloud_calls_limit: Optional[int] = None
    provider: Optional[str] = None
    tokens_in: Optional[int] = None
    tokens_out: Optional[int] = None
    latency_ms: Optional[int] = None


class AIUsageSummary(BaseModel):
    date: str
    total_cloud_calls: int
    global_daily_limit: int
    global_monthly_limit: int
    monthly_calls_used: int
    by_role: Dict[str, int]
    by_provider: Dict[str, int]
    failed_requests: int
    avg_latency_ms: Optional[float]
    total_tokens_in: int
    total_tokens_out: int


class AIUsageLogEntry(BaseModel):
    id: str
    user_id: Optional[str]
    role: str
    usage_date: str
    provider: str
    model: Optional[str]
    tokens_in: Optional[int]
    tokens_out: Optional[int]
    latency_ms: Optional[int]
    success: bool
    reason_for_cloud_route: Optional[str]
    quota_before: int
    quota_after: int
    created_at: Optional[str]


class KnowledgeIndexRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    content: str = Field(..., min_length=50)
    category: str = Field(default="general")
    access_scope: str = Field(default="faculty:department")
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
