from sqlmodel import Session


def refresh_all(session: Session, *instances) -> None:
    for instance in instances:
        session.refresh(instance)


def save_instance(instance, session):
    session.add(instance)
    session.flush()
