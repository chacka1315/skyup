from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID


class BookmarkBase(SQLModel):
    user_id: UUID | None = Field(default=None, foreign_key="users.id")


class BookmarkPublic(BookmarkBase):
    id: UUID
    post_id: UUID = Field(foreign_key="posts.id")
    created_at: datetime
