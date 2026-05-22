from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.middleware.auth import require_admin
from app.services import firebase_service

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard")
def get_admin_dashboard(current_user: dict = Depends(require_admin)):
    """
    Returns summary statistics for the admin dashboard:
    Total applicants, total job postings, shortlisted candidates, and recent applications.
    """
    apps = firebase_service.get_all_applications()
    jobs = firebase_service.get_all_jobs()
    
    total_applicants = len(apps)
    total_jobs = len(jobs)
    
    shortlisted = len([a for a in apps if a.get("status") == "shortlisted"])
    
    # Sort applications by appliedAt descending
    sorted_apps = sorted(apps, key=lambda x: x.get("appliedAt", ""), reverse=True)
    recent_apps = sorted_apps[:5]
    
    # Format response
    return {
        "totalApplicants": total_applicants,
        "totalJobs": total_jobs,
        "shortlistedCandidates": shortlisted,
        "recentApplications": recent_apps
    }

@router.get("/candidates")
def get_candidates(
    job_id: Optional[str] = Query(None, description="Filter by Job ID"),
    min_score: Optional[int] = Query(None, description="Filter by minimum AI score"),
    skill: Optional[str] = Query(None, description="Filter by skill keyword"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    current_user: dict = Depends(require_admin)
):
    """
    Gets all candidates/applications with advanced filtering and AI score ranking.
    """
    apps = firebase_service.get_all_applications()
    
    filtered_apps = []
    for app in apps:
        # Filter by job role
        if job_id and app.get("jobId") != job_id:
            continue
            
        # Filter by status
        if status and app.get("status") != status:
            continue
            
        # Filter by minimum score
        app_ai = app.get("aiAnalysis", {})
        score = app_ai.get("resumeScore", 0)
        if min_score is not None and score < min_score:
            continue
            
        # Filter by skill (case-insensitive check on skills list or candidate skills input)
        if skill:
            skill_lower = skill.lower()
            app_skills = [s.lower() for s in app.get("skills", [])]
            if not any(skill_lower in s for s in app_skills):
                continue
                
        filtered_apps.append(app)
        
    # Sort candidates by AI resume score descending (Candidate Ranking)
    ranked_apps = sorted(filtered_apps, key=lambda x: x.get("aiAnalysis", {}).get("resumeScore", 0), reverse=True)
    
    return ranked_apps
