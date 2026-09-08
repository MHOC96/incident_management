"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { deanIncidentService } from "@/services/deanIncidents";
import type { DeanIncident, DeanStats } from "@/types";

function DeanDashboardContent() {
  const [stats, setStats] = useState<DeanStats | null>(null);
  const [awaiting, setAwaiting] = useState<DeanIncident[]>([]);
  const [resolved, setResolved] = useState<DeanIncident[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [statsData, awaitingData, resolvedData] = await Promise.all([
          deanIncidentService.getStats(),
          deanIncidentService.listAwaitingAction(),
          deanIncidentService.listResolvedAwaitingClosure(),
        ]);
        setStats(statsData);
        setAwaiting(awaitingData.results);
        setResolved(resolvedData.results);
      } catch {
        setError("We couldn't load the dean overview.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const priorityIncidents = useMemo(
    () =>
      [...awaiting, ...resolved].filter(
        (incident) => incident.priority === "HIGH" || incident.priority === "CRITICAL",
      ),
    [awaiting, resolved],
  );

  return (
    <PageContainer width="app">
      <section className="py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold mb-2">Faculty incident management</h1>
            <p className="text-text-secondary">Current situation</p>
          </div>
          <Link
            href="/dean/users"
            className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-surface-hover"
          >
            Manage officials
          </Link>
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
                { value: stats?.total_incidents ?? 0, label: "Total incidents" },
                { value: stats?.awaiting_action ?? 0, label: "Awaiting action" },
                { value: stats?.in_progress ?? 0, label: "In progress" },
                { value: stats?.resolved_awaiting_closure ?? 0, label: "Ready to close" },
              ]}
            />

            <div className="mb-8 border border-border bg-surface">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-[18px] font-semibold">Priority incidents</h2>
              </div>
              <IncidentTable
                showPriority
                rows={priorityIncidents.map((incident) => ({
                  id: incident.id,
                  incident_number: incident.incident_number,
                  title: incident.title,
                  status: incident.status,
                  priority: incident.priority,
                  location: incident.location,
                  href: `/dean/incidents/${incident.id}`,
                  date: incident.updated_at,
                }))}
                emptyTitle="No high or critical incidents"
                emptyDescription="High and critical incidents awaiting your attention will appear here."
                dateLabel="Updated"
              />
            </div>

            <div className="mb-8 border border-border bg-surface">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-[18px] font-semibold">Incidents awaiting assignment</h2>
              </div>
              <IncidentTable
                showPriority
                rows={awaiting.map((incident) => ({
                  id: incident.id,
                  incident_number: incident.incident_number,
                  title: incident.title,
                  status: incident.status,
                  priority: incident.priority,
                  location: incident.location,
                  href: `/dean/incidents/${incident.id}`,
                  date: incident.updated_at,
                }))}
                emptyTitle="No incidents awaiting assignment"
                emptyDescription="Verified incidents appear here after administrative review."
                dateLabel="Updated"
              />
            </div>

            <div className="border border-border bg-surface">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-[18px] font-semibold">Resolved, awaiting closure</h2>
              </div>
              <IncidentTable
                showPriority
                rows={resolved.map((incident) => ({
                  id: incident.id,
                  incident_number: incident.incident_number,
                  title: incident.title,
                  status: incident.status,
                  priority: incident.priority,
                  location: incident.location,
                  href: `/dean/incidents/${incident.id}`,
                  date: incident.updated_at,
                }))}
                emptyTitle="No resolved incidents awaiting closure"
                emptyDescription="Incidents marked resolved by officials will appear here for final review."
                dateLabel="Updated"
              />
            </div>
          </>
        )}
      </section>
    </PageContainer>
  );
}

export default function DeanDashboardPage() {
  return (
    <RequireAuth allowedRoles={["DEAN"]}>
      <DeanDashboardContent />
    </RequireAuth>
  );
}
