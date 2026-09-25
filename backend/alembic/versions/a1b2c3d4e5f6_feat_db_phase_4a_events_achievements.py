"""feat(db): phase 4a events + achievements schema

Revision ID: a1b2c3d4e5f6
Revises: 62a6490d5a43
Create Date: 2026-09-25 03:23:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "62a6490d5a43"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(200) NOT NULL,
            slug VARCHAR(250) UNIQUE NOT NULL,
            description TEXT,
            event_type VARCHAR(50),
            category VARCHAR(50),
            mode VARCHAR(20),
            start_datetime TIMESTAMPTZ,
            end_datetime TIMESTAMPTZ,
            venue VARCHAR(200),
            meeting_url VARCHAR(500),
            organizer_id UUID REFERENCES users(id),
            capacity INT,
            registration_deadline TIMESTAMPTZ,
            cover_image_url TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'draft',
            tags JSONB DEFAULT '[]',
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            deleted_at TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_events_status_start ON events (status, start_datetime DESC)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_events_type ON events (event_type)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN (tags)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS event_registrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID NOT NULL REFERENCES events(id),
            student_id UUID NOT NULL REFERENCES students(id),
            registered_at TIMESTAMPTZ DEFAULT now(),
            attended BOOLEAN DEFAULT false,
            attended_at TIMESTAMPTZ,
            CONSTRAINT uq_event_reg_event_student UNIQUE (event_id, student_id)
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS event_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID NOT NULL REFERENCES events(id),
            student_id UUID NOT NULL REFERENCES students(id),
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comments TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            CONSTRAINT uq_event_feedback_event_student UNIQUE (event_id, student_id)
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS event_photos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID NOT NULL REFERENCES events(id),
            photo_url TEXT NOT NULL,
            caption VARCHAR(300),
            uploaded_by UUID REFERENCES users(id),
            uploaded_at TIMESTAMPTZ DEFAULT now()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            person_id UUID NOT NULL,
            person_type VARCHAR(20) NOT NULL,
            title VARCHAR(300) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            level VARCHAR(30),
            issuer VARCHAR(200),
            achieved_on DATE,
            certificate_url TEXT,
            proof_url TEXT,
            linked_url TEXT,
            is_verified BOOLEAN DEFAULT false,
            verified_by UUID REFERENCES users(id),
            verified_at TIMESTAMPTZ,
            tags JSONB DEFAULT '[]',
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            deleted_at TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_achieve_person ON achievements (person_id, person_type)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_achieve_cat_level ON achievements (category, level)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_achieve_date ON achievements (achieved_on DESC)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_achieve_tags ON achievements USING GIN (tags)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS achievements")
    op.execute("DROP TABLE IF EXISTS event_photos")
    op.execute("DROP TABLE IF EXISTS event_feedback")
    op.execute("DROP TABLE IF EXISTS event_registrations")
    op.execute("DROP TABLE IF EXISTS events")
