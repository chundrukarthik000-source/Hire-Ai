import json
import firebase_admin
from firebase_admin import credentials, firestore, storage
from app import config

db = None
bucket = None

if not config.MOCK_MODE:
    try:
        # Support credentials from JSON string (Cloud Run) or file path (local dev)
        if config.FIREBASE_CREDENTIALS_JSON:
            cred_dict = json.loads(config.FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            print("[Firebase Config] Loaded credentials from JSON environment variable.")
        elif config.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(config.FIREBASE_CREDENTIALS_PATH)
            print(f"[Firebase Config] Loaded credentials from file: {config.FIREBASE_CREDENTIALS_PATH}")
        else:
            raise ValueError("No Firebase credentials provided. Set FIREBASE_CREDENTIALS_PATH or GOOGLE_APPLICATION_CREDENTIALS_JSON.")

        firebase_admin.initialize_app(cred, {
            'storageBucket': config.FIREBASE_STORAGE_BUCKET,
            'databaseURL': config.FIREBASE_DATABASE_URL
        })
        db = firestore.client()
        bucket = storage.bucket()
        print("[Firebase Config] Live Firebase Admin SDK initialized successfully.")
        
        # Seed default jobs if database is empty
        jobs_ref = db.collection("jobs")
        docs = list(jobs_ref.limit(1).stream())
        if not docs:
            print("[Firebase Config] Firestore 'jobs' collection is empty. Seeding default roles...")
            DEFAULT_JOBS = [
                {
                    "id": "job-react-1",
                    "title": "Senior React Developer",
                    "description": "We are looking for a Senior Frontend Engineer proficient in React, Tailwind CSS, and state management libraries (Redux/Zustand) to construct high-performance futuristic user interfaces. Deployment experience with Vercel or AWS is a plus.",
                    "required_skills": ["React", "JavaScript", "Tailwind CSS", "Redux", "Vite"],
                    "experience_required": "3+ years",
                    "deadline": "2026-06-30",
                    "status": "open",
                    "salary": "$110,000 - $140,000 / year",
                    "created_at": "2026-05-22T14:00:00"
                },
                {
                    "id": "job-python-2",
                    "title": "Backend Python Developer",
                    "description": "Join our backend team to scale high-throughput FastAPI microservices. The candidate must be skilled in Python, SQL/NoSQL databases, asynchronous programming, Docker, and REST API development.",
                    "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"],
                    "experience_required": "2+ years",
                    "deadline": "2026-07-15",
                    "status": "open",
                    "salary": "$115,000 - $145,000 / year",
                    "created_at": "2026-05-22T14:00:00"
                },
                {
                    "id": "job-ai-3",
                    "title": "AI Integration Engineer",
                    "description": "We are seeking an AI Engineer to integrate Large Language Models (LLMs) like Gemini, Claude, and GPT-4 into client applications. Experience in prompt engineering, vector databases, and Python backend frameworks is highly required.",
                    "required_skills": ["Python", "Gemini API", "LLMs", "Vector DB", "Prompt Engineering"],
                    "experience_required": "1+ years",
                    "deadline": "2026-06-15",
                    "status": "open",
                    "salary": "$130,000 - $160,000 / year",
                    "created_at": "2026-05-22T14:00:00"
                }
            ]
            for job in DEFAULT_JOBS:
                jobs_ref.document(job["id"]).set(job)
            print("[Firebase Config] Seeding default roles completed.")
            
        # Seed default admins
        admins_ref = db.collection("admins")
        if not admins_ref.document("admin@hiringagent.com").get().exists:
            print("[Firebase Config] Seeding default admin user...")
            admins_ref.document("admin@hiringagent.com").set({
                "email": "admin@hiringagent.com",
                "role": "admin"
            })
            print("[Firebase Config] Seeding default admin completed.")
    except Exception as e:
        print(f"[Firebase Config Error] Failed to initialize Firebase: {e}. Forcing Mock Mode.")
        config.MOCK_MODE = True
else:
    print("[Firebase Config] Running in Mock Mode. Live Firebase SDK will not be initialized.")
