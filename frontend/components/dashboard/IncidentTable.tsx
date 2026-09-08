import Link from "next/link";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { formatDate, formatLocationLabel } from "@/lib/format";
import type { IncidentPriority, IncidentStatus, Location } from "@/types";

export type IncidentTableRow = {
  id: number;
  incident_number: string;
  title: string;
  status: IncidentStatus;
  priority?: IncidentPriority | null;
  location?: Location;
  href: string;
  date: string;
};

type IncidentTableProps = {
  rows: IncidentTableRow[];
  emptyTitle: string;
  emptyDescription: string;
  showPriority?: boolean;
  dateLabel?: string;
};

export function IncidentTable({
  rows,
  emptyTitle,
  emptyDescription,
  showPriority = false,
  dateLabel = "Submitted",
}: IncidentTableProps) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-10">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-text-secondary">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border text-text-muted">
          <tr>
            <th className="px-6 py-3 font-medium">Incident ID</th>
            <th className="px-6 py-3 font-medium">Title</th>
            <th className="px-6 py-3 font-medium">Location</th>
            <th className="px-6 py-3 font-medium">Status</th>
            {showPriority ? <th className="px-6 py-3 font-medium">Priority</th> : null}
            <th className="px-6 py-3 font-medium">{dateLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-surface-hover/60">
              <td className="px-6 py-4 text-text-muted">{row.incident_number}</td>
              <td className="px-6 py-4">
                <Link href={row.href} className="font-medium text-foreground hover:text-primary">
                  {row.title}
                </Link>
              </td>
              <td className="px-6 py-4 text-text-secondary">
                {row.location ? formatLocationLabel(row.location) : "Not specified"}
              </td>
              <td className="px-6 py-4">
                <IncidentStatusBadge status={row.status} />
              </td>
              {showPriority ? (
                <td className="px-6 py-4">
                  <IncidentPriorityBadge priority={row.priority ?? null} />
                </td>
              ) : null}
              <td className="px-6 py-4 text-text-muted">{formatDate(row.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
