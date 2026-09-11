"use client";

import Link from "next/link";
import type { PublicIncident } from "@/types";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentVoteButton } from "@/components/incidents/IncidentVoteButton";
import { formatDate, formatLocationLabel } from "@/lib/format";
import type { IncidentVoteResult } from "@/types";

type PublicIncidentRowProps = {
  incident: PublicIncident;
  onVoteChange: (incidentId: number, result: IncidentVoteResult) => void;
};

export function PublicIncidentRow({ incident, onVoteChange }: PublicIncidentRowProps) {
  return (
    <article className="public-incident-row py-5 transition-colors hover:bg-surface-hover/60">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="public-incident-title break-words text-[18px] font-semibold text-foreground">
            <Link href={`/incidents/${incident.id}`} className="hover:text-primary hover:underline">
              {incident.title}
            </Link>
            <IncidentStatusBadge status={incident.status} />
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {formatLocationLabel(incident.location)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{incident.category.name}</p>
        </div>
        <div className="public-incident-row-meta shrink-0">
          <p className="hidden whitespace-nowrap text-sm text-text-muted sm:block">
            {formatDate(incident.created_at)}
          </p>
          <IncidentVoteButton
            incidentId={incident.id}
            voteCount={incident.vote_count}
            hasUpvoted={incident.user_has_upvoted}
            onChange={(result) => onVoteChange(incident.id, result)}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end sm:hidden">
        <p className="text-sm text-text-muted">{formatDate(incident.created_at)}</p>
      </div>
    </article>
  );
}
