"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { officialIncidentService } from "@/services/officialIncidents";
import type { OfficialIncident, OfficialStats } from "@/types";

function OfficialDashboardContent() {
  const [stats, setStats] = useState<OfficialStats | null>(null);
  const [incidents, setIncidents] = useState<OfficialIncident[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [statsData, assignedData] = await Promise.all([
          officialIncidentService.getStats(),
          officialIncidentService.listAssigned(),
        ]);
        setStats(statsData);
        setIncidents(assignedData.results);
      } catch {
        setError("We couldn't load your assigned incidents.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <PageContainer width="app">
      <section className="py-8 md:py-10">
        <h1 className="mb-2 text-[26px] font-semibold md:text-[32px]">Assigned incidents</h1>
        <p className="text-text-secondary mb-8">Your official workspace</p>

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
                { value: stats?.assigned ?? 0, label: "Awaiting start" },
                { value: stats?.in_progress ?? 0, label: "In progress" },
                { value: stats?.resolved ?? 0, label: "Resolved" },
                { value: stats?.total_assigned ?? 0, label: "Total assigned" },
              ]}
            />

            <div className="border border-border bg-surface">
              <div className="border-b border-border px-4 py-4 md:px-6">
                <h2 className="text-[18px] font-semibold">Assigned to me</h2>
              </div>
              <IncidentTable
                showPriority
                rows={incidents.map((incident) => ({
                  id: incident.id,
                  incident_number: incident.incident_number,
                  title: incident.title,
                  status: incident.status,
                  priority: incident.priority,
                  location: incident.location,
                  href: `/official/incidents/${incident.id}`,
                  date: incident.updated_at,
                }))}
                emptyTitle="No incidents are currently assigned to you"
                emptyDescription="Check back when the Dean assigns work to you."
                dateLabel="Updated"
              />
            </div>
          </>
        )}
      </section>
    </PageContainer>
  );
}

export default function OfficialDashboardPage() {
  return (
    <RequireAuth allowedRoles={["OFFICIAL"]}>
      <OfficialDashboardContent />
    </RequireAuth>
  );
}
