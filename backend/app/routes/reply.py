from fastapi import APIRouter, Depends, HTTPException
from app.deps import get_current_verified_user, SessionDep
from app.models import User, Post, Reply
from sqlmodel import select, desc
from typing import Annotated
from uuid import UUID
from ..schemas import ReplyCreate, ReplyUpdate, ReplyPublic, NoContentResponse

reply_router = APIRouter(
    dependencies=[Depends(get_current_verified_user)],
    prefix="/api/posts/{post_id}/replies",
    tags=["Replies"],
)


# ----------CREATE A NEW REPLY---------------
@reply_router.post("/", response_model=ReplyPublic)
def create_reply(
    session: SessionDep,
    post_id: UUID,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    reply: ReplyCreate,
):
    # Check if the posts we try to reply exist
    existing_post = session.get(Post, post_id)
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # The we create the comment and save it
    reply_db = Reply(
        content=reply.content, author_id=current_user.id, post_id=existing_post.id
    )

    session.add(reply_db)
    session.commit()
    session.refresh(reply_db)

    return reply_db


# ----------UPDATE REPLY---------------
@reply_router.put("/{reply_id}/", response_model=ReplyPublic)
async def create_reply(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    reply_id: UUID,
    reply: ReplyUpdate,
):
    existing_reply = session.exec(
        select(Reply).where(Reply.id == reply_id, Reply.author_id == current_user.id)
    ).one_or_none()

    if not existing_reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    existing_reply.content = reply.content
    session.add(existing_reply)
    session.commit()
    session.refresh(existing_reply)

    return existing_reply


# ----------DELETE REPLY---------------
@reply_router.delete(
    "/{reply_id}/",
    response_model=NoContentResponse,
)
async def create_reply(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    reply_id: UUID,
):
    existing_reply = session.exec(
        select(Reply).where(Reply.id == reply_id, Reply.author_id == current_user.id)
    ).one_or_none()

    if not existing_reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    session.delete(existing_reply)
    session.commit()

    return {"success": True}


# ----------GET POST REPLIES---------------
@reply_router.get("/", response_model=list[ReplyPublic])
def get_post_replies(
    session: SessionDep,
    post_id: UUID,
):
    replies = session.exec(
        select(Reply).where(Reply.post_id == post_id).order_by(desc(Reply.created_at))
    ).all()

    return replies


# ----------GET SINGLE REPLY---------------
@reply_router.get(
    "/{reply_id}/",
    response_model=ReplyPublic,
)
def get_single_reply(
    session: SessionDep,
    reply_id: UUID,
):
    reply = session.get(Reply, reply_id)

    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    return reply
