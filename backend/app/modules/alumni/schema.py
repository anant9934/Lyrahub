from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date


class AlumniExperienceCreate(BaseModel):
    company: str = Field(..., max_length=200)
    role: str = Field(..., max_length=200)
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None


class AlumniExperienceResponse(BaseModel):
    id: UUID
    alumni_id: UUID
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlumniRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = Field(None, max_length=200)
    reg_no: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=20)
    graduation_year: Optional[int] = None
    program: Optional[str] = "B.Tech CSE (AI & ML)"
    degree: Optional[str] = "B.Tech"
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    open_to_mentorship: bool = False
    open_to_hiring: bool = False
    willing_to_visit: bool = False
    privacy_level: str = "public"  # public, alumni_only, private


class AlumniUpdate(BaseModel):
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    open_to_mentorship: Optional[bool] = None
    open_to_hiring: Optional[bool] = None
    willing_to_visit: Optional[bool] = None
    privacy_level: Optional[str] = None


class AlumniResponse(BaseModel):
    id: UUID
    user_id: UUID
    reg_no: Optional[str] = None
    full_name: str
    email: str
    phone: Optional[str] = None
    graduation_year: int
    program: Optional[str] = None
    degree: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool = False
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    open_to_mentorship: bool = False
    open_to_hiring: bool = False
    willing_to_visit: bool = False
    privacy_level: str = "public"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    experiences: List[AlumniExperienceResponse] = []

    class Config:
        from_attributes = True


class AlumniListResponse(BaseModel):
    items: List[AlumniResponse]
    total: int
    page: int
    page_size: int


class AlumniStatsResponse(BaseModel):
    by_graduation_year: Dict[str, int]
    by_company: Dict[str, int]
    by_program: Dict[str, int]
    total: int
