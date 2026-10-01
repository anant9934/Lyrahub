import math
from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models import User
from app.core.rbac import get_enforcer
from . import schema, service

router = APIRouter(tags=["courses"])


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


@router.get("", response_model=schema.CourseListResponse)
async def list_courses(
    response: Response = Response(),
    semester: Optional[int] = None,
    course_type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
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

    p = page if isinstance(page, int) else 1
    ps = page_size if isinstance(page_size, int) else 20

    items, total = await service.get_courses(
        db=db,
        semester=semester,
        course_type=course_type,
        category=category,
        search=search,
        page=p,
        page_size=ps,
        include_inactive=include_inactive
    )
    pages = math.ceil(total / ps) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": p,
        "page_size": ps,
        "pages": pages
    }


@router.get("/stats", response_model=schema.CourseStatsResponse)
async def get_course_stats(
    response: Response = Response(),
    db: AsyncSession = Depends(get_db)
):
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
    return await service.get_course_stats(db)


@router.get("/me", response_model=List[schema.CourseResponse])
async def get_my_courses(
    response: Response = Response(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    response.headers["Cache-Control"] = "private, no-store, no-cache, must-revalidate"
    role = await _get_role(current_user)
    return await service.get_my_courses(db, current_user, role)


@router.get("/code/{code}", response_model=schema.CourseDetailResponse)
async def get_course_by_code(
    code: str,
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

    return await service.get_course_by_code(db, code, include_inactive=include_inactive)


@router.get("/{slug}", response_model=schema.CourseDetailResponse)
async def get_course(
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

    return await service.get_course_by_slug(db, slug, include_inactive=include_inactive)





@router.post("", response_model=schema.CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    data: schema.CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    return await service.create_course(db, data, current_user)


@router.patch("/{id}", response_model=schema.CourseResponse)
async def update_course(
    id: UUID,
    data: schema.CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    return await service.update_course(db, id, data, current_user)


@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_course(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    await service.delete_course(db, id, current_user)
    return {"message": "Course successfully deleted"}


@router.post("/{id}/faculty", response_model=schema.CourseFacultyResponse, status_code=status.HTTP_201_CREATED)
async def assign_course_faculty(
    id: UUID,
    data: schema.CourseFacultyAssign,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    return await service.assign_course_faculty(db, id, data, current_user)


@router.delete("/{id}/faculty/{faculty_id}", status_code=status.HTTP_200_OK)
async def remove_course_faculty(
    id: UUID,
    faculty_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = await _get_role(current_user)
    _require_admin_or_hod(role)
    await service.remove_course_faculty(db, id, faculty_id, current_user)
    return {"message": "Faculty assignment removed successfully"}


@router.get("/{id}/faculty", response_model=List[schema.CourseFacultyResponse])
async def list_course_faculty(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    return await service.get_course_faculty_list(db, id)
