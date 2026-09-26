import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Numeric, Index, Date, CheckConstraint, text
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
    cgpa = Column(Numeric(4, 2))
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

# ==========================================
# PHASE 4C: STORIES, TESTIMONIALS & GROUPS
# ==========================================

class SuccessStory(Base):
    __tablename__ = "success_stories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(300), unique=True, nullable=False)
    title = Column(String(300), nullable=False)
    subtitle = Column(String(400))
    story_type = Column(String(30), nullable=False) # 'student', 'alumni'
    person_id = Column(UUID(as_uuid=True), nullable=False) # student_id OR alumni_id
    person_name = Column(String(200)) # denormalized for display
    person_photo_url = Column(String)
    current_role = Column(String(200))
    current_company = Column(String(200))
    batch_year = Column(Integer)
    program = Column(String(100))
    summary = Column(String) # short teaser (200 chars)
    full_story = Column(String) # markdown body
    featured_image_url = Column(String)
    video_url = Column(String(500))
    tags = Column(JSONB, default=list)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_stories_type_pub", "story_type", "is_published"),
        Index("idx_stories_featured", "featured", postgresql_where=text("featured = true")),
        Index("idx_stories_batch_year", "batch_year"),
        Index("idx_stories_tags", "tags", postgresql_using="gin"),
    )

class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # nullable if external
    author_type = Column(String(20), nullable=False) # 'student', 'faculty', 'alumni', 'recruiter', 'external'
    author_name = Column(String(200), nullable=False)
    author_role = Column(String(200)) # "SDE at Google", "Parent", etc.
    author_photo_url = Column(String)
    rating = Column(Integer, CheckConstraint("rating BETWEEN 1 AND 5", name="check_testimonial_rating"), nullable=True)
    text = Column(String, nullable=False)
    context = Column(String(100)) # 'about_department', 'about_course', 'about_faculty', 'about_placement'
    context_id = Column(UUID(as_uuid=True), nullable=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    moderated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    moderated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_testimonials_pub_feat", "is_published", "is_featured"),
        Index("idx_testimonials_author_type", "author_type"),
    )

class Group(Base):
    __tablename__ = "groups"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(200), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    tagline = Column(String(300))
    description = Column(String)
    group_type = Column(String(30), nullable=False) # 'interest_group', 'club', 'society', 'chapter'
    category = Column(String(50), nullable=False) # 'technical', 'cultural', 'sports', 'social', 'professional'
    cover_image_url = Column(String)
    logo_url = Column(String)
    founded_on = Column(Date)
    faculty_advisor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    student_lead_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=True)
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    social_links = Column(JSONB, default=dict) # {"instagram": "...", "twitter": "..."}
    meeting_schedule = Column(String(200))
    meeting_venue = Column(String(200))
    membership_open = Column(Boolean, default=True)
    membership_fee = Column(Numeric(10, 2), default=0)
    is_official = Column(Boolean, default=False) # verified by admin
    is_active = Column(Boolean, default=True)
    tags = Column(JSONB, default=list)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_groups_type_active", "group_type", "is_active"),
        Index("idx_groups_category", "category"),
        Index("idx_groups_tags", "tags", postgresql_using="gin"),
    )

class GroupMember(Base):
    __tablename__ = "group_members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    role = Column(String(50), default="member") # 'member', 'core', 'lead', 'advisor'
    joined_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    left_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        Index("idx_group_member_unique", "group_id", "student_id", unique=True),
    )

class GroupEvent(Base):
    __tablename__ = "group_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)

    __table_args__ = (
        Index("idx_group_event_unique", "group_id", "event_id", unique=True),
    )


class Program(Base):
    __tablename__ = "programs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(200), unique=True, index=True)
    code = Column(String(50), unique=True, index=True) # "BTCS-AIML", "MTCS-MLAI"
    name = Column(String(200), nullable=False) # "B.Tech CSE (AI & ML)"
    short_name = Column(String(50)) # "B.Tech AI&ML"
    degree = Column(String(20)) # "B.Tech", "M.Tech"
    level = Column(String(20)) # "undergraduate", "postgraduate", "minor"
    duration_years = Column(Numeric(3, 1)) # 4.0, 2.0
    total_credits = Column(Integer)
    description = Column(String) # overview
    eligibility = Column(String) # markdown
    admission_process = Column(String) # markdown
    career_opportunities = Column(String) # markdown
    program_outcomes = Column(JSONB, default=list) # list of POs
    program_specific_outcomes = Column(JSONB, default=list) # PSOs
    cover_image_url = Column(String)
    brochure_url = Column(String)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_programs_level_active", "level", "is_active"),
    )


class Course(Base):
    __tablename__ = "courses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(200), unique=True, index=True)
    code = Column(String(20), unique=True, index=True) # "CS301"
    name = Column(String(200), nullable=False) # "Deep Learning"
    short_name = Column(String(50))
    description = Column(String)
    credits = Column(Numeric(3, 1)) # 4.0, 3.5
    semester = Column(Integer) # 1-8
    year = Column(Integer) # 1-4
    course_type = Column(String(30)) # core, elective, lab, project, seminar
    category = Column(String(50)) # theory, practical, humanities, minor
    prerequisites = Column(String)
    syllabus = Column(String) # markdown
    ip_lp_notes = Column(String) # IP/LP mapping
    learning_outcomes = Column(JSONB, default=list) # COs
    evaluation_scheme = Column(JSONB, default=dict) # {"quiz": 20, "midterm": 30, "final": 50}
    references = Column(JSONB, default=list) # textbooks
    edurev_benefits = Column(JSONB, default=list) # ["RPL eligible", "Rev Gen 10%"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_courses_semester_type", "semester", "course_type"),
        Index("idx_courses_learning_outcomes", "learning_outcomes", postgresql_using="gin"),
    )


class ProgramCourse(Base):
    __tablename__ = "program_courses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id = Column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer)
    is_mandatory = Column(Boolean, default=True)

    __table_args__ = (
        Index("idx_program_course_unique", "program_id", "course_id", unique=True),
    )


class CourseFaculty(Base):
    __tablename__ = "course_faculty"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    academic_year = Column(String(20)) # "2025-26"
    section = Column(String(10)) # "A", "B"
    role = Column(String(30), default="primary") # primary, co-instructor, guest

    __table_args__ = (
        Index("idx_course_faculty_unique", "course_id", "faculty_id", "academic_year", "section", unique=True),
    )


class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(250), unique=True, index=True)
    title = Column(String(300), nullable=False)
    organization = Column(String(200), nullable=False) # company/org name
    opportunity_type = Column(String(30)) # 'internship', 'training', 'workshop', 'course', 'fellowship', 'scholarship'
    mode = Column(String(20)) # 'remote', 'onsite', 'hybrid'
    location = Column(String(200))
    description = Column(String)
    eligibility = Column(String)
    required_skills = Column(JSONB, default=list)
    stipend_amount = Column(Numeric(10, 2), nullable=True)
    stipend_currency = Column(String(3), default="INR")
    duration_weeks = Column(Integer)
    start_date = Column(Date, nullable=True)
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    application_url = Column(String(500))
    contact_email = Column(String(255))
    cover_image_url = Column(String)
    tags = Column(JSONB, default=list)
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_opportunities_type_active_deadline", "opportunity_type", "is_active", "application_deadline"),
        Index("idx_opportunities_organization", "organization"),
        Index("idx_opportunities_tags", "tags", postgresql_using="gin"),
        Index("idx_opportunities_skills", "required_skills", postgresql_using="gin"),
    )


class OpportunityApplication(Base):
    __tablename__ = "opportunity_applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    opportunity_id = Column(UUID(as_uuid=True), ForeignKey("opportunities.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    status = Column(String(20), default="interested") # interested, applied, selected, rejected, withdrawn
    notes = Column(String)
    applied_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_opportunity_application_unique", "opportunity_id", "student_id", unique=True),
    )


# ==========================================
# PHASE 4E: CORE MISSING FEATURES
# 1. AI/ML Knowledge Tests
# 2. Approvals Workflow
# 3. QR & Attendance
# 4. Leadership Profiles
# ==========================================

class Test(Base):
    __tablename__ = "tests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False)
    description = Column(String)
    domain = Column(String(50), nullable=False, default="ai_ml_general") # 'ai_ml_general', 'llm', 'cv', 'nlp', 'mlops'
    difficulty = Column(String(20), default="intermediate")             # 'beginner', 'intermediate', 'advanced'
    duration_minutes = Column(Integer, nullable=False, default=30)
    total_questions = Column(Integer, nullable=False, default=10)
    total_marks = Column(Integer, nullable=False, default=10)
    passing_marks = Column(Integer, nullable=True, default=5)
    is_published = Column(Boolean, default=False)
    available_from = Column(DateTime(timezone=True), nullable=True)
    available_until = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_tests_published_window", "is_published", "available_from", "available_until"),
    )


class TestQuestion(Base):
    __tablename__ = "test_questions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False)
    question_text = Column(String, nullable=False)
    question_type = Column(String(20), nullable=False, default="mcq") # 'mcq', 'multi_select', 'short_answer'
    options = Column(JSONB, default=list)                             # [{"id": "a", "text": "..."}]
    correct_answer = Column(JSONB, nullable=False)                   # ["a"] or "keyword"
    explanation = Column(String)
    marks = Column(Integer, default=1)
    difficulty = Column(String(20), default="intermediate")
    topic = Column(String(100))                                      # 'neural_networks', 'transformers'
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_test_questions_test_order", "test_id", "display_order"),
    )


class TestAttempt(Base):
    __tablename__ = "test_attempts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    score = Column(Numeric(6, 2), nullable=True)
    total_marks = Column(Integer, nullable=True)
    percentage = Column(Numeric(5, 2), nullable=True)
    passed = Column(Boolean, nullable=True)
    answers = Column(JSONB, default=dict)                             # {question_id: answer}
    status = Column(String(20), default="in_progress")                # in_progress, submitted, graded
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_test_attempt_unique", "test_id", "student_id", unique=True),
        Index("idx_test_attempts_student_submitted", "student_id", "submitted_at"),
    )


class ChangeRequest(Base):
    __tablename__ = "change_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    resource_type = Column(String(50), nullable=False)                # 'student_profile', 'achievement', 'test', 'group'
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(20), nullable=False, default="update")     # 'create', 'update', 'delete'
    payload = Column(JSONB, nullable=False, default=dict)
    current_state = Column(JSONB, nullable=True, default=dict)
    status = Column(String(20), default="pending")                   # pending, approved, rejected, withdrawn
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewer_comment = Column(String, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_change_requests_status_created", "status", "created_at"),
        Index("idx_change_requests_requester_status", "requester_id", "status"),
        Index("idx_change_requests_reviewer_status", "reviewer_id", "status"),
    )


class ApprovalNotification(Base):
    __tablename__ = "approval_notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    change_request_id = Column(UUID(as_uuid=True), ForeignKey("change_requests.id"), nullable=False)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    channel = Column(String(20), default="in_app")                   # 'in_app', 'email'
    sent_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    read_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_approval_notif_recipient", "recipient_id", "read_at"),
    )


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    section = Column(String(50), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        Index("idx_attendance_sessions_course_active", "course_id", "is_active"),
    )


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("attendance_sessions.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    marked_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    ip_address = Column(String(45), nullable=True)

    __table_args__ = (
        Index("idx_attendance_record_unique", "session_id", "student_id", unique=True),
    )


class LeadershipProfile(Base):
    __tablename__ = "leadership_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=True)
    role = Column(String(30), nullable=False)                         # 'hod', 'cos', 'hos'
    display_title = Column(String(100), nullable=False)              # "Head of Department"
    photo_url = Column(String, nullable=True)
    short_bio = Column(String, nullable=True)
    full_bio = Column(String, nullable=True)
    message = Column(String, nullable=True)
    vision = Column(String, nullable=True)
    qualifications = Column(JSONB, default=list)
    experience_years = Column(Integer, default=0)
    research_interests = Column(JSONB, default=list)
    publications_count = Column(Integer, default=0)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    office_location = Column(String(200), nullable=True)
    office_hours = Column(String(200), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    google_scholar_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_leadership_role_active", "role", "is_active"),
    )





class AIUsageLog(Base):
    """Immutable audit log for every cloud AI call routed through the AI Gateway."""
    __tablename__ = "ai_usage_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(50), nullable=False)
    usage_date = Column(Date, nullable=False)
    provider = Column(String(50), nullable=False)          # 'gemini', 'groq', 'cerebras', ...
    model = Column(String(100), nullable=True)
    request_id = Column(String(64), nullable=False)
    tokens_in = Column(Integer, nullable=True)
    tokens_out = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    success = Column(Boolean, nullable=False, default=True)
    reason_for_cloud_route = Column(String(500), nullable=True)
    quota_before = Column(Integer, nullable=False, default=0)
    quota_after = Column(Integer, nullable=False, default=0)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        Index("idx_ai_usage_user_date", "user_id", "usage_date"),
        Index("idx_ai_usage_date_role", "usage_date", "role"),
        Index("idx_ai_usage_provider", "provider", "usage_date"),
    )
