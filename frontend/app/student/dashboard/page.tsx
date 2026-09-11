"use client";

import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { LinkButton } from "@/components/ui/LinkButton";
import { incidentService } from "@/services/incidents";
import type { IncidentDetail, IncidentStatus } from "@/types";

const underReviewStatuses: IncidentStatus[] = ["SUBMITTED", "UNDER_REVIEW"];
const inProgressStatuses: IncidentStatus[] = [
  "VERIFIED",
  "FORWARDED_TO_DEAN",
  "ASSIGNED",
  "IN_PROGRESS",
];
const resolvedStatuses: IncidentStatus[] = ["RESOLVED", "CLOSED"];

function StudentDashboardContent() {
  const [incidents, setIncidents] = useState<IncidentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await incidentService.listMine();
        setIncidents(response.results);
      } catch {
        setError("We couldn't load your incidents.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(
    () => ({
      total: incidents.length,
      underReview: incidents.filter((item) =>
        underReviewStatuses.includes(item.status),
      ).length,
      inProgress: incidents.filter((item) =>
        inProgressStatuses.includes(item.status),
      ).length,
      resolved: incidents.filter((item) =>
        resolvedStatuses.includes(item.status),
      ).length,
    }),
    [incidents],
  );

  return (
    <PageContainer width="app">
      <section className="py-8 md:py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[26px] font-semibold md:text-[32px]">My reports</h1>
          <LinkButton href="/student/incidents/new" className="w-full shrink-0 sm:w-auto">
            Report an incident
          </LinkButton>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 border border-border bg-surface" />
            <div className="h-40 border border-border bg-surface" />
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <>
            <StatsStrip
              items={[
                { value: stats.total, label: "Total reports" },
                { value: stats.underReview, label: "Under review" },
                { value: stats.inProgress, label: "In progress" },
                { value: stats.resolved, label: "Resolved" },
              ]}
            />

            {incidents.length === 0 ? (
              <div className="border border-border bg-surface px-4 py-8 md:px-6 md:py-10">
                <p className="text-text-secondary mb-4">
                  You haven&apos;t reported any incidents yet.
                </p>
                <LinkButton href="/student/incidents/new" className="w-full sm:w-auto">
                  Report new incident
                </LinkButton>
              </div>
            ) : (
              <div className="border border-border bg-surface">
                <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                  <h2 className="text-[18px] font-semibold">Recent reports</h2>

                </div>
                <IncidentTable
                  rows={incidents.map((incident) => ({
                    id: incident.id,
                    incident_number: incident.incident_number,
                    title: incident.title,
                    status: incident.status,
                    location: incident.location,
                    href: `/student/incidents/${incident.id}`,
                    date: incident.created_at,
                  }))}
                  emptyTitle="You haven't reported any incidents yet."
                  emptyDescription="Submit a report when you notice a problem on campus."
                  showIncidentNumber={false}
                />
              </div>
            )}
          </>
        )}
      </section>
    </PageContainer>
  );
}

export default function StudentDashboardPage() {
  return (
    <RequireAuth allowedRoles={["STUDENT"]}>
      <StudentDashboardContent />
    </RequireAuth>
  );
}
