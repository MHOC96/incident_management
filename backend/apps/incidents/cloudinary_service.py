import os

import cloudinary
import cloudinary.uploader
from django.conf import settings
from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def configure_cloudinary() -> None:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


def validate_image_file(uploaded_file) -> None:
    content_type = getattr(uploaded_file, "content_type", "")
    if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed.")

    filename = getattr(uploaded_file, "name", "") or ""
    _, extension = os.path.splitext(filename.lower())
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed.")

    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError("Image must be 5 MB or smaller.")

    uploaded_file.seek(0)
    image_format = None
    try:
        with Image.open(uploaded_file) as image:
            image_format = image.format
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValidationError("The uploaded file is not a valid image.") from exc
    finally:
        uploaded_file.seek(0)

    if image_format not in ALLOWED_IMAGE_FORMATS:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed.")


def upload_incident_image(uploaded_file, incident_number: str) -> dict:
    configure_cloudinary()
    validate_image_file(uploaded_file)

    return cloudinary.uploader.upload(
        uploaded_file,
        folder=f"incident-management/{incident_number}",
        resource_type="image",
        overwrite=False,
    )
