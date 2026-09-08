import re

SRI_LANKA_PHONE_PATTERN = re.compile(r"^\+94[1-9]\d{8}$")

SRI_LANKA_PHONE_ERROR_MESSAGE = (
    "Enter a valid Sri Lankan contact number starting with +94 (e.g. +94771234567)."
)


def normalize_sri_lanka_phone(value: str) -> str:
    return value.strip().replace(" ", "")


def is_valid_sri_lanka_phone(value: str) -> bool:
    if not value:
        return False
    return bool(SRI_LANKA_PHONE_PATTERN.match(normalize_sri_lanka_phone(value)))


def validate_sri_lanka_phone(value: str, *, required: bool = True) -> str:
    normalized = normalize_sri_lanka_phone(value)

    if not normalized:
        if required:
            raise ValueError("Contact number is required.")
        return ""

    if not SRI_LANKA_PHONE_PATTERN.match(normalized):
        raise ValueError(SRI_LANKA_PHONE_ERROR_MESSAGE)

    return normalized
