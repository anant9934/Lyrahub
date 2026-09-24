from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class EventBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    event_type: Optional[str] = None
    category: Optional[str] = None
    mode: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    venue: Optional[str] = None
    meeting_url: Optional[str] = None
    capacity: Optional[int] = None
    registration_deadline: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    tags: List[str] = []

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    title: Optional[str] = Field(None, max_length=200)

class EventResponse(EventBase):
    id: UUID
    slug: str
    organizer_id: Optional[UUID]
    status: str
    created_at: datetime
    updated_at: datetime
    registration_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class EventListResponse(BaseModel):
    items: List[EventResponse]
    total: int
    page: int
    page_size: int

class EventFeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class EventFeedbackResponse(BaseModel):
    id: UUID
    event_id: UUID
    student_id: UUID
    rating: int
    comments: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
