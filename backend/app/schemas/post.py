from sqlmodel import SQLModel, Field
from pydantic import HttpUrl
from uuid import UUID


class PostBase(SQLModel):
    content: str = Field(max_length=300)
    image_url: str = Field()
