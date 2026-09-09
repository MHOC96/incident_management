"use client";
import { DetailJumpLinks } from "@/components/incidents/DetailJumpLinks";


import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentDetailHeader } from "@/components/incidents/IncidentDetailHeader";
import { IncidentEvidence } from "@/components/incidents/IncidentEvidence";
import { IncidentMessages } from "@/components/incidents/IncidentMessages";
import { IncidentMetaGrid } from "@/components/incidents/IncidentMetaGrid";
import { IncidentPageSkeleton, IncidentPageState } from "@/components/incidents/IncidentPageState";
import { IncidentSection } from "@/components/incidents/IncidentSection";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate } from "@/lib/format";
import { adminIncidentService } from "@/services/adminIncidents";
import type { AdminIncidentReview } from "@/types";

function AdminIncidentReviewContent() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<AdminIncidentReview | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError("");
    void (async () => {
      try {
        const data = await adminIncidentService.getForReview(Number(params.id));
        if (!ignore) {
          setIncident(data);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load this incident for review.");
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
    return <IncidentPageSkeleton />;
  }

  if (error || !incident) {
    return (
      <IncidentPageState
        message={error || "This incident could not be found."}
        tone="danger"
      />
    );
  }

  const isReviewComplete =
    incident.status !== "SUBMITTED" && incident.status !== "UNDER_REVIEW";

  return (
    <section className="py-6 md:py-10">
      <IncidentDetailHeader
        backHref="/admin/dashboard"
        backLabel="Back to review queue"
        incidentNumber={incident.incident_number}
        title={incident.title}
        status={incident.status}
        priority={incident.priority}
        location={incident.location}
        category={incident.category}
      />

      <DetailJumpLinks actions /><div className="detail-layout">
        <div className="detail-body">
          <IncidentSection title="Description">
            <p className="break-words whitespace-pre-wrap text-text-secondary">
              {incident.description}
            </p>
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Evidence</h3>
              <IncidentEvidence images={incident.images} title={incident.title} />
            </div>
          </IncidentSection>

          <IncidentSection title="Reporter information">
            <IncidentMetaGrid
              items={[
                { label: "Name", value: incident.reporter.name },
                { label: "Email", value: incident.reporter.email },
                { label: "Phone", value: incident.reporter.phone },
                { label: "MC number", value: incident.reporter.mc_number },
                { label: "Submitted", value: formatDate(incident.created_at) },
              ]}
            />
          </IncidentSection>

          <IncidentTimeline incident={incident} />

          <IncidentMessages
            incidentId={incident.id}
            allowInternal
            readOnly={isReviewComplete}
          />
        </div>

        <aside id="incident-actions" tabIndex={-1} className="detail-actions">
          <AdminReviewActions incident={incident} onUpdated={setIncident} />
        </aside>
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
