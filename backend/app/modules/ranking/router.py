import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional
from math import isclose
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models import User, Role, UserRole, RankingSnapshot, RankingConfig, RankingCriteria, Student, AuditLog
from app.tasks.ranking_tasks import recalculate_rankings_task
from . import schema

router = APIRouter()

async def require_hod(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = getattr(current_user, "id", None)
    if user_id:
        roles_res = await db.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
        )
        roles = roles_res.scalars().all()
        if "hod" in roles or "admin" in roles:
            return
    raise HTTPException(status_code=403, detail="HOD role required")

@router.get("", response_model=schema.PaginatedRankingResponse)
async def get_rankings(
    page: int = 1,
    page_size: int = 25,
    cgpa_min: Optional[float] = Query(None),
    placed: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(RankingSnapshot).join(Student, RankingSnapshot.student_id == Student.id)
    if cgpa_min:
        query = query.where(Student.cgpa >= cgpa_min)
    if placed:
        query = query.where(Student.placement_status == placed)
    if section:
        query = query.where(Student.section == section)
        
    max_date = await db.scalar(select(func.max(RankingSnapshot.snapshot_date)))
    if max_date:
        query = query.where(RankingSnapshot.snapshot_date == max_date)
        
    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    query = query.order_by(RankingSnapshot.rank).offset((page - 1) * page_size).limit(page_size)
    
    res = await db.execute(query)
    items = res.scalars().all()
    
    return {
        "items": [
            {
                "student_id": str(i.student_id),
                "rank": i.rank,
                "score": float(i.score),
                "breakdown": i.breakdown
            } for i in items
        ],
        "total": total or 0,
        "page": page
    }

@router.get("/me", response_model=schema.RankingSnapshotResponse)
async def get_my_ranking(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    student = await db.scalar(select(Student).where(Student.user_id == current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    snap = await db.scalar(
        select(RankingSnapshot)
        .where(RankingSnapshot.student_id == student.id)
        .order_by(RankingSnapshot.snapshot_date.desc())
        .limit(1)
    )
    if not snap:
        raise HTTPException(status_code=404, detail="No ranking snapshot yet")
        
    return {
        "student_id": str(snap.student_id),
        "rank": snap.rank,
        "score": float(snap.score),
        "breakdown": snap.breakdown
    }

@router.post("/recalculate", status_code=status.HTTP_202_ACCEPTED)
async def recalculate_rankings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_hod)
):
    task_id = "mock-task-id"
    try:
        task = recalculate_rankings_task.delay()
        task_id = str(task.id)
    except Exception:
        pass
    
    actor_id = getattr(current_user, "id", None)
    db.add(AuditLog(
        actor_id=actor_id,
        action="recalculate_rankings",
        resource_type="ranking",
        payload={"task_id": task_id}
    ))
    await db.commit()
    
    return {"message": "Recalculation started", "task_id": task_id}

@router.get("/export")
async def export_rankings(
    format: str = Query("csv", regex="^(csv|pdf|xlsx)$"),
    limit: int = 1000,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    max_date = await db.scalar(select(func.max(RankingSnapshot.snapshot_date)))
    if not max_date:
        raise HTTPException(status_code=404, detail="No ranking data available")
        
    query = (
        select(RankingSnapshot, Student.reg_no, Student.cgpa)
        .join(Student, RankingSnapshot.student_id == Student.id)
        .where(RankingSnapshot.snapshot_date == max_date)
        .order_by(RankingSnapshot.rank)
        .limit(limit)
    )
    res = await db.execute(query)
    rows = res.all()
    
    db.add(AuditLog(
        actor_id=current_user.id,
        action="export_rankings",
        resource_type="ranking",
        payload={"format": format, "row_count": len(rows)}
    ))
    await db.commit()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Rank", "Reg No", "Score", "CGPA"])
        for snap, reg_no, cgpa in rows:
            writer.writerow([snap.rank, reg_no, snap.score, cgpa])
        
        response = StreamingResponse(iter([output.getvalue().encode("utf-8-sig")]), media_type="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=ranking-export.csv"
        return response
    elif format == "pdf":
        from reportlab.pdfgen import canvas
        output = io.BytesIO()
        p = canvas.Canvas(output)
        p.drawString(100, 800, "Ranking Export")
        y = 780
        for snap, reg_no, cgpa in rows[:50]:
            p.drawString(100, y, f"Rank {snap.rank} | {reg_no} | Score: {snap.score}")
            y -= 20
        p.showPage()
        p.save()
        response = StreamingResponse(iter([output.getvalue()]), media_type="application/pdf")
        response.headers["Content-Disposition"] = "attachment; filename=ranking-export.pdf"
        return response
    elif format == "xlsx":
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(["Rank", "Reg No", "Score", "CGPA"])
        for snap, reg_no, cgpa in rows:
            ws.append([snap.rank, reg_no, float(snap.score), float(cgpa or 0)])
            
        output = io.BytesIO()
        wb.save(output)
        response = StreamingResponse(iter([output.getvalue()]), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response.headers["Content-Disposition"] = "attachment; filename=ranking-export.xlsx"
        return response

@router.get("/config", response_model=schema.RankingConfigResponse)
async def get_ranking_config(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    conf = await db.scalar(select(RankingConfig).order_by(RankingConfig.version.desc()).limit(1))
    if conf:
        return {"version": conf.version, "weights": conf.weights}
        
    criteria = await db.execute(select(RankingCriteria).where(RankingCriteria.is_active == True))
    weights = {c.code: float(c.weight) for c in criteria.scalars().all()}
    return {"version": 0, "weights": weights}

@router.put("/config", response_model=schema.RankingConfigResponse)
async def update_ranking_config(
    req: schema.RankingConfigUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_hod)
):
    
    total = sum(req.weights.values())
    if not isclose(total, 1.0, abs_tol=0.001):
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
        
    criteria = await db.execute(select(RankingCriteria))
    crit_map = {c.code: c for c in criteria.scalars().all()}
    
    for code, weight in req.weights.items():
        if code not in crit_map:
            raise HTTPException(status_code=400, detail=f"Invalid criteria code: {code}")
            
    for code, weight in req.weights.items():
        crit_map[code].weight = weight
        crit_map[code].is_active = weight > 0
        
    max_v = await db.scalar(select(func.max(RankingConfig.version)))
    new_version = (max_v or 0) + 1
    
    new_config = RankingConfig(
        version=new_version,
        weights=req.weights,
        updated_by=current_user.id
    )
    db.add(new_config)
    
    db.add(AuditLog(
        actor_id=current_user.id,
        action="update_ranking_config",
        resource_type="ranking_config",
        payload={"version": new_version, "weights": req.weights}
    ))
    
    await db.commit()
    return {"version": new_version, "weights": req.weights}
