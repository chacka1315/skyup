from sqlmodel import Field, DateTime, Column, func
from uuid import UUID
from deps import generate_uuid7
from schemas import UserBase, ProdileBase, CommentBase
from pydantic import model_validator


class User(UserBase, table=True):
    __tablename__ = "users"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    password: str = Field(max_length=255)
    is_verified: bool = False
    created_at: DateTime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
    updated_at: DateTime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now(), nullable=True),
    )


class Profile(ProdileBase, table=True):
    __tablename__ = "profiles"

    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")


class Reply(CommentBase, table=True):
    __tablename__ = "replies"
    id: UUID | None = Field(default_factory=generate_uuid7, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id")
    post_id: UUID = Field(foreign_key="posts.id")
    created_at: DateTime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )
