from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class SkillResponse(BaseModel):
    id: UUID
    name: str
    category: Optional[str]
    is_verified: bool
    
    class Config:
        from_attributes = True

class PaginatedSkillResponse(BaseModel):
    items: List[SkillResponse]
    total: int
    page: int
    size: int
