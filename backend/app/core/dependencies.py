from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import get_settings
from app.core.database import get_db
from app.models import User
from app.core.rbac import get_enforcer

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Server-Side Token Revocation Check (Rule 8 & Section 14)
    from app.core.redis import get_redis
    try:
        redis_client = await get_redis()
        if redis_client and await redis_client.get(f"bl_{token}"):
            raise credentials_exception
    except HTTPException:
        raise
    except Exception:
        pass
        
    result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RequirePermission:
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action

    async def __call__(self, current_user: User = Depends(get_current_active_user)):
        enforcer = get_enforcer()
        if not enforcer:
            raise HTTPException(status_code=500, detail="RBAC enforcer not initialized")
        
        has_permission = await enforcer.enforce(current_user.email, self.resource, self.action)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user


oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_optional_current_user(token: str = Depends(oauth2_scheme_optional), db: AsyncSession = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            return None
        result = await db.execute(select(User).where(User.email == email, User.deleted_at.is_(None)))
        return result.scalar_one_or_none()
    except Exception:
        return None

