from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal
from functools import lru_cache
from dotenv import load_dotenv
import os

load_dotenv()

env = os.getenv("PY_ENV")
env_file: str

if env is None:
    raise ("Unknown invironement, specify a PY_ENV!")


if env == "prod":
    env_file = ".env.prod"
elif env == "test":
    env_file = ".env.test"
else:
    env_file = ".env"


class Settings(BaseSettings):
    PY_ENV: Literal["dev", "test", "prod"] = "dev"

    # Database
    DATABASE_URL: str

    # Authentication screts
    ACCESS_TOKEN_SECRET: str
    REFRESH_TOKEN_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    TOKEN_ALGORITHM: str

    # Mailing
    EMAIL_VERIFICATION_MINUTES: int
    MAIL_USERNAME: str
    MAIL_FROM: str
    MAIL_FROM_NAME: str
    MAIL_PASSWORD: str
    MAIL_PORT: int
    MAIL_SERVER: str

    # For catching mails in dev
    TEST_MAIL_USERNAME: str | None
    TEST_MAIL_FROM: str | None
    TEST_MAIL_FROM_NAME: str | None
    TEST_MAIL_PASSWORD: str | None

    model_config = SettingsConfigDict(env_file=env_file, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
