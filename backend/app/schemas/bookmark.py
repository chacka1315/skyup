from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class BookmarkPublic(BaseModel):
    id: UUID
    post_id: UUID
    owner_id: UUID
