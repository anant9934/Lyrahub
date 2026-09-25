"""feat_db_phase_4c_stories_groups

Revision ID: b4c8e1f2a3d5
Revises: 2c2d14776b6e
Create Date: 2026-09-25 15:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b4c8e1f2a3d5'
down_revision: Union[str, None] = '2c2d14776b6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. success_stories
    op.create_table(
        'success_stories',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=300), nullable=False),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('subtitle', sa.String(length=400), nullable=True),
        sa.Column('story_type', sa.String(length=30), nullable=False),
        sa.Column('person_id', sa.UUID(), nullable=False),
        sa.Column('person_name', sa.String(length=200), nullable=True),
        sa.Column('person_photo_url', sa.String(), nullable=True),
        sa.Column('current_role', sa.String(length=200), nullable=True),
        sa.Column('current_company', sa.String(length=200), nullable=True),
        sa.Column('batch_year', sa.Integer(), nullable=True),
        sa.Column('program', sa.String(length=100), nullable=True),
        sa.Column('summary', sa.String(), nullable=True),
        sa.Column('full_story', sa.String(), nullable=True),
        sa.Column('featured_image_url', sa.String(), nullable=True),
        sa.Column('video_url', sa.String(length=500), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('views_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_stories_type_pub', 'success_stories', ['story_type', 'is_published'], unique=False)
    op.create_index('idx_stories_featured', 'success_stories', ['featured'], unique=False, postgresql_where=sa.text('featured = true'))
    op.create_index('idx_stories_batch_year', 'success_stories', ['batch_year'], unique=False)
    op.create_index('idx_stories_tags', 'success_stories', ['tags'], unique=False, postgresql_using='gin')

    # 2. testimonials
    op.create_table(
        'testimonials',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=True),
        sa.Column('author_type', sa.String(length=20), nullable=False),
        sa.Column('author_name', sa.String(length=200), nullable=False),
        sa.Column('author_role', sa.String(length=200), nullable=True),
        sa.Column('author_photo_url', sa.String(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('text', sa.String(), nullable=False),
        sa.Column('context', sa.String(length=100), nullable=True),
        sa.Column('context_id', sa.UUID(), nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=True),
        sa.Column('moderated_by', sa.UUID(), nullable=True),
        sa.Column('moderated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('rating BETWEEN 1 AND 5', name='check_testimonial_rating'),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['moderated_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_testimonials_pub_feat', 'testimonials', ['is_published', 'is_featured'], unique=False)
    op.create_index('idx_testimonials_author_type', 'testimonials', ['author_type'], unique=False)

    # 3. groups
    op.create_table(
        'groups',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('slug', sa.String(length=200), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('tagline', sa.String(length=300), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('group_type', sa.String(length=30), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('cover_image_url', sa.String(), nullable=True),
        sa.Column('logo_url', sa.String(), nullable=True),
        sa.Column('founded_on', sa.Date(), nullable=True),
        sa.Column('faculty_advisor_id', sa.UUID(), nullable=True),
        sa.Column('student_lead_id', sa.UUID(), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('contact_phone', sa.String(length=20), nullable=True),
        sa.Column('social_links', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=True),
        sa.Column('meeting_schedule', sa.String(length=200), nullable=True),
        sa.Column('meeting_venue', sa.String(length=200), nullable=True),
        sa.Column('membership_open', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('membership_fee', sa.Numeric(precision=10, scale=2), server_default='0', nullable=True),
        sa.Column('is_official', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['faculty_advisor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['student_lead_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug')
    )
    op.create_index('idx_groups_type_active', 'groups', ['group_type', 'is_active'], unique=False)
    op.create_index('idx_groups_category', 'groups', ['category'], unique=False)
    op.create_index('idx_groups_tags', 'groups', ['tags'], unique=False, postgresql_using='gin')

    # 4. group_members
    op.create_table(
        'group_members',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=50), server_default='member', nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('left_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'student_id', name='uq_group_members_group_student')
    )
    op.create_index('idx_group_member_unique', 'group_members', ['group_id', 'student_id'], unique=True)

    # 5. group_events
    op.create_table(
        'group_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('group_id', sa.UUID(), nullable=False),
        sa.Column('event_id', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'event_id', name='uq_group_events_group_event')
    )
    op.create_index('idx_group_event_unique', 'group_events', ['group_id', 'event_id'], unique=True)


def downgrade() -> None:
    op.drop_index('idx_group_event_unique', table_name='group_events')
    op.drop_table('group_events')
    op.drop_index('idx_group_member_unique', table_name='group_members')
    op.drop_table('group_members')
    op.drop_index('idx_groups_tags', table_name='groups', postgresql_using='gin')
    op.drop_index('idx_groups_category', table_name='groups')
    op.drop_index('idx_groups_type_active', table_name='groups')
    op.drop_table('groups')
    op.drop_index('idx_testimonials_author_type', table_name='testimonials')
    op.drop_index('idx_testimonials_pub_feat', table_name='testimonials')
    op.drop_table('testimonials')
    op.drop_index('idx_stories_tags', table_name='success_stories', postgresql_using='gin')
    op.drop_index('idx_stories_batch_year', table_name='success_stories')
    op.drop_index('idx_stories_featured', table_name='success_stories')
    op.drop_index('idx_stories_type_pub', table_name='success_stories')
    op.drop_table('success_stories')
