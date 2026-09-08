"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { adminIncidentService } from "@/services/adminIncidents";
import type { AdminIncidentReview, AdminReviewStats } from "@/types";

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [pending, setPending] = useState<AdminIncidentReview[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [statsData, pendingData] = await Promise.all([
          adminIncidentService.getReviewStats(),
          adminIncidentService.listPendingReview(),
        ]);
        setStats(statsData);
        setPending(pendingData.results);
      } catch {
        setError("We couldn't load the admin review workspace.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <PageContainer width="app">
      <section className="py-10">
        <h1 className="text-[32px] font-semibold mb-2">Incident review</h1>
        <p className="text-text-secondary mb-8">Verify submitted reports before they reach the Dean.</p>

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
                { value: stats?.pending_verification ?? 0, label: "Pending verification" },
                { value: stats?.verified ?? 0, label: "Verified" },
                { value: stats?.forwarded_to_dean ?? 0, label: "Forwarded to Dean" },
                { value: stats?.rejected ?? 0, label: "Rejected" },
              ]}
            />

            <div className="border border-border bg-surface">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-[18px] font-semibold">Reports awaiting review</h2>
              </div>
              <IncidentTable
                rows={pending.map((incident) => ({
                  id: incident.id,
                  incident_number: incident.incident_number,
                  title: incident.title,
                  status: incident.status,
                  location: incident.location,
                  href: `/admin/incidents/${incident.id}`,
                  date: incident.created_at,
                }))}
                emptyTitle="No reports awaiting verification"
                emptyDescription="New student submissions will appear here for review."
              />
            </div>
          </>
        )}
      </section>
    </PageContainer>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </RequireAuth>
  );
}
