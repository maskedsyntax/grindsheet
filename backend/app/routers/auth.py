import os
import re
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import LoginAttempt, PasswordChangeAttempt, User
from app.schemas import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenData,
    UserCreate,
    Token,
    UserResponse,
)
from app.utils.email import send_email
from app.utils.security import (
    generate_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db

# Configure logging at the top of auth.py
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])

# Configuration for reset token expiration
RESET_TOKEN_EXPIRE_MINUTES = 10080


def validate_password(password: str, username: str, full_name: str) -> None:
    """Validate password meets complexity requirements."""
    if len(password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter.",
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter.",
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=400, detail="Password must contain at least one number."
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character.",
        )
    if (
            username.lower() in password.lower()
            or full_name.lower().replace(" ", "") in password.lower()
    ):
        raise HTTPException(
            status_code=400, detail="Password must not contain username or full name."
        )


@router.post("/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    db_user_by_username = db.query(User).filter(User.username == user.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    db_user_by_email = db.query(User).filter(User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Validate password
    validate_password(user.password, user.username, user.full_name)

    # Hash password and create user
    hashed_password = hash_password(user.password)
    db_user = User(
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        leetcode_username=user.leetcode_username,
        gfg_username=user.gfg_username,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate JWT token
    access_token = generate_access_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login")
async def login(
        form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # Check login attempt rate limit
    current_time = datetime.utcnow()
    fifteen_minutes_ago = current_time - timedelta(minutes=15)
    attempts = (
        db.query(LoginAttempt)
        .filter(LoginAttempt.username == form_data.username)
        .filter(LoginAttempt.attempt_time >= fifteen_minutes_ago)
        .filter(LoginAttempt.success == False)
        .count()
    )
    if attempts >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Try again after 15 minutes.",
        )

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        attempt = LoginAttempt(username=form_data.username, success=False)
        db.add(attempt)
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Successful login
    attempt = LoginAttempt(username=form_data.username, success=True)
    db.add(attempt)
    db.commit()

    # Generate JWT Token
    access_token = generate_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/forgot-password")
async def forgot_password(
        request: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    email = request.email.lower()

    # Check if email exists in the database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found. Please check your email address or register.",
        )

    # Check email send rate limit (max 2 per day)
    current_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    attempts = (
        db.query(PasswordChangeAttempt)
        .filter(PasswordChangeAttempt.user_id == user.id)
        .filter(PasswordChangeAttempt.attempt_time >= current_day)
        .count()
    )
    if attempts >= 2:
        raise HTTPException(
            status_code=429,
            detail="Password reset email limit exceeded (max 2 per day). Try again tomorrow.",
        )

    # Generate a reset token with a short expiration
    reset_token = generate_access_token(
        data={"sub": user.email, "scope": "password_reset"},
        expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )

    # Use environment variable for frontend URL
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    print(f"Password reset link for {email}: {reset_link}")

    # Log the attempt (even if email isn't sent, to track limit)
    attempt = PasswordChangeAttempt(user_id=user.id)
    db.add(attempt)
    db.commit()

    try:
        email_content = f"""
        <html>
        <body>
            <p>Hi {user.full_name},</p>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <p><a href="{reset_link}">Reset Your Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,</p>
            <p>The GrindSheet Team</p>
        </body>
        </html>
        """

        # Send the email using SendGrid
        send_email(
            to_emails=[email], subject="Password Reset Request", content=email_content
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email. Please try again later.",
        )

    return {"message": "A password reset link has been sent to your email."}


@router.get("/total-users")
async def get_total_users(db: Session = Depends(get_db)):
    # Query all users and their details
    users = db.query(User).all()
    total_users = len(users)

    # Prepare user details for response
    user_details = [
        {
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "leetcode_username": user.leetcode_username,
            "gfg_username": user.gfg_username,
            "created_at": user.created_at.isoformat()
        } for user in users
    ]

    logger.info(f"Total registered users: {total_users}")
    return {
        "total_users": total_users,
        "users": user_details
    }


@router.post("/send-update")
async def send_update(subject: str, message: str, db: Session = Depends(get_db)):
    """
    Send an update email to all users.

    Args:
        subject (str): Email subject
        message (str): Update message (plain text)

    Returns:
        dict: Confirmation message
    """
    # Fetch all users' emails
    users = db.query(User).all()
    if not users:
        raise HTTPException(
            status_code=404, detail="No users found to send updates to."
        )

    to_emails = [user.email.lower() for user in users]

    # Create the email content with an unsubscribe link
    email_content = f"""
    <html>
    <body>
        <p>Hi there,</p>
        <p>{message}</p>
        <p>Thanks,</p>
        <p>The GrindSheet Team</p>
    </body>
    </html>
    """

    # Replace {{email}} placeholder for each user (SendGrid doesn't support per-recipient substitution here)
    for email in to_emails:
        personalized_content = email_content.replace("{{email}}", email)
        try:
            send_email(to_emails=[email], subject=subject, content=personalized_content)
        except Exception as e:
            print(f"Failed to send update to {email}: {e}")
            continue

    return {"message": "Update emails sent to users."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    token = request.token
    new_password = request.new_password

    # Validate the token
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")  # type: ignore
        scope: str = payload.get("scope")  # type: ignore
        if email is None or scope != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Find the user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    validate_password(new_password, user.username, user.full_name)

    current_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    attempts = (
        db.query(PasswordChangeAttempt)
        .filter(PasswordChangeAttempt.user_id == user.id)
        .filter(PasswordChangeAttempt.attempt_time >= current_day)
        .count()
    )
    if attempts >= 2:
        raise HTTPException(
            status_code=429,
            detail="Password change limit exceeded (max 3 per day). Try again tomorrow.",
        )

    # Update the user's password
    user.hashed_password = hash_password(new_password)
    attempt = PasswordChangeAttempt(user_id=user.id)
    db.add(attempt)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_details(
        token_data: TokenData = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    """Fetch the current logged-in user's details."""
    user = db.query(User).filter(User.username == token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
