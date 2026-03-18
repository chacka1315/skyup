import os
from dotenv import load_dotenv

# MUST be before any app imports — sets the right env before config.py is loaded
load_dotenv(".env.test", override=True)
os.environ["PY_ENV"] = "test"

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from unittest.mock import patch, AsyncMock, MagicMock
from pwdlib import PasswordHash

from app.main import app
from app.deps import get_sesssion
from app.models import User, Profile
from app.core.config import settings

password_hasher = PasswordHash.recommended()

test_engine = create_engine(settings.DATABASE_URL)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Create all tables once for the test session, drop them at the end."""
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture()
def db_session():
    """
    Each test runs in a transaction that is rolled back at the end.
    session.commit() inside routes creates savepoints, not real commits.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    """TestClient with the test session injected and emails mocked."""

    def override_session():
        yield db_session

    app.dependency_overrides[get_sesssion] = override_session

    with patch(
        "app.routes.authentication.send_email_verification",
        new_callable=AsyncMock,
        return_value={"status": "success"},
    ):
        with patch(
            "app.routes.authentication.send_email_welcome",
            new_callable=MagicMock,
        ):
            with TestClient(app) as c:
                yield c

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# User helpers
# ---------------------------------------------------------------------------


def _make_user(
    session: Session,
    *,
    username: str,
    email: str,
    password: str,
    name: str,
) -> User:
    """Insert a verified user + profile directly into the DB."""
    hashed = password_hasher.hash(password)
    user = User(username=username, email=email, password=hashed, is_verified=True)
    session.add(user)
    session.flush()
    session.refresh(user)
    profile = Profile(user_id=user.id, name=name)
    session.add(profile)
    session.flush()
    session.refresh(user)
    return user


@pytest.fixture()
def user_credentials():
    return {"email": "alice@example.com", "password": "AlicePass1!"}


@pytest.fixture()
def verified_user(db_session, user_credentials):
    return _make_user(
        db_session,
        username="alice",
        email=user_credentials["email"],
        password=user_credentials["password"],
        name="Alice",
    )


@pytest.fixture()
def auth_headers(client, verified_user, user_credentials):
    response = client.post(
        "/api/auth/login/",
        data={
            "username": user_credentials["email"],
            "password": user_credentials["password"],
        },
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def second_user(db_session):
    return _make_user(
        db_session,
        username="bob",
        email="bob@example.com",
        password="BobPass1!",
        name="Bob",
    )
