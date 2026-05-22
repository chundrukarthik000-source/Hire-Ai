import firebase_admin
from firebase_admin import credentials, firestore
import os

os.chdir(r"c:\Users\chund\Project7\backend")

# Initialize Firebase Admin
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Default salaries mapping
SALARIES = {
    "job-react-1": "$110,000 - $140,000 / year",
    "job-python-2": "$115,000 - $145,000 / year",
    "job-ai-3": "$130,000 - $160,000 / year",
}

print("Running Firestore database migration for jobs...")
jobs_ref = db.collection("jobs")
docs = list(jobs_ref.stream())

updated_count = 0
for doc in docs:
    job_data = doc.to_dict()
    job_id = doc.id
    
    # Choose default salary
    if "salary" not in job_data or not job_data["salary"] or job_data["salary"] == "Not Specified":
        default_salary = SALARIES.get(job_id, "$120,000 - $150,000 / year")
        jobs_ref.document(job_id).update({"salary": default_salary})
        print(f"Updated job {job_id} ({job_data.get('title')}) with salary: {default_salary}")
        updated_count += 1

print(f"Migration completed. Updated {updated_count} jobs.")
