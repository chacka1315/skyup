from sqlmodel import select
from app.models import EmailVerification

# from fastapi.testclient import TestClient

SIGNUP_DATA = {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "NewPass1!",
    "password_repeat": "NewPass1!",
    "name": "New User",
}


def test_signup_success(client):
    response = client.post("/api/auth/sign-up/", json=SIGNUP_DATA)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "password" not in data


def test_signup_duplicate_email(client, verified_user):
    data = {**SIGNUP_DATA, "email": verified_user.email, "username": "otheruser"}
    response = client.post("/api/auth/sign-up/", json=data)
    assert response.status_code == 400


def test_signup_duplicate_username(client, verified_user):
    data = {
        **SIGNUP_DATA,
        "username": verified_user.username,
        "email": "other@example.com",
    }
    response = client.post("/api/auth/sign-up/", json=data)
    assert response.status_code == 400


def test_email_verification_success(client, db_session):
    response = client.post("/api/auth/sign-up/", json=SIGNUP_DATA)
    assert response.status_code == 201
    user_id = response.json()["id"]

    verification = db_session.exec(
        select(EmailVerification).where(EmailVerification.user_id == user_id)
    ).first()

    response = client.post(
        "/api/auth/email-verification/",
        json={"user_id": str(user_id), "code": verification.code},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_email_verification_invalid_code(client, db_session):
    response = client.post("/api/auth/sign-up/", json=SIGNUP_DATA)
    assert response.status_code == 201
    user_id = response.json()["id"]

    response = client.post(
        "/api/auth/email-verification/",
        json={"user_id": str(user_id), "code": "000000"},
    )
    assert response.status_code == 400


def test_login_success(client, verified_user, user_credentials):
    response = client.post(
        "/api/auth/login/",
        data={
            "username": user_credentials["email"],
            "password": user_credentials["password"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, verified_user):
    response = client.post(
        "/api/auth/login/",
        data={"username": verified_user.email, "password": "WrongPass1!"},
    )
    assert response.status_code == 401


def test_login_unverified_user(client, db_session):
    from app.models import User
    from pwdlib import PasswordHash

    hasher = PasswordHash.recommended()
    user = User(
        username="unverified",
        email="unverified@example.com",
        password=hasher.hash("UnverifiedPass1!"),
        is_verified=False,
    )
    db_session.add(user)
    db_session.flush()

    response = client.post(
        "/api/auth/login/",
        data={"username": "unverified@example.com", "password": "UnverifiedPass1!"},
    )
    assert response.status_code == 401


def test_refresh_token_valid(client, verified_user, user_credentials):
    # Login sets the refresh_token cookie on the TestClient session
    login_response = client.post(
        "/api/auth/login/",
        data={
            "username": user_credentials["email"],
            "password": user_credentials["password"],
        },
    )
    assert login_response.status_code == 200

    response = client.post("/api/auth/refresh/")
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_refresh_token_missing(client):
    response = client.post("/api/auth/refresh/")
    assert response.status_code == 401


def test_logout(client, verified_user, user_credentials):
    client.post(
        "/api/auth/login/",
        data={
            "username": user_credentials["email"],
            "password": user_credentials["password"],
        },
    )
    response = client.post("/api/auth/logout/")
    assert response.status_code == 204
