"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDate, formatLocationLabel } from "@/lib/format";
import { incidentService } from "@/services/incidents";
import type { PublicIncident } from "@/types";

export default function PublicIncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<PublicIncident | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await incidentService.getPublic(Number(params.id));
        setIncident(data);
      } catch {
        setError("This incident could not be found or is not publicly visible.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params.id]);

  return (
    <PageContainer>
      <section className="py-10 max-w-3xl">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-1/4 rounded-sm bg-border" />
            <div className="h-8 w-2/3 rounded-sm bg-border" />
          </div>
        ) : error || !incident ? (
          <div role="status">
            <p className="text-sm text-danger">{error}</p>
            <Link
              href="/incidents"
              className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary-dark"
            >
              Back to public incidents
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted">{incident.incident_number}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-[32px] font-semibold">{incident.title}</h1>
              <IncidentStatusBadge status={incident.status} />
            </div>
            <p className="mt-2 text-text-secondary">
              {formatLocationLabel(incident.location)}
            </p>
            <p className="text-sm text-text-secondary">{incident.category.name}</p>

            <div className="mt-8 space-y-6 border-t border-border pt-8">
              <div>
                <h2 className="text-[18px] font-semibold mb-2">Description</h2>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>

              {incident.images.length > 0 ? (
                <div>
                  <h2 className="text-[18px] font-semibold mb-2">Incident photo</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={incident.images[0].cloudinary_url}
                    alt={`Photo related to ${incident.title}`}
                    className="max-h-96 rounded-lg border border-border object-contain"
                  />
                </div>
              ) : null}

              <IncidentTimeline incident={incident} />

              <p className="text-sm text-text-muted">
                Reported on {formatDate(incident.created_at)}
              </p>
            </div>
          </>
        )}

        {incident ? (
          <Link
            href="/incidents"
            className="mt-8 inline-flex text-sm font-medium text-primary hover:text-primary-dark"
          >
            Back to public incidents
          </Link>
        ) : null}
      </section>
    </PageContainer>
  );
}
