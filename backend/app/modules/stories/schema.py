from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


class StoryCreate(BaseModel):
    title: str = Field(..., max_length=300)
    subtitle: Optional[str] = Field(None, max_length=400)
    story_type: str = Field(..., description="'student' or 'alumni'")
    person_id: UUID
    person_name: Optional[str] = Field(None, max_length=200)
    person_photo_url: Optional[str] = None
    current_role: Optional[str] = Field(None, max_length=200)
    current_company: Optional[str] = Field(None, max_length=200)
    batch_year: Optional[int] = None
    program: Optional[str] = Field(None, max_length=100)
    summary: Optional[str] = Field(None, description="Short teaser (approx 200 chars)")
    full_story: Optional[str] = Field(None, description="Markdown body")
    featured_image_url: Optional[str] = None
    video_url: Optional[str] = Field(None, max_length=500)
    tags: List[str] = []


class StoryUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=300)
    subtitle: Optional[str] = Field(None, max_length=400)
    story_type: Optional[str] = None
    person_id: Optional[UUID] = None
    person_name: Optional[str] = Field(None, max_length=200)
    person_photo_url: Optional[str] = None
    current_role: Optional[str] = Field(None, max_length=200)
    current_company: Optional[str] = Field(None, max_length=200)
    batch_year: Optional[int] = None
    program: Optional[str] = Field(None, max_length=100)
    summary: Optional[str] = None
    full_story: Optional[str] = None
    featured_image_url: Optional[str] = None
    video_url: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None


class StoryResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: Optional[str] = None
    story_type: str
    person_id: UUID
    person_name: Optional[str] = None
    person_photo_url: Optional[str] = None
    current_role: Optional[str] = None
    current_company: Optional[str] = None
    batch_year: Optional[int] = None
    program: Optional[str] = None
    summary: Optional[str] = None
    full_story: Optional[str] = None
    featured_image_url: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = []
    is_published: bool = False
    published_at: Optional[datetime] = None
    featured: bool = False
    views_count: int = 0
    created_by: Optional[UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StoryListResponse(BaseModel):
    items: List[StoryResponse]
    total: int
    page: int
    page_size: int
    pages: int


class StoryStatsResponse(BaseModel):
    by_type: Dict[str, int]
    by_batch: Dict[str, int]
    total_stories: int
    total_published: int
    total_views: int
