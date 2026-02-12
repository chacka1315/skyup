from typing import Dict, Any
from fastapi_mail import MessageSchema, MessageType
from starlette.responses import JSONResponse
from ..core.email import mail
from datetime import datetime

# TODO: Refactor the email sending helpers in to one single helper.


async def send_email_verification(user_email: str, user_name: str, code: str):
    template_data = {
        "app_name": "SkyUp",
        "user_name": user_name,
        "verification_code": code,
        "year": datetime.now().year,
    }

    message = MessageSchema(
        recipients=[user_email],
        subject="SkyUp email verification",
        template_body=template_data,
        subtype=MessageType.html,
    )

    try:
        await mail.send_message(message=message, template_name="verification.html")
        return {"status": "success", "message": "Email sent"}
    except Exception as err:
        return {"status": "error", "message": str(err)}


async def send_email_welcome(user_email: str, user_name: str):
    template_data = {
        "app_name": "SkyUp",
        "user_name": user_name,
        "year": datetime.now().year,
    }

    message = MessageSchema(
        recipients=[user_email],
        subject="Welcome to SkyUp",
        template_body=template_data,
        subtype=MessageType.html,
    )

    try:
        await mail.send_message(message=message, template_name="welcome.html")
        return {"status": "success", "message": "Email sent"}
    except Exception as err:
        return {"status": "error", "message": str(err)}
