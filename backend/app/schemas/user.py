from sqlmodel import SQLModel, Field, DateTime
from pydantic import EmailStr, model_validator, field_validator
from uuid import UUID


class UserBase(SQLModel):
    username: str = Field(max_length=50)
    fullname: str = Field(index=True, max_length=50)
    email: EmailStr = Field(max_length=50)


class UserCreate(UserBase):
    password: str = Field(max_length=255)
    password_confirmation: str = Field(max_length=255)

    @field_validator("email", mode="after")
    @classmethod
    def email_rules(cls, email: str):
        if email.endswith("@tempmail.com"):
            raise ValueError("Temporary emails are not allowed.")
        return email

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.password_confirmation:
            raise ValueError("Passwords do not match.")

        return self


class UserUpdate(SQLModel):
    username: str = Field(max_length=50)
    fullname: str = Field(max_length=50)


class UserPublic(UserBase):
    id: UUID | None
    created_at: DateTime
