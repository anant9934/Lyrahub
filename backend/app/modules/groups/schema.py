from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class GroupMemberResponse(BaseModel):
    id: UUID
    group_id: UUID
    student_id: UUID
    student_name: Optional[str] = None
    student_reg_no: Optional[str] = None
    student_email: Optional[str] = None
    role: str
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class GroupMemberAdd(BaseModel):
    student_id: UUID
    role: Optional[str] = Field("member", description="'member', 'core', 'lead', 'advisor'")


class GroupMemberRoleUpdate(BaseModel):
    role: str = Field(..., description="'member', 'core', 'lead', 'advisor'")


class GroupEventLink(BaseModel):
    event_id: UUID


class GroupEventResponse(BaseModel):
    id: UUID
    group_id: UUID
    event_id: UUID
    event_title: Optional[str] = None
    event_slug: Optional[str] = None
    start_datetime: Optional[datetime] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class GroupCreate(BaseModel):
    name: str = Field(..., max_length=200)
    tagline: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    group_type: str = Field("club", description="'interest_group', 'club', 'society', 'chapter'")
    category: str = Field("technical", description="'technical', 'cultural', 'sports', 'social', 'professional'")
    cover_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    founded_on: Optional[date] = None
    faculty_advisor_id: Optional[UUID] = None
    student_lead_id: Optional[UUID] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_links: Dict[str, str] = {}
    meeting_schedule: Optional[str] = None
    meeting_venue: Optional[str] = None
    membership_open: bool = True
    membership_fee: Decimal = Decimal("0.00")
    tags: List[str] = []


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    tagline: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    group_type: Optional[str] = None
    category: Optional[str] = None
    cover_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    founded_on: Optional[date] = None
    faculty_advisor_id: Optional[UUID] = None
    student_lead_id: Optional[UUID] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    meeting_schedule: Optional[str] = None
    meeting_venue: Optional[str] = None
    membership_open: Optional[bool] = None
    membership_fee: Optional[Decimal] = None
    is_official: Optional[bool] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None


class GroupResponse(BaseModel):
    id: UUID
    slug: str
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    group_type: str
    category: str
    cover_image_url: Optional[str] = None
    logo_url: Optional[str] = None
    founded_on: Optional[date] = None
    faculty_advisor_id: Optional[UUID] = None
    faculty_advisor_name: Optional[str] = None
    student_lead_id: Optional[UUID] = None
    student_lead_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_links: Dict[str, Any] = {}
    meeting_schedule: Optional[str] = None
    meeting_venue: Optional[str] = None
    membership_open: bool = True
    membership_fee: float = 0.0
    is_official: bool = False
    is_active: bool = True
    tags: List[str] = []
    member_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GroupDetailResponse(GroupResponse):
    members: List[GroupMemberResponse] = []
    events: List[GroupEventResponse] = []


class GroupListResponse(BaseModel):
    items: List[GroupResponse]
    total: int
    page: int
    page_size: int
    pages: int


class GroupStatsResponse(BaseModel):
    by_type: Dict[str, int]
    by_category: Dict[str, int]
    total_groups: int
    total_official: int
    total_members: int
