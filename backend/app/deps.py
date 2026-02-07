from uuid_utils import uuid7
from uuid import UUID
from .core.db import engine
from typing import Annotated
from sqlmodel import Session
from fastapi import Depends


# generate an uuid v7 for the sql tables
def generate_uuid7() -> UUID:
    return UUID(str(uuid7()))


# provide session instance to query the db
def get_sesssion():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_sesssion)]

# Verify code for email verification
