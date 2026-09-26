import pytest
from httpx import AsyncClient
import uuid

@pytest.mark.asyncio
async def test_create_test_faculty(async_client: AsyncClient, faculty_token: str):
    res = await async_client.post(
        "/api/v1/tests",
        json={
            "title": f"Integration Test {uuid.uuid4().hex[:6]}",
            "domain": "ai_ml_general",
            "difficulty": "beginner",
            "duration_minutes": 20,
            "total_questions": 5,
            "total_marks": 10
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert "slug" in data
    assert data["is_published"] is False

@pytest.mark.asyncio
async def test_student_cannot_create_test(async_client: AsyncClient, student_token: str):
    res = await async_client.post(
        "/api/v1/tests",
        json={
            "title": "Unauthorized Student Test",
            "domain": "llm",
            "difficulty": "intermediate",
            "duration_minutes": 10
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 403

@pytest.mark.asyncio
async def test_attempt_lifecycle(async_client: AsyncClient, faculty_token: str, student_token: str):
    # 1. Faculty creates test
    create_res = await async_client.post(
        "/api/v1/tests",
        json={
            "title": f"Attempt Lifecycle Test {uuid.uuid4().hex[:6]}",
            "domain": "nlp",
            "difficulty": "intermediate",
            "duration_minutes": 15,
            "total_questions": 1,
            "total_marks": 5,
            "passing_marks": 3
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert create_res.status_code == 201
    test_id = create_res.json()["id"]

    # 2. Faculty adds MCQ question
    q_res = await async_client.post(
        f"/api/v1/tests/{test_id}/questions",
        json={
            "question_text": "What is self-attention mechanism?",
            "question_type": "mcq",
            "options": [{"id": "a", "text": "Relates different positions of a sequence"}, {"id": "b", "text": "Loss function"}],
            "correct_answer": ["a"],
            "marks": 5,
            "topic": "transformers"
        },
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert q_res.status_code == 201
    question_id = q_res.json()["id"]

    # 3. Faculty publishes test
    pub_res = await async_client.post(
        f"/api/v1/tests/{test_id}/publish",
        headers={"Authorization": f"Bearer {faculty_token}"}
    )
    assert pub_res.status_code == 200

    # 4. Student starts attempt
    start_res = await async_client.post(
        f"/api/v1/tests/{test_id}/start",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert "attempt_id" in start_data
    assert len(start_data["questions"]) == 1

    # 5. Duplicate attempt blocked
    dup_res = await async_client.post(
        f"/api/v1/tests/{test_id}/start",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert dup_res.status_code == 409

    # 6. Student submits attempt with correct answer
    sub_res = await async_client.post(
        f"/api/v1/tests/{test_id}/submit",
        json={"answers": {question_id: ["a"]}},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert float(sub_data["score"]) == 5.0
    assert sub_data["passed"] is True

    # 7. Student checks own attempt
    my_att = await async_client.get(
        f"/api/v1/tests/{test_id}/my-attempt",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert my_att.status_code == 200
    assert my_att.json()["passed"] is True

