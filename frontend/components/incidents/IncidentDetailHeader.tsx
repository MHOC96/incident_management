import Link from "next/link";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import type { Category, IncidentPriority, IncidentStatus, Location } from "@/types";

type IncidentDetailHeaderProps = {
  backHref: string;
  backLabel: string;
  incidentNumber: string;
  title: string;
  status: IncidentStatus;
  priority?: IncidentPriority | null;
  location: Location;
  category: Category;
  summary?: string;
  showPriority?: boolean;
  showBorderBottom?: boolean;
};

function getHeaderLocation(location: Location): string {
  return location.name || location.building || location.faculty;
}

export function IncidentDetailHeader({
  backHref,
  backLabel,
  incidentNumber,
  title,
  status,
  priority,
  location,
  category,
  summary,
  showPriority = true,
  showBorderBottom = true,
}: IncidentDetailHeaderProps) {
  return (
    <header
      className={`pb-5 md:pb-6 ${showBorderBottom ? "border-b border-border" : ""}`}
    >
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:text-primary-dark"
      >
        {backLabel}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-text-muted">{incidentNumber}</p>
        <IncidentStatusBadge status={status} />
        {showPriority && priority ? (
          <IncidentPriorityBadge priority={priority} />
        ) : null}
      </div>

      <h1 className="mt-2 min-w-0 break-words text-[24px] font-semibold leading-tight md:text-[30px]">
        {title}
      </h1>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span>
          <span className="text-text-muted">Location </span>
          <span className="font-medium text-foreground">{getHeaderLocation(location)}</span>
        </span>
        <span>
          <span className="text-text-muted">Category </span>
          <span className="font-medium text-foreground">{category.name}</span>
        </span>
      </p>

      {summary ? (
        <p className="mt-4 max-w-3xl rounded-md border border-border bg-background px-4 py-3 text-sm text-text-secondary">
          {summary}
        </p>
      ) : null}
    </header>
  );
}
