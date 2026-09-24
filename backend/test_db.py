import socket
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

host = "ep-wispy-mountain-a7s9mb0a-pooler.ap-southeast-2.aws.neon.tech"
port = 5432

print("=== SOCKET TEST ===")
try:
    sock = socket.create_connection((host, port), timeout=5)
    print("Socket connected successfully to port 5432!")
    sock.close()
except Exception as e:
    print(f"Socket connection failed: {e}")

print("\n=== ASYNCPG TEST ===")
async def test_asyncpg():
    url = os.environ.get("DATABASE_URL")
    # asyncpg expects postgresql:// not postgresql+asyncpg://
    url = url.replace("+asyncpg", "")
    print(f"Connecting to: {url}")
    try:
        conn = await asyncpg.connect(url, timeout=10)
        print("Asyncpg connected successfully!")
        await conn.close()
    except Exception as e:
        print(f"Asyncpg connection failed: {type(e).__name__} - {e}")

asyncio.run(test_asyncpg())
