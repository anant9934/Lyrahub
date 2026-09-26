from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import User
from app.modules.approvals import service
from app.modules.approvals.schema import (
    ChangeRequestCreate,
    ChangeRequestReject,
    ChangeRequestResponse,
    ChangeRequestListResponse,
    PendingCountResponse
)

router = APIRouter()

def check_is_hod_or_admin(user: User) -> bool:
    # admin@aiml.hub or hod role
    return user.email in ["admin@aiml.hub", "hod@aiml.hub", "720anant@gmail.com"]

@router.post("/requests", response_model=ChangeRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_change_request(
    req_in: ChangeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    cr = await service.create_request(db, req_in, current_user.id)
    return await service.get_request_by_id(db, cr.id, current_user, is_hod_or_admin=True)

@router.get("/requests/pending-count", response_model=PendingCountResponse)
async def get_pending_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    count = await service.get_pending_count(db, current_user, is_hod)
    return PendingCountResponse(pending_count=count)

@router.get("/history", response_model=List[ChangeRequestResponse])
async def get_approvals_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    return await service.get_history(db, current_user, is_hod)

@router.get("/requests", response_model=ChangeRequestListResponse)
async def list_change_requests(
    status: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    requester_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    items = await service.list_requests(
        db,
        user=current_user,
        is_hod_or_admin=is_hod,
        status_filter=status,
        resource_type=resource_type,
        requester_id=requester_id
    )
    return ChangeRequestListResponse(items=items, total=len(items))

@router.get("/requests/{id}", response_model=ChangeRequestResponse)
async def get_change_request_detail(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    return await service.get_request_by_id(db, id, current_user, is_hod)

@router.post("/requests/{id}/approve", response_model=ChangeRequestResponse)
async def approve_change_request(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    if not is_hod:
        raise HTTPException(status_code=403, detail="HOD or Admin authorization required to approve")
    await service.approve_request(db, id, current_user.id)
    return await service.get_request_by_id(db, id, current_user, is_hod_or_admin=True)

@router.post("/requests/{id}/reject", response_model=ChangeRequestResponse)
async def reject_change_request(
    id: UUID,
    reject_in: ChangeRequestReject,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_hod = check_is_hod_or_admin(current_user)
    if not is_hod:
        raise HTTPException(status_code=403, detail="HOD or Admin authorization required to reject")
    await service.reject_request(db, id, reject_in.comment, current_user.id)
    return await service.get_request_by_id(db, id, current_user, is_hod_or_admin=True)

@router.post("/requests/{id}/withdraw", response_model=ChangeRequestResponse)
async def withdraw_change_request(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    await service.withdraw_request(db, id, current_user.id)
    return await service.get_request_by_id(db, id, current_user, is_hod_or_admin=True)
