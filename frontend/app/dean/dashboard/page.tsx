"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentTable, type IncidentTableRow } from "@/components/dashboard/IncidentTable";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { PageContainer } from "@/components/layout/PageContainer";
import { LinkButton } from "@/components/ui/LinkButton";
import { deanIncidentService } from "@/services/deanIncidents";
import type { DeanIncident, DeanStats } from "@/types";

function toDeanRow(incident: DeanIncident): IncidentTableRow {
  return {
    id: incident.id,
    incident_number: incident.incident_number,
    title: incident.title,
    status: incident.status,
    priority: incident.priority,
    location: incident.location,
    href: `/dean/incidents/${incident.id}`,
    date: incident.updated_at,
    assignedTo: incident.current_assignment?.assigned_official_name,
  };
}

function DeanDashboardLoadingSkeleton() {
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
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-4 md:px-6">
            <div className="h-5 w-52 max-w-full bg-border" />
          </div>
          <div className="space-y-2 px-4 py-4 md:px-6">
            <div className="h-4 w-3/4 max-w-md bg-border" />
            <div className="h-3 w-1/2 max-w-xs bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeanDashboardContent() {
  const [stats, setStats] = useState<DeanStats | null>(null);
  const [awaiting, setAwaiting] = useState<DeanIncident[]>([]);
  const [underway, setUnderway] = useState<DeanIncident[]>([]);
  const [resolved, setResolved] = useState<DeanIncident[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [statsResult, awaitingResult, underwayResult, resolvedResult] =
        await Promise.allSettled([
          deanIncidentService.getStats(),
          deanIncidentService.listAwaitingAction(),
          deanIncidentService.listCurrentlyUnderway(),
          deanIncidentService.listResolvedAwaitingClosure(),
        ]);

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      }
      if (awaitingResult.status === "fulfilled") {
        setAwaiting(awaitingResult.value.results);
      }
      if (underwayResult.status === "fulfilled") {
        setUnderway(underwayResult.value.results);
      }
      if (resolvedResult.status === "fulfilled") {
        setResolved(resolvedResult.value.results);
      }

      const failedCount = [statsResult, awaitingResult, underwayResult, resolvedResult].filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedCount === 4) {
        setError("We couldn't load the dean overview.");
      } else if (failedCount > 0) {
        setError("Some overview data is temporarily unavailable. Review the lists that loaded.");
      }

      setIsLoading(false);
    })();
  }, []);

  const assignedCount = stats?.assigned ?? underway.filter((item) => item.status === "ASSIGNED").length;
  const inProgressCount =
    stats?.in_progress ?? underway.filter((item) => item.status === "IN_PROGRESS").length;
  const awaitingCount = stats?.awaiting_action ?? awaiting.length;
  const readyToCloseCount = stats?.resolved_awaiting_closure ?? resolved.length;

  const attentionParts: string[] = [];
  if (awaitingCount > 0) {
    attentionParts.push(
      `${awaitingCount} ${awaitingCount === 1 ? "report needs" : "reports need"} assignment`,
    );
  }
  if (underway.length === 1) {
    attentionParts.push("1 report is currently underway");
  } else if (underway.length > 0) {
    attentionParts.push(`${underway.length} reports are currently underway`);
  }
  if (readyToCloseCount > 0) {
    attentionParts.push(
      `${readyToCloseCount} ${readyToCloseCount === 1 ? "is" : "are"} ready to close`,
    );
  }

  const hasAnyLists = awaiting.length > 0 || underway.length > 0 || resolved.length > 0;

  return (
    <PageContainer width="app">
      <section className="py-6 md:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold md:text-[32px]">Faculty incident management</h1>
            <p className="mt-2 text-text-secondary">
              See who is responsible, what is currently in progress, and which reports need your decision.
            </p>
            {!isLoading && attentionParts.length > 0 ? (
              <p className="mt-3 text-sm font-medium text-foreground">
                {attentionParts.join(". ")}.
              </p>
            ) : null}
          </div>
          <LinkButton href="/dean/users" variant="secondary" className="w-full sm:w-auto">
            Manage officials
          </LinkButton>
        </div>

        {isLoading ? (
          <DeanDashboardLoadingSkeleton />
        ) : error && !stats && !hasAnyLists ? (
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
                {
                  value: awaitingCount,
                  label: "Awaiting assignment",
                  href: "#awaiting-assignment",
                },
                {
                  value: assignedCount,
                  label: "Assigned",
                  href: "#currently-underway",
                },
                {
                  value: inProgressCount,
                  label: "In progress",
                  href: "#currently-underway",
                },
                {
                  value: readyToCloseCount,
                  label: "Ready to close",
                  href: "#ready-to-close",
                },
              ]}
            />

            <div id="currently-underway" className="mb-8 scroll-mt-24 border border-border bg-surface">
              <div className="border-b border-border px-4 py-4 md:px-6">
                <h2 className="text-[18px] font-semibold">Currently underway</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Assigned reports and work in progress, with the responsible official.
                </p>
              </div>
              <IncidentTable
                showPriority
                showAssigned
                rows={underway.map(toDeanRow)}
                emptyTitle="No incidents are currently underway"
                emptyDescription="Assigned and in-progress reports will appear here after you assign an official."
                dateLabel="Updated"
              />
            </div>

            <div id="awaiting-assignment" className="mb-8 scroll-mt-24 border border-border bg-surface">
              <div className="border-b border-border px-4 py-4 md:px-6">
                <h2 className="text-[18px] font-semibold">Needs assignment</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Verified reports waiting for you to assign a responsible official.
                </p>
              </div>
              <IncidentTable
                showPriority
                showAssigned
                rows={awaiting.map(toDeanRow)}
                emptyTitle="No incidents awaiting assignment"
                emptyDescription="Verified incidents appear here after administrative review."
                dateLabel="Updated"
              />
            </div>

            <div id="ready-to-close" className="scroll-mt-24 border border-border bg-surface">
              <div className="border-b border-border px-4 py-4 md:px-6">
                <h2 className="text-[18px] font-semibold">Ready to close</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Officials have reported these as resolved. Review the work and close them, or return them.
                </p>
              </div>
              <IncidentTable
                showPriority
                showAssigned
                rows={resolved.map(toDeanRow)}
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
