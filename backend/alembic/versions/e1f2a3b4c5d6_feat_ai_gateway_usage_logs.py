"""feat_ai_gateway_usage_logs

Revision ID: e1f2a3b4c5d6
Revises: d6e7f8a9b0c1
Create Date: 2026-09-26 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd6e7f8a9b0c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # AI cloud usage audit log
    op.create_table(
        'ai_usage_logs',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('usage_date', sa.Date(), nullable=False),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('request_id', sa.String(64), nullable=False),
        sa.Column('tokens_in', sa.Integer(), nullable=True),
        sa.Column('tokens_out', sa.Integer(), nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('success', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reason_for_cloud_route', sa.String(500), nullable=True),
        sa.Column('quota_before', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('quota_after', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_ai_usage_user_date', 'ai_usage_logs', ['user_id', 'usage_date'])
    op.create_index('idx_ai_usage_date_role', 'ai_usage_logs', ['usage_date', 'role'])
    op.create_index('idx_ai_usage_provider', 'ai_usage_logs', ['provider', 'usage_date'])


def downgrade() -> None:
    op.drop_index('idx_ai_usage_provider', table_name='ai_usage_logs')
    op.drop_index('idx_ai_usage_date_role', table_name='ai_usage_logs')
    op.drop_index('idx_ai_usage_user_date', table_name='ai_usage_logs')
    op.drop_table('ai_usage_logs')
