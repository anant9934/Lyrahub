import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException

from app.modules.tests.service import (
    slugify,
    generate_unique_slug,
    create_test,
    list_tests,
    get_test_by_slug,
    get_test_by_id,
    update_test,
    delete_test,
    publish_test,
    add_question,
    update_question,
    delete_question,
    generate_questions_stub,
    start_test_attempt,
    submit_test_attempt,
    get_my_attempt,
    get_test_attempts,
    get_student_attempts
)
from app.modules.tests import schema
from app.models import Test, TestQuestion, TestAttempt, Student, User

def test_test_schemas():
    t_create = schema.TestCreate(
        title="Deep Learning Foundations",
        description="Core concepts of backprop and CNNs",
        domain="ai_ml_general",
        difficulty="intermediate",
        duration_minutes=30,
        total_questions=10,
        total_marks=20,
        passing_marks=12
    )
    assert t_create.title == "Deep Learning Foundations"
    assert t_create.duration_minutes == 30

    q_create = schema.TestQuestionCreate(
        question_text="What is gradient descent?",
        question_type="mcq",
        options=[{"id": "a", "text": "Optimization algorithm"}, {"id": "b", "text": "Activation function"}],
        correct_answer=["a"],
        marks=2,
        difficulty="beginner",
        topic="neural_networks"
    )
    assert q_create.marks == 2
    assert q_create.question_type == "mcq"

    submit_req = schema.SubmitAnswersRequest(
        answers={"q1": ["a"]}
    )
    assert submit_req.answers["q1"] == ["a"]

def test_slugify():
    assert slugify("Advanced AI & Machine Learning 101!") == "advanced-ai-machine-learning-101"

@pytest.mark.asyncio
async def test_generate_unique_slug():
    db = AsyncMock()
    existing = Test(id=uuid4(), slug="deep-learning")
    res1 = MagicMock()
    res1.scalar_one_or_none.return_value = existing
    res2 = MagicMock()
    res2.scalar_one_or_none.return_value = None
    db.execute.side_effect = [res1, res2]

    slug = await generate_unique_slug(db, "Deep Learning")
    assert slug.startswith("deep-learning-")

@pytest.mark.asyncio
async def test_create_test():
    db = AsyncMock()
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    user_id = uuid4()
    req = schema.TestCreate(
        title="Computer Vision Quiz",
        domain="cv",
        difficulty="beginner",
        duration_minutes=15,
        total_questions=5,
        total_marks=10
    )

    test = await create_test(db, req, user_id)
    assert test.title == "Computer Vision Quiz"
    assert test.created_by == user_id
    assert db.add.called
    assert db.commit.called

@pytest.mark.asyncio
async def test_list_tests():
    db = AsyncMock()
    items_mock = MagicMock()
    items_mock.scalars.return_value.all.return_value = [
        Test(id=uuid4(), title="Transformer Test", is_published=True)
    ]
    db.execute.return_value = items_mock

    tests = await list_tests(db, published_only=True, domain="nlp")
    assert len(tests) == 1
    assert tests[0].title == "Transformer Test"

@pytest.mark.asyncio
async def test_publish_test():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    existing = Test(id=test_id, title="Test", is_published=False, deleted_at=None)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=existing))

    published = await publish_test(db, test_id, user_id)
    assert published.is_published is True
    assert db.commit.called

@pytest.mark.asyncio
async def test_add_and_delete_question():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    existing_test = Test(id=test_id, total_questions=0, total_marks=0, deleted_at=None)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test))

    q_in = schema.TestQuestionCreate(
        question_text="What is backprop?",
        question_type="mcq",
        options=[{"id": "a", "text": "Chain rule"}],
        correct_answer=["a"],
        marks=2
    )

    q = await add_question(db, test_id, q_in, user_id)
    assert q.question_text == "What is backprop?"
    assert existing_test.total_questions == 1
    assert existing_test.total_marks == 2

    # Delete question
    q_to_del = TestQuestion(id=uuid4(), test_id=test_id, marks=2)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=q_to_del))
    ]
    await delete_question(db, test_id, q_to_del.id, user_id)
    assert db.delete.called

@pytest.mark.asyncio
async def test_generate_ai_questions():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    existing_test = Test(id=test_id, total_questions=0, total_marks=0, deleted_at=None)
    db.execute.return_value = MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test))

    gen_req = schema.GenerateQuestionsRequest(
        topic="Transformers & Attention",
        count=3,
        difficulty="intermediate"
    )

    res = await generate_questions_stub(db, test_id, gen_req, user_id)
    assert len(res) == 3
    assert existing_test.total_questions == 3
    assert db.commit.called

@pytest.mark.asyncio
async def test_start_attempt():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    student_id = uuid4()

    existing_test = Test(id=test_id, title="PyTorch Exam", is_published=True, duration_minutes=30, deleted_at=None)
    student = Student(id=student_id, user_id=user_id)

    q1 = TestQuestion(id=uuid4(), test_id=test_id, question_text="What is a tensor?", options=[], marks=1, display_order=1)
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=None)), # no previous attempt
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[q1]))))
    ]

    attempt_res = await start_test_attempt(db, test_id, user_id)
    assert "attempt_id" in attempt_res
    assert attempt_res["test"].title == "PyTorch Exam"
    assert len(attempt_res["questions"]) == 1

@pytest.mark.asyncio
async def test_start_attempt_duplicate_conflict():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    student_id = uuid4()

    existing_test = Test(id=test_id, is_published=True, deleted_at=None)
    student = Student(id=student_id, user_id=user_id)
    prev_attempt = TestAttempt(id=uuid4(), test_id=test_id, student_id=student_id)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=prev_attempt))
    ]

    with pytest.raises(HTTPException) as exc:
        await start_test_attempt(db, test_id, user_id)
    assert exc.value.status_code == 409

@pytest.mark.asyncio
async def test_submit_attempt_grading():
    db = AsyncMock()
    test_id = uuid4()
    user_id = uuid4()
    student_id = uuid4()
    q_id = uuid4()

    existing_test = Test(id=test_id, total_marks=10, passing_marks=5, duration_minutes=30, deleted_at=None)
    student = Student(id=student_id, user_id=user_id)
    attempt = TestAttempt(
        id=uuid4(),
        test_id=test_id,
        student_id=student_id,
        started_at=datetime.now(timezone.utc) - timedelta(minutes=5),
        status="in_progress"
    )

    q = TestQuestion(
        id=q_id,
        test_id=test_id,
        question_type="mcq",
        correct_answer=["b"],
        marks=10
    )

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=existing_test)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=student)),
        MagicMock(scalar_one_or_none=MagicMock(return_value=attempt)),
        MagicMock(scalars=MagicMock(return_value=MagicMock(all=MagicMock(return_value=[q]))))
    ]

    submit_in = schema.SubmitAnswersRequest(
        answers={str(q_id): ["b"]}
    )

    res = await submit_test_attempt(db, test_id, user_id, submit_in.answers)
    assert res.score == 10.0
    assert res.percentage == 100.0
    assert res.passed is True
    assert res.status == "submitted"
    assert db.commit.called

