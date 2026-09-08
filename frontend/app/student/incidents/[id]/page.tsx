"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentMessages } from "@/components/incidents/IncidentMessages";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, formatLocationLabel, getVisibilityLabel } from "@/lib/format";
import { incidentService } from "@/services/incidents";
import type { StudentIncident } from "@/types";

function StudentIncidentDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [incident, setIncident] = useState<StudentIncident | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await incidentService.getById(Number(params.id));
        setIncident(data);
      } catch {
        setError("We couldn't load this incident.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  if (isLoading) {
    return (
      <PageContainer width="app">
        <p className="py-16 text-sm text-text-secondary">Loading incident...</p>
      </PageContainer>
    );
  }

  if (error || !incident) {
    return (
      <PageContainer width="app">
        <p className="py-16 text-sm text-danger">{error || "Incident not found."}</p>
      </PageContainer>
    );
  }

  const canMessage =
    incident.status !== "CLOSED" && incident.status !== "REJECTED";

  return (
    <PageContainer width="app">
      <section className="py-10">
        {searchParams.get("submitted") ? (
          <p className="mb-6 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
            Incident submitted successfully.
          </p>
        ) : null}

        <Link
          href="/student/dashboard"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          Back to dashboard
        </Link>

        <p className="mt-6 text-sm text-text-muted">{incident.incident_number}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[32px] font-semibold">{incident.title}</h1>
          <IncidentStatusBadge status={incident.status} />
          <IncidentPriorityBadge priority={incident.priority} />
        </div>
        <p className="mt-2 text-text-secondary">
          {formatLocationLabel(incident.location)}
        </p>
        <p className="text-sm text-text-secondary">{incident.category.name}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-[18px] font-semibold mb-2">Description</h2>
              <p className="text-text-secondary whitespace-pre-wrap">{incident.description}</p>

              {incident.images.length > 0 ? (
                <div className="mt-6 border-t border-border pt-6">
                  <h2 className="text-[18px] font-semibold mb-2">Evidence</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={incident.images[0].cloudinary_url}
                  alt={`Photo related to ${incident.title}`}
                    className="max-h-96 rounded-lg border border-border object-contain"
                  />
                </div>
              ) : null}
            </div>

            {canMessage ? (
              <IncidentMessages incidentId={incident.id} />
            ) : (
              <IncidentMessages incidentId={incident.id} readOnly />
            )}
          </div>

          <div className="space-y-6">
            <IncidentTimeline incident={incident} />

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-[18px] font-semibold mb-4">Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-text-muted">Submitted</dt>
                  <dd className="font-medium">{formatDate(incident.created_at)}</dd>
                </div>
                {incident.verified_at ? (
                  <div>
                    <dt className="text-text-muted">Verified</dt>
                    <dd className="font-medium">{formatDate(incident.verified_at)}</dd>
                  </div>
                ) : null}
                {incident.current_assignment ? (
                  <div>
                    <dt className="text-text-muted">Assigned to</dt>
                    <dd className="font-medium">
                      {incident.current_assignment.assigned_official_name}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-text-muted">Visibility</dt>
                  <dd className="font-medium">{getVisibilityLabel(incident.visibility)}</dd>
                </div>
                {incident.resolved_at ? (
                  <div>
                    <dt className="text-text-muted">Resolved</dt>
                    <dd className="font-medium">{formatDate(incident.resolved_at)}</dd>
                  </div>
                ) : null}
                {incident.closed_at ? (
                  <div>
                    <dt className="text-text-muted">Closed</dt>
                    <dd className="font-medium">{formatDate(incident.closed_at)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

export default function StudentIncidentDetailPage() {
  return (
    <RequireAuth allowedRoles={["STUDENT"]}>
      <StudentIncidentDetailContent />
    </RequireAuth>
  );
}
