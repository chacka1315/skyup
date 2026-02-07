from sqlmodel import SQLModel, Field, Date, Column
from datetime import date
from pydantic import UUID7


class EmailVerificationCreate(SQLModel):
    user_id: UUID7
    code: str = Field(max_length=6, min_length=6)
