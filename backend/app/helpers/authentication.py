import secrets
from ..core.config import settings
from app.models import User
from app.deps import SessionDep
from sqlmodel import select
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import jwt


def generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06}"


password_hasher = PasswordHash.recommended()


def authenticate_user(email: str, password: str, session: SessionDep) -> User | None:
    user = session.exec(select(User).where(User.email == email)).one_or_none()

    if not user:
        return None

    password_match = password_hasher.verify(password, user.password)

    if not password_match:
        return None

    return user


def create_access_token(payload: dict):
    to_encode = payload.copy()
    expire_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire_at})
    encoded_jwt = jwt.encode(
        to_encode, settings.ACCESS_TOKEN_SECRET, algorithm=settings.TOKEN_ALGORITHM
    )

    return encoded_jwt


def create_refresh_token(payload: dict):
    to_encode = payload.copy()
    expire_at = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire_at})
    encoded_jwt = jwt.encode(
        to_encode, settings.ACCESS_TOKEN_SECRET, algorithm=settings.TOKEN_ALGORITHM
    )
    return encoded_jwt
