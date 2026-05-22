from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import JobCreate, JobResponse
from app.middleware.auth import require_admin, get_current_user
from app.services import firebase_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobResponse])
def get_jobs():
    """Get all job listings. Available to both candidates and admins."""
    return firebase_service.get_all_jobs()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    """Get details of a specific job role."""
    job = firebase_service.get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    return job

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def add_job(job_data: JobCreate, current_user: dict = Depends(require_admin)):
    """Create a new job posting. Admin privilege required."""
    created_job = firebase_service.create_job(job_data.model_dump())
    return created_job

@router.put("/{job_id}", response_model=JobResponse)
def edit_job(job_id: str, job_data: JobCreate, current_user: dict = Depends(require_admin)):
    """Edit an existing job posting. Admin privilege required."""
    updated_job = firebase_service.update_job(job_id, job_data.model_dump())
    if not updated_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found or update failed"
        )
    return updated_job

@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
def remove_job(job_id: str, current_user: dict = Depends(require_admin)):
    """Delete a job listing. Admin privilege required."""
    success = firebase_service.delete_job(job_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found"
        )
    return {"message": "Job deleted successfully"}
