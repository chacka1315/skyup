from sqlmodel import SQLModel, Field, Date, Column
from datetime import date
from uuid import UUID


class ProfileBase(SQLModel):
    name: str = Field(index=True, max_length=50)
    country: str | None = None
    birthday: date | None = Field(default=None, sa_column=Column(Date))
    bio: str | None = Field(default=None, max_length=255)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfilePublic(ProfileBase):
    id: UUID
    user_id: UUID
