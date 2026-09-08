import cloudinary
import cloudinary.uploader
from django.conf import settings
from rest_framework.exceptions import ValidationError

ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
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

    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError("Image must be 5 MB or smaller.")


def upload_incident_image(uploaded_file, incident_number: str) -> dict:
    configure_cloudinary()
    validate_image_file(uploaded_file)

    return cloudinary.uploader.upload(
        uploaded_file,
        folder=f"incident-management/{incident_number}",
        resource_type="image",
        overwrite=False,
    )
