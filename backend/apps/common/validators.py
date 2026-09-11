import re

SRI_LANKA_PHONE_PATTERN = re.compile(r"^\+94[1-9]\d{8}$")
MC_NUMBER_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9\-\/]{2,49}$")

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


def normalize_mc_number(value: str) -> str:
    return str(value).strip().upper().replace(" ", "")


def validate_mc_number(value: str) -> str:
    normalized = normalize_mc_number(value)
    if not normalized:
        raise ValueError("MC number is required.")
    if not MC_NUMBER_PATTERN.match(normalized):
        raise ValueError("Enter a valid university MC number.")
    return normalized


def validate_account_password(value: str) -> str:
    password = value.strip() if isinstance(value, str) else ""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must include an uppercase letter.")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must include a lowercase letter.")
    if not re.search(r"\d", password):
        raise ValueError("Password must include a number.")
    return password
