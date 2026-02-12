from sqlmodel import SQLModel, Field, Date, Column
from datetime import date
from uuid import UUID
from fastapi import Form, File, UploadFile
from typing import Annotated
from pydantic import HttpUrl


class ProfileBase(SQLModel):
    name: str = Field(index=True, max_length=50)
    country: str | None = None
    birthday: date | None = Field(default=None, sa_column=Column(Date))
    bio: str | None = Field(default=None, max_length=255)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(SQLModel):
    name: Annotated[str, Form(max_length=50)]
    country: Annotated[str | None, Form(max_length=60)] = None
    birthday: Annotated[date | None, Form()] = None
    bio: Annotated[str | None, Form(max_length=255)] = None
    banner: Annotated[UploadFile | None, File()] = None
    avatar: Annotated[UploadFile | None, File()] = None


class ProfilePublic(ProfileBase):
    id: UUID
    user_id: UUID
    avatar_url: HttpUrl | None
    banner_url: HttpUrl | None
