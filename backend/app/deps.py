from pydantic import BaseModel

from .core.db import engine
from typing import Annotated
from sqlmodel import Session, select
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


async def validate_user_creation(
    user_in: UserCreate, session: SessionDep
) -> UserCreate:
    # check if email already exists
    user_with_same_email = session.exec(
        select(User).where(User.email == user_in.email)
    ).first()

    if user_with_same_email is not None:
        if not user_with_same_email.is_verified:
            session.delete(user_with_same_email)
            session.commit()
        else:
            raise HTTPException(
                status_code=400, detail="A user already exists with same email address."
            )

    # check if username already exists
    user_with_same_username = session.exec(
        select(User).where(User.username == user_in.username)
    ).first()

    if user_with_same_username is not None:
        raise HTTPException(
            status_code=400, detail="A user already exists with same username."
        )

    return user_in


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
