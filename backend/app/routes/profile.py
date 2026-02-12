from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from app.deps import get_current_verified_user, SessionDep
from app.schemas import ProfilePublic
from app.models import User, Profile
from sqlmodel import select
from typing import Annotated
from datetime import date
from uuid import UUID
from ..helpers.cloudinary import (
    validate_media,
    upload_to_cloudinary,
    ALLOWED_IMG_TYPES,
    delete_from_cloudinary,
)


profile_router = APIRouter(
    prefix="/api/profiles",
    tags=["Users profiles"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------UPDATE USER PROFILE---------------
@profile_router.put("/", response_model=ProfilePublic)
async def update_profile(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
    name: Annotated[str, Form(max_length=50)],
    country: Annotated[str | None, Form(max_length=60)] = None,
    birthday: Annotated[date | None, Form()] = None,
    bio: Annotated[str | None, Form(max_length=255)] = None,
    banner: Annotated[UploadFile | None, File()] = None,
    avatar: Annotated[UploadFile | None, File()] = None,
):

    user_profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).one()

    user_profile.name = name
    user_profile.country = country
    user_profile.birthday = birthday
    user_profile.bio = bio

    if banner:
        validate_media(file=banner, allowed_types=ALLOWED_IMG_TYPES)

        banner_upload_res = await upload_to_cloudinary(
            file=banner, folder="skyup/banners"
        )

        # Delete the old banner
        if user_profile.banner_id:
            await delete_from_cloudinary(
                public_id=user_profile.banner_id, media_type="image"
            )

        user_profile.banner_id = banner_upload_res.public_id
        user_profile.banner_url = banner_upload_res.url

    if avatar:
        validate_media(file=avatar, allowed_types=ALLOWED_IMG_TYPES)

        avatar_upload_res = await upload_to_cloudinary(
            file=avatar, folder="skyup/avatars"
        )

        # Delete the old avatar
        if user_profile.avatar_id:
            await delete_from_cloudinary(
                public_id=user_profile.avatar_id, media_type="image"
            )

        user_profile.avatar_id = avatar_upload_res.public_id
        user_profile.avatar_url = avatar_upload_res.url

    session.add(user_profile)
    session.commit()
    session.refresh(user_profile)

    return user_profile


# ----------GET ALL THE PROFILES IN THE DB---------------
@profile_router.get("/", response_model=list[ProfilePublic])
# TODO: Add filters : i.e. limit, query, page, offset
def get_all_profiles(session: SessionDep):
    profiles = session.exec(select(Profile)).all()

    return profiles


# ------------GET THE CONNECTED PROFILE---------------
@profile_router.get("/me", response_model=ProfilePublic)
def get_me(
    current_user: Annotated[Profile, Depends(get_current_verified_user)],
    session: SessionDep,
):
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).one()

    return profile


# ------------GET ANY PROFILE---------------
@profile_router.get("/{profile_id}", response_model=ProfilePublic)
def get_profile(session: SessionDep, profile_id: UUID):
    profile = session.get(profile_id)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile
