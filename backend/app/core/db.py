from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

if DB_URL is None:
    raise Exception("❌ No DATABASE_URL for this env.")

# Avoid reusing stale idle connections (common with managed Postgres + SSL).
engine = create_engine(
    url=DB_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_timeout=30,
)
