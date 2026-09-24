import asyncio
import os
from dotenv import load_dotenv
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import text
from app.models import Role, Permission, User, Base

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))

DATABASE_URL = os.environ["DATABASE_URL"]

# Need to replace asyncpg with asyncpg driver for sqlalchemy if not present
# Actually, the env variable already has postgresql+asyncpg

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def seed():
    async with engine.begin() as conn:
        # ensure vector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # ensure some indexes (B-tree, GIN, etc.)
        try:
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(reg_no) WHERE deleted_at IS NULL;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa DESC);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_students_skills ON students USING GIN (skills);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_history_student ON student_history(student_id, valid_to);"))
        except Exception as e:
            print("Index creation issue:", e)

    async with async_session() as session:
        # Roles
        roles = ["Admin", "HOD", "COS", "HOS", "Faculty", "Staff", "Student", "Alumni"]
        for role_name in roles:
            stmt = select(Role).where(Role.name == role_name)
            res = await session.execute(stmt)
            if not res.scalars().first():
                session.add(Role(name=role_name, is_system=(role_name == "Admin")))
        
        # Super Admin
        admin_email = os.environ.get("SUPERADMIN_EMAIL", "admin@aiml.hub")
        admin_pass = os.environ.get("SUPERADMIN_PASSWORD", "ChangeMe123!")
        
        from passlib.hash import argon2
        
        stmt = select(User).where(User.email == admin_email)
        res = await session.execute(stmt)
        if not res.scalars().first():
            hashed = argon2.hash(admin_pass)
            session.add(User(email=admin_email, password_hash=hashed))
        
        await session.commit()
        print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed())
