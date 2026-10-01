import os
from sqlalchemy import create_engine

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL environment variable is required")

# Handle asyncpg prefix if present for sync engine
if database_url.startswith("postgresql+asyncpg://"):
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

engine = create_engine(database_url)
with engine.connect() as conn:
    conn.execute(engine.dialect.statement_compiler(engine.dialect, None).statement('CREATE EXTENSION IF NOT EXISTS vector'))
    conn.commit()
