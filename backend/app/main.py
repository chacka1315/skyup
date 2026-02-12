from fastapi import FastAPI
from .routes import (
    auth_router,
    user_router,
    relation_router,
    post_router,
    reply_router,
    profile_router,
)
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# routing
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(relation_router)
app.include_router(post_router)
app.include_router(reply_router)
app.include_router(profile_router)
