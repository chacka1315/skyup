from fastapi import FastAPI
from .routes import auth_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# routing
app.include_router(auth_router)
