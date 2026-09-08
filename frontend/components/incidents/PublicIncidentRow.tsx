"use client";

import Link from "next/link";
import type { PublicIncident } from "@/types";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { formatDate, formatLocationLabel } from "@/lib/format";

type PublicIncidentRowProps = {
  incident: PublicIncident;
};

export function PublicIncidentRow({ incident }: PublicIncidentRowProps) {
  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block py-5 transition-colors hover:bg-surface-hover/60"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-muted">{incident.incident_number}</p>
          <h2 className="mt-1 break-words text-[18px] font-semibold text-foreground">{incident.title}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {formatLocationLabel(incident.location)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{incident.category.name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
          <IncidentStatusBadge status={incident.status} />
          <p className="text-sm text-text-muted">{formatDate(incident.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}
