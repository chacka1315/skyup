from fastapi import APIRouter, Depends, status, HTTPException, Form, UploadFile, File
from app.deps import get_current_verified_user, SessionDep
from app.models import User, Post, Relation, Bookmark, Like
from sqlmodel import select, or_, func, and_, col, desc
from sqlalchemy.orm import selectinload
from ..helpers.subqueries import (
    reply_count_subq,
    likes_count_subq,
    bookmarks_count_subq,
    get_is_bookmarked_by_me_subq,
    get_is_liked_by_me_subq,
)
from typing import Annotated
from uuid import UUID
from ..schemas import (
    PostPublicWithAuthor,
    SinglePostPublicWithAuthor,
    PostUpdate,
    NoContentResponse,
    PostAuthorProfile,
    PostAuthor,
    SinglePostAuthor,
)
from ..helpers.cloudinary import (
    validate_media,
    upload_to_cloudinary,
    delete_from_cloudinary,
)
from pprint import pprint
from sqlalchemy import select as sa_select
from sqlalchemy.orm import selectinload
from ..helpers.posts import get_post_metrics

post_router = APIRouter(
    prefix="/api/posts",
    tags=["Posts"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------CREATE A NEW POST---------------
#
@post_router.post("/", response_model=PostPublicWithAuthor)
async def create_post(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    content: Annotated[str, Form(max_length=300)],
    media: Annotated[UploadFile | None, File()] = None,
):
    post_db = Post(content=content, author_id=current_user.id)

    # We validate and upload the media on the cloud
    if media:
        validate_media(media)
        upload_res = await upload_to_cloudinary(media, folder="skyup/posts")
        post_db.media_type = upload_res.media_type
        post_db.media_url = upload_res.url
        post_db.media_public_id = upload_res.public_id
    elif len(content.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No post content provided"
        )

    session.add(post_db)
    session.commit()
    session.refresh(post_db)

    author_profile = PostAuthorProfile(**current_user.profile.model_dump())
    author = PostAuthor(**current_user.model_dump(), profile=author_profile)

    post_public = PostPublicWithAuthor(
        **post_db.model_dump(),
        author=author,
        likes_count=0,
        is_liked_by_me=False,
        bookmarks_count=0,
        is_bookmarked_by_me=False,
        replies_count=0,
    )

    return post_public


# ----------UPDATE POST---------------
@post_router.put("/{post_id}/", response_model=NoContentResponse)
async def update_post(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
    post: PostUpdate,
):
    existing_post = session.exec(
        select(Post).where(Post.id == post_id, Post.author_id == current_user.id)
    ).one_or_none()

    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not existing_post.media_url and len(post.content.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No post content provided"
        )

    existing_post.content = post.content
    session.add(existing_post)
    session.commit()
    session.refresh(existing_post)

    return NoContentResponse(success=True)


# ----------DELETE POST---------------
@post_router.delete(
    "/{post_id}/",
    response_model=NoContentResponse,
)
async def delete_post(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    existing_post = session.exec(
        select(Post).where(Post.id == post_id, Post.author_id == current_user.id)
    ).one_or_none()

    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Delete the post media if exist
    if existing_post.media_public_id != None:
        await delete_from_cloudinary(
            public_id=existing_post.media_public_id, media_type=existing_post.media_type
        )

    session.delete(existing_post)
    session.commit()

    return {"success": True}


# ----------GET FEED POSTS---------------
@post_router.get("/", response_model=list[PostPublicWithAuthor])
def get_feed_posts(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
):

    # First we select some users followed by the current user
    users_followed = session.exec(
        select(User)
        .join(Relation, Relation.following_id == User.id)
        .where(
            Relation.follower_id == current_user.id,
        )
        .order_by(func.random())
        .limit(100)
    ).all()

    users_followed_ids = map(lambda user: user.id, users_followed)
    users_followed_ids = list(users_followed_ids)
    users_followed_ids.append(current_user.id)

    is_liked_by_me_subq = get_is_liked_by_me_subq(current_user)
    is_bookmarked_by_me_subq = get_is_bookmarked_by_me_subq(current_user)

    posts_res = session.exec(
        select(
            Post,
            likes_count_subq,
            reply_count_subq,
            bookmarks_count_subq,
            is_liked_by_me_subq,
            is_bookmarked_by_me_subq,
        )
        .options(selectinload(Post.author).selectinload(User.profile))
        .where(col(Post.author_id).in_(users_followed_ids))
        .order_by(desc(Post.created_at))
    ).all()

    posts_public = []

    for (
        post,
        likes_count,
        replies_count,
        bookmarks_count,
        is_liked_by_me,
        is_bookmarked_by_me,
    ) in posts_res:
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


# ----------BOOKMARK A POST---------------
@post_router.post("/{post_id}/bookmark/", response_model=NoContentResponse)
def create_bookmark(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    # Check if the post we want to bookmark exists
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if the post is already bookmarked
    existing_bookmark = session.exec(
        select(Bookmark).where(
            Bookmark.post_id == post_id, Bookmark.owner_id == current_user.id
        )
    ).one_or_none()

    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Post already bookmarked")

    bookmark = Bookmark(owner_id=current_user.id, post_id=post_id)

    session.add(bookmark)
    session.commit()

    return NoContentResponse(success=True)


# ----------GET BOOKMARKED POSTS---------------
@post_router.get("/bookmarks/", response_model=list[PostPublicWithAuthor])
def get_bookmarked_posts(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
):

    is_liked_by_me_subq = get_is_liked_by_me_subq(current_user)
    is_bookmarked_by_me_subq = get_is_bookmarked_by_me_subq(current_user)

    posts_res = session.exec(
        select(
            Post,
            likes_count_subq,
            reply_count_subq,
            bookmarks_count_subq,
            is_liked_by_me_subq,
            is_bookmarked_by_me_subq,
        )
        .options(selectinload(Post.author).selectinload(User.profile))
        .join(Bookmark, Bookmark.post_id == Post.id)
        .where(Bookmark.owner_id == current_user.id)
        .order_by(desc(Bookmark.created_at))
    ).all()

    bookmarks_public = []

    for (
        post,
        likes_count,
        replies_count,
        bookmarks_count,
        is_liked_by_me,
        is_bookmarked_by_me,
    ) in posts_res:
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

        bookmarks_public.append(post_public)

    return bookmarks_public


# ----------GET SINGLE POST---------------
@post_router.get(
    "/{post_id}/",
    response_model=SinglePostPublicWithAuthor,
)
def get_single_post(
    session: SessionDep,
    post_id: UUID,
    current_user: Annotated[User, Depends(get_current_verified_user)],
):
    is_liked_by_me_subq = get_is_liked_by_me_subq(current_user)
    is_bookmarked_by_me_subq = get_is_bookmarked_by_me_subq(current_user)

    post_res = session.exec(
        select(
            Post,
            likes_count_subq,
            reply_count_subq,
            bookmarks_count_subq,
            is_bookmarked_by_me_subq,
            is_liked_by_me_subq,
        ).where(Post.id == post_id)
    ).one_or_none()

    if not post_res:
        raise HTTPException(status_code=404, detail="Post not found")

    post: Post = post_res[0]

    existing_following = session.exec(
        select(Relation).where(
            Relation.following_id == post.author_id,
            Relation.follower_id == current_user.id,
        )
    ).one_or_none()

    post_metrics = get_post_metrics(post_res)

    author_profile = PostAuthorProfile(**post_res[0].author.profile.model_dump())
    author = SinglePostAuthor(
        **post_res[0].author.model_dump(),
        profile=author_profile,
        is_followed=True if existing_following else False,
    )

    post_public = SinglePostPublicWithAuthor(
        **post_res[0].model_dump(),
        author=author,
        likes_count=post_metrics.likes_count,
        replies_count=post_metrics.replies_count,
        bookmarks_count=post_metrics.bookmarks_count,
        is_liked_by_me=post_metrics.is_liked_by_me,
        is_bookmarked_by_me=post_metrics.is_bookmarked_by_me,
    )

    return post_public


# ----------DELETE BOOKMARK---------------
@post_router.delete("/{post_id}/bookmark/", response_model=NoContentResponse)
def delete_bookmark(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    existing_bookmark = session.exec(
        select(Bookmark).where(
            Bookmark.post_id == post_id, Bookmark.owner_id == current_user.id
        )
    ).one_or_none()

    if not existing_bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    session.delete(existing_bookmark)
    session.commit()

    return NoContentResponse(success=True)


# ----------LIKE A POST---------------
@post_router.post("/{post_id}/like/", response_model=NoContentResponse)
def create_like(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if the post is already liked
    existing_like = session.exec(
        select(Like).where(Like.post_id == post_id, Like.author_id == current_user.id)
    ).one_or_none()

    if existing_like:
        raise HTTPException(status_code=400, detail="Post already liked")

    like = Like(author_id=current_user.id, post_id=post_id)

    session.add(like)
    session.commit()

    return NoContentResponse(success=True)


# ----------DELETE A LIKE---------------
@post_router.delete("/{post_id}/like/", response_model=NoContentResponse)
def delete_like(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    existing_like = session.exec(
        select(Like).where(Like.author_id == current_user.id, Like.post_id == post_id)
    ).one_or_none()

    if not existing_like:
        raise HTTPException(status_code=404, detail="Like not found")

    session.delete(existing_like)
    session.commit()

    return NoContentResponse(success=True)
