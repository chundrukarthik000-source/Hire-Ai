import requests
import io

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== STARTING END-TO-END API TEST ===")

    # 1. Get jobs
    print("\n1. Testing GET /jobs...")
    r = requests.get(f"{BASE_URL}/jobs")
    assert r.status_code == 200, f"Failed jobs list: {r.text}"
    jobs = r.json()
    print(f"Success! Found {len(jobs)} jobs:")
    for j in jobs:
        print(f" - [{j['id']}] {j['title']} (Skills: {j['required_skills']})")

    # 2. Sync user (register/login candidate)
    print("\n2. Testing POST /auth/sync (Candidate)...")
    headers_candidate = {"Authorization": "Bearer mock-token-candidate-123"}
    sync_payload = {
        "displayName": "Alice Smith",
        "email": "alice@hiringagent.com",
        "role": "candidate"
    }
    r = requests.post(f"{BASE_URL}/auth/sync", headers=headers_candidate, json=sync_payload)
    assert r.status_code == 200, f"Failed candidate sync: {r.text}"
    candidate_profile = r.json()
    print(f"Success! Candidate profile synced: {candidate_profile}")

    # 3. Apply to job
    print("\n3. Testing POST /applications (Apply to Job)...")
    
    # Create a dummy PDF content
    dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 12 Tf 72 712 Td (Alice Smith React Javascript Tailwind Resume) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 >>\nstartxref\n312\n%%EOF"
    
    files = {
        "resume": ("alice_resume.pdf", dummy_pdf_content, "application/pdf")
    }
    
    form_data = {
        "job_id": "job-react-1",
        "name": "Alice Smith",
        "email": "alice@hiringagent.com",
        "phone": "+1 (555) 019-2834",
        "college": "State Technological Institute",
        "experience": "2 years as Frontend Engineer specializing in high-performance web systems and dashboard components.",
        "skills": "React, JavaScript, Tailwind CSS, Vite, Redux"
    }
    
    r = requests.post(
        f"{BASE_URL}/applications",
        headers=headers_candidate,
        data=form_data,
        files=files
    )
    assert r.status_code == 201, f"Failed application submission: {r.text}"
    app_details = r.json()
    print("Success! Job application submitted successfully.")
    print(f"Application ID: {app_details['id']}")
    print(f"AI Score: {app_details['aiAnalysis']['resumeScore']}%")
    print(f"AI Skill Match Score: {app_details['aiAnalysis']['skillsMatch']}%")
    print(f"AI Reasoning: {app_details['aiAnalysis']['reasoning']}")
    print(f"Resume URL: {app_details['resumeUrl']}")

    # 4. Get candidate's own applications
    print("\n4. Testing GET /applications/my (Candidate Dashboard)...")
    r = requests.get(f"{BASE_URL}/applications/my", headers=headers_candidate)
    assert r.status_code == 200, f"Failed fetching user applications: {r.text}"
    user_apps = r.json()
    print(f"Success! Found {len(user_apps)} applications for candidate Alice:")
    for app in user_apps:
        print(f" - [{app['id']}] Job: {app['jobTitle']} | Status: {app['status']} | AI Score: {app['aiAnalysis']['resumeScore']}%")

    # 5. Sync user as admin
    print("\n5. Testing POST /auth/sync (Admin)...")
    headers_admin = {"Authorization": "Bearer mock-token-mock-admin-uid"}
    admin_sync_payload = {
        "displayName": "ch karthik",
        "email": "admin@hiringagent.com",
        "role": "admin"
    }
    r = requests.post(f"{BASE_URL}/auth/sync", headers=headers_admin, json=admin_sync_payload)
    assert r.status_code == 200, f"Failed admin sync: {r.text}"
    admin_profile = r.json()
    print(f"Success! Admin profile synced: {admin_profile}")

    # 6. Fetch Admin Dashboard stats
    print("\n6. Testing GET /admin/dashboard (Admin Dashboard)...")
    r = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers_admin)
    assert r.status_code == 200, f"Failed admin dashboard: {r.text}"
    stats = r.json()
    print("Success! Admin Dashboard Stats:")
    print(f" - Total Applicants: {stats['totalApplicants']}")
    print(f" - Total Jobs: {stats['totalJobs']}")
    print(f" - Shortlisted Candidates: {stats['shortlistedCandidates']}")
    print(f" - Recent Applications: {len(stats['recentApplications'])} application(s)")

    # 7. Fetch Candidate Roster (Admin Candidate List)
    print("\n7. Testing GET /admin/candidates (Admin Candidates List)...")
    r = requests.get(f"{BASE_URL}/admin/candidates", headers=headers_admin)
    assert r.status_code == 200, f"Failed admin candidates roster: {r.text}"
    roster = r.json()
    print(f"Success! Found {len(roster)} candidate(s) in roster.")
    alice_app = None
    for cand in roster:
        print(f" - [{cand['id']}] {cand['candidateName']} ({cand['jobTitle']}) - AI Score: {cand['aiAnalysis']['resumeScore']}% | Status: {cand['status']}")
        if cand['candidateName'] == "Alice Smith":
            alice_app = cand
            
    assert alice_app is not None, "Alice Smith was not found in the admin candidates roster!"

    # 8. Update Alice Smith's status to shortlisted
    print(f"\n8. Testing PUT /applications/{alice_app['id']}/status (Shortlist Alice)...")
    status_payload = {"status": "shortlisted"}
    r = requests.put(f"{BASE_URL}/applications/{alice_app['id']}/status", headers=headers_admin, json=status_payload)
    assert r.status_code == 200, f"Failed updating application status: {r.text}"
    updated_alice = r.json()
    print(f"Success! Updated status is: {updated_alice['status']}")
    assert updated_alice['status'] == "shortlisted"

    # 9. Verify stats reflect the update
    print("\n9. Re-checking GET /admin/dashboard...")
    r = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers_admin)
    assert r.status_code == 200, f"Failed second admin dashboard query: {r.text}"
    new_stats = r.json()
    print(f"Success! Shortlisted count is now: {new_stats['shortlistedCandidates']} (was: {stats['shortlistedCandidates']})")
    assert new_stats['shortlistedCandidates'] == stats['shortlistedCandidates'] + 1

    print("\n=== ALL END-TO-END API TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
