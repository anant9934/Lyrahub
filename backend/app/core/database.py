from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool
from app.core.config import get_settings
import os

settings = get_settings()

# Production and Development: Async connection pooling with keepalive recycling and pre-ping
# Avoids TCP/TLS connection churn to Neon on every HTTP request
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=300,  # recycle connections every 5 min to match Neon idle timeouts
    pool_pre_ping=True,  # verify connection health before checkout
    connect_args={"statement_cache_size": 0},
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
