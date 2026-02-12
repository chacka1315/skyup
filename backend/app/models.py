from sqlmodel import (
    Field,
    DateTime,
    Column,
    func,
    SQLModel,
    text,
    UniqueConstraint,
    Boolean,
)
from datetime import datetime
from uuid import UUID
from .helpers.db import generate_uuid7
from .schemas import UserBase, ProfileBase, ReplyBase, PostBase, RelationBase


class User(UserBase, table=True):
    __tablename__ = "users"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    password: str = Field(max_length=255)
    refresh_token: str | None = None
    is_verified: bool | None = Field(
        default=None,
        sa_column=Column(Boolean, server_default=text("FALSE"), nullable=False),
    )
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now(), nullable=True),
    )


class Profile(ProfileBase, table=True):
    __tablename__ = "profiles"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    avatar_url: str | None = None
    banner_url: str | None = None
    avatar_id: str | None = None
    banner_id: str | None = None


class Post(PostBase, table=True):
    __tablename__ = "posts"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    author_id: UUID = Field(foreign_key="users.id", nullable=False, ondelete="CASCADE")
    media_url: str | None = None
    media_public_id: str | None = None
    media_type: str | None = None
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )


class Reply(ReplyBase, table=True):
    __tablename__ = "replies"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    author_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    post_id: UUID = Field(foreign_key="posts.id", ondelete="CASCADE")
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )


class Bookmark(SQLModel, table=True):
    __tablename__ = "bookmarks"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    owner_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    post_id: UUID = Field(foreign_key="posts.id", ondelete="CASCADE")
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )

    __table_args__ = (
        UniqueConstraint("owner_id", "post_id", name="unique_bookmark_post"),
    )


class Relation(RelationBase, table=True):
    __tablename__ = "relations"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    created_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )


class Like(SQLModel, table=True):
    __tablename__ = "likes"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    author_id: UUID = Field(foreign_key="users.id", nullable=True, ondelete="SET NULL")
    post_id: UUID = Field(foreign_key="posts.id", ondelete="CASCADE")

    __table_args__ = (
        UniqueConstraint("author_id", "post_id", name="unique_like_post"),
    )


class EmailVerification(SQLModel, table=True):
    __tablename__ = "emails_verifications"

    id: int | None = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    code: str = Field(nullable=False)
    is_used: bool | None = Field(
        default=None,
        sa_column=Column(Boolean, server_default=text("FALSE")),
    )
    expires_at: datetime = Field(sa_column=Column(DateTime, nullable=False))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
