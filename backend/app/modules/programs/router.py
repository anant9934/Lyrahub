from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models import User
from app.core.rbac import get_enforcer
from app.core.cache import catalog_cache
from . import schema, service

router = APIRouter(tags=["programs"])


async def _get_role(user: User) -> str:
    try:
        enforcer = get_enforcer()
        if enforcer:
            roles = await enforcer.get_implicit_roles_for_user(user.email)
            for r in ["admin", "hod", "faculty", "student", "alumni"]:
                if r in roles:
                    return r
    except Exception:
        pass
    return "student"


def _require_admin_or_hod(role: str):
    if role not in ["admin", "hod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HOD or Admin can perform this action"
        )


@router.get("", response_model=schema.ProgramListResponse)
async def list_programs(
    response: Response = Response(),
    level: Optional[str] = None,
    degree: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    include_inactive = False
    if current_user:
        response.headers["Cache-Control"] = "private, no-cache"
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            include_inactive = True
    else:
        response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
        cache_key = f"programs:list:{level}:{degree}"
        cached = catalog_cache.get(cache_key)
        if cached is not None:
            return cached

    items, total = await service.get_programs(
        db=db,
        level=level,
        degree=degree,
        include_inactive=include_inactive
    )
    result = {"items": items, "total": total}
    if not current_user:
        catalog_cache.set(f"programs:list:{level}:{degree}", result, ttl=300)
    return result


@router.get("/{slug}", response_model=schema.ProgramDetailResponse)
async def get_program(
    slug: str,
    response: Response = Response(),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    include_inactive = False
    if current_user:
        response.headers["Cache-Control"] = "private, no-cache"
        role = await _get_role(current_user)
        if role in ["admin", "hod"]:
            include_inactive = True
    else:
        response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
        cache_key = f"programs:slug:{slug}"
        cached = catalog_cache.get(cache_key)
        if cached is not None:
            return cached

    result = await service.get_program_by_slug(db, slug, include_inactive=include_inactive)
    if not current_user:
        catalog_cache.set(f"programs:slug:{slug}", result, ttl=300)
    return result


@router.post("", response_model=schema.ProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_program(
    data: schema.ProgramCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    catalog_cache.invalidate("programs:")
    return await service.create_program(db, data, current_user)


@router.patch("/{id}", response_model=schema.ProgramResponse)
async def update_program(
    id: UUID,
    data: schema.ProgramUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    catalog_cache.invalidate("programs:")
    return await service.update_program(db, id, data, current_user)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_program(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    catalog_cache.invalidate("programs:")
    await service.delete_program(db, id, current_user)
    return {"message": "Program successfully deleted"}


@router.post("/{id}/courses", status_code=status.HTTP_201_CREATED)
async def add_program_course(
    id: UUID,
    data: schema.ProgramCourseMap,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    catalog_cache.invalidate("programs:")
    pc = await service.add_program_course(db, id, data, current_user)
    return {
        "message": "Course mapped successfully",
        "program_id": pc.program_id,
        "course_id": pc.course_id,
        "semester": pc.semester,
        "is_mandatory": pc.is_mandatory
    }


@router.delete("/{id}/courses/{course_id}", status_code=status.HTTP_200_OK)
async def remove_program_course(
    id: UUID,
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    catalog_cache.invalidate("programs:")
    await service.remove_program_course(db, id, course_id, current_user)
    return {"message": "Course mapping removed successfully"}

