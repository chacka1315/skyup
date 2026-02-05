from uuid_utils import uuid7
from uuid import UUID


def generate_uuid7() -> UUID:
    return UUID(str(uuid7()))
