from sqlmodel import SQLModel, Field, Column, Date, String
from pydantic import EmailStr, field_validator, ValidationInfo, BaseModel
from uuid import UUID
from datetime import datetime, date
import re
from typing import Literal


# =================USER SCHEMAS=======================
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
        return username.lower()


class UserUpdate(SQLModel):
    username: str | None = Field(default=None, max_length=50)


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
        return username.lower()


class UserUpdate(SQLModel):
    username: str | None = Field(default=None, max_length=50)


# =================PROFILE SCHEMAS=======================
class ProfileBase(SQLModel):
    name: str = Field(index=True, max_length=50)
    country: str | None = None
    birthday: date | None = Field(default=None, sa_column=Column(Date))
    bio: str | None = Field(default=None, max_length=255)


class ProfileCreate(ProfileBase):
    pass


# =================POST SCHEMAS=======================
class PostBase(SQLModel):
    content: str = Field(max_length=300)


class PostUpdate(PostBase):
    pass


# =================RELATION SCHEMAS=======================
RelationStatus = Literal["pending", "accepted", "rejected"]


class RelationBase(SQLModel):
    receiver_id: UUID = Field(
        foreign_key="users.id", nullable=False, ondelete="CASCADE"
    )
    sender_id: UUID = Field(foreign_key="users.id", nullable=False, ondelete="CASCADE")
    status: RelationStatus = Field(
        default="pending",
        sa_column=Column(String, nullable=False),
    )


class RelationCreate(SQLModel):
    receiver_id: UUID


class RelationUpdate(SQLModel):
    status: Literal["accepted", "rejected"]


# =================REPLY SCHEMAS=======================
class ReplyBase(SQLModel):
    content: str = Field(min_length=1, max_length=300)


class ReplyCreate(ReplyBase):
    pass


class ReplyUpdate(ReplyBase):
    pass


class ReplyPublic(ReplyBase):
    id: UUID
    author_id: UUID
    post_id: UUID
    created_at: datetime


# =================EMAIL VERIFICATION SCHEMAS=======================
class EmailVerificationCreate(SQLModel):
    user_id: UUID
    code: str = Field(max_length=6, min_length=6)


# =================BOOKMARKS SCHEMAS=======================
class BookmarkPublic(BaseModel):
    id: UUID
    post_id: UUID
    owner_id: UUID
