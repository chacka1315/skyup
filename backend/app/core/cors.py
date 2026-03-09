from .config import settings
import os
from dotenv import load_dotenv

load_dotenv()


def get_cors_options():
    env = settings.PY_ENV

    if env == "prod":
        origins = []
        web_page_url = os.getenv("WEB_PAGE_URL")

        if web_page_url:
            origins.append(web_page_url)
        else:
            print("⚠️No web page url provided for prod.")

    elif env == "dev":
        origins = [
            "http://localhost:3000",
        ]
    else:
        raise Exception("⚠️ No cors options defined for this environnment!")

    cors_options = {
        "allow_origins": origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    return cors_options
