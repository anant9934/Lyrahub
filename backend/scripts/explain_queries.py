"""
Deep Database Query Plan Optimization Script (Phase 7 & 8)
Runs EXPLAIN (ANALYZE, BUFFERS) on critical endpoints/queries:
- Students pagination & search
- Rankings snapshot joins
- Projects with domain/skills
- Alumni search
- Events upcoming query
- Dashboard stats aggregation
- Audit logs query
- Casbin rule fetch
Outputs empirical execution plans to docs/optimization/DATABASE_DEEP_AUDIT.md.
"""
import asyncio
import json
from sqlalchemy.future import select
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

QUERIES_TO_EXPLAIN = [
    {
        "name": "Students List & Pagination",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT s.id, s.reg_no, s.section, s.batch, s.cgpa, s.placement_status, u.email
        FROM students s
        JOIN users u ON s.user_id = u.id
        WHERE s.deleted_at IS NULL
        ORDER BY s.cgpa DESC NULLS LAST
        LIMIT 20 OFFSET 0;
        """
    },
    {
        "name": "Student Ranking Snapshot Latest",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT rs.rank, rs.score, rs.breakdown, s.reg_no, s.section, s.cgpa
        FROM ranking_snapshots rs
        JOIN students s ON rs.student_id = s.id
        WHERE s.deleted_at IS NULL
        ORDER BY rs.rank ASC
        LIMIT 10;
        """
    },
    {
        "name": "Projects with Domain & Active Status",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT p.id, p.title, p.domain, p.status, p.created_at
        FROM projects p
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 20;
        """
    },
    {
        "name": "Alumni Verification & Career Search",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT a.id, a.full_name, a.current_company, a.current_role, a.graduation_year
        FROM alumni a
        WHERE a.deleted_at IS NULL AND a.is_verified = TRUE
        ORDER BY a.graduation_year DESC
        LIMIT 20;
        """
    },
    {
        "name": "Upcoming Events",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT e.id, e.title, e.event_type, e.start_datetime, e.venue
        FROM events e
        WHERE e.deleted_at IS NULL AND e.start_datetime >= NOW()
        ORDER BY e.start_datetime ASC
        LIMIT 10;
        """
    },
    {
        "name": "Dashboard Aggregation Stats",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT
            (SELECT COUNT(*) FROM students WHERE deleted_at IS NULL) as total_students,
            (SELECT COUNT(*) FROM students WHERE placement_status = 'placed' AND deleted_at IS NULL) as placed_students,
            (SELECT COUNT(*) FROM faculty WHERE deleted_at IS NULL) as total_faculty,
            (SELECT COUNT(*) FROM projects) as total_projects,
            (SELECT COUNT(*) FROM events WHERE deleted_at IS NULL) as total_events;
        """
    },
    {
        "name": "Audit Logs Actor Search",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT al.id, al.action, al.resource_type, al.created_at
        FROM audit_logs al
        ORDER BY al.created_at DESC
        LIMIT 50;
        """
    },
    {
        "name": "Casbin Rules Fetch",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT ptype, v0, v1, v2, v3, v4, v5
        FROM casbin_rule;
        """
    }
]

async def run_explain_suite():
    print("=== Running EXPLAIN (ANALYZE, BUFFERS) Suite on Neon PostgreSQL ===")
    results = []
    
    async with AsyncSessionLocal() as session:
        for item in QUERIES_TO_EXPLAIN:
            name = item["name"]
            raw_sql = item["sql"].strip()
            print(f"Profiling: {name}...")
            try:
                res = await session.execute(text(raw_sql))
                plan_lines = [row[0] for row in res.fetchall()]
                plan_text = "\n".join(plan_lines)
                print(f"  Plan generated ({len(plan_lines)} lines)")
                results.append({
                    "name": name,
                    "sql": raw_sql.replace("EXPLAIN (ANALYZE, BUFFERS)\n", ""),
                    "plan": plan_text
                })
            except Exception as e:
                print(f"  Error profiling {name}: {e}")
                results.append({
                    "name": name,
                    "sql": raw_sql,
                    "plan": f"ERROR: {e}"
                })

        # Also retrieve all indexes and their scan statistics
        print("Fetching pg_stat_user_indexes...")
        idx_res = await session.execute(text("""
            SELECT
                schemaname,
                relname as table_name,
                indexrelname as index_name,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch,
                pg_size_pretty(pg_relation_size(indexrelid)) as index_size
            FROM pg_stat_user_indexes
            ORDER BY idx_scan DESC;
        """))
        idx_stats = idx_res.fetchall()

    return results, idx_stats

if __name__ == "__main__":
    plans, stats = asyncio.run(run_explain_suite())
    with open("query_plans.json", "w") as f:
        json.dump({"plans": plans, "stats": [dict(r._mapping) for r in stats]}, f, indent=2)
    print("Saved query_plans.json successfully.")
