import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional
from app import config
from app import firebase_config

# Paths for local file database and storage when running in Mock Mode
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
MOCK_DB_PATH = os.path.join(DATA_DIR, "db.json")
MOCK_STORAGE_DIR = os.path.join(DATA_DIR, "storage")

# Ensure local data directory structure exists
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MOCK_STORAGE_DIR, exist_ok=True)

DEFAULT_MOCK_DATA = {
    "users": {
        "mock-candidate-uid": {
            "uid": "mock-candidate-uid",
            "email": "candidate@hiringagent.com",
            "displayName": "John Doe",
            "role": "candidate",
            "createdAt": datetime.datetime.now().isoformat()
        },
        "mock-admin-uid": {
            "uid": "mock-admin-uid",
            "email": "admin@hiringagent.com",
            "displayName": "ch karthik",
            "role": "admin",
            "createdAt": datetime.datetime.now().isoformat()
        }
    },
    "jobs": {
        "job-react-1": {
            "id": "job-react-1",
            "title": "Senior React Developer",
            "description": "We are looking for a Senior Frontend Engineer proficient in React, Tailwind CSS, and state management libraries (Redux/Zustand) to construct high-performance futuristic user interfaces. Deployment experience with Vercel or AWS is a plus.",
            "required_skills": ["React", "JavaScript", "Tailwind CSS", "Redux", "Vite"],
            "experience_required": "3+ years",
            "deadline": "2026-06-30",
            "status": "open",
            "salary": "$110,000 - $140,000 / year",
            "created_at": datetime.datetime.now().isoformat()
        },
        "job-python-2": {
            "id": "job-python-2",
            "title": "Backend Python Developer",
            "description": "Join our backend team to scale high-throughput FastAPI microservices. The candidate must be skilled in Python, SQL/NoSQL databases, asynchronous programming, Docker, and REST API development.",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST API"],
            "experience_required": "2+ years",
            "deadline": "2026-07-15",
            "status": "open",
            "salary": "$115,000 - $145,000 / year",
            "created_at": datetime.datetime.now().isoformat()
        },
        "job-ai-3": {
            "id": "job-ai-3",
            "title": "AI Integration Engineer",
            "description": "We are seeking an AI Engineer to integrate Large Language Models (LLMs) like Gemini, Claude, and GPT-4 into client applications. Experience in prompt engineering, vector databases, and Python backend frameworks is highly required.",
            "required_skills": ["Python", "Gemini API", "LLMs", "Vector DB", "Prompt Engineering"],
            "experience_required": "1+ years",
            "deadline": "2026-06-15",
            "status": "open",
            "salary": "$130,000 - $160,000 / year",
            "created_at": datetime.datetime.now().isoformat()
        }
    },
    "applications": {},
    "admins": {
        "admin@hiringagent.com": {
            "email": "admin@hiringagent.com",
            "role": "admin"
        }
    }
}

def _read_mock_db() -> Dict[str, Any]:
    if not os.path.exists(MOCK_DB_PATH):
        _write_mock_db(DEFAULT_MOCK_DATA)
        return DEFAULT_MOCK_DATA
    try:
        with open(MOCK_DB_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_MOCK_DATA

def _write_mock_db(data: Dict[str, Any]):
    with open(MOCK_DB_PATH, "w") as f:
        json.dump(data, f, indent=2)

# ==========================================
# USERS COLLECTION SERVICES
# ==========================================

def get_user_profile(uid: str) -> Optional[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return db_data["users"].get(uid)
    else:
        doc = firebase_config.db.collection("users").document(uid).get()
        return doc.to_dict() if doc.exists else None

def create_or_update_user(uid: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
    user_data["uid"] = uid
    user_data["createdAt"] = datetime.datetime.now().isoformat()
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        db_data["users"][uid] = user_data
        # If user is in admins list, automatically set role as admin
        if user_data.get("email") in db_data["admins"]:
            db_data["users"][uid]["role"] = "admin"
        _write_mock_db(db_data)
        return db_data["users"][uid]
    else:
        # Check if email is in admins collection
        admin_doc = firebase_config.db.collection("admins").document(user_data["email"]).get()
        if admin_doc.exists:
            user_data["role"] = "admin"
        else:
            user_data["role"] = user_data.get("role", "candidate")
        firebase_config.db.collection("users").document(uid).set(user_data, merge=True)
        return user_data

# ==========================================
# JOBS COLLECTION SERVICES
# ==========================================

def get_all_jobs() -> List[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return list(db_data["jobs"].values())
    else:
        docs = firebase_config.db.collection("jobs").stream()
        return [doc.to_dict() for doc in docs]

def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return db_data["jobs"].get(job_id)
    else:
        doc = firebase_config.db.collection("jobs").document(job_id).get()
        return doc.to_dict() if doc.exists else None

def create_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())
    job_data["id"] = job_id
    job_data["created_at"] = datetime.datetime.now().isoformat()
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        db_data["jobs"][job_id] = job_data
        _write_mock_db(db_data)
        return job_data
    else:
        firebase_config.db.collection("jobs").document(job_id).set(job_data)
        return job_data

def update_job(job_id: str, job_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        if job_id not in db_data["jobs"]:
            return None
        db_data["jobs"][job_id].update(job_data)
        _write_mock_db(db_data)
        return db_data["jobs"][job_id]
    else:
        doc_ref = firebase_config.db.collection("jobs").document(job_id)
        if not doc_ref.get().exists:
            return None
        doc_ref.update(job_data)
        return doc_ref.get().to_dict()

def delete_job(job_id: str) -> bool:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        if job_id in db_data["jobs"]:
            del db_data["jobs"][job_id]
            _write_mock_db(db_data)
            return True
        return False
    else:
        doc_ref = firebase_config.db.collection("jobs").document(job_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False

# ==========================================
# APPLICATIONS COLLECTION SERVICES
# ==========================================

def get_all_applications() -> List[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return list(db_data["applications"].values())
    else:
        docs = firebase_config.db.collection("applications").stream()
        return [doc.to_dict() for doc in docs]

def get_applications_by_user(user_id: str) -> List[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return [app for app in db_data["applications"].values() if app["userId"] == user_id]
    else:
        docs = firebase_config.db.collection("applications").where("userId", "==", user_id).stream()
        return [doc.to_dict() for doc in docs]

def get_application_by_id(app_id: str) -> Optional[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return db_data["applications"].get(app_id)
    else:
        doc = firebase_config.db.collection("applications").document(app_id).get()
        return doc.to_dict() if doc.exists else None

def create_application(app_data: Dict[str, Any]) -> Dict[str, Any]:
    app_id = str(uuid.uuid4())
    app_data["id"] = app_id
    app_data["appliedAt"] = datetime.datetime.now().isoformat()
    app_data["status"] = "pending"
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        db_data["applications"][app_id] = app_data
        _write_mock_db(db_data)
        return app_data
    else:
        firebase_config.db.collection("applications").document(app_id).set(app_data)
        return app_data

def update_application_status(app_id: str, status: str) -> Optional[Dict[str, Any]]:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        if app_id not in db_data["applications"]:
            return None
        db_data["applications"][app_id]["status"] = status
        _write_mock_db(db_data)
        return db_data["applications"][app_id]
    else:
        doc_ref = firebase_config.db.collection("applications").document(app_id)
        if not doc_ref.get().exists:
            return None
        doc_ref.update({"status": status})
        return doc_ref.get().to_dict()

# ==========================================
# STORAGE SERVICES
# ==========================================

def upload_resume(file_bytes: bytes, filename: str) -> str:
    """
    Saves a resume file and returns the accessible URL.
    In Mock Mode: Saves file in local directory and returns a local relative download URL.
    In Live Mode: Uploads file to Firebase Storage bucket. Falls back to local storage if upload fails.
    """
    unique_filename = f"{uuid.uuid4()}_{filename}"
    if config.MOCK_MODE:
        file_path = os.path.join(MOCK_STORAGE_DIR, unique_filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        # Returns relative URL to the download endpoint on the FastAPI server
        return f"/api/applications/resume/download/{unique_filename}"
    else:
        try:
            if not firebase_config.bucket:
                raise ValueError("Firebase Storage bucket is not initialized.")
            blob = firebase_config.bucket.blob(f"resumes/{unique_filename}")
            blob.upload_from_string(file_bytes, content_type="application/pdf" if filename.lower().endswith(".pdf") else "application/octet-stream")
            try:
                blob.make_public()
                return blob.public_url
            except Exception as pub_err:
                print(f"[Firebase Storage Warning] Could not make blob public: {pub_err}. Trying to return public url anyway.")
                return blob.public_url
        except Exception as e:
            print(f"[Firebase Storage Error] Upload failed: {e}. Falling back to local storage.")
            # Save file locally as a fallback
            file_path = os.path.join(MOCK_STORAGE_DIR, unique_filename)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            # Returns relative URL to the download endpoint on the FastAPI server
            return f"/api/applications/resume/download/{unique_filename}"

def get_mock_resume_path(filename: str) -> str:
    return os.path.join(MOCK_STORAGE_DIR, filename)

# ==========================================
# ADMIN VERIFICATION SERVICES
# ==========================================

def verify_is_admin(email: str) -> bool:
    if config.MOCK_MODE:
        db_data = _read_mock_db()
        return email in db_data["admins"] or email == "admin@hiringagent.com"
    else:
        doc = firebase_config.db.collection("admins").document(email).get()
        return doc.exists
