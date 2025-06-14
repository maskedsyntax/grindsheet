from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import User
from app.schemas import ForgotPasswordRequest, ResetPasswordRequest, UserCreate, Token
from app.utils.email import send_email
from app.utils.security import generate_access_token, hash_password, verify_password
from app.database import get_db

router = APIRouter(tags=["Authentication"])

# Configuration for reset token expiration
RESET_TOKEN_EXPIRE_MINUTES = 30


@router.post("/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
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
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

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
    print(email)

    # Check if email exists in the database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found. Please check your email address or register.",
        )

    # Generate a reset token with a short expiration
    reset_token = generate_access_token(
        data={"sub": user.email, "scope": "password_reset"},
        expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )

    # Mock sending an email (replace with actual email sending logic)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    print(f"Password reset link for {email}: {reset_link}")
    # In a real application, use a service like SendGrid to send the email
    # Example:
    # send_email(email, "Password Reset Request", f"Click here to reset your password: {reset_link}")

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
    print("Check1")
    try:
        send_email(
            to_emails=[email], subject="Password Reset Request", content=email_content
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email. Please try again later.",
        )

    return {"message": "A password reset link has been sent to your email."}


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

    # Update the user's password
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}
