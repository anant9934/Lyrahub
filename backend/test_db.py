import asyncio
from app.core.database import SessionLocal
from app.models import User, Student
from sqlalchemy.future import select

async def main():
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "test@example.com"))
        user = result.scalar_one_or_none()
        print("Existing user:", user)
        if user:
            print("Deleting user")
            await db.delete(user)
            await db.commit()

asyncio.run(main())
