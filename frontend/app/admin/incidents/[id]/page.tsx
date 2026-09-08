"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentMessages } from "@/components/incidents/IncidentMessages";
import { IncidentPriorityBadge } from "@/components/incidents/IncidentPriorityBadge";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, formatLocationLabel } from "@/lib/format";
import { adminIncidentService } from "@/services/adminIncidents";
import type { AdminIncidentReview } from "@/types";

function AdminIncidentReviewContent() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<AdminIncidentReview | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await adminIncidentService.getForReview(Number(params.id));
        setIncident(data);
      } catch {
        setError("We couldn't load this incident for review.");
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

  const isReviewComplete =
    incident.status !== "SUBMITTED" && incident.status !== "UNDER_REVIEW";

  return (
    <section className="py-10">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          Back to review queue
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-semibold">Incident review</h1>
        <IncidentStatusBadge status={incident.status} />
        <IncidentPriorityBadge priority={incident.priority} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="text-sm text-text-muted">{incident.incident_number}</p>
            <h2 className="mt-2 text-[22px] font-semibold">{incident.title}</h2>
            <p className="mt-2 text-text-secondary">
              {formatLocationLabel(incident.location)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">{incident.category.name}</p>

            <div className="mt-6 border-t border-border pt-6">
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
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-[18px] font-semibold mb-4">Reporter information</h3>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-text-muted">Name</dt>
                <dd className="font-medium">{incident.reporter.name}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Email</dt>
                <dd className="font-medium">{incident.reporter.email}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Phone</dt>
                <dd className="font-medium">{incident.reporter.phone}</dd>
              </div>
              <div>
                <dt className="text-text-muted">MC number</dt>
                <dd className="font-medium">{incident.reporter.mc_number}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Department</dt>
                <dd className="font-medium">{incident.reporter.department}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Submitted</dt>
                <dd className="font-medium">{formatDate(incident.created_at)}</dd>
              </div>
            </dl>
          </div>

          <IncidentTimeline incident={incident} />
          <IncidentMessages
            incidentId={incident.id}
            allowInternal
            readOnly={isReviewComplete}
          />
        </div>

        <AdminReviewActions incident={incident} onUpdated={setIncident} />
      </div>
    </section>
  );
}

export default function AdminIncidentReviewPage() {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <PageContainer width="app">
        <AdminIncidentReviewContent />
      </PageContainer>
    </RequireAuth>
  );
}
