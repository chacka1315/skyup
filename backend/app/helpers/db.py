from sqlmodel import Session
from uuid_utils import uuid7
from uuid import UUID


# generate an uuid v7 for the sql tables
def generate_uuid7() -> UUID:
    return UUID(str(uuid7()))


def refresh_all(session: Session, *instances) -> None:
    for instance in instances:
        session.refresh(instance)


def save_instance(instance, session):
    session.add(instance)
    session.flush()
