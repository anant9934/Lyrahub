from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.rbac import init_casbin, get_enforcer
from app.core.config import get_settings
from app.modules.auth.router import router as auth_router
from app.modules.admin.router import router as admin_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    enforcer = await init_casbin()
    # Seed Casbin for superadmin and test roles if not already present
    try:
        if not enforcer.has_policy("Admin", "roles", "create"):
            await enforcer.add_policy("Admin", "roles", "create")
        if not enforcer.has_grouping_policy(settings.SUPERADMIN_EMAIL, "Admin"):
            await enforcer.add_grouping_policy(settings.SUPERADMIN_EMAIL, "Admin")
        if not enforcer.has_grouping_policy("hod@aiml.hub", "HOD"):
            await enforcer.add_grouping_policy("hod@aiml.hub", "HOD")
    except Exception as e:
        print(f"Policy seeding notice: {e}")
    yield
    # Shutdown
    pass

app = FastAPI(
    title="AI/ML Department Hub API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.modules.health.router import router as health_router
from app.modules.students.router import router as students_router
from app.modules.skills.router import router as skills_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(health_router, prefix="/api/v1/health", tags=["health"])
app.include_router(students_router, prefix="/api/v1/students", tags=["students"])
app.include_router(skills_router, prefix="/api/v1/skills", tags=["skills"])

from app.modules.files.router import router as files_router
app.include_router(files_router, prefix="/api/v1/files", tags=["files"])

from app.modules.ranking.router import router as ranking_router
app.include_router(ranking_router, prefix="/api/v1/ranking", tags=["ranking"])

from app.modules.events.router import router as events_router
app.include_router(events_router, prefix="/api/v1/events", tags=["events"])

from app.modules.achievements.router import router as achievements_router
app.include_router(achievements_router, prefix="/api/v1/achievements", tags=["achievements"])

from app.modules.projects.router import router as projects_router
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])

from app.modules.alumni.router import router as alumni_router
app.include_router(alumni_router, prefix="/api/v1/alumni", tags=["alumni"])

from app.modules.stories.router import router as stories_router
app.include_router(stories_router, prefix="/api/v1/stories", tags=["stories"])

from app.modules.testimonials.router import router as testimonials_router
app.include_router(testimonials_router, prefix="/api/v1/testimonials", tags=["testimonials"])

from app.modules.groups.router import router as groups_router
app.include_router(groups_router, prefix="/api/v1/groups", tags=["groups"])

from app.modules.programs.router import router as programs_router
app.include_router(programs_router, prefix="/api/v1/programs", tags=["programs"])

from app.modules.courses.router import router as courses_router
app.include_router(courses_router, prefix="/api/v1/courses", tags=["courses"])

from app.modules.opportunities.router import router as opportunities_router
app.include_router(opportunities_router, prefix="/api/v1/opportunities", tags=["opportunities"])

from app.modules.tests.router import router as tests_router
app.include_router(tests_router, prefix="/api/v1/tests", tags=["tests"])

from app.modules.approvals.router import router as approvals_router
app.include_router(approvals_router, prefix="/api/v1/approvals", tags=["approvals"])

from app.modules.qr.router import router as qr_router
app.include_router(qr_router, prefix="/api/v1/qr", tags=["qr"])

from app.modules.leadership.router import router as leadership_router
app.include_router(leadership_router, prefix="/api/v1/leadership", tags=["leadership"])








