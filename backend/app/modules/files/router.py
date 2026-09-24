from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse, Response
from app.core.dependencies import get_current_active_user
from app.models import User
from app.services.storage import get_storage
import os
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.students.service import get_student_by_user_id

router = APIRouter()
storage = get_storage()

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

@router.post("/upload/{key:path}")
async def upload_file(
    key: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    try:
        student = await get_student_by_user_id(db, current_user.id)
        student_id = str(student.id)
    except Exception:
        student_id = ""
        
    if not student_id or not key.startswith(student_id):
        raise HTTPException(status_code=403, detail="Key must start with your student ID")

    # Read bytes and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    # Check magic bytes for PDF
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Only PDF files are allowed")

    # Use the LocalStorageProvider's internal file creation since we receive bytes
    # (The interface generates URLs for direct uploads, but since local doesn't support
    # pre-signed PUTs intrinsically like S3, the client POSTs to this endpoint instead).
    # Wait, the prompt says "Save via storage.get_storage() provider", but our StorageProvider
    # interface only has generate_upload_url and get_file_bytes, etc., no save_bytes.
    # Ah, the local provider was returning `/api/v1/files/upload/{key}` as the upload URL.
    # So this endpoint IS the local provider's upload mechanism!
    # Let's save the file manually to the uploads folder, but wait - I should just write it.
    
    # Check if we are actually using LocalStorageProvider to know if we should save here
    if hasattr(storage, "root_dir"):
        target_path = os.path.join(storage.root_dir, key)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, "wb") as f:
            f.write(contents)
    else:
        # If it's R2, they shouldn't hit this endpoint, they should hit the presigned URL directly.
        # But if they do, we can't save it directly without writing more boto3 code here.
        raise HTTPException(status_code=400, detail="Use presigned URL for direct uploads with R2")

    return {"key": key, "size": len(contents)}

@router.get("/download/{key:path}")
async def download_file(
    key: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        student = await get_student_by_user_id(db, current_user.id)
        student_id = str(student.id)
    except Exception:
        student_id = ""
        
    # Simplified ownership check for local testing: owner or admin
    is_owner = key.startswith(student_id)
    # TODO: Or faculty of that student OR HOD OR Admin
    # Note: user roles access is also lazy-loaded, so we check if admin string is mapped or just query roles.
    # To fix MissingGreenletError on roles:
    from sqlalchemy.future import select
    from app.models import Role, UserRole
    role_res = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == current_user.id)
    )
    user_roles = [r[0] for r in role_res.all()]
    is_admin = any(role in ["Admin", "HOD", "Faculty"] for role in user_roles)
    
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to download this file")

    if not await storage.file_exists(key):
        raise HTTPException(status_code=404, detail="File not found")

    if hasattr(storage, "root_dir"):
        path = os.path.join(storage.root_dir, key)
        return FileResponse(path, media_type="application/pdf", filename=os.path.basename(key))
    else:
        # R2 provider reads bytes
        file_bytes = await storage.get_file_bytes(key)
        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={os.path.basename(key)}"}
        )
