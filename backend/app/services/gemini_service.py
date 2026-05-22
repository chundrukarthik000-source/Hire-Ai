import json
import re
import random
from typing import Dict, Any
from app import config

# Import google.generativeai if not in mock mode or if available
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

def get_mock_analysis(resume_text: str, job_details: Dict[str, Any], candidate_skills: list) -> Dict[str, Any]:
    """Generates a realistic mock AI evaluation for local testing/fallback."""
    job_skills = [s.lower() for s in job_details.get("required_skills", [])]
    cand_skills = [s.lower() for s in candidate_skills]
    resume_text_lower = resume_text.lower()
    
    # 1. Skills Match (50 points)
    matched_skills = []
    for skill in job_skills:
        if skill in cand_skills or skill in resume_text_lower:
            matched_skills.append(skill)
            
    skills_match_pct = int((len(matched_skills) / max(len(job_skills), 1)) * 100)
    skills_score = int(skills_match_pct * 0.5)
    
    # 2. Projects (20 points)
    project_keywords = ["project", "developed", "built", "created", "designed", "portfolio"]
    project_score = 10
    for kw in project_keywords:
        if kw in resume_text_lower:
            project_score += 2
    project_score = min(project_score, 20)
    
    # 3. Experience (20 points)
    exp_keywords = ["experience", "year", "intern", "worked", "developer", "engineer"]
    exp_score = 10
    for kw in exp_keywords:
        if kw in resume_text_lower:
            exp_score += 2
    exp_score = min(exp_score, 20)
    
    # 4. Education (10 points)
    edu_keywords = ["university", "college", "btech", "degree", "bs", "mca", "bachelor", "master"]
    edu_score = 5
    for kw in edu_keywords:
        if kw in resume_text_lower:
            edu_score += 1
    edu_score = min(edu_score, 10)
    
    final_score = skills_score + project_score + exp_score + edu_score
    # Clamp final score
    final_score = max(min(final_score, 98), 40)
    
    # Strengths and Weaknesses simulation
    strengths = []
    weaknesses = []
    
    # Analyze skills to generate strengths/weaknesses
    if len(matched_skills) >= 2:
        strengths.append(f"Demonstrated proficiency in core skills: {', '.join(matched_skills[:3])}")
    else:
        weaknesses.append("Resume lacks mention of key required skills listed in the job description")
        
    if "project" in resume_text_lower:
        strengths.append("Contains project descriptions outlining developer responsibilities")
    else:
        weaknesses.append("Lacks detailed project descriptions showing applied knowledge")
        
    if "experience" in resume_text_lower or "intern" in resume_text_lower:
        strengths.append("Has relevant practical experience in software development roles")
    else:
        weaknesses.append("Limited commercial or industrial experience listed")
        
    if not strengths:
        strengths = ["Structured resume layout", "Technical education background"]
    if not weaknesses:
        weaknesses = ["Could include more quantifiable project metrics", "Missing deployment or cloud service highlights"]
        
    return {
        "resumeScore": final_score,
        "skillsMatch": skills_match_pct,
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
        "reasoning": f"Simulated evaluation: Matched {len(matched_skills)}/{len(job_skills)} required skills. Skills score: {skills_score}/50, Projects: {project_score}/20, Experience: {exp_score}/20, Education: {edu_score}/10."
    }

def analyze_resume_with_gemini(resume_text: str, job_details: Dict[str, Any], candidate_skills: list) -> Dict[str, Any]:
    """
    Analyzes resume text against job details using Gemini API.
    Falls back to mock analysis if credentials are not configured or request fails.
    """
    if config.MOCK_MODE or not GENAI_AVAILABLE or not config.GEMINI_API_KEY:
        print("[Gemini Service] Running in Mock Mode / Fallback Mode.")
        return get_mock_analysis(resume_text, job_details, candidate_skills)
        
    try:
        # Configure API key
        genai.configure(api_key=config.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        job_skills_str = ", ".join(job_details.get("required_skills", []))
        candidate_skills_str = ", ".join(candidate_skills)
        
        prompt = f"""
You are an expert AI Recruiting Assistant. Evaluate the candidate's resume text against the selected job details and calculate a match score.

Job Details:
- Title: {job_details.get('title')}
- Description: {job_details.get('description')}
- Required Skills: {job_skills_str}
- Experience Required: {job_details.get('experience_required')}

Candidate Filled Skills: {candidate_skills_str}

Candidate Resume Text:
---
{resume_text}
---

CRITICAL SCORING BREAKDOWN (Total 100 points):
1. Skills Match (50% weight): Compare candidate skills and resume text against the required job skills. Max 50 points.
2. Project Relevance (20% weight): Compare projects mentioned in the resume with job requirements. Max 20 points.
3. Experience (20% weight): Match candidate experience level against job description. Max 20 points.
4. Education (10% weight): Evaluate candidate educational background (college, degree). Max 10 points.

Calculate the sub-scores and sum them up to get the Final resumeScore (0-100).
Calculate the skillsMatch score (0-100) specifically based on the skills overlaps and gaps.

Return ONLY a JSON object with this exact structure (do not return markdown other than the JSON block itself):
{{
  "resumeScore": <integer, sum of breakdown scores: skills_score + projects_score + experience_score + education_score>,
  "skillsMatch": <integer, percentage of required skills matched, 0-100>,
  "strengths": [<list of 2-3 key strengths>],
  "weaknesses": [<list of 2-3 key weaknesses or areas of improvement>],
  "reasoning": "<brief explanation of the scoring breakdown and overall evaluation>"
}}
"""
        
        # We request application/json type output
        generation_config = {"response_mime_type": "application/json"}
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        text = response.text.strip()
        # Parse JSON
        result = json.loads(text)
        
        # Verify required keys exist
        required_keys = ["resumeScore", "skillsMatch", "strengths", "weaknesses", "reasoning"]
        for key in required_keys:
            if key not in result:
                raise ValueError(f"Missing key in AI response: {key}")
                
        return result
        
    except Exception as e:
        print(f"[Gemini Service Error] {str(e)}. Falling back to mock analysis.")
        return get_mock_analysis(resume_text, job_details, candidate_skills)
