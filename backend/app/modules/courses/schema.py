from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CourseBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=200)
    short_name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    credits: Optional[float] = Field(4.0, ge=0.0, le=30.0)
    semester: Optional[int] = Field(1, ge=1, le=12)
    year: Optional[int] = Field(1, ge=1, le=6)
    course_type: Optional[str] = Field("core", max_length=30) # core, elective, lab, project, seminar
    category: Optional[str] = Field("theory", max_length=50) # theory, practical, humanities, minor
    prerequisites: Optional[str] = None
    syllabus: Optional[str] = None
    ip_lp_notes: Optional[str] = None
    learning_outcomes: Optional[List[str]] = Field(default_factory=list)
    evaluation_scheme: Optional[Dict[str, Any]] = Field(default_factory=dict)
    references: Optional[List[str]] = Field(default_factory=list)
    edurev_benefits: Optional[List[str]] = Field(default_factory=list)
    is_active: Optional[bool] = True


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, max_length=200)
    short_name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    credits: Optional[float] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    course_type: Optional[str] = None
    category: Optional[str] = None
    prerequisites: Optional[str] = None
    syllabus: Optional[str] = None
    ip_lp_notes: Optional[str] = None
    learning_outcomes: Optional[List[str]] = None
    evaluation_scheme: Optional[Dict[str, Any]] = None
    references: Optional[List[str]] = None
    edurev_benefits: Optional[List[str]] = None
    is_active: Optional[bool] = None


class CourseFacultyAssign(BaseModel):
    faculty_id: UUID
    academic_year: Optional[str] = Field("2025-26", max_length=20)
    section: Optional[str] = Field("A", max_length=10)
    role: Optional[str] = Field("primary", max_length=30) # primary, co-instructor, guest


class CourseFacultyResponse(BaseModel):
    id: UUID
    course_id: UUID
    faculty_id: UUID
    faculty_name: Optional[str] = None
    faculty_email: Optional[str] = None
    faculty_designation: Optional[str] = None
    academic_year: Optional[str] = None
    section: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True


class CourseResponse(CourseBase):
    id: UUID
    slug: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseDetailResponse(CourseResponse):
    faculty: List[CourseFacultyResponse] = Field(default_factory=list)
    programs: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    items: List[CourseResponse]
    total: int
    page: int
    page_size: int
    pages: int


class CourseStatsResponse(BaseModel):
    by_semester: Dict[str, int]
    by_type: Dict[str, int]
    by_category: Dict[str, int]
    total_courses: int
