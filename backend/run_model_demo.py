import sys
import os
from app.services.gemini_service import analyze_resume_with_gemini

def main():
    print("=== AURA AI Model Evaluator (Standalone Demo) ===")
    
    # 1. Define sample Job Details
    job_details = {
        "title": "Senior React Developer",
        "description": "Looking for a Frontend Engineer with React, Tailwind CSS, and Vite experience.",
        "required_skills": ["React", "JavaScript", "Tailwind CSS", "Vite", "Redux"],
        "experience_required": "3+ years"
    }
    
    # 2. Define sample Candidate Resume Text
    resume_text = """
    JOHN DOE
    Frontend Specialist
    Email: john.doe@email.com | Phone: +1 555-019-2834
    
    SUMMARY:
    Highly motivated frontend developer with 4 years of experience building responsive web applications.
    Specialist in modern React ecosystems, state management, and aesthetic interface design.
    
    SKILLS:
    - Frontend: React, JavaScript, HTML5, CSS3, Tailwind CSS, Vite, Redux Toolkit
    - Backend: Node.js, Express (basic)
    - Tools: Git, Webpack, Docker
    
    EXPERIENCE:
    Senior Frontend Developer | TechLogix Corp (2024 - Present)
    - Developed and launched 5+ production web apps using React and Tailwind CSS.
    - Improved frontend build performance by 40% by migrating projects from Webpack to Vite.
    - Mentored junior engineers and led code reviews.
    
    PROJECTS:
    - Dashboard Alpha: A futuristic analytics dashboard with rich data charts built using Tailwind CSS.
    
    EDUCATION:
    B.S. in Computer Science | State University
    """
    
    candidate_skills = ["React", "JavaScript", "Tailwind CSS", "Vite", "Redux"]
    
    print("\n--- JOB VACANCY DETAILS ---")
    print(f"Role: {job_details['title']}")
    print(f"Required Skills: {', '.join(job_details['required_skills'])}")
    
    print("\n--- CANDIDATE RESUME PROFILE ---")
    print("Name: John Doe")
    print(f"Skills Filled: {', '.join(candidate_skills)}")
    
    print("\nRunning AI Matcher Model...")
    
    # Run the analysis model
    result = analyze_resume_with_gemini(
        resume_text=resume_text,
        job_details=job_details,
        candidate_skills=candidate_skills
    )
    
    print("\n--- MODEL ANALYSIS RESULTS ---")
    print(f"Overall Match Score  : {result.get('resumeScore')}%")
    print(f"Skill Alignment Score: {result.get('skillsMatch')}%")
    
    print("\nKey Strengths:")
    for strength in result.get("strengths", []):
        print(f"  - [OK] {strength}")
        
    print("\nAreas for Growth:")
    for weakness in result.get("weaknesses", []):
        print(f"  - [ALERT] {weakness}")
        
    print("\nEvaluation Reasoning:")
    print(result.get("reasoning"))
    print("===============================================")

if __name__ == "__main__":
    # Ensure backend folder is in PYTHONPATH
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    main()
