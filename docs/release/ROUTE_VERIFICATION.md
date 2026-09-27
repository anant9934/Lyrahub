# AIMETRA — Route Verification & Access Control Inventory

This document catalogs and classifies all frontend pages and backend API routes across the AIMETRA platform.

---

## 1. Frontend Route Inventory (Next.js 14 App Router)

| Route Path | Type | Access Level | Indexable | Status Code | Notes |
|---|---|---|---|---|---|
| `/` | Static | PUBLIC | Yes | 200 | Institutional Homepage & Ecosystem Overview |
| `/about` | Static | PUBLIC | Yes | 200 | Mission, Leadership & Department History |
| `/programs` | Static | PUBLIC | Yes | 200 | Academic Programs & Specializations Overview |
| `/programs/[slug]` | Dynamic | PUBLIC | Yes | 200 / 404 | Individual degree curriculum details |
| `/programs/manage` | Static | ADMIN | No | 200 (auth-gated) | Curriculum and course management |
| `/courses` | Static | PUBLIC | Yes | 200 | Department Course Catalog |
| `/courses/[slug]` | Dynamic | PUBLIC | Yes | 200 / 404 | Syllabus, credits, and prerequisites |
| `/courses/manage` | Static | ADMIN | No | 200 (auth-gated) | Course creation and instructor assignment |
| `/research` | Static | PUBLIC | Yes | 200 | Research Labs, Publications & Grants |
| `/people` | Static | PUBLIC | Yes | 200 | Faculty, Mentors, and Staff Directory |
| `/events` | Static | PUBLIC | Yes | 200 | Hackathons, Seminars & Workshops |
| `/events/[slug]` | Dynamic | PUBLIC | Yes | 200 / 404 | Event registration & schedule |
| `/events/create` | Static | PRIVATE | No | 200 (auth-gated) | Event publishing for faculty/admin |
| `/events/me` | Static | PRIVATE | No | 200 (auth-gated) | User's registered events |
| `/opportunities` | Static | PUBLIC | Yes | 200 | Internships, Jobs & Fellowships |
| `/opportunities/[slug]`| Dynamic | PUBLIC | Yes | 200 / 404 | Opportunity description and application form |
| `/opportunities/create`| Static | PRIVATE | No | 200 (auth-gated) | Opportunity submission form |
| `/opportunities/me` | Static | PRIVATE | No | 200 (auth-gated) | Applied opportunities tracking |
| `/opportunities/verify`| Static | ADMIN | No | 200 (auth-gated) | HOD/Admin opportunity moderation queue |
| `/projects` | Static | PUBLIC | Yes | 200 | Student & Faculty Project Showcase |
| `/projects/[slug]` | Dynamic | PUBLIC | Yes | 200 / 404 | Project architecture, repo & team members |
| `/projects/create` | Static | PRIVATE | No | 200 (auth-gated) | Project submission form |
| `/projects/me` | Static | PRIVATE | No | 200 (auth-gated) | User's authored projects |
| `/stories` | Static | PUBLIC | Yes | 200 | Student & Alumni Success Stories |
| `/stories/[slug]` | Dynamic | PUBLIC | Yes | 200 / 404 | In-depth student spotlight article |
| `/stories/create` | Static | PRIVATE | No | 200 (auth-gated) | Story authoring submission |
| `/testimonials` | Static | PUBLIC | Yes | 200 | Verified Student & Recruiter Feedback |
| `/alumni` | Static | PUBLIC | Yes | 200 | Alumni Network & Career Directory |
| `/alumni/[id]` | Dynamic | PUBLIC | Yes | 200 / 404 | Public alumnus profile & career timeline |
| `/alumni/register` | Static | PUBLIC | Yes | 200 | Alumni onboarding registration |
| `/alumni/verify` | Static | ADMIN | No | 200 (auth-gated) | HOD alumni verification queue |
| `/alumni/mentors` | Static | PUBLIC | Yes | 200 | Alumni willing to mentor students |
| `/tests` | Static | PRIVATE | No | 200 (auth-gated) | Department Skill & Coding Assessments |
| `/tests/[slug]/attempt`| Dynamic | PRIVATE | No | 200 (auth-gated) | Timed student test execution |
| `/tests/manage` | Static | ADMIN | No | 200 (auth-gated) | Test creation & question management |
| `/ranking` | Static | PRIVATE | No | 200 (auth-gated) | Student Merit & Skill Leaderboard |
| `/ranking/me` | Static | PRIVATE | No | 200 (auth-gated) | Individual score breakdown & radar chart |
| `/ranking/export` | Static | ADMIN | No | 200 (auth-gated) | Encrypted ranking CSV/PDF export |
| `/attendance` | Static | PRIVATE | No | 200 (auth-gated) | Session attendance tracking |
| `/scan` | Static | PRIVATE | No | 200 (auth-gated) | QR-code scanner for attendance |
| `/qr/my-code` | Static | PRIVATE | No | 200 (auth-gated) | Dynamic student identity QR code |
| `/approvals/pending` | Static | ADMIN | No | 200 (auth-gated) | HOD approval queue for profile changes |
| `/ai-usage` | Static | PRIVATE | No | 200 (auth-gated) | AIDA token consumption & quota monitor |
| `/dashboard` | Static | PRIVATE | No | 200 (auth-gated) | Main user operational portal |
| `/dashboard/profile` | Static | PRIVATE | No | 200 (auth-gated) | Student profile editing & resume upload |
| `/leadership/hod` | Static | ADMIN | No | 200 (auth-gated) | HOD strategic analytics dashboard |
| `/leadership/cos` | Static | ADMIN | No | 200 (auth-gated) | Head of School oversight dashboard |
| `/leadership/hos` | Static | ADMIN | No | 200 (auth-gated) | Institutional executive dashboard |
| `/login` | Static | PUBLIC | Yes | 200 | User Authentication Portal |
| `/signup` | Static | PUBLIC | Yes | 200 | Student Onboarding Portal |
| `/contact` | Static | PUBLIC | Yes | 200 | Department Contact & Location |
| `/privacy` | Static | PUBLIC | Yes | 200 | DPDP-aligned Data Protection Notice |
| `/terms` | Static | PUBLIC | Yes | 200 | Academic Platform Terms of Use |
| `/security` | Static | PUBLIC | Yes | 200 | Security Disclosure & Vulnerability Reporting|

---

## 2. Backend API Router Modules (`/api/v1/*`)

| Module Path | Primary Actions | Authorization Requirement |
|---|---|---|
| `/api/v1/auth/*` | Login, Register, Refresh, Logout, Me | Public (Login/Register) / Bearer JWT (Refresh/Me) |
| `/api/v1/students/*` | Profile Read, Update, Resume Upload/Download | User (Own) / Mentor / HOD / Admin |
| `/api/v1/courses/*` | Course Catalog, Syllabus, Management | Public (Read) / Faculty & Admin (Write) |
| `/api/v1/programs/*` | Degree Programs, Curriculum | Public (Read) / Admin (Write) |
| `/api/v1/projects/*` | Project Showcase, Creation, Approvals | Public (Read) / Student (Create) / Faculty (Approve) |
| `/api/v1/opportunities/*` | Jobs, Internships, Applications | Public (Read) / Student (Apply) / HOD (Verify) |
| `/api/v1/events/*` | Event Listings, Registration | Public (Read) / Authenticated (Register) |
| `/api/v1/alumni/*` | Directory, Mentorship, Verification | Public (Verified) / HOD (Verify) |
| `/api/v1/ranking/*` | Leaderboard, Config, Score Calculation, Export | Authenticated (Read) / HOD & Admin (Export) |
| `/api/v1/attendance/*`| Sessions, QR Token Generation, Marking | Faculty (Create Session) / Student (Scan QR) |
| `/api/v1/approvals/*` | Change Requests, Review, Moderation | HOD & Admin |
| `/api/v1/tests/*` | Assessment Catalog, Attempts, AI Grading | Student (Attempt) / Faculty & Admin (Create) |
| `/api/v1/ai/*` | AIDA Query, Quota Status, Usage Logs | Authenticated (Scope-Filtered RAG) |
| `/api/v1/files/*` | Upload, Download, Storage Validation | Authenticated (Ownership Prefix Enforced) |
| `/api/v1/health/*` | Liveness, Readiness, Deep Check | Public (`/live`, `/ready`) / Admin (`/deep`) |
| `/api/v1/roles/*` | Casbin Grouping Policy Management | Admin & Super Admin only |
| `/api/v1/audit-logs/*`| System Mutation Audit Trail | Admin & Super Admin only |
