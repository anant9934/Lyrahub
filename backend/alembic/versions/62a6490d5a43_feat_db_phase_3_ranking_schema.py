"""feat(db): phase 3 ranking schema

Revision ID: 62a6490d5a43
Revises: d9a51dd233e9
Create Date: 2026-09-25 02:49:24.683670

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62a6490d5a43'
down_revision: Union[str, None] = 'd9a51dd233e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    import uuid
    from sqlalchemy.dialects import postgresql
    
    ranking_criteria = op.create_table(
        'ranking_criteria',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('weight', sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.UniqueConstraint('code')
    )

    op.create_table(
        'ranking_snapshots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id'), nullable=False),
        sa.Column('snapshot_date', sa.Date(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('score', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('breakdown', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('idx_rank_snap_stu_date', 'ranking_snapshots', ['student_id', 'snapshot_date'], unique=False)
    op.create_index('idx_rank_snap_date_rank', 'ranking_snapshots', ['snapshot_date', 'rank'], unique=False)
    op.create_index('idx_rank_snap_breakdown', 'ranking_snapshots', ['breakdown'], postgresql_using='gin')

    op.create_table(
        'ranking_config',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('weights', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    )

    op.execute("""
        CREATE MATERIALIZED VIEW mv_current_rankings AS
        SELECT DISTINCT ON (student_id) student_id, rank, score, breakdown
        FROM ranking_snapshots
        ORDER BY student_id, snapshot_date DESC;
    """)
    op.execute("CREATE UNIQUE INDEX idx_mv_curr_rankings_student_id ON mv_current_rankings (student_id);")
    op.execute("CREATE INDEX idx_mv_curr_rankings_rank ON mv_current_rankings (rank);")

    op.bulk_insert(ranking_criteria, [
        {"id": uuid.uuid4(), "code": "test_score", "name": "Test Score", "weight": 0.25},
        {"id": uuid.uuid4(), "code": "cgpa", "name": "CGPA", "weight": 0.15},
        {"id": uuid.uuid4(), "code": "certifications", "name": "Certifications", "weight": 0.15},
        {"id": uuid.uuid4(), "code": "projects", "name": "Projects", "weight": 0.15},
        {"id": uuid.uuid4(), "code": "coding_stats", "name": "Coding Stats", "weight": 0.10},
        {"id": uuid.uuid4(), "code": "resume_quality", "name": "Resume Quality", "weight": 0.10},
        {"id": uuid.uuid4(), "code": "internships", "name": "Internships", "weight": 0.05},
        {"id": uuid.uuid4(), "code": "revenue", "name": "Revenue", "weight": 0.05},
    ])


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_current_rankings;")
    op.drop_table('ranking_config')
    op.drop_index('idx_rank_snap_breakdown', table_name='ranking_snapshots', postgresql_using='gin')
    op.drop_index('idx_rank_snap_date_rank', table_name='ranking_snapshots')
    op.drop_index('idx_rank_snap_stu_date', table_name='ranking_snapshots')
    op.drop_table('ranking_snapshots')
    op.drop_table('ranking_criteria')
