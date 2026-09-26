import pytest
import os
from httpx import AsyncClient
from dotenv import load_dotenv

from app.core.security import create_access_token

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

@pytest.fixture
async def async_client():
    async with AsyncClient(base_url="http://127.0.0.1:8000", timeout=180.0) as ac:
        yield ac

def _get_token(email: str) -> str:
    return create_access_token({"sub": email})

@pytest.fixture
def student_token() -> str:
    return _get_token("student@aiml.hub")

@pytest.fixture
def faculty_token() -> str:
    return _get_token("admin@aiml.hub")

@pytest.fixture
def hod_token() -> str:
    return _get_token("hod@aiml.hub")
