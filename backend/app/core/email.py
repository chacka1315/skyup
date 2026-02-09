from fastapi_mail import FastMail, ConnectionConfig
from pydantic import EmailStr, BaseModel
from typing import List
from .config import settings
from pathlib import Path

BASE_DIR = Path(__file__).resolve()


class EmailSchema(BaseModel):
    email: List[EmailStr]


mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=BASE_DIR.parent.parent / "templates" / "emails",
)

test_mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.TEST_MAIL_USERNAME,
    MAIL_PASSWORD=settings.TEST_MAIL_PASSWORD,
    MAIL_PORT=587,
    MAIL_SERVER="sandbox.smtp.mailtrap.io",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    TEMPLATE_FOLDER=BASE_DIR.parent.parent / "templates" / "emails",
)

mail = (
    FastMail(config=mail_config)
    if settings.PY_ENV == "prod"
    else FastMail(config=test_mail_config)
)
