from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100, example="Frontend Engineer")
    description: str = Field(..., min_length=10, example="React & Tailwind developer...")
    required_skills: List[str] = Field(..., example=["React", "Tailwind CSS", "JavaScript"])
    experience_required: str = Field(..., example="2+ years")
    deadline: str = Field(..., example="2026-06-30")
    status: str = Field("open", example="open") # open or closed
    salary: Optional[str] = Field("Not Specified", example="$120,000 - $150,000")

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    created_at: str

class ApplicationCreate(BaseModel):
    job_id: str = Field(...)
    name: str = Field(..., min_length=2)
    email: EmailStr = Field(...)
    phone: str = Field(...)
    college: str = Field(...)
    experience: str = Field(..., example="1 year internship at Google")
    skills: List[str] = Field(..., example=["React", "NodeJS"])

class AIAnalysisSchema(BaseModel):
    resume_score: int = Field(..., ge=0, le=100)
    skills_match: int = Field(..., ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    reasoning: str = Field(...)

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: str
    user_id: str
    candidate_name: str
    candidate_email: EmailStr
    candidate_phone: str
    college: str
    experience: str
    skills: List[str]
    resume_url: str
    status: str # pending, shortlisted, rejected
    ai_analysis: Optional[AIAnalysisSchema] = None
    applied_at: str

class StatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(pending|shortlisted|rejected)$")
