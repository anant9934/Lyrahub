"""feat_db_phase_4d_courses_programs

Revision ID: c5d9f3a1e2b4
Revises: b4c8e1f2a3d5
Create Date: 2026-09-26 13:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c5d9f3a1e2b4'
down_revision: Union[str, None] = 'b4c8e1f2a3d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. programs
    op.create_table(
        'programs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=200), nullable=True),
        sa.Column('code', sa.String(length=50), nullable=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('short_name', sa.String(length=50), nullable=True),
        sa.Column('degree', sa.String(length=20), nullable=True),
        sa.Column('level', sa.String(length=20), nullable=True),
        sa.Column('duration_years', sa.Numeric(precision=3, scale=1), nullable=True),
        sa.Column('total_credits', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('eligibility', sa.Text(), nullable=True),
        sa.Column('admission_process', sa.Text(), nullable=True),
        sa.Column('career_opportunities', sa.Text(), nullable=True),
        sa.Column('program_outcomes', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('program_specific_outcomes', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('cover_image_url', sa.Text(), nullable=True),
        sa.Column('brochure_url', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_programs_level_active', 'programs', ['level', 'is_active'])

    # 2. courses
    op.create_table(
        'courses',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=200), nullable=True),
        sa.Column('code', sa.String(length=20), nullable=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('short_name', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('credits', sa.Numeric(precision=3, scale=1), nullable=True),
        sa.Column('semester', sa.Integer(), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('course_type', sa.String(length=30), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('prerequisites', sa.Text(), nullable=True),
        sa.Column('syllabus', sa.Text(), nullable=True),
        sa.Column('ip_lp_notes', sa.Text(), nullable=True),
        sa.Column('learning_outcomes', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('evaluation_scheme', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True),
        sa.Column('references', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('edurev_benefits', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
        sa.UniqueConstraint('code')
    )
    op.create_index('idx_courses_semester_type', 'courses', ['semester', 'course_type'])
    op.create_index('idx_courses_learning_outcomes', 'courses', ['learning_outcomes'], postgresql_using='gin')

    # 3. program_courses
    op.create_table(
        'program_courses',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('program_id', sa.UUID(), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('semester', sa.Integer(), nullable=True),
        sa.Column('is_mandatory', sa.Boolean(), server_default='true', nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['program_id'], ['programs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_program_course_unique', 'program_courses', ['program_id', 'course_id'], unique=True)

    # 4. course_faculty
    op.create_table(
        'course_faculty',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('course_id', sa.UUID(), nullable=False),
        sa.Column('faculty_id', sa.UUID(), nullable=False),
        sa.Column('academic_year', sa.String(length=20), nullable=True),
        sa.Column('section', sa.String(length=10), nullable=True),
        sa.Column('role', sa.String(length=30), server_default='primary', nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['faculty_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_course_faculty_unique', 'course_faculty', ['course_id', 'faculty_id', 'academic_year', 'section'], unique=True)

    # 5. opportunities
    op.create_table(
        'opportunities',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=250), nullable=True),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('organization', sa.String(length=200), nullable=False),
        sa.Column('opportunity_type', sa.String(length=30), nullable=True),
        sa.Column('mode', sa.String(length=20), nullable=True),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('eligibility', sa.Text(), nullable=True),
        sa.Column('required_skills', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('stipend_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('stipend_currency', sa.String(length=3), server_default='INR', nullable=True),
        sa.Column('duration_weeks', sa.Integer(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('application_url', sa.String(length=500), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('cover_image_url', sa.Text(), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('posted_by', sa.UUID(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('verified_by', sa.UUID(), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['posted_by'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['verified_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_opportunities_type_active_deadline', 'opportunities', ['opportunity_type', 'is_active', 'application_deadline'])
    op.create_index('idx_opportunities_organization', 'opportunities', ['organization'])
    op.create_index('idx_opportunities_tags', 'opportunities', ['tags'], postgresql_using='gin')
    op.create_index('idx_opportunities_skills', 'opportunities', ['required_skills'], postgresql_using='gin')

    # 6. opportunity_applications
    op.create_table(
        'opportunity_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('opportunity_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='interested', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_opportunity_application_unique', 'opportunity_applications', ['opportunity_id', 'student_id'], unique=True)


def downgrade() -> None:
    op.drop_table('opportunity_applications')
    op.drop_table('opportunities')
    op.drop_table('course_faculty')
    op.drop_table('program_courses')
    op.drop_table('courses')
    op.drop_table('programs')
