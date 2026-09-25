from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import re


def sanitize_html(v: str) -> str:
    if not v:
        return v
    # Strip HTML tags
    stripped = re.sub(r'<[^>]*>', '', v)
    return stripped.strip()


class TestimonialCreate(BaseModel):
    author_name: Optional[str] = Field(None, max_length=200)
    author_role: Optional[str] = Field(None, max_length=200, description="e.g. SDE at Google, Student, etc.")
    author_photo_url: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    text: str = Field(..., max_length=500)
    context: Optional[str] = Field("about_department", max_length=100, description="'about_department', 'about_course', 'about_faculty', 'about_placement'")
    context_id: Optional[UUID] = None

    @validator("text")
    def validate_text(cls, v):
        cleaned = sanitize_html(v)
        if not cleaned:
            raise ValueError("Testimonial text cannot be empty after sanitizing HTML")
        if len(cleaned) > 500:
            raise ValueError("Testimonial text cannot exceed 500 characters")
        return cleaned


class TestimonialUpdate(BaseModel):
    author_name: Optional[str] = Field(None, max_length=200)
    author_role: Optional[str] = Field(None, max_length=200)
    author_photo_url: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    text: Optional[str] = Field(None, max_length=500)
    context: Optional[str] = Field(None, max_length=100)
    context_id: Optional[UUID] = None
    display_order: Optional[int] = None

    @validator("text")
    def validate_text(cls, v):
        if v is not None:
            cleaned = sanitize_html(v)
            if not cleaned:
                raise ValueError("Testimonial text cannot be empty")
            if len(cleaned) > 500:
                raise ValueError("Testimonial text cannot exceed 500 characters")
            return cleaned
        return v


class TestimonialReject(BaseModel):
    reason: Optional[str] = "Does not meet department guidelines"


class TestimonialResponse(BaseModel):
    id: UUID
    author_id: Optional[UUID] = None
    author_type: str
    author_name: str
    author_role: Optional[str] = None
    author_photo_url: Optional[str] = None
    rating: Optional[int] = None
    text: str
    context: Optional[str] = None
    context_id: Optional[UUID] = None
    is_published: bool = False
    is_featured: bool = False
    display_order: int = 0
    moderated_by: Optional[UUID] = None
    moderated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TestimonialListResponse(BaseModel):
    items: List[TestimonialResponse]
    total: int
    page: int
    page_size: int
    pages: int


class TestimonialStatsResponse(BaseModel):
    by_author_type: Dict[str, int]
    avg_rating_by_context: Dict[str, float]
    total_testimonials: int
    total_published: int
    total_pending: int
