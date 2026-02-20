from .config import settings


def get_cors_options():
    env = settings.PY_ENV

    if env == "prod":
        origins = ["https://myapp.com"]
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
