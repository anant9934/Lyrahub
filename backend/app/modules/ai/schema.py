from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List


class AIDAQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)


class AIDAQueryResponse(BaseModel):
    answer: Optional[str] = None
    source: Optional[str] = None
    ai_mode: str  # 'Deterministic (SQL)' | 'Browser SLM' | 'Cloud LLM'
    signal: Optional[str] = None          # Frontend-only signal for browser SLM
    query: Optional[str] = None
    data: Optional[Dict[str, Any]] = None  # Tabular data for frontend rendering
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
    created_at: str
