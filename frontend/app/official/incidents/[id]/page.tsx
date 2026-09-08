"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentMessages } from "@/components/incidents/IncidentMessages";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { OfficialProgressPanel } from "@/components/official/OfficialProgressPanel";
import { formatDate, formatLocationLabel } from "@/lib/format";
import { officialIncidentService } from "@/services/officialIncidents";
import type { OfficialIncident } from "@/types";

function OfficialIncidentDetailContent() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<OfficialIncident | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError("");
    void (async () => {
      try {
        const data = await officialIncidentService.getById(Number(params.id));
        if (!ignore) {
          setIncident(data);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load this assigned incident.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [params.id]);

  if (isLoading) {
    return <p className="py-16 text-sm text-text-secondary">Loading incident...</p>;
  }

  if (error || !incident) {
    return <p className="py-16 text-sm text-danger">{error}</p>;
  }

  return (
    <section className="py-10">
      <Link
        href="/official/dashboard"
        className="text-sm font-medium text-primary hover:text-primary-dark"
      >
        Back to assigned incidents
      </Link>

      <p className="mt-6 text-sm text-text-muted">{incident.incident_number}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 break-words text-[26px] font-semibold md:text-[32px]">{incident.title}</h1>
        <IncidentStatusBadge status={incident.status} />
        <IncidentPriorityBadge priority={incident.priority} />
      </div>
      <p className="mt-2 text-text-secondary">{formatLocationLabel(incident.location)}</p>
      <p className="text-sm text-text-secondary">{incident.category.name}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h3 className="text-[18px] font-semibold mb-2">Description</h3>
            <p className="break-words text-text-secondary whitespace-pre-wrap">{incident.description}</p>

            {incident.images.length > 0 ? (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-[18px] font-semibold mb-2">Evidence</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={incident.images[0].cloudinary_url}
                    alt={`Photo related to ${incident.title}`}
                  loading="lazy"
                  className="max-h-96 w-full rounded-md border border-border object-contain"
                />
              </div>
            ) : null}

            {incident.current_assignment?.comment ? (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-[18px] font-semibold mb-2">Assignment note</h3>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {incident.current_assignment.comment}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Assigned by {incident.current_assignment.assigned_by_name} on{" "}
                  {formatDate(incident.current_assignment.assigned_at)}
                </p>
              </div>
            ) : null}
          </div>

          <IncidentTimeline incident={incident} />
          <IncidentMessages incidentId={incident.id} />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <OfficialProgressPanel incident={incident} onUpdated={setIncident} />
        </div>
      </div>
    </section>
  );
}

export default function OfficialIncidentDetailPage() {
  return (
    <RequireAuth allowedRoles={["OFFICIAL"]}>
      <PageContainer width="app">
        <OfficialIncidentDetailContent />
      </PageContainer>
    </RequireAuth>
  );
}
