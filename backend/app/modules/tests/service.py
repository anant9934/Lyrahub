import re
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update, delete, and_, or_
from fastapi import HTTPException, status

from app.models import (
    Test, 
    TestQuestion, 
    TestAttempt, 
    Student, 
    User,
    AuditLog
)
from app.modules.tests.schema import (
    TestCreate,
    TestUpdate,
    TestQuestionCreate,
    TestQuestionUpdate,
    GenerateQuestionsRequest
)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

async def generate_unique_slug(db: AsyncSession, title: str) -> str:
    base_slug = slugify(title)
    if not base_slug:
        base_slug = f"test-{uuid.uuid4().hex[:6]}"
    slug = base_slug
    counter = 1
    while True:
        stmt = select(Test).where(Test.slug == slug)
        res = await db.execute(stmt)
        if not res.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

async def list_tests(
    db: AsyncSession,
    published_only: bool = True,
    domain: Optional[str] = None,
    difficulty: Optional[str] = None,
    user: Optional[User] = None
) -> List[Test]:
    query = select(Test).where(Test.deleted_at.is_(None))
    
    if published_only:
        now = datetime.now(timezone.utc)
        query = query.where(
            Test.is_published.is_(True),
            or_(Test.available_from.is_(None), Test.available_from <= now),
            or_(Test.available_until.is_(None), Test.available_until >= now)
        )
    
    if domain and domain != "all":
        query = query.where(Test.domain == domain)
    if difficulty and difficulty != "all":
        query = query.where(Test.difficulty == difficulty)
        
    query = query.order_by(Test.created_at.desc())
    res = await db.execute(query)
    return list(res.scalars().all())

async def get_test_by_id(db: AsyncSession, test_id: uuid.UUID) -> Test:
    stmt = select(Test).where(Test.id == test_id, Test.deleted_at.is_(None))
    res = await db.execute(stmt)
    test = res.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

async def get_test_by_slug(
    db: AsyncSession, 
    slug: str, 
    current_user: Optional[User] = None
) -> Dict[str, Any]:
    stmt = select(Test).where(Test.slug == slug, Test.deleted_at.is_(None))
    res = await db.execute(stmt)
    test = res.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Count questions
    count_stmt = select(func.count(TestQuestion.id)).where(TestQuestion.test_id == test.id)
    count_res = await db.execute(count_stmt)
    questions_count = count_res.scalar() or 0

    has_attempted = False
    my_attempt_data = None

    if current_user:
        # Check student
        student_stmt = select(Student).where(Student.user_id == current_user.id)
        student_res = await db.execute(student_stmt)
        student = student_res.scalar_one_or_none()
        if student:
            att_stmt = select(TestAttempt).where(
                TestAttempt.test_id == test.id,
                TestAttempt.student_id == student.id
            )
            att_res = await db.execute(att_stmt)
            attempt = att_res.scalar_one_or_none()
            if attempt:
                has_attempted = True
                my_attempt_data = {
                    "id": str(attempt.id),
                    "status": attempt.status,
                    "score": float(attempt.score) if attempt.score is not None else None,
                    "percentage": float(attempt.percentage) if attempt.percentage is not None else None,
                    "passed": attempt.passed,
                    "started_at": attempt.started_at,
                    "submitted_at": attempt.submitted_at
                }

    test_dict = {
        "id": test.id,
        "title": test.title,
        "slug": test.slug,
        "description": test.description,
        "domain": test.domain,
        "difficulty": test.difficulty,
        "duration_minutes": test.duration_minutes,
        "total_questions": test.total_questions,
        "total_marks": test.total_marks,
        "passing_marks": test.passing_marks,
        "is_published": test.is_published,
        "available_from": test.available_from,
        "available_until": test.available_until,
        "created_by": test.created_by,
        "created_at": test.created_at,
        "updated_at": test.updated_at,
        "questions_count": questions_count,
        "has_attempted": has_attempted,
        "my_attempt": my_attempt_data
    }
    return test_dict

async def create_test(db: AsyncSession, test_in: TestCreate, user_id: uuid.UUID) -> Test:
    slug = await generate_unique_slug(db, test_in.title)
    test = Test(
        id=uuid.uuid4(),
        title=test_in.title,
        slug=slug,
        description=test_in.description,
        domain=test_in.domain,
        difficulty=test_in.difficulty,
        duration_minutes=test_in.duration_minutes,
        total_questions=test_in.total_questions or 0,
        total_marks=test_in.total_marks or 0,
        passing_marks=test_in.passing_marks,
        available_from=test_in.available_from,
        available_until=test_in.available_until,
        created_by=user_id,
        is_published=False
    )
    db.add(test)
    
    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="CREATE_TEST",
        resource_type="tests",
        resource_id=str(test.id),
        payload={"title": test.title, "slug": test.slug}
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(test)
    return test

async def update_test(db: AsyncSession, test_id: uuid.UUID, test_in: TestUpdate, user_id: uuid.UUID) -> Test:
    test = await get_test_by_id(db, test_id)
    update_data = test_in.model_dump(exclude_unset=True)
    
    if "title" in update_data and update_data["title"] and update_data["title"] != test.title:
        test.slug = await generate_unique_slug(db, update_data["title"])
        
    for field, val in update_data.items():
        setattr(test, field, val)
        
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="UPDATE_TEST",
        resource_type="tests",
        resource_id=str(test.id),
        payload=update_data
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(test)
    return test

async def delete_test(db: AsyncSession, test_id: uuid.UUID, user_id: uuid.UUID) -> None:
    test = await get_test_by_id(db, test_id)
    test.deleted_at = datetime.now(timezone.utc)
    
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="DELETE_TEST",
        resource_type="tests",
        resource_id=str(test.id),
        payload={"deleted_at": str(test.deleted_at)}

    )
    db.add(audit)
    await db.commit()

async def publish_test(db: AsyncSession, test_id: uuid.UUID, user_id: uuid.UUID) -> Test:
    test = await get_test_by_id(db, test_id)
    test.is_published = True
    
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="PUBLISH_TEST",
        resource_type="tests",
        resource_id=str(test.id),
        payload={"is_published": True}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(test)
    return test

async def add_question(
    db: AsyncSession, 
    test_id: uuid.UUID, 
    question_in: TestQuestionCreate, 
    user_id: uuid.UUID
) -> TestQuestion:
    test = await get_test_by_id(db, test_id)
    
    question = TestQuestion(
        id=uuid.uuid4(),
        test_id=test_id,
        question_text=question_in.question_text,
        question_type=question_in.question_type,
        options=question_in.options or [],
        correct_answer=question_in.correct_answer,
        explanation=question_in.explanation,
        marks=question_in.marks,
        difficulty=question_in.difficulty,
        topic=question_in.topic,
        display_order=question_in.display_order or (test.total_questions + 1)
    )
    db.add(question)
    
    # Update test totals
    test.total_questions += 1
    test.total_marks += question.marks
    
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="ADD_TEST_QUESTION",
        resource_type="test_questions",
        resource_id=str(question.id),
        payload={"test_id": str(test_id), "type": question.question_type}

    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(question)
    return question

async def update_question(
    db: AsyncSession,
    test_id: uuid.UUID,
    qid: uuid.UUID,
    question_in: TestQuestionUpdate,
    user_id: uuid.UUID
) -> TestQuestion:
    test = await get_test_by_id(db, test_id)
    stmt = select(TestQuestion).where(TestQuestion.id == qid, TestQuestion.test_id == test_id)
    res = await db.execute(stmt)
    question = res.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    old_marks = question.marks
    update_data = question_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(question, field, val)
        
    if "marks" in update_data and update_data["marks"] is not None:
        test.total_marks = test.total_marks - old_marks + update_data["marks"]
        
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="UPDATE_TEST_QUESTION",
        resource_type="test_questions",
        resource_id=str(question.id),
        payload=update_data
    )
    db.add(audit)
    await db.commit()
    await db.refresh(question)
    return question

async def delete_question(
    db: AsyncSession,
    test_id: uuid.UUID,
    qid: uuid.UUID,
    user_id: uuid.UUID
) -> None:
    test = await get_test_by_id(db, test_id)
    stmt = select(TestQuestion).where(TestQuestion.id == qid, TestQuestion.test_id == test_id)
    res = await db.execute(stmt)
    question = res.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    test.total_questions = max(0, test.total_questions - 1)
    test.total_marks = max(0, test.total_marks - question.marks)
    
    await db.delete(question)
    
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="DELETE_TEST_QUESTION",
        resource_type="test_questions",
        resource_id=str(qid),
        payload={"test_id": str(test_id)}
    )
    db.add(audit)
    await db.commit()

async def get_test_questions(
    db: AsyncSession, 
    test_id: uuid.UUID, 
    include_answers: bool = False
) -> List[TestQuestion]:
    stmt = select(TestQuestion).where(TestQuestion.test_id == test_id).order_by(TestQuestion.display_order.asc())
    res = await db.execute(stmt)
    return list(res.scalars().all())

async def start_test_attempt(
    db: AsyncSession,
    test_id: uuid.UUID,
    user_id: uuid.UUID,
    ip_address: Optional[str] = None
) -> Dict[str, Any]:
    test = await get_test_by_id(db, test_id)
    
    # Student record
    student_stmt = select(Student).where(Student.user_id == user_id)
    student_res = await db.execute(student_stmt)
    student = student_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Student profile required to take test")
        
    # Check duplicate attempt
    att_stmt = select(TestAttempt).where(
        TestAttempt.test_id == test_id,
        TestAttempt.student_id == student.id
    )
    att_res = await db.execute(att_stmt)
    existing_att = att_res.scalar_one_or_none()
    if existing_att:
        raise HTTPException(status_code=409, detail="Student has already attempted this test")
        
    # Check published and window
    if not test.is_published:
        raise HTTPException(status_code=400, detail="Test is not published")
        
    now = datetime.now(timezone.utc)
    if test.available_from and now < test.available_from:
        raise HTTPException(status_code=400, detail="Test is not available yet")
    if test.available_until and now > test.available_until:
        raise HTTPException(status_code=400, detail="Test availability window has expired")
        
    attempt = TestAttempt(
        id=uuid.uuid4(),
        test_id=test_id,
        student_id=student.id,
        started_at=now,
        status="in_progress",
        ip_address=ip_address
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    
    # Get questions WITHOUT answers
    questions = await get_test_questions(db, test_id, include_answers=False)
    expires_at = now + timedelta(minutes=test.duration_minutes)
    
    return {
        "attempt_id": attempt.id,
        "test": test,
        "questions": questions,
        "started_at": attempt.started_at,
        "duration_minutes": test.duration_minutes,
        "expires_at": expires_at
    }

async def submit_test_attempt(
    db: AsyncSession,
    test_id: uuid.UUID,
    user_id: uuid.UUID,
    answers: Dict[str, Any],
    ip_address: Optional[str] = None
) -> TestAttempt:
    test = await get_test_by_id(db, test_id)
    student_stmt = select(Student).where(Student.user_id == user_id)
    student_res = await db.execute(student_stmt)
    student = student_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=403, detail="Student profile required")
        
    att_stmt = select(TestAttempt).where(
        TestAttempt.test_id == test_id,
        TestAttempt.student_id == student.id
    )
    att_res = await db.execute(att_stmt)
    attempt = att_res.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found for this test")
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Attempt has already been submitted")
        
    now = datetime.now(timezone.utc)
    time_taken = int((now - attempt.started_at).total_seconds())
    
    # Timer validation with 60 second grace period
    allowed_seconds = test.duration_minutes * 60 + 60
    is_time_expired = time_taken > allowed_seconds
    
    # Auto-grade
    questions = await get_test_questions(db, test_id, include_answers=True)
    earned_score = Decimal("0.0")
    total_marks = 0
    
    for q in questions:
        total_marks += q.marks
        user_ans = answers.get(str(q.id))
        if user_ans is None:
            continue
            
        correct = q.correct_answer
        if q.question_type == "mcq":
            # Compare formatted list or string
            user_val = user_ans[0] if isinstance(user_ans, list) and len(user_ans) > 0 else user_ans
            correct_val = correct[0] if isinstance(correct, list) and len(correct) > 0 else correct
            if str(user_val).strip().lower() == str(correct_val).strip().lower():
                earned_score += Decimal(q.marks)
        elif q.question_type == "multi_select":
            user_set = set(str(x).strip().lower() for x in user_ans) if isinstance(user_ans, list) else {str(user_ans).strip().lower()}
            correct_set = set(str(x).strip().lower() for x in correct) if isinstance(correct, list) else {str(correct).strip().lower()}
            if user_set == correct_set:
                earned_score += Decimal(q.marks)
        elif q.question_type == "short_answer":
            # Keyword matching
            target_kw = str(correct).strip().lower()
            if target_kw in str(user_ans).strip().lower():
                earned_score += Decimal(q.marks)
                
    calc_total_marks = total_marks if total_marks > 0 else (test.total_marks or 1)
    percentage = round((earned_score / Decimal(calc_total_marks)) * Decimal("100.0"), 2)
    passing_threshold = test.passing_marks or 0
    passed = earned_score >= Decimal(passing_threshold)
    
    attempt.submitted_at = now
    attempt.time_taken_seconds = time_taken
    attempt.score = earned_score
    attempt.total_marks = calc_total_marks
    attempt.percentage = percentage
    attempt.passed = passed
    attempt.answers = answers
    attempt.status = "submitted"
    if ip_address:
        attempt.ip_address = ip_address
        
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="SUBMIT_TEST_ATTEMPT",
        resource_type="test_attempts",
        resource_id=str(attempt.id),
        payload={"score": float(earned_score), "percentage": float(percentage), "passed": passed}
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(attempt)
    return attempt

async def get_my_attempt(db: AsyncSession, test_id: uuid.UUID, user_id: uuid.UUID) -> Dict[str, Any]:
    test = await get_test_by_id(db, test_id)
    student_stmt = select(Student).where(Student.user_id == user_id)
    student_res = await db.execute(student_stmt)
    student = student_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    att_stmt = select(TestAttempt).where(
        TestAttempt.test_id == test_id,
        TestAttempt.student_id == student.id
    )
    att_res = await db.execute(att_stmt)
    attempt = att_res.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    # Breakdown with explanations
    questions = await get_test_questions(db, test_id, include_answers=True)
    breakdown = []
    user_answers = attempt.answers or {}
    
    for q in questions:
        user_ans = user_answers.get(str(q.id))
        breakdown.append({
            "id": str(q.id),
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "user_answer": user_ans,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "marks": q.marks
        })
        
    return {
        "id": attempt.id,
        "test_id": attempt.test_id,
        "student_id": attempt.student_id,
        "test_title": test.title,
        "test_slug": test.slug,
        "started_at": attempt.started_at,
        "submitted_at": attempt.submitted_at,
        "time_taken_seconds": attempt.time_taken_seconds,
        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "percentage": attempt.percentage,
        "passed": attempt.passed,
        "status": attempt.status,
        "answers": attempt.answers,
        "created_at": attempt.created_at,
        "questions_breakdown": breakdown
    }

async def get_test_attempts(db: AsyncSession, test_id: uuid.UUID) -> List[Dict[str, Any]]:
    stmt = (
        select(TestAttempt, Student, User)
        .join(Student, TestAttempt.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(TestAttempt.test_id == test_id)
        .order_by(TestAttempt.score.desc().nullslast())
    )
    res = await db.execute(stmt)
    items = []
    for att, stud, usr in res.all():
        items.append({
            "id": att.id,
            "student_id": att.student_id,
            "student_email": usr.email,
            "student_reg_no": stud.reg_no,
            "started_at": att.started_at,
            "submitted_at": att.submitted_at,
            "time_taken_seconds": att.time_taken_seconds,
            "score": att.score,
            "total_marks": att.total_marks,
            "percentage": att.percentage,
            "passed": att.passed,
            "status": att.status
        })
    return items

async def get_student_attempts(db: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
    student_stmt = select(Student).where(Student.user_id == user_id)
    student_res = await db.execute(student_stmt)
    student = student_res.scalar_one_or_none()
    if not student:
        return []
        
    stmt = (
        select(TestAttempt, Test)
        .join(Test, TestAttempt.test_id == Test.id)
        .where(TestAttempt.student_id == student.id)
        .order_by(TestAttempt.submitted_at.desc().nullslast())
    )
    res = await db.execute(stmt)
    history = []
    for att, tst in res.all():
        history.append({
            "id": att.id,
            "test_id": att.test_id,
            "test_title": tst.title,
            "test_slug": tst.slug,
            "domain": tst.domain,
            "started_at": att.started_at,
            "submitted_at": att.submitted_at,
            "score": att.score,
            "total_marks": att.total_marks,
            "percentage": att.percentage,
            "passed": att.passed,
            "status": att.status
        })
    return history

SAMPLE_AI_QUESTIONS = [
    {
        "question_text": "Which activation function helps alleviate the vanishing gradient problem in deep neural networks by outputting 0 for negative inputs and linear values for positive inputs?",
        "question_type": "mcq",
        "options": [
            {"id": "a", "text": "Sigmoid"},
            {"id": "b", "text": "Tanh"},
            {"id": "c", "text": "ReLU (Rectified Linear Unit)"},
            {"id": "d", "text": "Softmax"}
        ],
        "correct_answer": ["c"],
        "explanation": "ReLU returns max(0, x), ensuring gradients don't saturate for positive activations and greatly mitigating vanishing gradients.",
        "marks": 2,
        "topic": "neural_networks",
        "difficulty": "beginner"
    },
    {
        "question_text": "What is the primary mechanism behind the Transformer architecture introduced in 'Attention Is All You Need'?",
        "question_type": "mcq",
        "options": [
            {"id": "a", "text": "Recurrent LSTM Cells"},
            {"id": "b", "text": "Multi-Head Self-Attention"},
            {"id": "c", "text": "Markov Random Fields"},
            {"id": "d", "text": "Dilated Convolutions"}
        ],
        "correct_answer": ["b"],
        "explanation": "Multi-Head Self-Attention allows Transformers to model dependencies between tokens regardless of their positional distance.",
        "marks": 2,
        "topic": "transformers",
        "difficulty": "intermediate"
    },
    {
        "question_text": "Select all regularisation techniques used to prevent overfitting in Machine Learning models:",
        "question_type": "multi_select",
        "options": [
            {"id": "a", "text": "Dropout"},
            {"id": "b", "text": "L2 Weight Decay"},
            {"id": "c", "text": "Early Stopping"},
            {"id": "d", "text": "Increasing Model Parameter Count"}
        ],
        "correct_answer": ["a", "b", "c"],
        "explanation": "Dropout, L2 penalty, and Early Stopping reduce model variance and overfitting. Increasing parameters generally increases model capacity.",
        "marks": 2,
        "topic": "regularization",
        "difficulty": "intermediate"
    },
    {
        "question_text": "What loss function is standardly used for binary classification tasks modeled with a sigmoid output layer?",
        "question_type": "short_answer",
        "options": [],
        "correct_answer": "binary cross entropy",
        "explanation": "Binary Cross-Entropy (or Log Loss) evaluates binary probabilistic classifications.",
        "marks": 2,
        "topic": "loss_functions",
        "difficulty": "beginner"
    },
    {
        "question_text": "In object detection, what metric measures the overlap between a predicted bounding box and ground truth box?",
        "question_type": "mcq",
        "options": [
            {"id": "a", "text": "IoU (Intersection over Union)"},
            {"id": "b", "text": "Cosine Similarity"},
            {"id": "c", "text": "KL Divergence"},
            {"id": "d", "text": "Euclidean Norm"}
        ],
        "correct_answer": ["a"],
        "explanation": "Intersection over Union (IoU) measures the area of overlap divided by the area of union between predicted and ground truth boxes.",
        "marks": 2,
        "topic": "computer_vision",
        "difficulty": "intermediate"
    }
]

async def generate_questions_stub(
    db: AsyncSession,
    test_id: uuid.UUID,
    req: GenerateQuestionsRequest,
    user_id: uuid.UUID
) -> List[TestQuestion]:
    test = await get_test_by_id(db, test_id)
    count = min(req.count, len(SAMPLE_AI_QUESTIONS))
    created = []
    
    current_order = test.total_questions
    for item in SAMPLE_AI_QUESTIONS[:count]:
        current_order += 1
        q = TestQuestion(
            id=uuid.uuid4(),
            test_id=test_id,
            question_text=item["question_text"],
            question_type=item["question_type"],
            options=item["options"],
            correct_answer=item["correct_answer"],
            explanation=item["explanation"],
            marks=item["marks"],
            difficulty=req.difficulty or item["difficulty"],
            topic=req.topic or item["topic"],
            display_order=current_order
        )
        db.add(q)
        test.total_questions += 1
        test.total_marks += q.marks
        created.append(q)
        
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user_id,
        action="GENERATE_TEST_QUESTIONS",
        resource_type="tests",
        resource_id=str(test_id),
        payload={"topic": req.topic, "count": count}

    )
    db.add(audit)
    
    await db.commit()
    for q in created:
        await db.refresh(q)
    return created
