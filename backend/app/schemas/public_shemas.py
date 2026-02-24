from pydantic import EmailStr, HttpUrl, BaseModel
from uuid import UUID
from datetime import datetime
from .models_schemas import (
    UserBase,
    PostBase,
    RelationBase,
    RelationStatus,
    ProfileBase,
    ReplyBase,
)
from typing import Literal


class UserPublic(UserBase):
    id: UUID | None
    created_at: datetime


class UserPublicWithProfile(UserPublic):
    profile: "ProfilePublic"


class UserPublicWithPosts(UserPublic):
    posts: list["PostPublic"] = []


class ProfilePublic(ProfileBase):
    id: UUID
    user_id: UUID
    avatar_url: HttpUrl | None
    banner_url: HttpUrl | None


class ProfilePublicWithUser(ProfilePublic):
    user: UserPublic


class PostAuthorProfile(BaseModel):
    name: str
    avatar_url: HttpUrl | None


class PostAuthor(UserPublic):
    profile: PostAuthorProfile


class SinglePostAuthor(PostAuthor):
    is_my_friend: bool


class PostPublic(PostBase):
    id: UUID
    author_id: UUID
    media_url: HttpUrl | None
    media_type: Literal["image", "video", None]
    created_at: datetime
    likes_count: int
    replies_count: int
    bookmarks_count: int
    is_liked_by_me: bool
    is_bookmarked_by_me: bool


class PostPublicWithAuthor(PostPublic):
    author: PostAuthor


class SinglePostPublicWithAuthor(PostPublic):
    author: SinglePostAuthor


class ReplyPublic(ReplyBase):
    id: UUID
    author_id: UUID
    post_id: UUID
    created_at: datetime
    author: PostAuthor


class PostPublicWithReplies(BaseModel):
    post: PostPublicWithAuthor
    replies: list[ReplyPublic]


class RelationPublic(RelationBase):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    status: RelationStatus
    created_at: datetime
