from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class LeadershipCreate(BaseModel):
    role: str                                    # 'hod', 'cos', 'hos'
    display_title: str                           # "Head of Department"
    user_id: Optional[UUID] = None
    photo_url: Optional[str] = None
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    message: Optional[str] = None
    vision: Optional[str] = None
    qualifications: List[str] = []
    experience_years: int = 0
    research_interests: List[str] = []
    publications_count: int = 0
    email: Optional[str] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None
    office_hours: Optional[str] = None
    linkedin_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class LeadershipUpdate(BaseModel):
    role: Optional[str] = None
    display_title: Optional[str] = None
    photo_url: Optional[str] = None
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    message: Optional[str] = None
    vision: Optional[str] = None
    qualifications: Optional[List[str]] = None
    experience_years: Optional[int] = None
    research_interests: Optional[List[str]] = None
    publications_count: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None
    office_hours: Optional[str] = None
    linkedin_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class LeadershipResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    role: str
    display_title: str
    photo_url: Optional[str] = None
    short_bio: Optional[str] = None
    full_bio: Optional[str] = None
    message: Optional[str] = None
    vision: Optional[str] = None
    qualifications: List[Any] = []
    experience_years: int = 0
    research_interests: List[Any] = []
    publications_count: int = 0
    email: Optional[str] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None
    office_hours: Optional[str] = None
    linkedin_url: Optional[str] = None
    google_scholar_url: Optional[str] = None
    display_order: int = 0
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LeadershipStatsResponse(BaseModel):
    role: str
    total_students: int
    total_faculty: int
    total_placements: int
    total_publications: int
    total_projects: int
    department_name: str
