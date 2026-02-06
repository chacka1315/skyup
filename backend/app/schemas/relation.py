from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID


class RelationBase(SQLModel):
    receiver_id: UUID = Field(foreign_key="users.id", nullable=False)


class RelationCreate(RelationBase):
    pass


class RelationPublic(RelationBase):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    is_accepted: bool
    created_at: datetime
