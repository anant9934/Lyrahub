from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProgramBase(BaseModel):
    name: str = Field(..., max_length=200)
    code: str = Field(..., max_length=50)
    short_name: Optional[str] = Field(None, max_length=50)
    degree: Optional[str] = Field(None, max_length=20)
    level: Optional[str] = Field("undergraduate", max_length=20)
    duration_years: Optional[float] = Field(4.0, ge=0.5, le=10.0)
    total_credits: Optional[int] = Field(160, ge=0)
    description: Optional[str] = None
    eligibility: Optional[str] = None
    admission_process: Optional[str] = None
    career_opportunities: Optional[str] = None
    program_outcomes: Optional[List[str]] = Field(default_factory=list)
    program_specific_outcomes: Optional[List[str]] = Field(default_factory=list)
    cover_image_url: Optional[str] = None
    brochure_url: Optional[str] = None
    is_active: Optional[bool] = True
    display_order: Optional[int] = 0


class ProgramCreate(ProgramBase):
    pass


class ProgramUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    code: Optional[str] = Field(None, max_length=50)
    short_name: Optional[str] = Field(None, max_length=50)
    degree: Optional[str] = Field(None, max_length=20)
    level: Optional[str] = Field(None, max_length=20)
    duration_years: Optional[float] = None
    total_credits: Optional[int] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    admission_process: Optional[str] = None
    career_opportunities: Optional[str] = None
    program_outcomes: Optional[List[str]] = None
    program_specific_outcomes: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    brochure_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class ProgramCourseMap(BaseModel):
    course_id: UUID
    semester: int = Field(..., ge=1, le=12)
    is_mandatory: Optional[bool] = True


class ProgramCourseItem(BaseModel):
    course_id: UUID
    course_code: str
    course_name: str
    course_slug: Optional[str] = None
    credits: Optional[float] = None
    course_type: Optional[str] = None
    category: Optional[str] = None
    semester: int
    is_mandatory: bool


class ProgramResponse(ProgramBase):
    id: UUID
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgramDetailResponse(ProgramResponse):
    curriculum: Dict[int, List[ProgramCourseItem]] = Field(default_factory=dict)

    class Config:
        from_attributes = True


class ProgramListResponse(BaseModel):
    items: List[ProgramResponse]
    total: int
