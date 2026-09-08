import type { IncidentImage } from "@/types";

type IncidentEvidenceProps = {
  images: IncidentImage[];
  title: string;
};

export function IncidentEvidence({ images, title }: IncidentEvidenceProps) {
  if (images.length === 0) {
    return <p className="text-sm text-text-secondary">No photo was attached to this report.</p>;
  }

  return (
    <div className="grid gap-3">
      {images.map((image) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.id}
          src={image.cloudinary_url}
          alt={`Photo related to ${title}`}
          loading="lazy"
          className="max-h-80 w-full rounded-md border border-border bg-background object-contain md:max-h-96"
        />
      ))}
    </div>
  );
}
