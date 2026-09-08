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
  reporter?: string;
  category?: string;
  assignedTo?: string;
};

type IncidentTableProps = {
  rows: IncidentTableRow[];
  emptyTitle: string;
  emptyDescription: string;
  showPriority?: boolean;
  dateLabel?: string;
  showReporter?: boolean;
  showCategory?: boolean;
  showAssigned?: boolean;
};

export function IncidentTable({
  rows,
  emptyTitle,
  emptyDescription,
  showPriority = false,
  dateLabel = "Submitted",
  showReporter = false,
  showCategory = false,
  showAssigned = false,
}: IncidentTableProps) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-8 md:px-6 md:py-10">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-text-secondary">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            aria-label={`Review ${row.incident_number}: ${row.title}`}
            className="block px-4 py-4 no-underline hover:bg-surface-hover/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          >
            <p className="text-xs text-text-muted">{row.incident_number}</p>
            <p className="mt-1 font-medium text-foreground">{row.title}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {row.location ? formatLocationLabel(row.location) : "Not specified"}
            </p>
            {showReporter && row.reporter ? (
              <p className="mt-1 text-sm text-text-secondary">Reported by {row.reporter}</p>
            ) : null}
            {showCategory && row.category ? (
              <p className="mt-1 text-sm text-text-muted">{row.category}</p>
            ) : null}
            {showAssigned ? (
              <p className="mt-1 text-sm text-text-secondary">
                {row.assignedTo ? `Assigned to ${row.assignedTo}` : "Not assigned"}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <IncidentStatusBadge status={row.status} />
              {showPriority ? (
                <IncidentPriorityBadge priority={row.priority ?? null} />
              ) : null}
              <span className="text-xs text-text-muted">
                {dateLabel}: {formatDate(row.date)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
          <table className={`w-full text-left text-sm ${showAssigned ? "min-w-[760px]" : "min-w-[640px]"}`}>
          <thead className="border-b border-border text-text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Incident ID</th>
              <th className="px-6 py-3 font-medium">Title</th>
              {showReporter ? <th className="px-6 py-3 font-medium">Reporter</th> : null}
              {showCategory ? <th className="px-6 py-3 font-medium">Category</th> : null}
              {showAssigned ? <th className="px-6 py-3 font-medium">Assigned to</th> : null}
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Status</th>
              {showPriority ? <th className="px-6 py-3 font-medium">Priority</th> : null}
              <th className="px-6 py-3 font-medium">{dateLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-b-0 hover:bg-surface-hover/60"
              >
                <td className="px-6 py-4 text-text-muted">{row.incident_number}</td>
                <td className="px-6 py-4">
                  <Link href={row.href} className="font-medium text-foreground hover:text-primary">
                    {row.title}
                  </Link>
                </td>
                {showReporter ? (
                  <td className="px-6 py-4 text-text-secondary">{row.reporter || "Not listed"}</td>
                ) : null}
                {showCategory ? (
                  <td className="px-6 py-4 text-text-secondary">{row.category || "Not listed"}</td>
                ) : null}
                {showAssigned ? (
                  <td className="px-6 py-4 text-text-secondary">
                    {row.assignedTo || "Not assigned"}
                  </td>
                ) : null}
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
    </>
  );
}
