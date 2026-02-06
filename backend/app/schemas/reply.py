from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID


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
