from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class QuestionOption(BaseModel):
    id: str
    text: str

class TestQuestionCreate(BaseModel):
    question_text: str
    question_type: str = "mcq"  # 'mcq', 'multi_select', 'short_answer'
    options: Optional[List[Dict[str, Any]]] = []
    correct_answer: Any
    explanation: Optional[str] = None
    marks: int = 1
    difficulty: Optional[str] = "intermediate"
    topic: Optional[str] = None
    display_order: Optional[int] = 1

class TestQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[Any] = None
    explanation: Optional[str] = None
    marks: Optional[int] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    display_order: Optional[int] = None

class TestQuestionPublic(BaseModel):
    id: UUID
    test_id: UUID
    question_text: str
    question_type: str
    options: Optional[List[Dict[str, Any]]] = []
    marks: int
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    display_order: int

    model_config = ConfigDict(from_attributes=True)

class TestQuestionDetail(TestQuestionPublic):
    correct_answer: Any
    explanation: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    domain: str = "ai_ml_general"  # 'ai_ml_general', 'llm', 'cv', 'nlp', 'mlops'
    difficulty: str = "intermediate"  # 'beginner', 'intermediate', 'advanced'
    duration_minutes: int = 30
    total_questions: Optional[int] = 0
    total_marks: Optional[int] = 0
    passing_marks: Optional[int] = 5
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None

class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    passing_marks: Optional[int] = None
    is_published: Optional[bool] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None

class TestResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    domain: str
    difficulty: str
    duration_minutes: int
    total_questions: int
    total_marks: int
    passing_marks: Optional[int] = None
    is_published: bool
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    created_by: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TestDetailResponse(TestResponse):
    questions_count: int = 0
    has_attempted: bool = False
    my_attempt: Optional[Dict[str, Any]] = None

class TestListResponse(BaseModel):
    items: List[TestResponse]
    total: int

class TestStartResponse(BaseModel):
    attempt_id: UUID
    test: TestResponse
    questions: List[TestQuestionPublic]
    started_at: datetime
    duration_minutes: int
    expires_at: datetime

class SubmitAnswersRequest(BaseModel):
    answers: Dict[str, Any]

class TestAttemptResponse(BaseModel):
    id: UUID
    test_id: UUID
    student_id: UUID
    started_at: datetime
    submitted_at: Optional[datetime] = None
    time_taken_seconds: Optional[int] = None
    score: Optional[Decimal] = None
    total_marks: Optional[int] = None
    percentage: Optional[Decimal] = None
    passed: Optional[bool] = None
    answers: Optional[Dict[str, Any]] = None
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TestAttemptDetailResponse(TestAttemptResponse):
    test_title: Optional[str] = None
    test_slug: Optional[str] = None
    questions_breakdown: Optional[List[Dict[str, Any]]] = None

class GenerateQuestionsRequest(BaseModel):
    topic: str
    count: int = 5
    difficulty: str = "intermediate"

class GenerateQuestionsResponse(BaseModel):
    message: str
    generated_count: int
    questions: List[TestQuestionDetail]
