import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Numeric, Index, Date
from sqlalchemy.orm import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSONB

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    is_system = Column(Boolean, default=False)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    module = Column(String, nullable=False)
    action = Column(String, nullable=False)
    description = Column(String)

class RolePermission(Base):
    __tablename__ = "role_permissions"
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), primary_key=True)
    permission_id = Column(UUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True)

class UserRole(Base):
    __tablename__ = "user_roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    scope_type = Column(String)
    scope_id = Column(String)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_to = Column(DateTime, nullable=True)

class Student(Base):
    __tablename__ = "students"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reg_no = Column(String, unique=True, nullable=False)
    section = Column(String)
    batch = Column(Integer)
    phone = Column(String)
    cgpa = Column(Integer)
    placement_status = Column(String)
    
    # Phase 2 Enhancements
    linkedin_url = Column(String(255))
    github_url = Column(String(255))
    leetcode_url = Column(String(255))
    hackerrank_url = Column(String(255))
    hackerearth_url = Column(String(255))
    portfolio_url = Column(String(255))
    bio = Column(String)
    expected_graduation = Column(DateTime)
    current_semester = Column(Integer)
    backlogs = Column(Integer, default=0)
    tenth_percentage = Column(Numeric(5, 2))
    twelfth_percentage = Column(Numeric(5, 2))

    skills = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

class StudentResume(Base):
    __tablename__ = "student_resumes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_hash = Column(String(64), nullable=False)
    raw_text = Column(String)
    parsed_skills = Column(JSONB, default=list)
    parsed_projects = Column(JSONB, default=list)
    parsed_certifications = Column(JSONB, default=list)
    parse_status = Column(String(20), default="pending")
    parsed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime)
    
    __table_args__ = (
        Index("idx_resume_student", "student_id", "deleted_at"),
        Index("idx_resume_hash", "file_hash"),
    )

class Skill(Base):
    __tablename__ = "skills"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50))
    aliases = Column(JSONB, default=list)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_skills_category", "category"),
        Index("idx_skills_aliases", "aliases", postgresql_using="gin"),
    )

class StudentSkill(Base):
    __tablename__ = "student_skills"
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), primary_key=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), primary_key=True)
    proficiency = Column(String(20), default="intermediate")
    source = Column(String(30), default="self_declared")
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_student_skills_student", "student_id"),
        Index("idx_student_skills_skill", "skill_id"),
    )

class StudentHistory(Base):
    __tablename__ = "student_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    data = Column(JSONB)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_to = Column(DateTime, nullable=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

class Faculty(Base):
    __tablename__ = "faculty"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    designation = Column(String)
    department = Column(String)
    research_interests = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

class FacultyHistory(Base):
    __tablename__ = "faculty_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("faculty.id"), nullable=False)
    data = Column(JSONB)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_to = Column(DateTime, nullable=True)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String)
    url = Column(String)
    version = Column(Integer)
    content_hash = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(String)
    payload = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

class RankingCriteria(Base):
    __tablename__ = "ranking_criteria"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    weight = Column(Numeric(5, 4), nullable=False)
    is_active = Column(Boolean, default=True)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RankingSnapshot(Base):
    __tablename__ = "ranking_snapshots"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    rank = Column(Integer, nullable=False)
    score = Column(Numeric(6, 2), nullable=False)
    breakdown = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_rank_snap_stu_date", "student_id", "snapshot_date"),
        Index("idx_rank_snap_date_rank", "snapshot_date", "rank"),
        Index("idx_rank_snap_breakdown", "breakdown", postgresql_using="gin"),
    )

class RankingConfig(Base):
    __tablename__ = "ranking_config"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(Integer, nullable=False)
    weights = Column(JSONB, nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# ==========================================
# PHASE 4A: EVENTS & ACHIEVEMENTS
# ==========================================

class Event(Base):
    __tablename__ = "events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False)
    description = Column(String)
    event_type = Column(String(50))         # workshop, seminar, hackathon, conference, cultural, sports
    category = Column(String(50))           # department, school, inter-college, national, international
    mode = Column(String(20))               # online, offline, hybrid
    start_datetime = Column(DateTime(timezone=True))
    end_datetime = Column(DateTime(timezone=True))
    venue = Column(String(200))
    meeting_url = Column(String(500))
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    capacity = Column(Integer)
    registration_deadline = Column(DateTime(timezone=True))
    cover_image_url = Column(String)
    status = Column(String(20), default="draft")  # draft, published, ongoing, completed, cancelled
    tags = Column(JSONB, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_events_status_start", "status", "start_datetime"),
        Index("idx_events_type", "event_type"),
        Index("idx_events_tags", "tags", postgresql_using="gin"),
    )

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    registered_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    attended = Column(Boolean, default=False)
    attended_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_event_reg_unique", "event_id", "student_id", unique=True),
    )

class EventFeedback(Base):
    __tablename__ = "event_feedback"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    rating = Column(Integer, nullable=False) # CHECK constraint to be added manually or in app logic
    comments = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_event_feedback_unique", "event_id", "student_id", unique=True),
    )

class EventPhoto(Base):
    __tablename__ = "event_photos"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    photo_url = Column(String, nullable=False)
    caption = Column(String(300))
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id = Column(UUID(as_uuid=True), nullable=False) # student_id OR user_id
    person_type = Column(String(20), nullable=False)       # 'student', 'faculty'
    title = Column(String(300), nullable=False)
    description = Column(String)
    category = Column(String(50))          # academic, research, competition, sports, cultural, entrepreneurship, social_impact
    level = Column(String(30))             # college, university, state, national, international
    issuer = Column(String(200))           # who awarded it
    achieved_on = Column(Date)
    certificate_url = Column(String)
    proof_url = Column(String)
    linked_url = Column(String)            # link to news/article if any
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    tags = Column(JSONB, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_achieve_person", "person_id", "person_type"),
        Index("idx_achieve_cat_level", "category", "level"),
        Index("idx_achieve_date", "achieved_on"),
        Index("idx_achieve_tags", "tags", postgresql_using="gin"),
    )

# ==========================================
# PHASE 4B: PROJECTS & ALUMNI
# ==========================================

class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False)
    summary = Column(String(500))
    description = Column(String)
    tech_stack = Column(JSONB, default=list)        # ["PyTorch", "FastAPI"]
    domain = Column(String(50))                    # cv, nlp, llm, mlops, robotics, etc.
    status = Column(String(20), default="ongoing") # ongoing, completed, abandoned, archived
    github_url = Column(String(500))
    demo_url = Column(String(500))
    paper_url = Column(String(500))
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    external_mentor = Column(String(200))
    start_date = Column(Date)
    end_date = Column(Date)
    outcomes = Column(String)
    awards = Column(String(300))
    revenue_generated = Column(Numeric(10, 2))
    client_name = Column(String(200))
    cover_image_url = Column(String)
    is_public = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_projects_domain_status", "domain", "status"),
        Index("idx_projects_mentor", "mentor_id"),
        Index("idx_projects_tech_stack", "tech_stack", postgresql_using="gin"),
    )

class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    role = Column(String(50), default="contributor") # lead, contributor, advisor
    joined_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_proj_member_unique", "project_id", "student_id", unique=True),
    )

class ProjectDocument(Base):
    __tablename__ = "project_documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    doc_type = Column(String(50), nullable=False)    # report, presentation, poster, paper
    file_url = Column(String, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_proj_doc_project", "project_id"),
    )

class Alumni(Base):
    __tablename__ = "alumni"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    reg_no = Column(String(20), unique=True, nullable=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    graduation_year = Column(Integer, nullable=False)
    program = Column(String(50))                   # B.Tech CSE (AI & ML), M.Tech (ML & AI)
    degree = Column(String(20))                    # B.Tech, M.Tech
    current_company = Column(String(200))
    current_role = Column(String(200))
    location = Column(String(200))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))
    bio = Column(String)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    open_to_mentorship = Column(Boolean, default=False)
    open_to_hiring = Column(Boolean, default=False)
    willing_to_visit = Column(Boolean, default=False)
    privacy_level = Column(String(20), default="public")   # public, alumni_only, private
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_alumni_grad_year", "graduation_year"),
        Index("idx_alumni_company", "current_company"),
    )

class AlumniExperience(Base):
    __tablename__ = "alumni_experience"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alumni_id = Column(UUID(as_uuid=True), ForeignKey("alumni.id"), nullable=False)
    company = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)                          # nullable = current
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_alumni_exp_alumni", "alumni_id"),
    )

