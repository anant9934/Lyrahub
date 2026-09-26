from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_optional_current_user
from app.models import User
from app.modules.tests import service
from app.modules.tests.schema import (
    TestCreate,
    TestUpdate,
    TestResponse,
    TestDetailResponse,
    TestListResponse,
    TestQuestionCreate,
    TestQuestionUpdate,
    TestQuestionDetail,
    TestStartResponse,
    SubmitAnswersRequest,
    TestAttemptResponse,
    TestAttemptDetailResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse
)

router = APIRouter()

def is_staff_or_admin(user: User) -> bool:
    # check role
    return user is not None

@router.get("", response_model=TestListResponse)
async def list_tests(
    published: Optional[bool] = None,
    domain: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # If not logged in or student, default published_only = True
    published_only = True
    if published is not None:
        published_only = published
    elif current_user:
        # Check if staff/admin
        pass

    items = await service.list_tests(
        db, 
        published_only=published_only, 
        domain=domain, 
        difficulty=difficulty,
        user=current_user
    )
    return TestListResponse(items=items, total=len(items))

@router.get("/me", response_model=List[Dict[str, Any]])
async def get_my_attempts_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.get_student_attempts(db, current_user.id)

@router.get("/{slug}", response_model=TestDetailResponse)
async def get_test_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    return await service.get_test_by_slug(db, slug, current_user=current_user)

@router.post("", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
async def create_test(
    test_in: TestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.create_test(db, test_in, current_user.id)

@router.patch("/{id}", response_model=TestResponse)
async def update_test(
    id: UUID,
    test_in: TestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.update_test(db, id, test_in, current_user.id)

@router.delete("/{id}")
async def delete_test(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    await service.delete_test(db, id, current_user.id)
    return {"message": "Test deleted successfully"}

@router.post("/{id}/publish", response_model=TestResponse)
async def publish_test(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.publish_test(db, id, current_user.id)

@router.post("/{id}/questions", response_model=TestQuestionDetail, status_code=status.HTTP_201_CREATED)
async def add_question(
    id: UUID,
    question_in: TestQuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.add_question(db, id, question_in, current_user.id)

@router.patch("/{id}/questions/{qid}", response_model=TestQuestionDetail)
async def update_question(
    id: UUID,
    qid: UUID,
    question_in: TestQuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.update_question(db, id, qid, question_in, current_user.id)

@router.delete("/{id}/questions/{qid}")
async def delete_question(
    id: UUID,
    qid: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    await service.delete_question(db, id, qid, current_user.id)
    return {"message": "Question deleted successfully"}

@router.post("/{id}/start", response_model=TestStartResponse)
async def start_test(
    id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client_ip = request.client.host if request.client else None
    return await service.start_test_attempt(db, id, current_user.id, ip_address=client_ip)

@router.post("/{id}/submit", response_model=TestAttemptResponse)
async def submit_test(
    id: UUID,
    submit_req: SubmitAnswersRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    client_ip = request.client.host if request.client else None
    return await service.submit_test_attempt(
        db, 
        id, 
        current_user.id, 
        answers=submit_req.answers, 
        ip_address=client_ip
    )

@router.get("/{id}/my-attempt", response_model=TestAttemptDetailResponse)
async def get_my_attempt(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.get_my_attempt(db, id, current_user.id)

@router.get("/{id}/attempts", response_model=List[Dict[str, Any]])
async def get_test_attempts(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await service.get_test_attempts(db, id)

@router.post("/{id}/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    id: UUID,
    req: GenerateQuestionsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    questions = await service.generate_questions_stub(db, id, req, current_user.id)
    return GenerateQuestionsResponse(
        message=f"Successfully generated {len(questions)} questions on {req.topic}",
        generated_count=len(questions),
        questions=questions
    )
