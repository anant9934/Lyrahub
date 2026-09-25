from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date


class ProjectMemberCreate(BaseModel):
    student_id: UUID
    role: str = "contributor"


class ProjectMemberResponse(BaseModel):
    id: UUID
    project_id: UUID
    student_id: UUID
    role: str
    joined_at: Optional[datetime] = None
    student_name: Optional[str] = None
    student_reg_no: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectDocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    doc_type: str
    file_url: str
    uploaded_by: Optional[UUID] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str = Field(..., max_length=300)
    summary: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    tech_stack: List[str] = []
    domain: Optional[str] = "cv"
    status: Optional[str] = "ongoing"
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    paper_url: Optional[str] = None
    mentor_id: Optional[UUID] = None
    external_mentor: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    outcomes: Optional[str] = None
    awards: Optional[str] = None
    revenue_generated: Optional[float] = None
    client_name: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: bool = True


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    summary: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    domain: Optional[str] = None
    status: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    paper_url: Optional[str] = None
    mentor_id: Optional[UUID] = None
    external_mentor: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    outcomes: Optional[str] = None
    awards: Optional[str] = None
    revenue_generated: Optional[float] = None
    client_name: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    summary: Optional[str] = None
    description: Optional[str] = None
    tech_stack: List[str] = []
    domain: Optional[str] = None
    status: str = "ongoing"
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    paper_url: Optional[str] = None
    mentor_id: Optional[UUID] = None
    external_mentor: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    outcomes: Optional[str] = None
    awards: Optional[str] = None
    revenue_generated: Optional[float] = None
    client_name: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: bool = True
    created_by: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    mentor_name: Optional[str] = None
    members: List[ProjectMemberResponse] = []
    documents: List[ProjectDocumentResponse] = []

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    total: int
    page: int
    page_size: int


class ProjectStatsResponse(BaseModel):
    by_domain: Dict[str, int]
    by_status: Dict[str, int]
    total: int
