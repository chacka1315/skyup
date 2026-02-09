from fastapi import APIRouter, HTTPException, status, Depends
from app.models import User, EmailVerification, Profile
from ..schemas import UserCreate, UserPublic, EmailVerificationCreate, Token
from app.deps import SessionDep, validate_user_creation
from sqlmodel import select
from datetime import datetime, timedelta, timezone
from ..helpers.db import refresh_all, save_instance
from ..helpers.authentication import (
    generate_code,
    authenticate_user,
    create_access_token,
    create_refresh_token,
)
from ..core.config import settings
from pwdlib import PasswordHash
from ..helpers.email import send_email_verification
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
import jwt

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

password_hasher = PasswordHash.recommended()


# *************USER REGISTRATION*************
@auth_router.post(
    "/sign-up", status_code=status.HTTP_201_CREATED, response_model=UserPublic
)
async def create_user(
    user: Annotated[UserCreate, Depends(validate_user_creation)], session: SessionDep
):
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
    expires_mins = settings.EMAIL_VERIFICATION_MINUTES
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=expires_mins)
    verification = EmailVerification(
        user_id=user_db.id, code=verification_code, expires_at=expires_at
    )
    save_instance(verification, session)

    session.commit()
    refresh_all(session, user_db, user_profile, verification)

    mail_res = await send_email_verification(
        user_email=user_db.email, user_name=user.name, code=verification.code
    )
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


# *************USER LOGIN*************


@auth_router.post("/sign-in", response_model=Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
):
    user_email = form_data.username  # We use email as username to follow Oauth2 rules
    user_password = form_data.password

    user = authenticate_user(user_email, user_password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jwt_payload = {"sub": {"username": user.username, "user_id": user.id}}
    access_token = create_access_token(jwt_payload)
    refresh_token = create_refresh_token(jwt_payload)

    user.refresh_token = refresh_token
    session.add(user)
    session.commit()

    return Token(access_token=access_token, token_type="bearer")
