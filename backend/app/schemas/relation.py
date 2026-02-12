from sqlmodel import SQLModel, Field, Column, String
from datetime import datetime
from uuid import UUID
from typing import Literal

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


class RelationPublic(RelationBase):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    status: RelationStatus
    created_at: datetime
