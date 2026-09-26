from uuid import UUID
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class OpportunityBase(BaseModel):
    title: str = Field(..., max_length=300)
    organization: str = Field(..., max_length=200)
    opportunity_type: Optional[str] = Field("internship", max_length=30)
    mode: Optional[str] = Field("remote", max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    eligibility: Optional[str] = None
    required_skills: Optional[List[str]] = Field(default_factory=list)
    stipend_amount: Optional[float] = Field(None, ge=0)
    stipend_currency: Optional[str] = Field("INR", max_length=3)
    duration_weeks: Optional[int] = Field(None, ge=1)
    start_date: Optional[date] = None
    application_deadline: Optional[datetime] = None
    application_url: Optional[str] = Field(None, max_length=500)
    contact_email: Optional[str] = Field(None, max_length=255)
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    is_active: Optional[bool] = True


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    organization: Optional[str] = Field(None, max_length=200)
    opportunity_type: Optional[str] = Field(None, max_length=30)
    mode: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    eligibility: Optional[str] = None
    required_skills: Optional[List[str]] = None
    stipend_amount: Optional[float] = None
    stipend_currency: Optional[str] = None
    duration_weeks: Optional[int] = None
    start_date: Optional[date] = None
    application_deadline: Optional[datetime] = None
    application_url: Optional[str] = None
    contact_email: Optional[str] = None
    cover_image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class OpportunityApplicationUpdate(BaseModel):
    status: str = Field(..., max_length=20)
    notes: Optional[str] = None


class OpportunityApplicationResponse(BaseModel):
    id: UUID
    opportunity_id: UUID
    student_id: UUID
    student_name: Optional[str] = None
    student_reg_no: Optional[str] = None
    student_email: Optional[str] = None
    status: str
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OpportunityResponse(OpportunityBase):
    id: UUID
    slug: str
    posted_by: UUID
    posted_by_name: Optional[str] = None
    is_verified: bool = False
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    applicants_count: Optional[int] = 0

    class Config:
        from_attributes = True


class OpportunityListResponse(BaseModel):
    items: List[OpportunityResponse]
    total: int
    page: int
    page_size: int
    pages: int


class OpportunityStatsResponse(BaseModel):
    by_type: Dict[str, int]
    by_organization: Dict[str, int]
    total_opportunities: int
    total_verified: int
