from sqlmodel import SQLModel, Field, Date
from uuid import UUID


class ProdileBase(SQLModel):
    birthday: Date | None
    bio: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = None
    banner_url: str | None = None
    avatar_id: str | None = None
    banner_id: str | None = None


class ProfileCreate(ProdileBase):
    user_id: UUID


class ProfileUpdate(ProdileBase):
    pass


class ProfilePublic(ProdileBase):
    id: UUID
    user_id: UUID
