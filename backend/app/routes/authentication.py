from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from app.models import User, EmailVerification, Profile
from ..schemas import UserCreate, UserPublic, EmailVerificationCreate
from app.deps import SessionDep
from pydantic import UUID7
from sqlmodel import select
from datetime import datetime, timedelta, timezone
from ..helpers.db import refresh_all, save_instance
from ..helpers.authentication import generate_code
import os
from pwdlib import PasswordHash

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

password_hasher = PasswordHash.recommended()


@auth_router.post(
    "/sign-up", status_code=status.HTTP_201_CREATED, response_model=UserPublic
)
def create_user(user: UserCreate, session: SessionDep):
    # create user
    user_db = User.model_validate(user)
    hashed_password = password_hasher.hash(user_db.password)
    user_db.password = hashed_password
    save_instance(user_db, session)

    # create the user profile
    user_profile = Profile(name=user.name, user_id=user_db.id)
    save_instance(user_profile, session)

    # create email verification
    verification_code = generate_code()
    expires_mins = int(os.getenv("EMAIL_VERIFICATION_MINUTES"))
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=expires_mins)
    verification = EmailVerification(
        user_id=user_db.id, code=verification_code, expires_at=expires_at
    )
    save_instance(verification, session)

    session.commit()
    refresh_all(session, user_db, user_profile, verification)

    return user_db


@auth_router.post("/email-verification")
def verify_email_code(data: EmailVerificationCreate, session: SessionDep):
    user = session.exec(
        select(User).where(User.id == data.user_id, User.is_verified == False)
    ).one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized to access this ressource.",
        )

    verification = session.exec(
        select(EmailVerification).where(
            EmailVerification.user_id == data.user_id,
            EmailVerification.code == data.code,
            EmailVerification.is_used == False,
            EmailVerification.expires_at > datetime.now(),
        )
    ).one_or_none()

    if verification is None:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    user.is_verified = True
    verification.is_used = True

    session.add(user)
    session.add(verification)
    session.commit()

    return {"success": True}
