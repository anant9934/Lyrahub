from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Optional["UserResponse"] = None


class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    reg_no: Optional[str] = None

class Role(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    is_active: bool
    created_at: datetime
    roles: Optional[list[Role]] = []

    model_config = {"from_attributes": True}

class RefreshRequest(BaseModel):
    refresh_token: str
