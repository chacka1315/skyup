from fastapi import APIRouter, Depends, BackgroundTasks
from app.deps import get_current_verified_user, SessionDep
from app.schemas import UserPublic, UserPublicWithProfile
from app.models import User
from sqlmodel import select
from typing import Annotated


user_router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------GET ALL THE USERS IN THE DB---------------
@user_router.get("/", response_model=list[UserPublicWithProfile])
# TODO: Add filters : i.e. limit, query, page, offset
def get_all_users(session: SessionDep):
    users = session.exec(select(User)).all()

    return users


# ------------GET THE CONNECTED USER---------------
@user_router.get("/me/", response_model=UserPublicWithProfile)
def get_me(current_user: Annotated[User, Depends(get_current_verified_user)]):
    return current_user
