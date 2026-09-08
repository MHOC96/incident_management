import type { ReactNode } from "react";

export type IncidentMetaItem = {
  label: string;
  value: ReactNode;
};

type IncidentMetaGridProps = {
  items: IncidentMetaItem[];
};

export function IncidentMetaGrid({ items }: IncidentMetaGridProps) {
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-text-muted">{item.label}</dt>
          <dd className="mt-0.5 break-words font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
