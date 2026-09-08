import { ApiClientError } from "@/lib/api";
import type { ApiError } from "@/types";

export function formatApiError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!(error instanceof ApiClientError)) {
    return fallback;
  }

  const { payload } = error;

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload.detail)) {
    return (payload.detail as unknown[]).map(String).join(" ");
  }

  const fieldMessages = Object.entries(payload)
    .filter(([key]) => key !== "detail")
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((message) => `${field}: ${String(message)}`);
      }
      return [`${field}: ${String(value)}`];
    });

  if (fieldMessages.length > 0) {
    return fieldMessages.join(" ");
  }

  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};
  const payload = error.payload as ApiError;

  for (const [field, value] of Object.entries(payload)) {
    if (field === "detail") {
      continue;
    }
    if (Array.isArray(value) && value.length > 0) {
      fieldErrors[field] = String(value[0]);
    } else if (typeof value === "string") {
      fieldErrors[field] = value;
    }
  }

  return fieldErrors;
}
