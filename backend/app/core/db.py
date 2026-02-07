from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

if DB_URL is None:
    raise Exception("❌ No DATABASE_URL for this env.")

engine = create_engine(url=DB_URL)
