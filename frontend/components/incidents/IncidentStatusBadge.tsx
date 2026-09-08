import type { IncidentStatus } from "@/types";
import { getStatusClassName, getStatusLabel } from "@/lib/format";

type IncidentStatusBadgeProps = {
  status: IncidentStatus;
};

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium ${getStatusClassName(status)}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </span>
  );
}
