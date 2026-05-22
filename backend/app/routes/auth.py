from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.services import firebase_service
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserSyncRequest(BaseModel):
    displayName: str
    email: EmailStr
    role: str = "candidate" # candidate or admin

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's profile details."""
    return current_user

@router.post("/sync")
def sync_user(request: UserSyncRequest, current_user: dict = Depends(get_current_user)):
    """
    Syncs user details from frontend Firebase Authentication into the Firestore database.
    This ensures we have a corresponding profile document.
    """
    uid = current_user.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. UID missing."
        )
        
    user_data = {
        "uid": uid,
        "email": request.email,
        "displayName": request.displayName,
        "role": request.role
    }
    
    # Save/Update in DB (handles role upgrades if email is in admins database)
    updated_user = firebase_service.create_or_update_user(uid, user_data)
    return updated_user
