from pydantic import BaseModel, Field
from uuid import UUID
from .public_shemas import PostAuthor


class NoContentResponse(BaseModel):
    success: bool


# -----------JWTs-----------------
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: UUID


# ---------------Uploading-----------
class CloudinaryUploadResponse(BaseModel):
    public_id: str
    url: str
    media_type: str


class MultipleImagesResponse(BaseModel):
    success: bool
    images: list[CloudinaryUploadResponse]
    total: int


class PostMetrics(BaseModel):
    likes_count: int
    replies_count: int
    bookmarks_count: int
    is_liked_by_me: bool
    is_bookmarked_by_me: bool
    author: PostAuthor


class FilterParams(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    page: int = Field(1, ge=1)
