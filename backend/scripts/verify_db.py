import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from app.core.database import engine
from sqlalchemy import text

async def verify():
    async with engine.connect() as conn:
        # Check students columns
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'"))
        columns = [row[0] for row in result.fetchall()]
        print("Students columns:", columns)

        # Check table count
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result.fetchall()]
        print(f"Total tables: {len(tables)}")
        print("Tables:", tables)

        # Check skills count
        result = await conn.execute(text("SELECT COUNT(*) FROM skills"))
        count = result.scalar()
        print(f"Total skills: {count}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
