from pydantic import BaseModel
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
