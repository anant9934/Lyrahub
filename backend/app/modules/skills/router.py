from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.database import get_db
from app.models import Skill
from . import schema

router = APIRouter()

@router.get("", response_model=schema.PaginatedSkillResponse)
async def list_skills(
    q: str = None,
    category: str = None,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Skill)
    if q:
        query = query.where(Skill.name.ilike(f"%{q}%"))
    if category:
        query = query.where(Skill.category == category)
        
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    query = query.order_by(Skill.name).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size
    }
