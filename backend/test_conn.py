import os
import psycopg2
from urllib.parse import urlparse

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("DATABASE_URL environment variable is required")
    exit(1)

if database_url.startswith("postgresql+asyncpg://"):
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

try:
    conn = psycopg2.connect(database_url, connect_timeout=3)
    print("Success")
except Exception as e:
    print("Failed:", e)
