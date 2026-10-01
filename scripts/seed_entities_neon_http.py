import os
import sys
import uuid
import json
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))
load_dotenv(os.path.join(ROOT_DIR, ".env"))

from app.core.security import get_password_hash

DATABASE_URL = os.environ.get("DATABASE_URL")
p = urlparse(DATABASE_URL)
conn_str = f"postgresql://{p.username}:{p.password}@{p.hostname}/neondb?sslmode=require"
neon_http_url = f"https://{p.hostname}/sql"

import time

def execute_sql(query, params=None):
    payload = {"query": query}
    if params:
        payload["params"] = params
    for attempt in range(5):
        try:
            resp = requests.post(
                neon_http_url,
                headers={"Neon-Connection-String": conn_str, "Content-Type": "application/json"},
                json=payload,
                timeout=35
            )
            if resp.status_code != 200:
                raise Exception(f"Query error ({resp.status_code}): {resp.text} \nQuery: {query}")
            return resp.json()
        except Exception as e:
            if attempt == 4:
                raise
            time.sleep(2 * (attempt + 1))

ENTITIES = [
    {
        "email": "admin@aiml.hub",
        "password": "admin123",
        "roles": ["Admin", "admin"],
        "entity_type": "admin"
    },
    {
        "email": "hod@aiml.hub",
        "password": "hod123",
        "roles": ["HOD", "hod", "Faculty", "faculty"],
        "entity_type": "hod",
        "name": "Dr. Rajesh Kumar",
        "designation": "Professor & Head of Department",
        "department": "Department of Artificial Intelligence & Machine Learning",
        "research_interests": ["Deep Learning", "Multi-Agent Systems", "Explainable AI"],
        "phone": "+91 98765 00001",
        "office_location": "Tech Block 4, Room 401"
    },
    {
        "email": "faculty@aiml.hub",
        "password": "faculty123",
        "roles": ["Faculty", "faculty"],
        "entity_type": "faculty",
        "name": "Dr. Sunita Sharma",
        "designation": "Associate Professor",
        "department": "Department of Artificial Intelligence & Machine Learning",
        "research_interests": ["Natural Language Processing", "Large Language Models", "Computer Vision"],
        "phone": "+91 98765 00002",
        "office_location": "Tech Block 4, Room 405"
    },
    {
        "email": "student@aiml.hub",
        "password": "student123",
        "roles": ["Student", "student"],
        "entity_type": "student",
        "name": "Aditya Verma",
        "reg_no": "RA2111003010001",
        "section": "AIML-A",
        "batch": 2024,
        "phone": "+91 98765 11111",
        "cgpa": 8.95,
        "placement_status": "Placed",
        "bio": "AI/ML Senior Student specializing in NLP & Deep Learning frameworks.",
        "skills": ["Python", "PyTorch", "FastAPI", "Next.js", "PostgreSQL", "Machine Learning", "Docker"],
        "github_url": "https://github.com/aiml-student",
        "linkedin_url": "https://linkedin.com/in/aiml-student",
        "leetcode_url": "https://leetcode.com/aiml-student"
    },
    {
        "email": "alumni@aiml.hub",
        "password": "alumni123",
        "roles": ["Alumni", "alumni"],
        "entity_type": "alumni",
        "name": "Priya Nair",
        "batch": 2022,
        "company": "Google DeepMind",
        "role": "Machine Learning Engineer",
        "city": "Bengaluru, India",
        "linkedin_url": "https://linkedin.com/in/priya-nair-aiml",
        "is_mentor": True,
        "bio": "Alumni class of 2022. Working on LLM reasoning and agent systems."
    },
    {
        "email": "staff@aiml.hub",
        "password": "staff123",
        "roles": ["Staff", "staff"],
        "entity_type": "staff"
    },
    {
        "email": "cos@aiml.hub",
        "password": "cos123",
        "roles": ["COS", "cos", "Faculty", "faculty"],
        "entity_type": "cos",
        "name": "Dr. Arvind Swaminathan",
        "designation": "Committee of Studies Chair & Professor",
        "department": "School of Computing & Artificial Intelligence",
        "research_interests": ["Curriculum Design", "Reinforcement Learning", "Autonomous Systems"],
        "phone": "+91 98765 00003",
        "office_location": "Admin Block 2, Room 210"
    },
    {
        "email": "hos@aiml.hub",
        "password": "hos123",
        "roles": ["HOS", "hos", "Faculty", "faculty"],
        "entity_type": "hos",
        "name": "Dr. Meenakshi Sundaram",
        "designation": "Head of School & Senior Professor",
        "department": "School of Computing & Artificial Intelligence",
        "research_interests": ["AI Governance", "High Performance Computing", "Big Data Analytics"],
        "phone": "+91 98765 00004",
        "office_location": "Admin Block 1, Room 101"
    }
]

def main():
    print("=== SYNCHRONIZING ALL ENTITIES TO NEON POSTGRESQL (HTTPS) ===", flush=True)

    # 1. Ensure Roles exist
    all_role_names = set()
    for e in ENTITIES:
        for r in e["roles"]:
            all_role_names.add(r)

    for r_name in all_role_names:
        res = execute_sql("SELECT id FROM roles WHERE name = $1;", [r_name])
        if not res["rows"]:
            r_id = str(uuid.uuid4())
            execute_sql(
                "INSERT INTO roles (id, name, description, is_system) VALUES ($1, $2, $3, $4);",
                [r_id, r_name, f"{r_name} system role", True]
            )
            print(f"✓ Created Role: {r_name}", flush=True)

    roles_res = execute_sql("SELECT id, name FROM roles;")
    role_map = {r["name"]: r["id"] for r in roles_res["rows"]}

    # 2. Sync Each Entity User & Profile
    for item in ENTITIES:
        email = item["email"]
        pwd = item["password"]
        roles = item["roles"]
        entity_type = item["entity_type"]

        hashed_pwd = get_password_hash(pwd)

        user_res = execute_sql("SELECT id FROM users WHERE email = $1;", [email])
        if user_res["rows"]:
            user_id = user_res["rows"][0]["id"]
            execute_sql(
                "UPDATE users SET password_hash = $1, is_active = TRUE, deleted_at = NULL, updated_at = NOW() WHERE id = $2;",
                [hashed_pwd, user_id]
            )
            print(f"✓ Updated User ({email}) password_hash & active status")
        else:
            user_id = str(uuid.uuid4())
            execute_sql(
                "INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at) VALUES ($1, $2, $3, TRUE, NOW(), NOW());",
                [user_id, email, hashed_pwd]
            )
            print(f"✓ Created User: {email}")

        # User Roles mapping
        for r_name in roles:
            r_id = role_map.get(r_name)
            if r_id:
                ur_res = execute_sql(
                    "SELECT id FROM user_roles WHERE user_id = $1 AND role_id = $2;",
                    [user_id, r_id]
                )
                if not ur_res["rows"]:
                    execute_sql(
                        "INSERT INTO user_roles (id, user_id, role_id, valid_from) VALUES ($1, $2, $3, NOW());",
                        [str(uuid.uuid4()), user_id, r_id]
                    )

        # Casbin rules
        for r_name in roles:
            execute_sql(
                "INSERT INTO casbin_rule (ptype, v0, v1) VALUES ('g', $1, $2) ON CONFLICT DO NOTHING;",
                [email, r_name]
            )

        # Profile Records
        if entity_type == "student":
            stu_res = execute_sql("SELECT id FROM students WHERE user_id = $1;", [user_id])
            skills_json = json.dumps(item["skills"])
            if stu_res["rows"]:
                execute_sql(
                    """
                    UPDATE students 
                    SET reg_no = $1, section = $2, batch = $3, phone = $4, cgpa = $5, placement_status = $6,
                        bio = $7, skills = $8::jsonb, github_url = $9, linkedin_url = $10, leetcode_url = $11,
                        deleted_at = NULL, updated_at = NOW()
                    WHERE user_id = $12;
                    """,
                    [item["reg_no"], item["section"], item["batch"], item["phone"], item["cgpa"],
                     item["placement_status"], item["bio"], skills_json, item["github_url"],
                     item["linkedin_url"], item["leetcode_url"], user_id]
                )
                print(f"✓ Updated Student profile ({email})")
            else:
                execute_sql(
                    """
                    INSERT INTO students (
                        id, user_id, reg_no, section, batch, phone, cgpa, placement_status,
                        bio, skills, github_url, linkedin_url, leetcode_url, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8,
                        $9, $10::jsonb, $11, $12, $13, NOW(), NOW()
                    );
                    """,
                    [str(uuid.uuid4()), user_id, item["reg_no"], item["section"], item["batch"], item["phone"],
                     item["cgpa"], item["placement_status"], item["bio"], skills_json, item["github_url"],
                     item["linkedin_url"], item["leetcode_url"]]
                )
                print(f"✓ Created Student profile ({email})")

        elif entity_type in ("faculty", "hod", "cos", "hos"):
            fac_res = execute_sql("SELECT id FROM faculty WHERE user_id = $1;", [user_id])
            research_json = json.dumps(item["research_interests"])
            if fac_res["rows"]:
                execute_sql(
                    """
                    UPDATE faculty 
                    SET designation = $1, department = $2, research_interests = $3::jsonb, deleted_at = NULL, updated_at = NOW()
                    WHERE user_id = $4;
                    """,
                    [item["designation"], item["department"], research_json, user_id]
                )
                print(f"✓ Updated Faculty profile ({email})")
            else:
                execute_sql(
                    """
                    INSERT INTO faculty (id, user_id, designation, department, research_interests, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW());
                    """,
                    [str(uuid.uuid4()), user_id, item["designation"], item["department"], research_json]
                )
                print(f"✓ Created Faculty profile ({email})")

            # If leadership profile (HOD, COS, HOS)
            if entity_type in ("hod", "cos", "hos"):
                lead_res = execute_sql("SELECT id FROM leadership_profiles WHERE email = $1;", [email])
                order_map = {"hod": 1, "cos": 2, "hos": 3}
                if lead_res["rows"]:
                    execute_sql(
                        """
                        UPDATE leadership_profiles 
                        SET user_id = $1, role = $2, display_title = $3, short_bio = $4, phone = $5,
                            office_location = $6, is_active = TRUE, updated_at = NOW(), deleted_at = NULL
                        WHERE email = $7;
                        """,
                        [user_id, entity_type, item["designation"], f"{item['designation']} at {item['department']}",
                         item.get("phone"), item.get("office_location"), email]
                    )
                    print(f"✓ Updated LeadershipProfile ({email})")
                else:
                    execute_sql(
                        """
                        INSERT INTO leadership_profiles (
                            id, user_id, role, display_title, short_bio, email, phone,
                            office_location, display_order, is_active, created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7,
                            $8, $9, TRUE, NOW(), NOW()
                        );
                        """,
                        [str(uuid.uuid4()), user_id, entity_type, item["designation"], f"{item['designation']} at {item['department']}",
                         email, item.get("phone"), item.get("office_location"), order_map.get(entity_type, 5)]
                    )
                    print(f"✓ Created LeadershipProfile ({email})")

        elif entity_type == "alumni":
            alum_res = execute_sql("SELECT id FROM alumni WHERE user_id = $1;", [user_id])
            if alum_res["rows"]:
                execute_sql(
                    """
                    UPDATE alumni 
                    SET full_name = $1, email = $2, graduation_year = $3, "current_company" = $4, "current_role" = $5,
                        location = $6, linkedin_url = $7, open_to_mentorship = $8, bio = $9, deleted_at = NULL, updated_at = NOW()
                    WHERE user_id = $10;
                    """,
                    [item["name"], email, item["batch"], item["company"], item["role"],
                     item["city"], item["linkedin_url"], item["is_mentor"], item["bio"], user_id]
                )
                print(f"✓ Updated Alumni profile ({email})", flush=True)
            else:
                execute_sql(
                    """
                    INSERT INTO alumni (
                        id, user_id, reg_no, full_name, email, graduation_year, program, degree,
                        "current_company", "current_role", location, linkedin_url, open_to_mentorship, bio, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
                    );
                    """,
                    [str(uuid.uuid4()), user_id, f"ALUM{uuid.uuid4().hex[:6].upper()}", item["name"], email, item["batch"],
                     "B.Tech CSE (AI & ML)", "B.Tech", item["company"], item["role"],
                     item["city"], item["linkedin_url"], item["is_mentor"], item["bio"]]
                )
                print(f"✓ Created Alumni profile ({email})", flush=True)

    # 3. Ensure Casbin Policy Rules
    policies = [
        ("Admin", "users", "read"),
        ("Admin", "users", "write"),
        ("Admin", "users", "delete"),
        ("Admin", "roles", "create"),
        ("Admin", "*", "*"),
        ("HOD", "approvals", "approve"),
        ("HOD", "approvals", "reject"),
        ("HOD", "faculty", "read"),
        ("HOD", "students", "read"),
        ("Faculty", "students", "read"),
        ("Faculty", "courses", "write"),
        ("Student", "profile", "read"),
        ("Student", "profile", "update"),
        ("Alumni", "events", "read"),
        ("Staff", "inventory", "read"),
    ]
    for p in policies:
        execute_sql(
            "INSERT INTO casbin_rule (ptype, v0, v1, v2) VALUES ('p', $1, $2, $3) ON CONFLICT DO NOTHING;",
            [p[0], p[1], p[2]]
        )

    print("\n=======================================================", flush=True)
    print("SUCCESS: ALL ENTITY DATA & PASSWORDS STORED IN DATABASE!", flush=True)
    print("=======================================================", flush=True)

if __name__ == "__main__":
    main()
