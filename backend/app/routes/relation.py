from fastapi import APIRouter, Depends, status, HTTPException, Path
from app.deps import get_current_verified_user, SessionDep
from app.schemas import (
    RelationDelete,
    RelationUserPublic,
    RelationPublic,
    RelationCreate,
    RelationProfile,
    NoContentResponse,
)
from app.models import User, Relation
from sqlmodel import select, or_
from sqlalchemy.orm import selectinload
from typing import Annotated
from uuid import UUID
from ..helpers.subqueries import get_is_followed_by_me_subq

relation_router = APIRouter(
    prefix="/api/relations",
    tags=["Follows, Users relations"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------CREATE A NEW FOLLOW---------------
@relation_router.post("/", response_model=RelationPublic)
def create_relation(
    data: RelationCreate,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    user_to_follow = session.get(User, data.following_id)

    if not user_to_follow or not user_to_follow.is_verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User to follow not found",
        )

    if user_to_follow.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Connot follow yourself"
        )

    # check if the relation already exist
    existing_relation = session.exec(
        select(Relation).where(
            Relation.following_id == user_to_follow.id,
            Relation.follower_id == current_user.id,
        )
    ).one_or_none()

    if existing_relation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send this follow request",
        )

    # Create a new relation.
    relation = Relation(follower_id=current_user.id, following_id=user_to_follow.id)
    session.add(relation)
    session.commit()
    session.refresh(relation)

    return relation


# ----------DELETE A FOLLOW---------------
@relation_router.delete("/", response_model=NoContentResponse)
def delete_relation(
    data: RelationDelete,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    existing_relation = session.exec(
        select(Relation).where(
            Relation.follower_id == current_user.id,
            Relation.following_id == data.following_id,
        )
    ).one_or_none()

    if not existing_relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relation not found",
        )

    session.delete(existing_relation)
    session.commit()

    return NoContentResponse(success=True)


# ----------GET CONNECTED USER FOLLOWERS---------------
@relation_router.get("/followers", response_model=list[RelationUserPublic])
def get_all_followers(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    is_followed_by_me_subq = get_is_followed_by_me_subq(current_user)
    followers_res = session.exec(
        select(User, is_followed_by_me_subq)
        .join(Relation, Relation.follower_id == User.id)
        .options(selectinload(User.profile))
        .where(
            Relation.following_id == current_user.id,
        )
    ).all()

    followers = []

    for user, is_followed_by_me in followers_res:
        followers.append(
            RelationUserPublic(
                **user.model_dump(),
                profile=RelationProfile(**user.profile.model_dump()),
                is_followed_by_me=bool(is_followed_by_me)
            )
        )
    return followers


# ----------GET CONNECTED USER FOLLOWINGS---------------
@relation_router.get("/followings", response_model=list[RelationUserPublic])
def get_all_followings(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    followings = session.exec(
        select(User)
        .join(Relation, Relation.following_id == User.id)
        .options(selectinload(User.profile))
        .where(
            Relation.follower_id == current_user.id,
        )
    ).all()

    return followings
