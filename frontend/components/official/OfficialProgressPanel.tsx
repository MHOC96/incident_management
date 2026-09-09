"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { formatApiError } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { officialIncidentService } from "@/services/officialIncidents";
import type { OfficialIncident } from "@/types";

type OfficialProgressPanelProps = {
  incident: OfficialIncident;
  onUpdated: (incident: OfficialIncident) => void;
};

export function OfficialProgressPanel({
  incident,
  onUpdated,
}: OfficialProgressPanelProps) {
  const [progressComment, setProgressComment] = useState("");
  const [resolveComment, setResolveComment] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canStart = incident.status === "ASSIGNED";
  const canResolve =
    incident.status === "ASSIGNED" || incident.status === "IN_PROGRESS";
  const isComplete =
    incident.status === "RESOLVED" || incident.status === "CLOSED";

  async function handleStartProgress() {
    setError("");
    setIsSubmitting(true);
    try {
      const updated = await officialIncidentService.startProgress(
        incident.id,
        progressComment,
      );
      onUpdated(updated);
      setProgressComment("");
    } catch (startError) {
      setError(formatApiError(startError, "We couldn't start progress."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResolve() {
    setError("");
    setIsSubmitting(true);
    try {
      const updated = await officialIncidentService.resolve(
        incident.id,
        resolveComment,
      );
      onUpdated(updated);
      setShowResolve(false);
      setResolveComment("");
    } catch (resolveError) {
      setError(formatApiError(resolveError, "We couldn't mark this as resolved."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
        <h2 className="text-[18px] font-semibold mb-2">Work complete</h2>
        <p className="text-sm text-text-secondary">
          {incident.status === "CLOSED" ? "The Dean has reviewed the resolution and closed this incident." : "This incident has been marked as resolved and is awaiting Dean review."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canStart ? (
        <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
          <h2 className="text-[18px] font-semibold mb-4">Start work</h2>
          <FormField label="Progress note (optional)" htmlFor="progress-comment">
            <Textarea
              id="progress-comment"
              value={progressComment}
              onChange={(event) => setProgressComment(event.target.value)}
              rows={3}
              placeholder={placeholders.progressNote}
            />
          </FormField>
          <Button
            type="button"
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Starting work..."
            onClick={handleStartProgress}
          >
            Start work
          </Button>
        </div>
      ) : null}

      {canResolve ? (
        <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
          <h2 className="text-[18px] font-semibold mb-4">Resolution</h2>
          {!showResolve ? (
            <Button type="button" className="w-full" onClick={() => setShowResolve(true)}>
              Mark as resolved
            </Button>
          ) : (
            <div className="space-y-3">
              <FormField label="Resolution statement" htmlFor="resolve-comment" required>
                <Textarea
                  id="resolve-comment"
                  value={resolveComment}
                  onChange={(event) => setResolveComment(event.target.value)}
                  rows={4}
                  required
                  placeholder={placeholders.resolutionStatement}
                />
              </FormField>
              <div className="form-actions">
                <Button type="button" disabled={!resolveComment.trim()} isLoading={isSubmitting} loadingText="Confirming resolution..." onClick={handleResolve}>
                  Confirm resolution
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowResolve(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
