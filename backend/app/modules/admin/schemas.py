from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None

class RoleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    is_system: bool

    model_config = {"from_attributes": True}
