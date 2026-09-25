from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import date

class RankingSnapshotResponse(BaseModel):
    student_id: str
    rank: int
    score: float
    breakdown: Dict[str, Any]

class PaginatedRankingResponse(BaseModel):
    items: List[RankingSnapshotResponse]
    total: int
    page: int

class RankingConfigUpdate(BaseModel):
    weights: Dict[str, float]

class RankingConfigResponse(BaseModel):
    version: int
    weights: Dict[str, float]
