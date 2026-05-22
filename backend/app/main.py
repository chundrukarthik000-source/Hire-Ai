from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, jobs, applications, admin
from app import config

app = FastAPI(
    title="AI Hiring Agent API",
    description="Backend API for candidate resume parsing, Firestore management, and Gemini AI analysis",
    version="1.0.0"
)

# CORS Configuration
# Allows React frontend (default: http://localhost:5173) to communicate with API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                          # Local Vite dev server
        "http://localhost:4173",                          # Local Vite preview
        "https://hiring-agent-p7-2026.web.app",          # Firebase Hosting primary
        "https://hiring-agent-p7-2026.firebaseapp.com",  # Firebase Hosting alt domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Hiring Agent Backend API is active",
        "mock_mode": config.MOCK_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
