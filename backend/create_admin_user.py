import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv

# Load backend env
load_dotenv()

credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "service-account.json")
if not os.path.exists(credentials_path):
    print(f"Error: Credentials path '{credentials_path}' does not exist.")
    exit(1)

print(f"Initializing Firebase with credentials from {credentials_path}...")
cred = credentials.Certificate(credentials_path)
firebase_admin.initialize_app(cred)

email = "admin@hiringagent.com"
password = "admin123"

try:
    print(f"Creating user {email} in live Firebase Auth...")
    user = auth.create_user(
        email=email,
        password=password,
        display_name="ch karthik"
    )
    print(f"Successfully created admin user in Firebase Auth! UID: {user.uid}")
except Exception as e:
    if "EMAIL_EXISTS" in str(e) or "already exists" in str(e).lower():
        print(f"Admin user {email} already exists in Firebase Auth.")
    else:
        print(f"Error creating user: {e}")
