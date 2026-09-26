from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool
from app.core.config import get_settings
import os

settings = get_settings()

# Production: use connection pooling. Dev/test/serverless (Neon): use NullPool
# Neon serverless requires NullPool (no persistent connections)
IS_SERVERLESS = "neon.tech" in settings.DATABASE_URL or os.getenv("ENVIRONMENT", "development") == "development"

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=NullPool if IS_SERVERLESS else AsyncAdaptedQueuePool,
    # Pool settings for non-serverless (Render dedicated DB)
    **({} if IS_SERVERLESS else {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    }),
    connect_args={"statement_cache_size": 0},
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
