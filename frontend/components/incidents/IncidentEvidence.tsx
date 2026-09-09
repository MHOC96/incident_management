"use client";

import { useId, useRef, useState } from "react";
import type { IncidentImage } from "@/types";

type IncidentEvidenceProps = {
  images: IncidentImage[];
  title: string;
};

export function IncidentEvidence({ images, title }: IncidentEvidenceProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  if (images.length === 0) {
    return <p className="text-sm text-text-secondary">No photo was attached to this report.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] justify-items-center gap-3">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => {
            setSelectedIndex(index);
            dialogRef.current?.showModal();
          }}
          className="group relative w-full max-w-80 overflow-hidden rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label={`View full photo ${index + 1} related to ${title}`}
          aria-haspopup="dialog"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.cloudinary_url}
            alt={`Photo ${index + 1} related to ${title}`}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
          <span className="flex min-h-11 items-center justify-center bg-surface px-2 text-sm font-medium text-primary group-hover:underline">
            View photo {images.length > 1 ? index + 1 : ""}
          </span>
        </button>
      ))}
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-auto rounded-md border border-border bg-surface p-4 backdrop:bg-black/70"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={headingId} className="text-base font-semibold">Photo {selectedIndex + 1} of {images.length}</h2>
          <button type="button" onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-md border border-border px-4 text-sm font-medium">Close</button>
        </div>
        {selectedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selectedImage.cloudinary_url} alt={`Photo ${selectedIndex + 1} related to ${title}`} className="mx-auto block h-auto max-h-[65dvh] w-auto max-w-full object-contain" />
        ) : null}
        {images.length > 1 ? (
          <div className="mt-3 flex justify-between gap-3">
            <button type="button" disabled={selectedIndex === 0} onClick={() => setSelectedIndex((index) => index - 1)} className="min-h-11 rounded-md border border-border px-4 text-sm disabled:opacity-40">Previous</button>
            <button type="button" disabled={selectedIndex === images.length - 1} onClick={() => setSelectedIndex((index) => index + 1)} className="min-h-11 rounded-md border border-border px-4 text-sm disabled:opacity-40">Next</button>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
