import asyncio
from app.core.rbac import init_casbin

async def main():
    enforcer = await init_casbin()
    await enforcer.add_grouping_policy("720anant@gmail.com", "Admin")
    print("Successfully added 720anant@gmail.com as Admin")

if __name__ == "__main__":
    asyncio.run(main())
