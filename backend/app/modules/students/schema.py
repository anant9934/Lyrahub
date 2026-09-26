from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

class SkillResponse(BaseModel):
    skill_id: UUID
    name: str
    category: Optional[str]
    proficiency: str
    source: str
    verified: bool

class StudentProfileResponse(BaseModel):
    id: UUID
    reg_no: str
    section: Optional[str]
    batch: Optional[int]
    cgpa: Optional[float]
    bio: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    leetcode_url: Optional[str]
    hackerrank_url: Optional[str]
    hackerearth_url: Optional[str]
    portfolio_url: Optional[str]
    expected_graduation: Optional[date]
    current_semester: Optional[int]
    backlogs: Optional[int]
    tenth_percentage: Optional[float]
    twelfth_percentage: Optional[float]
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

class StudentProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    hackerrank_url: Optional[str] = None
    hackerearth_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    expected_graduation: Optional[date] = None
    cgpa: Optional[float] = None
    section: Optional[str] = None
    batch: Optional[int] = None

class StudentUpdateResultResponse(BaseModel):
    change_request_id: Optional[str] = None
    status: Optional[str] = None
    message: Optional[str] = None
    profile: Optional[StudentProfileResponse] = None

class ResumeMetadataResponse(BaseModel):
    id: UUID
    file_url: str
    file_hash: str
    parse_status: str
    parsed_skills: List[str]
    parsed_projects: List[Dict[str, Any]]
    parsed_certifications: List[Dict[str, Any]]
    parsed_at: Optional[datetime]

    class Config:
        from_attributes = True

class AddSkillRequest(BaseModel):
    skill_id: UUID
    proficiency: str = "intermediate"

class PresignResumeRequest(BaseModel):
    filename: str
    content_type: str
    size: int

class ConfirmResumeRequest(BaseModel):
    file_id: UUID
    key: str
    content_hash: str

class HistoryResponse(BaseModel):
    id: UUID
    data: Dict[str, Any]
    valid_from: datetime
    valid_to: Optional[datetime]
    changed_by: Optional[UUID]

    class Config:
        from_attributes = True
