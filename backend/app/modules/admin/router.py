from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.core.database import get_db
from app.models import Role
from app.modules.admin.schemas import RoleCreate, RoleResponse
from app.core.dependencies import RequirePermission

router = APIRouter()

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_in: RoleCreate, 
    db: AsyncSession = Depends(get_db),
    _=Depends(RequirePermission("roles", "create"))
):
    result = await db.execute(select(Role).where(Role.name == role_in.name))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail={"type": "about:blank", "title": "Role already exists", "status": 400}
        )
        
    role = Role(
        id=uuid.uuid4(),
        name=role_in.name,
        description=role_in.description,
        is_system=False
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role
