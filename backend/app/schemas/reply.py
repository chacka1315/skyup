from sqlmodel import SQLModel, Field
from uuid import UUID


class ReplyBase(SQLModel):
    content: str = Field(min_length=1, max_length=300)


class ReplyCreate(ReplyBase):
    user_id: UUID
    post_id: UUID


class ReplyUpdate(ReplyBase):
    pass
