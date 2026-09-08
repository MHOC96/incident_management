import type { ReactNode } from "react";

type IncidentSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function IncidentSection({
  title,
  description,
  children,
  className = "",
}: IncidentSectionProps) {
  return (
    <section className={`rounded-lg border border-border bg-surface p-4 md:p-6 ${className}`}>
      <h2 className="text-[18px] font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 mb-4 text-sm text-text-muted">{description}</p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </section>
  );
}
