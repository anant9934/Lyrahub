# Phase 1 Technical Specification: Foundation & Onboarding

## 1. Project Overview
This document outlines the technical architecture and specifications for Phase 1 of the AI/ML Department Hub. The focus is on project scaffolding, core database schema, authentication, dynamic role-based access control (RBAC), and basic frontend landing/auth pages.

## 2. Project Scaffolding
### 2.1 Backend (FastAPI)
- **Path**: `/backend`
- **Framework**: FastAPI with Python 3.11+
- **Architecture**: Domain-driven modular structure:
  - `app/core/`: Configuration, security, dependencies, RFC 7807 error handlers.
  - `app/modules/auth/`: JWT issuance, user registration, Casbin integration.
  - `app/modules/students/`: Student profiles, history versioning.
  - `app/modules/faculty/`: Faculty profiles.
- **ORM**: SQLAlchemy 2.0 (async) + asyncpg.
- **Validation**: Pydantic v2.

### 2.2 Frontend (Next.js)
- **Path**: `/frontend`
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State & Data**: React Query for data fetching, React Hook Form + Zod for forms.
- **Typography & Theme**: 
  - Font: Geist
  - Unidale Design Tokens: Canvas `#F2F2F1`, Surface `#FFFFFF`, Ink `#1E1E1E`, Sage `#94B0B8`, Amber `#EEBE1E`, Border `#D6D6D6`.

### 2.3 Shared DevOps
- **Path**: `/docker-compose.yml`
- **Services**: Postgres (with pgvector), Redis, Backend API, Frontend App.
- **Environment**: `.env.example` provided.

## 3. Database Schema (Neon + pgvector)
**Rules**: Soft deletes (`deleted_at` timestamp), history versioning for profiles (`*_history` tables). All migrations via Alembic.

### 3.1 Core Auth & RBAC Tables
- `users`: `id`, `email` (B-tree index), `password_hash`, `role_id`, `created_at`, `deleted_at`
- `roles`: `id`, `name`, `description`, `is_system`
- `permissions`: `id`, `code`, `module`, `action`
- `role_permissions`: `role_id`, `permission_id`
- `user_roles`: `user_id`, `role_id`, `scope_type`, `scope_id`, `valid_from`, `valid_to`

### 3.2 Domain Tables
- `students`: `id`, `user_id`, `reg_no` (B-tree), `personal_details`, `academic_details`, `professional_details`, `skills` (GIN array), `embeddings` (HNSW pgvector), `created_at`, `deleted_at`.
- `student_history`: Track changes. Columns: `student_id`, `snapshot_data`, `valid_from`, `valid_to`, `changed_by`, `approved_by`.
- `faculty`: `id`, `user_id`, `employee_id`, `department`, `designation`, `skills` (GIN array), `created_at`, `deleted_at`.
- `documents`: `id`, `owner_id`, `type`, `url`, `version`, `content_hash`, `created_at`, `deleted_at`.

## 4. Authentication & Security
- **Endpoints**:
  - `POST /auth/register`: Student self-signup.
  - `POST /auth/login`: Returns JWT (15-min access, 7-day refresh).
  - `POST /auth/refresh`: Refresh token exchange.
  - `POST /auth/logout`: Blacklists refresh token in Redis.
  - `GET /auth/me`: Current user context.
- **Middleware**: `get_current_user` FastAPI dependency.
- **Responses**: RFC 7807 Problem Details for all errors. No stack traces.

## 5. Role-Based Access Control (RBAC)
- **Default Roles (Seeded)**: Admin, HOD, COS, HOS, Faculty, Staff, Student, Alumni.
- **Permissions**: Format `module.action.scope` (e.g., `students.read.all`).
- **Policy Engine**: Casbin integration loaded dynamically.
- **Endpoints**: 
  - `POST /admin/roles`
  - `POST /admin/permissions`
  - `POST /admin/users/{id}/roles`

## 6. Frontend Pages (Phase 1)
- `/`: Landing page featuring a floating pill navigation, hero section, utilizing Unidale colors.
- `/login`: JWT login form (React Hook Form + Zod).
- `/signup`: Student self-registration form.
- `/dashboard`: Role-aware shell, placeholder content for student dashboard.
- **Layout**: Shared Sidebar + Top bar + Global Search (Cmd+K stub).

## 7. Next Steps for Implementation
1. **@db**: Initialize database, Alembic, write schema migrations & seed scripts.
2. **@engineer**: Implement the FastAPI backend & Next.js frontend according to spec.
3. **@qa**: Write Pytest unit tests for Auth & Integration tests for RBAC.
4. **@devops**: Prepare Docker configurations & README.

**Awaiting Product Manager / Human approval before proceeding to implementation.**
