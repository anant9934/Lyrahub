"""Phase 2 schema

Revision ID: d9a51dd233e9
Revises: 8632a31d15b7
Create Date: 2026-09-25 01:33:24.884711

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd9a51dd233e9'
down_revision: Union[str, None] = '8632a31d15b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to students table
    op.add_column('students', sa.Column('linkedin_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('github_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('leetcode_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('hackerrank_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('hackerearth_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('portfolio_url', sa.String(length=255), nullable=True))
    op.add_column('students', sa.Column('bio', sa.String(), nullable=True))
    op.add_column('students', sa.Column('expected_graduation', sa.DateTime(), nullable=True))
    op.add_column('students', sa.Column('current_semester', sa.Integer(), nullable=True))
    op.add_column('students', sa.Column('backlogs', sa.Integer(), server_default='0', nullable=True))
    op.add_column('students', sa.Column('tenth_percentage', sa.Numeric(precision=5, scale=2), nullable=True))
    op.add_column('students', sa.Column('twelfth_percentage', sa.Numeric(precision=5, scale=2), nullable=True))

    # Create skills table
    op.create_table('skills',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('aliases', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('idx_skills_category', 'skills', ['category'], unique=False)
    # Using execute since raw SQL is easier for GIN index in Alembic
    op.execute("CREATE INDEX idx_skills_aliases ON skills USING gin (aliases);")

    # Create student_resumes table
    op.create_table('student_resumes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_url', sa.String(), nullable=False),
        sa.Column('file_hash', sa.String(length=64), nullable=False),
        sa.Column('raw_text', sa.String(), nullable=True),
        sa.Column('parsed_skills', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('parsed_projects', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('parsed_certifications', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('parse_status', sa.String(length=20), nullable=True),
        sa.Column('parsed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_resume_hash', 'student_resumes', ['file_hash'], unique=False)
    op.create_index('idx_resume_student', 'student_resumes', ['student_id', 'deleted_at'], unique=False)

    # Create student_skills table
    op.create_table('student_skills',
        sa.Column('student_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('skill_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('proficiency', sa.String(length=20), nullable=True),
        sa.Column('source', sa.String(length=30), nullable=True),
        sa.Column('verified_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['verified_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('student_id', 'skill_id')
    )
    op.create_index('idx_student_skills_skill', 'student_skills', ['skill_id'], unique=False)
    op.create_index('idx_student_skills_student', 'student_skills', ['student_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_student_skills_student', table_name='student_skills')
    op.drop_index('idx_student_skills_skill', table_name='student_skills')
    op.drop_table('student_skills')
    
    op.drop_index('idx_resume_student', table_name='student_resumes')
    op.drop_index('idx_resume_hash', table_name='student_resumes')
    op.drop_table('student_resumes')
    
    op.execute("DROP INDEX idx_skills_aliases;")
    op.drop_index('idx_skills_category', table_name='skills')
    op.drop_table('skills')
    
    op.drop_column('students', 'twelfth_percentage')
    op.drop_column('students', 'tenth_percentage')
    op.drop_column('students', 'backlogs')
    op.drop_column('students', 'current_semester')
    op.drop_column('students', 'expected_graduation')
    op.drop_column('students', 'bio')
    op.drop_column('students', 'portfolio_url')
    op.drop_column('students', 'hackerearth_url')
    op.drop_column('students', 'hackerrank_url')
    op.drop_column('students', 'leetcode_url')
    op.drop_column('students', 'github_url')
    op.drop_column('students', 'linkedin_url')
