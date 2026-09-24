import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, Numeric, Index
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
