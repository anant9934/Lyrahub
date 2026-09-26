import asyncio
import uuid
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def run_e2e():
    print("=================================================================")
    print("PHASE 4E END-TO-END VERIFICATION: 8 CORE BROWSER / USER FLOWS")
    print("=================================================================")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=120.0) as client:
        # Step 0: Auth tokens
        print("\n[STEP 0] Authenticating users...", flush=True)
        from app.core.security import create_access_token
        faculty_token = create_access_token({"sub": "admin@aiml.hub"})
        student_token = create_access_token({"sub": "student@aiml.hub"})
        hod_token = create_access_token({"sub": "hod@aiml.hub"})

        fac_headers = {"Authorization": f"Bearer {faculty_token}"}
        stu_headers = {"Authorization": f"Bearer {student_token}"}
        hod_headers = {"Authorization": f"Bearer {hod_token}"}
        print("  Tokens generated successfully.", flush=True)

        # Flow 1: Faculty creates test with MCQ questions -> publishes
        print("\n[FLOW 1] Faculty creates a test with MCQ questions -> publishes", flush=True)
        test_slug = f"e2e-ml-test-{uuid.uuid4().hex[:6]}"
        create_test_res = await client.post(
            "/api/v1/tests",
            json={
                "title": "Machine Learning Fundamentals Assessment",
                "slug": test_slug,
                "description": "Comprehensive evaluation of supervised learning, regularization, and model metrics.",
                "domain": "ai_ml_general",
                "difficulty": "intermediate",
                "duration_minutes": 25,
                "total_questions": 2,
                "total_marks": 2,
                "passing_marks": 1
            },
            headers=fac_headers
        )
        assert create_test_res.status_code == 201, f"Failed: {create_test_res.text}"
        test_id = create_test_res.json()["id"]
        print(f"  Test created with id: {test_id} (slug: {test_slug})", flush=True)

        sample_questions = [
            ("Which regularization technique adds L2 norm penalty to the loss function?", ["Lasso", "Ridge", "ElasticNet", "Dropout"], ["Ridge"]),
            ("What does AUC-ROC measure in binary classification?", ["Precision vs Recall", "True Positive Rate vs False Positive Rate", "Accuracy", "F1 Score"], ["True Positive Rate vs False Positive Rate"])
        ]

        q_ids = []
        for i, (q_text, opts, correct) in enumerate(sample_questions, 1):
            q_res = await client.post(
                f"/api/v1/tests/{test_id}/questions",
                json={
                    "question_text": q_text,
                    "question_type": "mcq",
                    "options": [{"id": chr(97 + idx), "text": opt} for idx, opt in enumerate(opts)],
                    "correct_answer": correct,
                    "marks": 1,
                    "display_order": i
                },
                headers=fac_headers
            )
            assert q_res.status_code == 201, f"Question {i} failed: {q_res.text}"
            q_ids.append((q_res.json()["id"], q_res.json()["options"]))
            print(f"  Added question {i}/2", flush=True)
        print("  Added all MCQ questions successfully.", flush=True)

        pub_res = await client.post(f"/api/v1/tests/{test_id}/publish", headers=fac_headers)
        assert pub_res.status_code == 200
        assert pub_res.json()["is_published"] is True
        print("  Test published successfully.", flush=True)
        print("  -> FLOW 1: [PASS]", flush=True)

        # Flow 2: Student logs in -> sees test -> starts attempt -> submits -> sees score
        print("\n[FLOW 2] Student logs in -> sees test -> starts attempt -> submits -> sees score", flush=True)
        list_res = await client.get("/api/v1/tests", headers=stu_headers)
        assert list_res.status_code == 200
        found = any(t["id"] == test_id for t in list_res.json()["items"])
        assert found, "Published test not visible to student"
        print(f"  Student sees test '{test_slug}' in available tests catalog.", flush=True)

        start_res = await client.post(f"/api/v1/tests/{test_id}/start", headers=stu_headers)
        assert start_res.status_code == 200
        attempt_id = start_res.json()["attempt_id"]
        received_questions = start_res.json()["questions"]
        assert len(received_questions) == 2
        print(f"  Student started attempt {attempt_id} and received {len(received_questions)} questions.", flush=True)

        # Prepare correct answers for both questions
        submitted_answers = {}
        for q in received_questions:
            for orig_text, opts, correct in sample_questions:
                if q["question_text"] == orig_text:
                    submitted_answers[q["id"]] = correct[0]

        sub_res = await client.post(
            f"/api/v1/tests/{test_id}/submit",
            json={"answers": submitted_answers},
            headers=stu_headers
        )
        assert sub_res.status_code == 200
        result = sub_res.json()
        print(f"  Graded result: Score = {result['score']}/{result['total_marks']} ({result['percentage']}%), Passed = {result['passed']}", flush=True)
        assert float(result["score"]) == 2.0
        assert result["passed"] is True

        my_res = await client.get(f"/api/v1/tests/{test_id}/my-attempt", headers=stu_headers)
        assert my_res.status_code == 200
        print(f"  Retrieved attempt breakdown: status = {my_res.json()['status']}")
        print("  -> FLOW 2: [PASS]")

        # Flow 3: Faculty edits student's CGPA -> submits change request
        print("\n[FLOW 3] Faculty edits student's CGPA -> submits change request")
        stud_prof = await client.get("/api/v1/students/me", headers=stu_headers)
        assert stud_prof.status_code == 200
        student_id = stud_prof.json()["id"]

        cr_res = await client.post(
            "/api/v1/approvals/requests",
            json={
                "resource_type": "student_profile",
                "resource_id": student_id,
                "action": "update",
                "payload": {"cgpa": 9.45}
            },
            headers=fac_headers
        )
        assert cr_res.status_code == 201
        cr_data = cr_res.json()
        cr_id = cr_data["id"]
        assert cr_data["status"] == "pending"
        print(f"  Change request {cr_id} submitted by faculty. Status: pending.")
        print(f"  Diff captured: current cgpa={cr_data['current_state'].get('cgpa')} -> proposed cgpa={cr_data['payload'].get('cgpa')}")
        print("  -> FLOW 3: [PASS]")

        # Flow 4: HOD sees pending -> reviews diff -> approves
        print("\n[FLOW 4] HOD sees pending -> reviews diff -> approves")
        hod_queue = await client.get("/api/v1/approvals/requests?status=pending", headers=hod_headers)
        assert hod_queue.status_code == 200
        pending_items = hod_queue.json()["items"]
        assert any(item["id"] == cr_id for item in pending_items)
        print(f"  HOD found request {cr_id} in pending approval queue.")

        detail_res = await client.get(f"/api/v1/approvals/requests/{cr_id}", headers=hod_headers)
        assert detail_res.status_code == 200
        print(f"  HOD reviewed diff details.")

        appr_res = await client.post(f"/api/v1/approvals/requests/{cr_id}/approve", headers=hod_headers)
        assert appr_res.status_code == 200
        assert appr_res.json()["status"] == "approved"
        print(f"  HOD approved change request.")
        print("  -> FLOW 4: [PASS]")

        # Flow 5: Student profile updated automatically
        print("\n[FLOW 5] Student profile updated automatically")
        updated_student = await client.get("/api/v1/students/me", headers=stu_headers)
        assert updated_student.status_code == 200
        new_cgpa = updated_student.json()["cgpa"]
        print(f"  Student CGPA after HOD approval: {new_cgpa}")
        assert float(new_cgpa) == 9.45
        print("  -> FLOW 5: [PASS]")

        # Flow 6: Student views own QR code -> downloads PNG
        print("\n[FLOW 6] Student views own QR code -> downloads PNG")
        qr_res = await client.get("/api/v1/qr/student/me", headers=stu_headers)
        assert qr_res.status_code == 200
        assert qr_res.headers["content-type"] == "image/png"
        assert qr_res.content.startswith(b"\x89PNG\r\n\x1a\n")
        print(f"  Downloaded student QR code PNG ({len(qr_res.content)} bytes).")
        print("  -> FLOW 6: [PASS]")

        # Flow 7: Faculty starts attendance session -> projects QR -> student scans -> marked
        print("\n[FLOW 7] Faculty starts attendance session -> projects QR -> student scans -> marked")
        sess_create = await client.post(
            "/api/v1/qr/attendance/session",
            json={"section": "Section-AIML-1", "duration_minutes": 30},
            headers=fac_headers
        )
        assert sess_create.status_code == 201
        sess_id = sess_create.json()["id"]
        print(f"  Faculty started live attendance session: {sess_id}")
        assert sess_create.json()["qr_image_base64"].startswith("data:image/png;base64,")

        # Student scans and marks attendance
        mark_res = await client.post(
            "/api/v1/qr/attendance/mark",
            json={"session_id": sess_id},
            headers=stu_headers
        )
        assert mark_res.status_code == 201
        print(f"  Student scanned and marked attendance: {mark_res.json()['message']}")

        # Verify duplicate scan is prevented (409)
        dup_res = await client.post(
            "/api/v1/qr/attendance/mark",
            json={"session_id": sess_id},
            headers=stu_headers
        )
        assert dup_res.status_code == 409
        print(f"  Duplicate attendance correctly rejected with 409 Conflict.")

        # Faculty checks live roster
        roster_res = await client.get(f"/api/v1/qr/attendance/session/{sess_id}/records", headers=fac_headers)
        assert roster_res.status_code == 200
        assert roster_res.json()["total_marked"] >= 1
        print(f"  Faculty verified live attendance roll: {roster_res.json()['total_marked']} student(s) marked.")
        print("  -> FLOW 7: [PASS]")

        # Flow 8: Public visitor opens /leadership/hod -> sees profile
        print("\n[FLOW 8] Public visitor opens /leadership/hod -> sees profile")
        lead_res = await client.get("/api/v1/leadership/hod")
        assert lead_res.status_code == 200
        lead_data = lead_res.json()
        assert lead_data["role"] == "hod"
        print(f"  Profile Title: {lead_data['display_title']}")
        print(f"  Short Bio: {lead_data['short_bio'][:80]}...")
        assert "Artificial Intelligence" in lead_data["short_bio"] or "AI" in lead_data["display_title"]

        stats_res = await client.get("/api/v1/leadership/hod/stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        print(f"  Department Stats: Students={stats['total_students']}, Faculty={stats['total_faculty']}")
        print("  -> FLOW 8: [PASS]")

    print("\n=================================================================")
    print("ALL 8 END-TO-END FLOWS COMPLETED AND PASSED!")
    print("=================================================================")

if __name__ == "__main__":
    asyncio.run(run_e2e())
