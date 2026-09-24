from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordRequestForm
import uuid

from app.core.database import get_db
from app.models import User, Student
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.modules.auth.schemas import UserCreate, UserResponse, Token, RefreshRequest
from app.core.dependencies import get_current_active_user
import redis.asyncio as redis
from app.core.redis import get_redis

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail={"type": "about:blank", "title": "Email already registered", "status": 400}
        )
    
    user = User(
        id=uuid.uuid4(),
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(user)
    await db.flush()
    
    student = Student(
        id=uuid.uuid4(),
        user_id=user.id,
        reg_no=user_in.reg_no if user_in.reg_no else f"REG{uuid.uuid4().hex[:6].upper()}"
    )
    db.add(student)
    
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"type": "about:blank", "title": "Incorrect email or password", "status": 401},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshRequest, 
    db: AsyncSession = Depends(get_db), 
    redis_client: redis.Redis = Depends(get_redis)
):
    from jose import jwt, JWTError
    from app.core.config import get_settings
    settings = get_settings()
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"type": "about:blank", "title": "Invalid refresh token", "status": 401},
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    is_blacklisted = await redis_client.get(f"bl_{request.refresh_token}")
    if is_blacklisted:
        raise credentials_exception

    try:
        payload = jwt.decode(request.refresh_token, settings.JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception

    await redis_client.setex(f"bl_{request.refresh_token}", settings.JWT_REFRESH_EXPIRY, "true")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token_new = create_refresh_token(data={"sub": user.email})
    
    return {"access_token": access_token, "refresh_token": refresh_token_new, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    from app.core.rbac import get_enforcer
    enforcer = get_enforcer()
    roles = []
    if enforcer:
        try:
            group_roles = await enforcer.get_implicit_roles_for_user(current_user.email)
            roles = [{"name": r} for r in group_roles]
        except Exception:
            # fallback if casbin isn't fully loaded
            pass
    # We must attach it to the Pydantic model response
    # We can convert current_user to a dict or just set it
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "roles": roles
    }
    return user_dict

@router.post("/logout", status_code=200)
async def logout(current_user: User = Depends(get_current_active_user)):
    return {"message": "Logged out successfully"}
