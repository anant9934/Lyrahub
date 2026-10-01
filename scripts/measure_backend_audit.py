import asyncio
import time
import json
import statistics
import httpx
from dotenv import load_dotenv
import os

load_dotenv('.env')

from passlib.context import CryptContext
from jose import jwt
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PWD_CONTEXT = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
BASE_URL = "http://localhost:8000/api/v1"
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")

async def measure_primitives():
    results = {}
    print("\n--- MEASURING LOW-LEVEL PRIMITIVES ---")

    # 1. Argon2 Hashing and Verification
    pwd = "password123"
    t0 = time.perf_counter()
    h = PWD_CONTEXT.hash(pwd)
    t1 = time.perf_counter()
    results["argon2_hash_ms"] = round((t1 - t0) * 1000, 2)

    ver_times = []
    for _ in range(5):
        t0 = time.perf_counter()
        valid = PWD_CONTEXT.verify(pwd, h)
        t1 = time.perf_counter()
        ver_times.append((t1 - t0) * 1000)
    results["argon2_verify_avg_ms"] = round(statistics.mean(ver_times), 2)
    results["argon2_verify_min_ms"] = round(min(ver_times), 2)
    results["argon2_verify_max_ms"] = round(max(ver_times), 2)

    # 2. JWT Encode & Decode
    payload = {"sub": "student@aiml.hub", "exp": int(time.time()) + 900}
    t0 = time.perf_counter()
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    t1 = time.perf_counter()
    results["jwt_encode_ms"] = round((t1 - t0) * 1000, 3)

    t0 = time.perf_counter()
    decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    t1 = time.perf_counter()
    results["jwt_decode_ms"] = round((t1 - t0) * 1000, 3)

    # 3. Redis Operations (Remote redis.io)
    r = redis.from_url(REDIS_URL, socket_timeout=5.0)
    ping_times = []
    for _ in range(5):
        t0 = time.perf_counter()
        await r.ping()
        t1 = time.perf_counter()
        ping_times.append((t1 - t0) * 1000)
    results["redis_ping_p50_ms"] = round(statistics.median(ping_times), 2)
    results["redis_ping_p95_ms"] = round(max(ping_times), 2)

    set_times = []
    for i in range(5):
        t0 = time.perf_counter()
        await r.setex(f"audit_test_key_{i}", 60, "true")
        t1 = time.perf_counter()
        set_times.append((t1 - t0) * 1000)
    results["redis_setex_p50_ms"] = round(statistics.median(set_times), 2)

    get_times = []
    for i in range(5):
        t0 = time.perf_counter()
        await r.get(f"audit_test_key_{i}")
        t1 = time.perf_counter()
        get_times.append((t1 - t0) * 1000)
    results["redis_get_p50_ms"] = round(statistics.median(get_times), 2)
    await r.aclose()

    # 4. DB Queries (Neon ap-southeast-2 Sydney)
    engine = create_async_engine(DATABASE_URL, pool_size=5, connect_args={"statement_cache_size": 0})
    db_select1_times = []
    async with engine.connect() as conn:
        for _ in range(5):
            t0 = time.perf_counter()
            res = await conn.execute(text("SELECT 1"))
            res.scalar()
            t1 = time.perf_counter()
            db_select1_times.append((t1 - t0) * 1000)
    results["db_select1_p50_ms"] = round(statistics.median(db_select1_times), 2)
    results["db_select1_p95_ms"] = round(max(db_select1_times), 2)

    # Specific DB Query benchmarks
    async with engine.connect() as conn:
        # User lookup query
        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT id, email, password_hash, is_active FROM users WHERE email = 'student@aiml.hub' AND deleted_at IS NULL"))
        row = res.fetchone()
        t1 = time.perf_counter()
        results["db_user_lookup_ms"] = round((t1 - t0) * 1000, 2)

        # Casbin rules lookup query
        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT ptype, v0, v1, v2, v3, v4, v5 FROM casbin_rule"))
        rows = res.fetchall()
        t1 = time.perf_counter()
        results["db_casbin_load_ms"] = round((t1 - t0) * 1000, 2)
        results["casbin_rule_count"] = len(rows)

        # Projects count & list query
        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT count(*) FROM projects WHERE deleted_at IS NULL AND is_public = true"))
        p_count = res.scalar()
        t1 = time.perf_counter()
        results["db_projects_count_ms"] = round((t1 - t0) * 1000, 2)

        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT * FROM projects WHERE deleted_at IS NULL AND is_public = true ORDER BY created_at DESC LIMIT 20"))
        p_rows = res.fetchall()
        t1 = time.perf_counter()
        results["db_projects_select_ms"] = round((t1 - t0) * 1000, 2)
        results["projects_count"] = p_count

        # Courses query
        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT count(*) FROM courses WHERE deleted_at IS NULL AND is_active = true"))
        c_count = res.scalar()
        t1 = time.perf_counter()
        results["db_courses_count_ms"] = round((t1 - t0) * 1000, 2)

        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT * FROM courses WHERE deleted_at IS NULL AND is_active = true ORDER BY semester ASC, code ASC LIMIT 20"))
        c_rows = res.fetchall()
        t1 = time.perf_counter()
        results["db_courses_select_ms"] = round((t1 - t0) * 1000, 2)
        results["courses_count"] = c_count

        # Ranking snapshot query
        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT max(snapshot_date) FROM ranking_snapshots"))
        max_date = res.scalar()
        t1 = time.perf_counter()
        results["db_ranking_maxdate_ms"] = round((t1 - t0) * 1000, 2)

        t0 = time.perf_counter()
        res = await conn.execute(text("SELECT count(*) FROM ranking_snapshots WHERE snapshot_date = :dt"), {"dt": max_date})
        r_count = res.scalar()
        t1 = time.perf_counter()
        results["db_ranking_count_ms"] = round((t1 - t0) * 1000, 2)
        results["ranking_count"] = r_count

    await engine.dispose()
    print(json.dumps(results, indent=2))
    return results

async def measure_endpoints():
    print("\n--- MEASURING API ENDPOINTS VIA HTTP ---")
    results = {}
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Health endpoints
        t0 = time.perf_counter()
        resp = await client.get(f"{BASE_URL}/health/live")
        t1 = time.perf_counter()
        results["api_health_live_ms"] = round((t1 - t0) * 1000, 2)

        # 2. Login
        login_times = []
        token_data = None
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.post(
                f"{BASE_URL}/auth/login",
                data={"username": "student@aiml.hub", "password": "password123"},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            t1 = time.perf_counter()
            login_times.append((t1 - t0) * 1000)
            if resp.status_code == 200:
                token_data = resp.json()
        results["api_login_p50_ms"] = round(statistics.median(login_times), 2)
        results["api_login_min_ms"] = round(min(login_times), 2)
        results["api_login_max_ms"] = round(max(login_times), 2)
        results["api_login_status"] = resp.status_code
        results["api_login_size_bytes"] = len(resp.content)

        access_token = token_data.get("access_token") if token_data else None
        headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}

        # 3. GET /auth/me
        me_times = []
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.get(f"{BASE_URL}/auth/me", headers=headers)
            t1 = time.perf_counter()
            me_times.append((t1 - t0) * 1000)
        results["api_auth_me_p50_ms"] = round(statistics.median(me_times), 2)
        results["api_auth_me_min_ms"] = round(min(me_times), 2)
        results["api_auth_me_size_bytes"] = len(resp.content)

        # 4. GET /projects
        proj_times = []
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.get(f"{BASE_URL}/projects", headers=headers)
            t1 = time.perf_counter()
            proj_times.append((t1 - t0) * 1000)
        results["api_projects_p50_ms"] = round(statistics.median(proj_times), 2)
        results["api_projects_min_ms"] = round(min(proj_times), 2)
        results["api_projects_size_bytes"] = len(resp.content)

        # 5. GET /courses
        course_times = []
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.get(f"{BASE_URL}/courses?page_size=30&page=1", headers=headers)
            t1 = time.perf_counter()
            course_times.append((t1 - t0) * 1000)
        results["api_courses_p50_ms"] = round(statistics.median(course_times), 2)
        results["api_courses_min_ms"] = round(min(course_times), 2)
        results["api_courses_size_bytes"] = len(resp.content)

        # 6. GET /ranking
        rank_times = []
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.get(f"{BASE_URL}/ranking?page_size=25", headers=headers)
            t1 = time.perf_counter()
            rank_times.append((t1 - t0) * 1000)
        results["api_ranking_p50_ms"] = round(statistics.median(rank_times), 2)
        results["api_ranking_min_ms"] = round(min(rank_times), 2)
        results["api_ranking_size_bytes"] = len(resp.content)

        # 7. GET /students/me
        student_times = []
        for _ in range(3):
            t0 = time.perf_counter()
            resp = await client.get(f"{BASE_URL}/students/me", headers=headers)
            t1 = time.perf_counter()
            student_times.append((t1 - t0) * 1000)
        results["api_students_me_p50_ms"] = round(statistics.median(student_times), 2)
        results["api_students_me_min_ms"] = round(min(student_times), 2)
        results["api_students_me_size_bytes"] = len(resp.content)

        # 8. POST /ai/query (AIDA deterministic query vs LLM)
        ai_times = []
        for query_text in ["What is AIMETRA?", "Show department courses", "Hello"]:
            t0 = time.perf_counter()
            resp = await client.post(
                f"{BASE_URL}/ai/query",
                json={"query": query_text, "mode": "academic"},
                headers=headers
            )
            t1 = time.perf_counter()
            ai_times.append({
                "query": query_text,
                "latency_ms": round((t1 - t0) * 1000, 2),
                "status": resp.status_code,
                "route": resp.json().get("route") if resp.status_code == 200 else None,
                "cached": resp.json().get("metadata", {}).get("cached") if resp.status_code == 200 else None
            })
        results["api_aida_queries"] = ai_times

    print(json.dumps(results, indent=2))
    return results

async def main():
    prim = await measure_primitives()
    endpoints = await measure_endpoints()
    full = {"primitives": prim, "endpoints": endpoints}
    with open("docs/optimization/backend_audit_measurements.json", "w") as f:
        json.dump(full, f, indent=2)
    print("\nMeasurements saved to docs/optimization/backend_audit_measurements.json")

if __name__ == "__main__":
    asyncio.run(main())
