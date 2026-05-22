import os
import json
from dotenv import load_dotenv

# Load env variables from .env (local development only)
load_dotenv()

# Firebase Config — support both file path (local) and JSON string (Cloud Run)
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
FIREBASE_CREDENTIALS_JSON = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")  # Used in Cloud Run
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET")
FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")

# Gemini API Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Mock Mode Configuration
# If Firebase credentials or Gemini API key are missing, we default to Mock Mode for easy testing
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() in ("true", "1", "yes")

# Check if credentials are available (either file or JSON string)
_has_credentials = (
    (FIREBASE_CREDENTIALS_PATH and os.path.exists(FIREBASE_CREDENTIALS_PATH))
    or FIREBASE_CREDENTIALS_JSON
)

if not _has_credentials:
    # If no Firebase credentials available, force Mock Mode
    MOCK_MODE = True

PORT = int(os.getenv("PORT", "8080"))
HOST = os.getenv("HOST", "0.0.0.0")

print(f"--- Configuration loaded ---")
print(f"Mock Mode Active: {MOCK_MODE}")
if MOCK_MODE:
    print("Running in self-contained simulation mode. Firestore, Storage, Auth, and AI will be mocked.")
else:
    cred_source = "JSON env var" if FIREBASE_CREDENTIALS_JSON else f"file: {FIREBASE_CREDENTIALS_PATH}"
    print(f"Running in live cloud mode connected to Firebase and Gemini. Credentials from: {cred_source}")
print(f"----------------------------")
