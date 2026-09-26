"""feat_phase5_aida_rag_knowledge_conversations

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-09-26 19:00:00.000000

Creates:
  - knowledge_documents: RAG document registry
  - knowledge_chunks: semantic chunks with pgvector embeddings
  - ai_conversations: lightweight conversation session
  - ai_messages: per-message audit + routing trace
  - ai_model_health: provider/model availability tracking
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'f2a3b4c5d6e7'
down_revision: Union[str, None] = 'e1f2a3b4c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure pgvector extension is available
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # ── knowledge_documents ─────────────────────────────────────────────────
    op.create_table(
        'knowledge_documents',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('source_type', sa.String(50), nullable=False),
        sa.Column('source_path', sa.String(1000), nullable=True),
        sa.Column('access_scope', sa.String(100), nullable=False, server_default='public'),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('token_estimate', sa.Integer, nullable=True),
        sa.Column('embedding_model', sa.String(100), nullable=True),
        sa.Column('embedding_version', sa.String(50), nullable=True),
        sa.Column('indexing_status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('indexing_error', sa.String(500), nullable=True),
        sa.Column('uploader_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('chunk_count', sa.Integer, nullable=True),
        sa.Column('tags', postgresql.JSONB, nullable=True),
        sa.Column('metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_knowledge_doc_category', 'knowledge_documents', ['category'])
    op.create_index('idx_knowledge_doc_hash', 'knowledge_documents', ['content_hash'])
    op.create_index('idx_knowledge_doc_status', 'knowledge_documents', ['indexing_status'])
    op.create_index('idx_knowledge_doc_scope', 'knowledge_documents', ['access_scope'])

    # ── knowledge_chunks (with pgvector embedding column) ───────────────────
    op.create_table(
        'knowledge_chunks',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('document_id', sa.UUID(), sa.ForeignKey('knowledge_documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_index', sa.Integer, nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('token_estimate', sa.Integer, nullable=True),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('embedding_model', sa.String(100), nullable=True),
        sa.Column('embedding_version', sa.String(50), nullable=True),
        sa.Column('embedding_json', postgresql.JSONB, nullable=True),   # JSON fallback
        sa.Column('metadata', postgresql.JSONB, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_chunk_document_id', 'knowledge_chunks', ['document_id'])
    op.create_index('idx_chunk_content_hash', 'knowledge_chunks', ['content_hash'])

    # Add pgvector embedding column (768-dim for nomic-embed-text)
    op.execute("ALTER TABLE knowledge_chunks ADD COLUMN IF NOT EXISTS embedding vector(768)")

    # HNSW index for fast ANN search
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_chunk_embedding_hnsw
        ON knowledge_chunks
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64)
    """)

    # ── ai_conversations ────────────────────────────────────────────────────
    op.create_table(
        'ai_conversations',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('summary', sa.String(2000), nullable=True),
        sa.Column('last_route', sa.String(50), nullable=True),
        sa.Column('message_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_conversation_user', 'ai_conversations', ['user_id'])

    # ── ai_messages ─────────────────────────────────────────────────────────
    op.create_table(
        'ai_messages',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conversation_id', sa.UUID(), sa.ForeignKey('ai_conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.String(10000), nullable=False),
        sa.Column('route', sa.String(50), nullable=True),
        sa.Column('intent', sa.String(100), nullable=True),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('latency_ms', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_message_conversation', 'ai_messages', ['conversation_id'])

    # ── ai_model_health ─────────────────────────────────────────────────────
    op.create_table(
        'ai_model_health',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('model_id', sa.String(200), nullable=False, unique=True),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('model_type', sa.String(50), nullable=False),
        sa.Column('is_available', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('last_checked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_latency_ms', sa.Integer, nullable=True),
        sa.Column('error_message', sa.String(500), nullable=True),
        sa.Column('consecutive_failures', sa.Integer, nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_model_health_provider', 'ai_model_health', ['provider'])


def downgrade() -> None:
    op.drop_table('ai_model_health')
    op.drop_table('ai_messages')
    op.drop_table('ai_conversations')
    op.drop_table('knowledge_chunks')
    op.drop_table('knowledge_documents')
