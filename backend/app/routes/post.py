from fastapi import APIRouter, Depends, status, HTTPException, Form, UploadFile, File
from app.deps import get_current_verified_user, SessionDep
from app.models import User, Post, Relation, Bookmark, Like
from sqlmodel import select, or_, func, and_, col, desc
from typing import Annotated
from uuid import UUID
from ..schemas import PostPublic, PostUpdate, NoContentResponse, BookmarkPublic
from ..helpers.cloudinary import (
    validate_media,
    upload_to_cloudinary,
    delete_from_cloudinary,
)

post_router = APIRouter(
    prefix="/api/posts",
    tags=["Posts"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------CREATE A NEW POST---------------
@post_router.post("/", response_model=PostPublic)
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

    return post_db


# ----------UPDATE POST---------------
@post_router.put("/{post_id}", response_model=PostPublic)
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
    session.refreh(existing_post)

    return existing_post


# ----------DELETE POST---------------
@post_router.delete(
    "/{post_id}",
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
@post_router.get("/", response_model=list[PostPublic])
# TODO: Implement filtering (limit, offset, query)
def get_feed_posts(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
):

    # First we select some users followed by the current user
    user_relations = session.exec(
        select(Relation)
        .where(
            or_(
                and_(
                    Relation.sender_id == current_user.id, Relation.status == "accepted"
                ),
                and_(
                    Relation.receiver_id == current_user.id,
                    Relation.status == "accepted",
                ),
            )
        )
        .order_by(func.random())
        .limit(100)
    ).all()

    def get_friend_id(relation: Relation) -> UUID:
        return (
            relation.sender_id
            if current_user.id == relation.receiver_id
            else relation.receiver_id
        )

    user_friend_ids = list(map(get_friend_id, user_relations))
    user_friend_ids.append(current_user.id)

    posts = session.exec(
        select(Post)
        .where(col(Post.author_id).in_(user_friend_ids))
        .order_by(desc(Post.created_at))
    ).all()

    return posts


# ----------GET SINGLE POST---------------
@post_router.get(
    "/{post_id}",
    response_model=PostPublic,
)
def get_single_post(
    session: SessionDep,
    post_id: UUID,
):
    post = session.get(Post, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


# ----------BOOKMARK A POST---------------
@post_router.post("/{post_id}/bookmark", response_model=NoContentResponse)
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


# ----------DELETE BOOKMARK---------------
@post_router.delete("/{post_id}/bookmark", response_model=NoContentResponse)
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
@post_router.post("/{post_id}/like", response_model=NoContentResponse)
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
@post_router.delete("/{post_id}/like", response_model=NoContentResponse)
def delete_like(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    post_id: UUID,
):
    existing_like = session.exec(
        select(Like).where(Like.author_id == current_user.id, post_id == post_id)
    ).one_or_none()

    if not existing_like:
        raise HTTPException(status_code=404, detail="Like not found")

    session.delete(existing_like)
    session.commit()

    return NoContentResponse(success=True)
