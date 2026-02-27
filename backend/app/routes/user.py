from fastapi import APIRouter, Depends, Query
from app.deps import get_current_verified_user, SessionDep
from app.schemas import (
    UserPublicWithProfile,
    RelationUserPublic,
    RelationProfile,
    FilterParams,
)
from app.models import User, Profile
from sqlmodel import select, col
from typing import Annotated
from ..helpers.subqueries import get_is_followed_by_me_subq
from sqlalchemy.orm import selectinload


user_router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------GET ALL THE USERS IN THE DB---------------
@user_router.get("/", response_model=list[RelationUserPublic])
# TODO: Add filters : i.e. limit, query, page, offset
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
            .limit(limit)
        ).all()
    else:
        users_res = session.exec(
            select(User, is_followed_by_me_subq, Profile)
            .join(Profile, User.id == Profile.user_id)
            .limit(limit)
            .offset((page - 1) * limit)
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
def get_me(current_user: Annotated[User, Depends(get_current_verified_user)]):
    return current_user
