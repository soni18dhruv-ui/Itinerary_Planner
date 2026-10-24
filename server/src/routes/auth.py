import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from passlib.context import CryptContext
from jose import jwt, JWTError

from ..database import SessionLocal
from ..models.db_models import DBProfile
from ..models.schemas import SignUpRequest, LoginRequest, AuthResponse, ProfileResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "daytrail-travel-secret-jwt-key"
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def profile_to_response(prof: DBProfile) -> ProfileResponse:
    interests = prof.interests if isinstance(prof.interests, list) else []
    return ProfileResponse(
        id=prof.id,
        email=prof.email,
        full_name=prof.full_name,
        home_city=prof.home_city,
        travel_style=prof.travel_style or "mixed",
        budget_level=prof.budget_level or "moderate",
        interests=interests,
        dietary_notes=prof.dietary_notes,
        created_at=prof.created_at.isoformat() if isinstance(prof.created_at, datetime) else str(prof.created_at),
        updated_at=prof.updated_at.isoformat() if isinstance(prof.updated_at, datetime) else str(prof.updated_at),
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignUpRequest):
    """
    Registers a new user account with email, password, and full name.
    """
    db = SessionLocal()
    try:
        clean_email = req.email.strip().lower()
        if not clean_email or "@" not in clean_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid email address.",
            )

        if len(req.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long.",
            )

        existing = db.query(DBProfile).filter(DBProfile.email == clean_email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please sign in instead.",
            )

        user_id = str(uuid.uuid4())
        hashed = pwd_context.hash(req.password)

        new_profile = DBProfile(
            id=user_id,
            email=clean_email,
            password_hash=hashed,
            full_name=req.full_name.strip() or "Traveler",
            home_city="San Francisco",
            travel_style="culture",
            budget_level="moderate",
            interests=["history", "photography", "markets", "coffee"],
            dietary_notes=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_profile)

        token = create_access_token({"sub": user_id, "email": clean_email})
        user_info = {
            "id": user_id,
            "email": clean_email,
            "full_name": new_profile.full_name,
        }
        return AuthResponse(
            token=token,
            user=user_info,
            profile=profile_to_response(new_profile),
        )
    finally:
        db.close()


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    """
    Authenticates user with email and password.
    """
    db = SessionLocal()
    try:
        clean_email = req.email.strip().lower()
        user = db.query(DBProfile).filter(DBProfile.email == clean_email).first()

        # Fallback check for demo account if user typed username or email
        if not user and clean_email in ["alex", "alex@daytrail.app", "demo"]:
            user = db.query(DBProfile).filter(DBProfile.id == "demo-user").first()
        if not user and clean_email in ["guest", "guest@daytrail.app"]:
            user = db.query(DBProfile).filter(DBProfile.id == "guest-traveler").first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again.",
            )

        # If user has no password_hash yet, allow initial login with password123 and set hash
        valid = False
        if user.password_hash:
            valid = pwd_context.verify(req.password, user.password_hash)
        elif req.password == "password123":
            user.password_hash = pwd_context.hash(req.password)
            db.commit()
            valid = True

        if not valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again.",
            )

        token = create_access_token({"sub": user.id, "email": user.email or clean_email})
        user_info = {
            "id": user.id,
            "email": user.email or clean_email,
            "full_name": user.full_name or "Traveler",
        }
        return AuthResponse(
            token=token,
            user=user_info,
            profile=profile_to_response(user),
        )
    finally:
        db.close()


@router.get("/me", response_model=AuthResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Returns the currently authenticated user from JWT token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    db = SessionLocal()
    try:
        user = db.query(DBProfile).filter(DBProfile.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user_info = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        }
        return AuthResponse(
            token=token,
            user=user_info,
            profile=profile_to_response(user),
        )
    finally:
        db.close()
