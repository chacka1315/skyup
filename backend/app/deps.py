from .core.db import engine
from typing import Annotated
from sqlmodel import Session, select, or_
from fastapi import Depends, HTTPException, status
from .schemas import UserCreate
from app.models import User, EmailVerification
from datetime import datetime, timedelta, timezone
from .helpers.db import save_instance
from .helpers.authentication import generate_code
from .helpers.email import send_email_verification
from .core.config import settings
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer
from .schemas import TokenData
import jwt


# provide session instance to query the db
def get_sesssion():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_sesssion)]


# Verify credentials not in use
async def validate_user_creation(user_in: UserCreate, session: SessionDep):

    # check if user already exist with same username
    existing_user = session.exec(
        select(User).where(
            or_(User.username == user_in.username, User.email == user_in.email)
        )
    ).one_or_none()

    if existing_user is None:
        return user_in
    if existing_user.email == user_in.email:
        if not existing_user.is_verified:
            verification = session.exec(
                select(EmailVerification).where(
                    EmailVerification.user_id == existing_user.id
                )
            ).one()

            now = datetime.now(timezone.utc)
            cooldown = timedelta(minutes=2)

            if verification.created_at + cooldown > now:
                raise HTTPException(
                    status_code=429,
                    detail="Please wait 2 minute before doing another request.",
                )

            verification_code = generate_code()
            expires_mins = settings.EMAIL_VERIFICATION_MINUTES
            expires_at = now + timedelta(minutes=expires_mins)

            verification.expires_at = expires_at
            verification.code = verification_code
            verification.created_at = now

            save_instance(verification, session)
            session.commit()

            mail_res = await send_email_verification(
                user_email=user_in.email, user_name=user_in.name, code=verification_code
            )

            raise HTTPException(
                status_code=202,
                detail={
                    "message": "We have sent a verification code.",
                    "user_id": str(existing_user.id),
                },
            )
        else:
            raise HTTPException(
                status_code=400, detail="A user already exists with same email address."
            )

    if existing_user.username == user_in.username:
        raise HTTPException(
            status_code=400, detail="A user already exists with same username."
        )


# authentication deps
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.ACCESS_TOKEN_SECRET, algorithms=[settings.TOKEN_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except jwt.InvalidTokenError as err:
        print("🔅JWT ERR when getting curr user:", err)
        raise credentials_exception

    user = session.get(User, token_data.user_id)

    if user is None:
        raise credentials_exception

    return user


async def get_current_verified_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Unverified account")
    return current_user
