from fastapi import APIRouter, Depends, status, HTTPException, Path
from app.deps import get_current_verified_user, SessionDep
from app.schemas import (
    UserPublic,
    RelationStatus,
    RelationPublic,
    RelationUpdate,
    RelationCreate,
)
from app.models import User, Relation
from sqlmodel import select, or_
from typing import Annotated
from uuid import UUID

relation_router = APIRouter(
    prefix="/api/relations",
    tags=["Friendships, Users relations"],
    dependencies=[Depends(get_current_verified_user)],
)


# ----------CREATE A NEW RELATION---------------
@relation_router.post("/")
def create_relation(
    data: RelationCreate,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    receiver = session.get(User, data.receiver_id)

    if not receiver or not receiver.is_verified:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receiver not found",
        )

    if receiver.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Connot follow yourself"
        )

    # check if the relation already exist
    existing_relation = session.exec(
        select(Relation).where(
            Relation.receiver_id == receiver.id, Relation.sender_id == current_user.id
        )
    ).one_or_none()

    if existing_relation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send this request",
        )

    # Create a new relation. By default status is 'pending'
    relation = Relation(sender_id=current_user.id, receiver_id=receiver.id)
    session.add(relation)
    session.commit()

    return {"success": True}


# ----------UPDATE FOLLOW REQUEST STATUS---------------
@relation_router.put("/{relation_id}", status_code=status.HTTP_202_ACCEPTED)
def accept_relation(
    relation_id: UUID,
    data: RelationUpdate,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    pending_relation = session.exec(
        select(Relation).where(
            Relation.id == relation_id,
            Relation.status == "pending",
            Relation.receiver_id == current_user.id,
        )
    ).one_or_none()

    if not pending_relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending relation not found",
        )

    new_status = data.status

    pending_relation.status = new_status

    session.add(pending_relation)
    session.commit()

    return {"success": True}


# ----------DELETE A RELATION---------------
@relation_router.delete("/{relation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relation(
    relation_id: UUID,
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    existing_relation = session.get(Relation, relation_id)

    if not existing_relation or existing_relation.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relation not found",
        )

    session.delete(existing_relation)
    session.commit()

    return {"success": True}


# ----------GET CONNECTED USER RELATIONSHIPS---------------
@relation_router.get("/")
def get_all_relations(
    current_user: Annotated[User, Depends(get_current_verified_user)],
    session: SessionDep,
):
    relations = session.exec(
        select(Relation).where(
            or_(
                Relation.sender_id == current_user.id,
                Relation.receiver_id == current_user.id,
            )
        )
    ).all()

    return relations
