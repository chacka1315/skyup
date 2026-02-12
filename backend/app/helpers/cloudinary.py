from dotenv import load_dotenv

load_dotenv()

import cloudinary
import cloudinary.uploader as uploader
import cloudinary.api as cloudinary_api
from fastapi import UploadFile, HTTPException
from ..schemas import CloudinaryUploadResponse
from fastapi.concurrency import run_in_threadpool

cloudinary.config(secure=True)

ALLOWED_IMG_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
]

ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
]

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50 MB

ALLOWED_MEDIA_TYPES = ALLOWED_IMG_TYPES + ALLOWED_VIDEO_TYPES


def validate_media(
    file: UploadFile,
    allowed_types: list[str] = ALLOWED_MEDIA_TYPES,
):
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail=f"File type {file.content_type} not allowed. "
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    media_type = file.content_type.split("/")[0]

    if media_type == "video" and file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size for videos is { MAX_VIDEO_SIZE// (1024*1024)} MB",
        )
    elif file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size for images is { MAX_IMAGE_SIZE// (1024*1024)} MB",
        )


async def upload_to_cloudinary(
    file: UploadFile,
    folder: str,
) -> CloudinaryUploadResponse:
    try:
        options = {
            "folder": folder,
            "resource_type": "auto",
        }

        res = await run_in_threadpool(uploader.upload, file.file, **options)

        return CloudinaryUploadResponse(
            public_id=res["public_id"],
            url=res["secure_url"],
            media_type=res["resource_type"],
        )
    except Exception as err:
        raise HTTPException(
            status_code=500, detail=f"Failed to upload to the Cloud: {str(err)}"
        )
    finally:
        await file.close()


async def delete_from_cloudinary(public_id: str, media_type: str):
    try:
        await run_in_threadpool(
            uploader.destroy,
            public_id=public_id,
            resource_type=media_type,
            invalidate=True,
        )
    except Exception as err:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete asset from the Cloud: {str(err)}"
        )
