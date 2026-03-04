from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from app.deps import get_current_verified_user, SessionDep
from app.schemas import (
    UserPublicWithProfile,
    RelationUserPublic,
    RelationProfile,
    PostPublicWithAuthor,
    PostAuthor,
    PostAuthorProfile,
    UserPublicWithPosts,
)
from app.models import Post, User, Profile, Relation
from sqlmodel import select, col, desc, func
from typing import Annotated
from ..helpers.subqueries import get_is_followed_by_me_subq
from sqlalchemy.orm import selectinload
from ..helpers.subqueries import (
    reply_count_subq,
    likes_count_subq,
    bookmarks_count_subq,
    get_is_bookmarked_by_me_subq,
    get_is_liked_by_me_subq,
)

user_router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------GET ALL THE USERS IN THE DB---------------
@user_router.get("/", response_model=list[RelationUserPublic])
def get_all_users(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    limit: int = Query(100, gt=0, le=100),
    page: int = Query(1, ge=1),
    name: Annotated[str | None, Query(description="Filter to search user.")] = None,
):
    is_followed_by_me_subq = get_is_followed_by_me_subq(current_user)
    if name:
        users_res = session.exec(
            select(User, is_followed_by_me_subq, Profile)
            .join(Profile, User.id == Profile.user_id)
            .filter(col(Profile.name).ilike(f"%{name}%"))
            .where(User.is_verified == True)
            .limit(50)
        ).all()
    else:
        users_res = session.exec(
            select(User, is_followed_by_me_subq, Profile)
            .where(User.is_verified == True)
            .join(Profile, User.id == Profile.user_id)
            .limit(limit)
            .offset((page - 1) * limit)
            .order_by(desc(User.created_at))
        ).all()

    users = []

    for user, is_followed_by_me, profile in users_res:
        users.append(
            RelationUserPublic(
                **user.model_dump(),
                profile=RelationProfile(**profile.model_dump()),
                is_followed_by_me=bool(is_followed_by_me),
            )
        )

    return users


# ------------GET THE CONNECTED USER---------------
@user_router.get("/me/", response_model=UserPublicWithProfile)
def get_me(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
):
    followers_count_subq = (
        select(func.count(Relation.id))
        .where(Relation.following_id == User.id)
        .scalar_subquery()
        .label("followers_count")
    )
    followings_count_subq = (
        select(func.count(Relation.id))
        .where(Relation.follower_id == User.id)
        .scalar_subquery()
        .label("followings_count")
    )

    user_res = session.exec(
        select(User, followers_count_subq, followings_count_subq)
        .options(selectinload(User.profile))
        .where(User.id == current_user.id)
    ).one_or_none()

    if not user_res:
        raise HTTPException(status_code=404, detail="User not found")

    user, followers_count, followings_count = user_res

    return UserPublicWithProfile(
        **user.model_dump(),
        profile=user.profile.model_dump(),
        followers_count=followers_count,
        followings_count=followings_count,
    )


# ------------GET ANY USER---------------
@user_router.get("/{username}/", response_model=UserPublicWithProfile)
def get_user(
    session: SessionDep,
    username: str,
):
    followers_count_subq = (
        select(func.count(Relation.id))
        .where(Relation.following_id == User.id)
        .scalar_subquery()
        .label("followers_count")
    )
    followings_count_subq = (
        select(func.count(Relation.id))
        .where(Relation.follower_id == User.id)
        .scalar_subquery()
        .label("followings_count")
    )

    user_res = session.exec(
        select(User, followers_count_subq, followings_count_subq)
        .options(selectinload(User.profile))
        .where(User.username == username, User.is_verified == True)
    ).one_or_none()

    if not user_res:
        raise HTTPException(status_code=404, detail="User not found")

    user, followers_count, followings_count = user_res

    return UserPublicWithProfile(
        **user.model_dump(),
        profile=user.profile.model_dump(),
        followers_count=followers_count,
        followings_count=followings_count,
    )


# ------------GET ANY USER POSTS---------------
@user_router.get("/{user_id}/posts/", response_model=list[PostPublicWithAuthor])
def get_user(
    session: SessionDep,
    user_id: UUID,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    limit: int = Query(100, gt=0, le=100),
    page: int = Query(1, ge=1),
):

    is_liked_by_me_subq = get_is_liked_by_me_subq(current_user)
    is_bookmarked_by_me_subq = get_is_bookmarked_by_me_subq(current_user)

    user_posts_res = session.exec(
        select(
            Post,
            likes_count_subq,
            reply_count_subq,
            bookmarks_count_subq,
            is_liked_by_me_subq,
            is_bookmarked_by_me_subq,
        )
        .options(selectinload(Post.author).selectinload(User.profile))
        .where(Post.author_id == user_id)
        .order_by(desc(Post.created_at))
        .limit(limit)
        .offset((page - 1) * limit)
    ).all()

    posts_public = []

    for (
        post,
        likes_count,
        replies_count,
        bookmarks_count,
        is_liked_by_me,
        is_bookmarked_by_me,
    ) in user_posts_res:
        author_profile = PostAuthorProfile(**post.author.profile.model_dump())
        author = PostAuthor(**post.author.model_dump(), profile=author_profile)

        post_public = PostPublicWithAuthor(
            **post.model_dump(),
            author=author,
            likes_count=likes_count,
            is_liked_by_me=bool(is_liked_by_me),
            bookmarks_count=bookmarks_count,
            is_bookmarked_by_me=bool(is_bookmarked_by_me),
            replies_count=replies_count,
        )

        posts_public.append(post_public)

    return posts_public
