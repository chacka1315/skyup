from sqlmodel import SQLModel, Field
from datetime import datetime
from pydantic import HttpUrl
from uuid import UUID


class PostBase(SQLModel):
    content: str = Field(max_length=300)


class PostCreate(PostBase):
    pass


class PostPublic(PostBase):
    id: UUID
    author_id: UUID
    image_url: HttpUrl | None
    created_at: datetime
