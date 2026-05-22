import os
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.responses import FileResponse
from typing import List
from app.middleware.auth import get_current_user, require_admin
from app.services import firebase_service, gemini_service
from app.utils import resume_parser
from app.models.schemas import StatusUpdateRequest

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    college: str = Form(...),
    experience: str = Form(...),
    skills: str = Form(...), # comma-separated
    resume: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Submits a new job application.
    Uploads resume, parses text, requests AI comparison matching from Gemini,
    and stores details in Firestore.
    """
    # 1. Fetch Job details
    job_details = firebase_service.get_job_by_id(job_id)
    if not job_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
        
    # 2. Read resume file
    try:
        file_bytes = await resume.read()
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read resume file: {str(e)}"
        )
        
    # 3. Parse skills
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    # 4. Extract text from resume
    try:
        resume_text = resume_parser.extract_text(file_bytes, resume.filename)
    except Exception as e:
        # If parsing fails entirely, use a fallback message or raise error
        print(f"[Parser Error] Failed to parse resume: {e}")
        resume_text = f"Resume Content of {name}. Failed to extract full text."
        
    # 5. Get AI review analysis from Gemini
    ai_analysis = gemini_service.analyze_resume_with_gemini(
        resume_text=resume_text,
        job_details=job_details,
        candidate_skills=skills_list
    )
    
    # 6. Upload file to Firebase storage / Mock storage
    try:
        resume_url = firebase_service.upload_resume(file_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save resume attachment: {str(e)}"
        )
        
    # 7. Structure application document
    app_data = {
        "jobId": job_id,
        "jobTitle": job_details.get("title", ""),
        "userId": current_user["uid"],
        "candidateName": name,
        "candidateEmail": email,
        "candidatePhone": phone,
        "college": college,
        "experience": experience,
        "skills": skills_list,
        "resumeUrl": resume_url,
        "status": "pending",
        "aiAnalysis": {
            "resumeScore": ai_analysis.get("resumeScore", 50),
            "skillsMatch": ai_analysis.get("skillsMatch", 50),
            "strengths": ai_analysis.get("strengths", []),
            "weaknesses": ai_analysis.get("weaknesses", []),
            "reasoning": ai_analysis.get("reasoning", "No description provided.")
        }
    }
    
    # 8. Save application document in Firestore
    created_app = firebase_service.create_application(app_data)
    return created_app

@router.get("/my")
def get_my_applications(current_user: dict = Depends(get_current_user)):
    """Retrieve all applications submitted by the current candidate."""
    return firebase_service.get_applications_by_user(current_user["uid"])

@router.get("/resume/download/{filename}")
def download_mock_resume(filename: str):
    """
    Serves resume files locally. Only used in Mock Mode.
    Provides PDF/document files for browser previews.
    """
    file_path = firebase_service.get_mock_resume_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found"
        )
    # Set headers so it can render in-browser if it is a PDF
    media_type = "application/pdf" if filename.lower().endswith(".pdf") else "application/octet-stream"
    return FileResponse(file_path, media_type=media_type, filename=filename, content_disposition_type="inline")

@router.get("/{app_id}")
def get_application_details(app_id: str, current_user: dict = Depends(get_current_user)):
    """Gets details for a specific application. Restricted to candidate owner or admin."""
    app = firebase_service.get_application_by_id(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    
    # Restrict read to owner or admin
    if current_user.get("role") != "admin" and app["userId"] != current_user["uid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not own this application."
        )
    return app

@router.put("/{app_id}/status")
def update_app_status(app_id: str, request: StatusUpdateRequest, current_user: dict = Depends(require_admin)):
    """Update status of a candidate application. Admin privilege required."""
    updated_app = firebase_service.update_application_status(app_id, request.status)
    if not updated_app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {app_id} not found"
        )
    return updated_app
