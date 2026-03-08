from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()
env = os.getenv("PY_ENV")

if env is None:
    raise ValueError("Unknown environment, specify a PY_ENV!")

env_file_map = {"dev": ".env", "test": ".env.test"}


class Settings(BaseSettings):
    PY_ENV: Literal["dev", "test", "prod"] = "dev"
    DATABASE_URL: str
    ACCESS_TOKEN_SECRET: str
    REFRESH_TOKEN_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    TOKEN_ALGORITHM: str
    EMAIL_VERIFICATION_MINUTES: int
    MAIL_USERNAME: str
    MAIL_FROM: str
    MAIL_FROM_NAME: str
    MAIL_PASSWORD: str
    MAIL_PORT: int
    MAIL_SERVER: str
    TEST_MAIL_USERNAME: str | None = None
    TEST_MAIL_SERVER: str | None = None
    TEST_MAIL_PASSWORD: str | None = None

    model_config = SettingsConfigDict(env_file=env_file_map.get(env), extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
