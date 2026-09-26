from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ChangeRequestCreate(BaseModel):
    resource_type: str  # 'student_profile', 'achievement', 'test', 'group'
    resource_id: Optional[UUID] = None
    action: str = "update"  # 'create', 'update', 'delete'
    payload: Dict[str, Any]

class ChangeRequestReject(BaseModel):
    comment: str

class ChangeRequestResponse(BaseModel):
    id: UUID
    requester_id: UUID
    requester_email: Optional[str] = None
    resource_type: str
    resource_id: Optional[UUID] = None
    action: str
    payload: Dict[str, Any]
    current_state: Optional[Dict[str, Any]] = None
    status: str
    reviewer_id: Optional[UUID] = None
    reviewer_email: Optional[str] = None
    reviewer_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ChangeRequestListResponse(BaseModel):
    items: List[ChangeRequestResponse]
    total: int

class PendingCountResponse(BaseModel):
    pending_count: int
