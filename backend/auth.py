import os


from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from db import get_db
import models

# Load .env
load_dotenv()

FIREBASE_CRED_FILE = os.getenv("FIREBASE_CREDENTIALS_FILE")
if not FIREBASE_CRED_FILE:
    raise ValueError("FIREBASE_CREDENTIALS_FILE is not set in .env")

# Initialize Firebase Admin only once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_FILE)
    firebase_admin.initialize_app(cred)

# Extract "Bearer <token>" from Authorization header
bearer_scheme = HTTPBearer()


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> models.User:
    """
    - Reads the Firebase ID token from the Authorization header
    - Verifies it with Firebase
    - Finds or creates a local User in PostgreSQL
    - Returns the User row
    """
    token = credentials.credentials  # the JWT string

    try:
        decoded = firebase_auth.verify_id_token(token)
        uid: str = decoded["uid"]
        email: str | None = decoded.get("email")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token",
        ) from e

    # Look for this user in our DB
    user = db.query(models.User).filter(models.User.firebase_uid == uid).first()

    # If not found, create it
    if not user:
        user = models.User(
            firebase_uid=uid,
            email=email or "unknown@example.com",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
