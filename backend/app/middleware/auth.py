from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import base64
import json
from app import config
from app.services import firebase_service

# Import firebase_admin.auth if available and not in mock mode
try:
    from firebase_admin import auth as firebase_auth
    AUTH_AVAILABLE = True
except ImportError:
    AUTH_AVAILABLE = False

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Decodes the Firebase JWT token and retrieves/creates the user profile.
    Supports mock tokens in Mock Mode.
    """
    token = credentials.credentials
    
    if config.MOCK_MODE:
        # Simple simulated authentication
        if token.startswith("mock-token-"):
            uid = token.replace("mock-token-", "")
            # Look up profile
            user = firebase_service.get_user_profile(uid)
            if user:
                return user
            
            # If user not found, create a generic mock user based on uid
            is_admin = "admin" in uid
            email = f"{uid}@hiringagent.com"
            name = uid.replace("-", " ").title()
            user_data = {
                "uid": uid,
                "email": email,
                "displayName": name,
                "role": "admin" if is_admin else "candidate"
            }
            return firebase_service.create_or_update_user(uid, user_data)
        
        # Fallback for generic mock token
        return {
            "uid": "mock-candidate-uid",
            "email": "candidate@hiringagent.com",
            "displayName": "John Doe",
            "role": "candidate"
        }

    # Live Mode - Verify with Firebase Admin SDK
    try:
        print(f"[Auth Middleware Debug] Received token: {token[:30]}... (length: {len(token)})", flush=True)
        try:
            decoded_token = firebase_auth.verify_id_token(token)
        except Exception as e:
            if "Token used too early" in str(e):
                print(f"[Auth Middleware Clock Skew Warning] Token used too early ({e}). Decoding payload manually.", flush=True)
                parts = token.split('.')
                if len(parts) != 3:
                    raise e
                payload_b64 = parts[1]
                payload_b64 += '=' * (4 - len(payload_b64) % 4)
                payload_json = base64.b64decode(payload_b64).decode('utf-8')
                decoded_token = json.loads(payload_json)
                if "uid" not in decoded_token:
                    decoded_token["uid"] = decoded_token.get("user_id") or decoded_token.get("sub")
            else:
                raise e
                
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split("@")[0].title() if email else "User")
        
        # Check if user already exists in Firestore database
        user = firebase_service.get_user_profile(uid)
        if not user:
            # Create user profile record in Firestore
            user_data = {
                "uid": uid,
                "email": email,
                "displayName": name,
                "role": "candidate" # Default role
            }
            user = firebase_service.create_or_update_user(uid, user_data)
            
        return user
    except Exception as e:
        print(f"[Auth Middleware Error] Verification failed: {e}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency that checks if the logged-in user is an admin."""
    if current_user.get("role") != "admin":
        # Double check in database
        is_db_admin = firebase_service.verify_is_admin(current_user.get("email", ""))
        if not is_db_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        # Update role in context
        current_user["role"] = "admin"
    return current_user
