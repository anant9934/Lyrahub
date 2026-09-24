from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

class AchievementBase(BaseModel):
    title: str = Field(..., max_length=300)
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    issuer: Optional[str] = None
    achieved_on: Optional[date] = None
    certificate_url: Optional[str] = None
    proof_url: Optional[str] = None
    linked_url: Optional[str] = None
    tags: List[str] = []

class AchievementCreate(AchievementBase):
    person_id: Optional[UUID] = None  # If not provided, assumed to be current_user/student

class AchievementResponse(AchievementBase):
    id: UUID
    person_id: UUID
    person_type: str
    is_verified: bool
    verified_by: Optional[UUID]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AchievementListResponse(BaseModel):
    items: List[AchievementResponse]
    total: int
    page: int
    page_size: int
