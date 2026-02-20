from fastapi import FastAPI, Request, Header
from .routes import (
    auth_router,
    user_router,
    relation_router,
    post_router,
    reply_router,
    profile_router,
)
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from .core.cors import get_cors_options
from pprint import pprint
from typing import Annotated

load_dotenv()

app = FastAPI()


# @app.middleware("http")
# async def show_headers(req: Request, call_next):
#     print("🎈Request from user agent ->", req.headers.get("user-agent", None))
#     print("Headers:", req.headers)
#     response = await call_next(req)
#     return response


app.add_middleware(CORSMiddleware, **get_cors_options())

# routing
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(relation_router)
app.include_router(post_router)
app.include_router(reply_router)
app.include_router(profile_router)
