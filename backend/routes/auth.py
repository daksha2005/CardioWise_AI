from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, User
import hashlib
from datetime import datetime

router = APIRouter()

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: str
    created_at: datetime

def create_access_token(data: dict):
    """Simple token creation for demo"""
    return f"token_{hashlib.md5(str(data).encode()).hexdigest()}"

def verify_token(token: str):
    """Simple token verification for demo"""
    return token.startswith("token_")

def get_current_user_simple(token: str = None):
    """Demo user authentication - in production use JWT"""
    if token and verify_token(token):
        # For demo, return user with id=1
        return User(id=1, email="demo@cardioai.com", username="demo", 
                   hashed_password="", full_name="Demo User", role="user", 
                   is_active=True, created_at=datetime.utcnow())
    return None

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    # Hash password for comparison
    hashed_password = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    # Find user in database
    user = db.query(User).filter(
        User.email == user_data.email,
        User.hashed_password == hashed_password
    ).first()
    
    if not user:
        # Create demo user if not exists
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user:
            user = User(
                email=user_data.email,
                username=user_data.email.split("@")[0],
                hashed_password=hashed_password,
                full_name="Demo User",
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
    # Create access token
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """User registration endpoint"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email or username already registered"
        )
    
    # Hash password
    hashed_password = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    # Create new user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role="user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    token = create_access_token({"user_id": new_user.id, "email": new_user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

@router.post("/logout")
def logout():
    """User logout endpoint"""
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user_simple)):
    """Get current user information"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
