"""
Intent Router — routes AIDA queries first to deterministic tools,
then to database queries, then cache, then browser/local, and finally cloud.

This is the core of the deterministic-first AI policy.

Routing priority (per spec §18):
  1. deterministic tool
  2. database query
  3. cache
  4. browser SLM (signal returned to frontend)
  5. local Ollama (signal returned to frontend)
  6. RAG
  7. cloud LLM
"""

from __future__ import annotations

import json
import re
from typing import Optional, Any
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text, desc

from app.models import Student, User, RankingSnapshot


# ─── Deterministic Tool Handlers ──────────────────────────────────────────────

DETERMINISTIC_PATTERNS = [
    # Count queries
    (r"\bhow many students\b", "count_students"),
    (r"\bstudent count\b", "count_students"),
    (r"\btotal students\b", "count_students"),
    (r"\bhow many faculty\b", "count_faculty"),
    # Top N ranking
    (r"\btop\s+(\d+)\s+students?\b", "top_students"),
    (r"\bleaderboard\b", "top_students"),
    (r"\branking\b", "top_students"),
    # CGPA filters
    (r"\bcgpa\s+(?:above|over|greater than|>)\s*([\d.]+)", "high_cgpa_students"),
    (r"\bcgpa\s+(?:below|under|less than|<)\s*([\d.]+)", "low_cgpa_students"),
    # Placement
    (r"\bplaced students\b", "placed_students"),
    (r"\bnot placed\b", "unplaced_students"),
    # Search by name
    (r"\bfind student\s+(.+)", "find_student"),
    (r"\bsearch student\s+(.+)", "find_student"),
]


def _classify_intent(query: str) -> tuple[Optional[str], Optional[str]]:
    """Returns (intent_name, capture_group) or (None, None) if no deterministic match."""
    q = query.lower()
    for pattern, intent in DETERMINISTIC_PATTERNS:
        m = re.search(pattern, q)
        if m:
            capture = m.group(1) if m.lastindex else None
            return intent, capture
    return None, None


async def _run_deterministic(
    db: AsyncSession,
    intent: str,
    capture: Optional[str],
) -> Optional[dict]:
    """Execute deterministic database queries for classified intents."""
    try:
        if intent == "count_students":
            result = await db.execute(
                select(func.count(Student.id)).where(Student.deleted_at.is_(None))
            )
            count = result.scalar()
            return {
                "answer": f"There are currently **{count}** active students in the AI & ML department.",
                "source": "Department database",
                "ai_mode": "Deterministic (SQL)",
                "data": {"student_count": count},
            }

        elif intent == "top_students":
            limit = int(capture) if capture and capture.isdigit() else 10
            limit = min(limit, 50)
            result = await db.execute(
                select(RankingSnapshot, Student)
                .join(Student, RankingSnapshot.student_id == Student.id)
                .where(Student.deleted_at.is_(None))
                .order_by(RankingSnapshot.rank.asc())
                .limit(limit)
            )
            rows = result.all()
            table = [
                {
                    "rank": snap.rank,
                    "reg_no": stu.reg_no,
                    "section": stu.section,
                    "cgpa": float(stu.cgpa) if stu.cgpa else None,
                    "score": float(snap.score) if snap.score else None,
                }
                for snap, stu in rows
            ]
            return {
                "answer": f"Here are the top **{len(table)}** ranked students.",
                "source": "Department database (RankingSnapshot)",
                "ai_mode": "Deterministic (SQL)",
                "data": {"columns": ["rank", "reg_no", "section", "cgpa", "score"], "rows": table},
            }

        elif intent == "high_cgpa_students":
            threshold = float(capture) if capture else 8.5
            result = await db.execute(
                select(Student)
                .where(Student.deleted_at.is_(None), Student.cgpa >= threshold)
                .order_by(desc(Student.cgpa))
                .limit(50)
            )
            students = result.scalars().all()
            table = [{"reg_no": s.reg_no, "section": s.section, "cgpa": float(s.cgpa)} for s in students]
            return {
                "answer": f"Found **{len(table)}** students with CGPA ≥ {threshold}.",
                "source": "Department database",
                "ai_mode": "Deterministic (SQL)",
                "data": {"columns": ["reg_no", "section", "cgpa"], "rows": table},
            }

        elif intent == "placed_students":
            result = await db.execute(
                select(func.count(Student.id)).where(
                    Student.deleted_at.is_(None), Student.placement_status == "placed"
                )
            )
            count = result.scalar()
            return {
                "answer": f"**{count}** students have been placed.",
                "source": "Department database",
                "ai_mode": "Deterministic (SQL)",
                "data": {"placed_count": count},
            }

        elif intent == "find_student":
            search_term = (capture or "").strip()
            if not search_term:
                return None
            result = await db.execute(
                select(Student)
                .where(
                    Student.deleted_at.is_(None),
                    Student.reg_no.ilike(f"%{search_term}%"),
                )
                .limit(10)
            )
            students = result.scalars().all()
            if not students:
                return {
                    "answer": f"No students found matching `{search_term}`.",
                    "source": "Department database",
                    "ai_mode": "Deterministic (SQL)",
                    "data": {"rows": []},
                }
            table = [{"reg_no": s.reg_no, "section": s.section, "cgpa": float(s.cgpa) if s.cgpa else None} for s in students]
            return {
                "answer": f"Found **{len(table)}** student(s) matching `{search_term}`.",
                "source": "Department database",
                "ai_mode": "Deterministic (SQL)",
                "data": {"columns": ["reg_no", "section", "cgpa"], "rows": table},
            }

    except Exception:
        return None
    return None


# ─── Main Intent Router ───────────────────────────────────────────────────────

BROWSER_SLM_SIGNAL = "__BROWSER_SLM__"
CLOUD_REQUIRED_SIGNAL = "__CLOUD_REQUIRED__"


async def route_intent(
    query: str,
    db: AsyncSession,
    role: str,
) -> dict:
    """
    Route the query through the priority chain.
    Returns a structured result dict.
    If cloud is needed, returns a special signal dict so the gateway can handle quota.
    """
    # Step 1 + 2: Deterministic tool / DB query
    intent, capture = _classify_intent(query)
    if intent:
        result = await _run_deterministic(db, intent, capture)
        if result:
            return result

    # Step 3: Could check a cache here (Redis key-value for frequent queries)
    # Skipped for now — would add a Redis cache layer here

    # Step 4+5: For students → return browser SLM signal (frontend handles)
    if role.lower() == "student":
        return {
            "answer": None,
            "source": "Browser",
            "ai_mode": "Browser SLM",
            "signal": BROWSER_SLM_SIGNAL,
            "query": query,
        }

    # Step 6+7: For authorized staff → signal that cloud is needed
    return {
        "answer": None,
        "source": None,
        "ai_mode": "Cloud LLM",
        "signal": CLOUD_REQUIRED_SIGNAL,
        "query": query,
    }
