"""feat_db_phase_4e_tests_approvals_qr_leadership

Revision ID: d6e7f8a9b0c1
Revises: c5d9f3a1e2b4
Create Date: 2026-09-26 14:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd6e7f8a9b0c1'
down_revision: Union[str, None] = 'c5d9f3a1e2b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. tests
    op.create_table(
        'tests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=250), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(length=50), server_default='ai_ml_general', nullable=False),
        sa.Column('difficulty', sa.String(length=20), server_default='intermediate', nullable=True),
        sa.Column('duration_minutes', sa.Integer(), server_default='30', nullable=False),
        sa.Column('total_questions', sa.Integer(), server_default='10', nullable=False),
        sa.Column('total_marks', sa.Integer(), server_default='10', nullable=False),
        sa.Column('passing_marks', sa.Integer(), server_default='5', nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('available_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('available_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_tests_published_window', 'tests', ['is_published', 'available_from', 'available_until'])

    # 2. test_questions
    op.create_table(
        'test_questions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('test_id', sa.UUID(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(length=20), server_default='mcq', nullable=False),
        sa.Column('options', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('correct_answer', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('marks', sa.Integer(), server_default='1', nullable=True),
        sa.Column('difficulty', sa.String(length=20), server_default='intermediate', nullable=True),
        sa.Column('topic', sa.String(length=100), nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='1', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_test_questions_test_order', 'test_questions', ['test_id', 'display_order'])

    # 3. test_attempts
    op.create_table(
        'test_attempts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('test_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_taken_seconds', sa.Integer(), nullable=True),
        sa.Column('score', sa.Numeric(precision=6, scale=2), nullable=True),
        sa.Column('total_marks', sa.Integer(), nullable=True),
        sa.Column('percentage', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('passed', sa.Boolean(), nullable=True),
        sa.Column('answers', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True),
        sa.Column('status', sa.String(length=20), server_default='in_progress', nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['test_id'], ['tests.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_test_attempt_unique', 'test_attempts', ['test_id', 'student_id'], unique=True)
    op.create_index('idx_test_attempts_student_submitted', 'test_attempts', ['student_id', 'submitted_at'])

    # 4. change_requests
    op.create_table(
        'change_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('requester_id', sa.UUID(), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.UUID(), nullable=True),
        sa.Column('action', sa.String(length=20), server_default='update', nullable=False),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('current_state', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=True),
        sa.Column('reviewer_id', sa.UUID(), nullable=True),
        sa.Column('reviewer_comment', sa.Text(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_change_requests_status_created', 'change_requests', ['status', 'created_at'])
    op.create_index('idx_change_requests_requester_status', 'change_requests', ['requester_id', 'status'])
    op.create_index('idx_change_requests_reviewer_status', 'change_requests', ['reviewer_id', 'status'])

    # 5. approval_notifications
    op.create_table(
        'approval_notifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('change_request_id', sa.UUID(), nullable=False),
        sa.Column('recipient_id', sa.UUID(), nullable=False),
        sa.Column('channel', sa.String(length=20), server_default='in_app', nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['change_request_id'], ['change_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_approval_notif_recipient', 'approval_notifications', ['recipient_id', 'read_at'])

    # 6. attendance_sessions
    op.create_table(
        'attendance_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=True),
        sa.Column('section', sa.String(length=10), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_attendance_sessions_course_active', 'attendance_sessions', ['course_id', 'is_active'])

    # 7. attendance_records
    op.create_table(
        'attendance_records',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('session_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('marked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['attendance_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_attendance_record_unique', 'attendance_records', ['session_id', 'student_id'], unique=True)

    # 8. leadership_profiles
    op.create_table(
        'leadership_profiles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('role', sa.String(length=30), nullable=False),
        sa.Column('display_title', sa.String(length=100), nullable=False),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('short_bio', sa.Text(), nullable=True),
        sa.Column('full_bio', sa.Text(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('vision', sa.Text(), nullable=True),
        sa.Column('qualifications', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('experience_years', sa.Integer(), server_default='0', nullable=True),
        sa.Column('research_interests', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('publications_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('office_location', sa.String(length=200), nullable=True),
        sa.Column('office_hours', sa.String(length=200), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('google_scholar_url', sa.String(length=500), nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('idx_leadership_role_active', 'leadership_profiles', ['role', 'is_active'])


def downgrade() -> None:
    op.drop_index('idx_leadership_role_active', table_name='leadership_profiles')
    op.drop_table('leadership_profiles')

    op.drop_index('idx_attendance_record_unique', table_name='attendance_records')
    op.drop_table('attendance_records')

    op.drop_index('idx_attendance_sessions_course_active', table_name='attendance_sessions')
    op.drop_table('attendance_sessions')

    op.drop_index('idx_approval_notif_recipient', table_name='approval_notifications')
    op.drop_table('approval_notifications')

    op.drop_index('idx_change_requests_reviewer_status', table_name='change_requests')
    op.drop_index('idx_change_requests_requester_status', table_name='change_requests')
    op.drop_index('idx_change_requests_status_created', table_name='change_requests')
    op.drop_table('change_requests')

    op.drop_index('idx_test_attempts_student_submitted', table_name='test_attempts')
    op.drop_index('idx_test_attempt_unique', table_name='test_attempts')
    op.drop_table('test_attempts')

    op.drop_index('idx_test_questions_test_order', table_name='test_questions')
    op.drop_table('test_questions')

    op.drop_index('idx_tests_published_window', table_name='tests')
    op.drop_table('tests')
