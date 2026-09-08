"use client";

import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { adminIncidentService } from "@/services/adminIncidents";
import type { AdminIncidentReview, AdminReviewStats } from "@/types";

type StatusFilter = "ALL" | "SUBMITTED" | "UNDER_REVIEW";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
];

function AdminDashboardLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 md:space-y-8" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 border border-border bg-surface p-4 sm:gap-6 sm:p-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-7 w-12 bg-border" />
            <div className="h-4 w-28 max-w-full bg-border" />
          </div>
        ))}
      </div>
      <div className="border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="h-5 w-52 max-w-full bg-border" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-11 w-24 bg-border" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 px-4 py-4 md:px-6 md:py-5">
              <div className="h-3 w-24 bg-border" />
              <div className="h-4 w-3/4 max-w-md bg-border" />
              <div className="h-3 w-1/2 max-w-xs bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [pending, setPending] = useState<AdminIncidentReview[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    void (async () => {
      const [statsResult, pendingResult] = await Promise.allSettled([
        adminIncidentService.getReviewStats(),
        adminIncidentService.listPendingReview(),
      ]);

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      }

      if (pendingResult.status === "fulfilled") {
        setPending(pendingResult.value.results);
      }

      if (statsResult.status === "rejected" && pendingResult.status === "rejected") {
        setError("We couldn't load the admin review workspace.");
      } else if (statsResult.status === "rejected") {
        setError("Summary counts are temporarily unavailable. The review queue is shown below.");
      } else if (pendingResult.status === "rejected") {
        setError("We couldn't load the reports awaiting review.");
      }

      setIsLoading(false);
    })();
  }, []);

  const filteredPending = useMemo(() => {
    if (statusFilter === "ALL") {
      return pending;
    }
    return pending.filter((incident) => incident.status === statusFilter);
  }, [pending, statusFilter]);

  const attentionMessage =
    pending.length === 1
      ? "1 report waiting for verification."
      : `${pending.length} reports waiting for verification.`;

  const emptyTitle =
    statusFilter === "ALL"
      ? "No reports awaiting verification"
      : statusFilter === "SUBMITTED"
        ? "No submitted reports in the queue"
        : "No reports currently under review";

  const emptyDescription =
    statusFilter === "ALL"
      ? "New student submissions will appear here for review."
      : "Try another filter or check back when new reports are submitted.";

  const tableRows = filteredPending.map((incident) => ({
    id: incident.id,
    incident_number: incident.incident_number,
    title: incident.title,
    status: incident.status,
    location: incident.location,
    href: `/admin/incidents/${incident.id}`,
    date: incident.created_at,
    reporter: incident.reporter.name,
    category: incident.category.name,
  }));

  return (
    <PageContainer width="app">
      <section className="py-6 md:py-10">
        <header className="mb-6 md:mb-8">
          <h1 className="text-[26px] font-semibold md:text-[32px]">Incident review</h1>
          <p className="mt-2 text-text-secondary">
            Verify submitted reports before they reach the Dean.
          </p>
          {!isLoading && pending.length > 0 ? (
            <p className="mt-3 text-sm font-medium text-foreground">{attentionMessage}</p>
          ) : null}
        </header>

        {isLoading ? (
          <AdminDashboardLoadingSkeleton />
        ) : error && pending.length === 0 && !stats ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <>
            {error ? (
              <p
                className="mb-4 rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-sm text-warning"
                role="status"
              >
                {error}
              </p>
            ) : null}

            <StatsStrip
              items={[
                { value: stats?.pending_verification ?? 0, label: "Pending verification" },
                { value: stats?.verified ?? 0, label: "Verified" },
                { value: stats?.forwarded_to_dean ?? 0, label: "Forwarded to Dean" },
                { value: stats?.rejected ?? 0, label: "Rejected" },
              ]}
            />

            <div className="border border-border bg-surface">
              <div className="flex flex-col gap-4 border-b border-border px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <h2 className="text-[18px] font-semibold">Reports awaiting review</h2>
                  {pending.length > 0 ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {filteredPending.length === pending.length
                        ? `${pending.length} in queue`
                        : `${filteredPending.length} of ${pending.length} shown`}
                    </p>
                  ) : null}
                </div>

                {pending.length > 0 ? (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter reports by status"
                  >
                    {STATUS_FILTERS.map((filter) => {
                      const isSelected = statusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setStatusFilter(filter.value)}
                          className={`min-h-11 rounded-md border px-4 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-surface text-text-secondary hover:bg-surface-hover/60 hover:text-foreground"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <IncidentTable
                showReporter
                showCategory
                rows={tableRows}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
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
