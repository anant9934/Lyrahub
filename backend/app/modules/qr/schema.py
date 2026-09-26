from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class CreateAttendanceSessionRequest(BaseModel):
    course_id: Optional[UUID] = None
    section: Optional[str] = "A"
    duration_minutes: int = 15

class AttendanceSessionResponse(BaseModel):
    id: UUID
    course_id: Optional[UUID] = None
    course_name: Optional[str] = None
    section: Optional[str] = None
    qr_data: str
    qr_image_base64: str
    expires_at: Optional[datetime] = None
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class MarkAttendanceRequest(BaseModel):
    session_id: UUID
    scanned_at: Optional[datetime] = None

class MarkAttendanceResponse(BaseModel):
    message: str
    session_id: UUID
    student_id: UUID
    marked_at: datetime

class AttendanceRecordResponse(BaseModel):
    id: UUID
    student_id: UUID
    student_email: str
    student_reg_no: str
    marked_at: datetime
    ip_address: Optional[str] = None

class SessionRecordsResponse(BaseModel):
    session_id: UUID
    course_id: Optional[UUID] = None
    section: Optional[str] = None
    is_active: bool
    expires_at: Optional[datetime] = None
    total_marked: int
    records: List[AttendanceRecordResponse]
