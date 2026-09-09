"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type ImageUploadProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export function ImageUpload({ file, onChange, error }: ImageUploadProps) {
  const [localError, setLocalError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    setLocalError("");

    if (!selected) {
      onChange(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setLocalError("Only JPEG, PNG, and WebP images are allowed.");
      onChange(null);
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setLocalError("Image must be 5 MB or smaller.");
      onChange(null);
      return;
    }

    onChange(selected);
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-surface p-4">
        {previewUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Incident evidence preview"
              className="max-h-64 w-full rounded-md border border-border object-contain"
            />
            <p className="break-all text-sm text-text-secondary">{file?.name}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onChange(null)}
            >
              Remove photo
            </Button>
          </div>
        ) : (
          <label className="upload-target flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 py-6 text-center md:min-h-40">
            <span className="text-sm font-medium text-foreground">Choose a photo</span>
            <span className="text-sm text-text-muted">JPEG, PNG, or WebP up to 5 MB</span>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
            <span className="mt-2 inline-flex h-11 min-h-11 items-center rounded-md border border-border px-4 text-sm">
              Choose photo
            </span>
          </label>
        )}
      </div>
      {localError || error ? (
        <p role="alert" className="mt-2 text-sm text-danger">{localError || error}</p>
      ) : null}
    </div>
  );
}
