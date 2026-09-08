"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DeanAssignPanel } from "@/components/dean/DeanAssignPanel";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentMessages } from "@/components/incidents/IncidentMessages";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, formatLocationLabel } from "@/lib/format";
import { deanIncidentService } from "@/services/deanIncidents";
import type { DeanIncident } from "@/types";

function DeanIncidentDetailContent() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<DeanIncident | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await deanIncidentService.getById(Number(params.id));
        setIncident(data);
      } catch {
        setError("We couldn't load this incident.");
      } finally {
        setIsLoading(false);
      }
    })();
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
        href="/dean/dashboard"
        className="text-sm font-medium text-primary hover:text-primary-dark"
      >
        Back to overview
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-semibold">{incident.incident_number}</h1>
        <IncidentStatusBadge status={incident.status} />
        <IncidentPriorityBadge priority={incident.priority} />
      </div>
      <h2 className="mt-2 text-[22px] font-semibold">{incident.title}</h2>
      <p className="mt-2 text-text-secondary">{formatLocationLabel(incident.location)}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <div>
              <h3 className="text-[18px] font-semibold mb-2">Description</h3>
              <p className="text-text-secondary whitespace-pre-wrap">{incident.description}</p>
            </div>

            {incident.images.length > 0 ? (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-[18px] font-semibold mb-2">Evidence</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={incident.images[0].cloudinary_url}
                    alt={`Evidence for ${incident.incident_number}: ${incident.title}`}
                  className="max-h-96 rounded-md border border-border object-contain"
                />
              </div>
            ) : null}

            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-[18px] font-semibold mb-2">Reporter</h3>
              <p className="text-sm text-text-secondary">{incident.reporter.name}</p>
              <p className="text-sm text-text-secondary">{incident.reporter.email}</p>
              <p className="text-sm text-text-secondary">{incident.reporter.phone}</p>
            </div>

            {incident.current_assignment ? (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="text-[18px] font-semibold mb-2">Current assignment</h3>
                <p className="text-sm">{incident.current_assignment.assigned_official_name}</p>
                <p className="text-sm text-text-muted">
                  Assigned {formatDate(incident.current_assignment.assigned_at)}
                </p>
              </div>
            ) : null}
          </div>

          <IncidentTimeline incident={incident} />
          <IncidentMessages incidentId={incident.id} allowInternal />
        </div>

        <DeanAssignPanel incident={incident} onUpdated={setIncident} />
      </div>
    </section>
  );
}

export default function DeanIncidentDetailPage() {
  return (
    <RequireAuth allowedRoles={["DEAN"]}>
      <PageContainer width="app">
        <DeanIncidentDetailContent />
      </PageContainer>
    </RequireAuth>
  );
}
