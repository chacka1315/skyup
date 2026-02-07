from sqlmodel import SQLModel, Field
from pydantic import EmailStr, field_validator, ValidationInfo
from uuid import UUID
from datetime import datetime
import re


class UserBase(SQLModel):
    username: str = Field(max_length=50, unique=True, nullable=False)
    email: EmailStr = Field(max_length=50, unique=True, nullable=False)


STRONG_PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$"


class UserCreate(UserBase):
    password: str = Field(regex=STRONG_PASSWORD_REGEX)
    password_repeat: str = Field(max_length=64)
    name: str = Field(index=True, max_length=50)

    @field_validator("password", mode="after")
    @classmethod
    def password_strength(cls, password: str) -> str:
        match = re.search(STRONG_PASSWORD_REGEX, password)
        if match is None:
            raise ValueError(
                "Password must contain at least: one capital letter, one lowercase letter, one special character, one digit."
            )
        return password

    @field_validator("password_repeat", mode="after")
    @classmethod
    def passwords_match(cls, password_repeat: str, info: ValidationInfo) -> str:
        password = info.data.get("password")
        if password is None:
            return password_repeat
        if password_repeat != password:
            raise ValueError("Passwords do not match.")
        return password_repeat

    @field_validator("email", mode="after")
    @classmethod
    def email_rules(cls, email: str):
        if email.endswith("@tempmail.com"):
            raise ValueError("Temporary emails are not allowed.")
        return email

    @field_validator("username", mode="after")
    @classmethod
    def username_rules(cls, username: str):
        if not username.isalnum():
            raise ValueError("Username must contain only letters and numbers.")
        return username


class UserUpdate(SQLModel):
    username: str | None = Field(default=None, max_length=50)


class UserPublic(UserBase):
    id: UUID | None
    created_at: datetime
