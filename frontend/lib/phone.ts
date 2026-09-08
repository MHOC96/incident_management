import { isValidPhoneNumber } from "libphonenumber-js";

export const SRI_LANKA_COUNTRY_CODE = "+94";

export const SRI_LANKA_PHONE_ERROR_MESSAGE =
  "Enter a valid Sri Lankan mobile number.";

export function normalizeSriLankaPhone(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export function formatSriLankaPhoneInput(value: string | undefined) {
  if (!value) {
    return "";
  }

  const normalized = normalizeSriLankaPhone(value);
  if (!normalized.startsWith(SRI_LANKA_COUNTRY_CODE)) {
    return normalized;
  }

  const nationalDigits = normalized.slice(3).replace(/\D/g, "");
  const withoutLeadingZero = nationalDigits.startsWith("0")
    ? nationalDigits.slice(1)
    : nationalDigits;

  return withoutLeadingZero ? `${SRI_LANKA_COUNTRY_CODE}${withoutLeadingZero}` : "";
}

export function fromNationalInput(input: string) {
  const normalized = normalizeSriLankaPhone(input);

  if (normalized.startsWith(SRI_LANKA_COUNTRY_CODE)) {
    return formatSriLankaPhoneInput(normalized);
  }

  const digits = input.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  let national = digits;
  if (national.startsWith("94")) {
    national = national.slice(2);
  }
  if (national.startsWith("0")) {
    national = national.slice(1);
  }

  return national ? formatSriLankaPhoneInput(`${SRI_LANKA_COUNTRY_CODE}${national}`) : "";
}

export function toNationalDisplay(value: string) {
  const normalized = formatSriLankaPhoneInput(value);
  if (!normalized.startsWith(SRI_LANKA_COUNTRY_CODE)) {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      return digits.slice(1);
    }
    return digits;
  }

  return normalized.slice(3);
}

export function isValidSriLankaPhone(value: string) {
  const normalized = formatSriLankaPhoneInput(value);
  if (!normalized) {
    return false;
  }
  return isValidPhoneNumber(normalized, "LK");
}

export function getSriLankaPhoneError(value: string, required = true) {
  const normalized = formatSriLankaPhoneInput(value);

  if (!normalized) {
    return required ? "Contact number is required." : "";
  }

  if (!isValidPhoneNumber(normalized, "LK")) {
    return SRI_LANKA_PHONE_ERROR_MESSAGE;
  }

  return "";
}
