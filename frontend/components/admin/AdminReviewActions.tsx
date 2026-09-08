"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { formatApiError } from "@/lib/errors";
import { adminIncidentService } from "@/services/adminIncidents";
import type { AdminIncidentReview } from "@/types";

type AdminReviewActionsProps = {
  incident: AdminIncidentReview;
  onUpdated: (incident: AdminIncidentReview) => void;
};

export function AdminReviewActions({ incident, onUpdated }: AdminReviewActionsProps) {
  const [rejectComment, setRejectComment] = useState("");
  const [infoComment, setInfoComment] = useState("");
  const [verifyComment, setVerifyComment] = useState("");
  const [activeAction, setActiveAction] = useState<"reject" | "info" | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReview =
    incident.status === "SUBMITTED" || incident.status === "UNDER_REVIEW";

  async function runAction(action: () => Promise<AdminIncidentReview>) {
    setFormError("");
    setIsSubmitting(true);
    try {
      const updated = await action();
      onUpdated(updated);
      setActiveAction(null);
      setRejectComment("");
      setInfoComment("");
      setVerifyComment("");
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't complete this review action."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!canReview) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-[18px] font-semibold mb-2">Review complete</h2>
        <p className="text-sm text-text-secondary">
          This incident has already been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-[18px] font-semibold mb-4">Verification</h2>

      <FormField label="Internal note (optional)" htmlFor="verify-comment">
        <Textarea
          id="verify-comment"
          value={verifyComment}
          onChange={(event) => setVerifyComment(event.target.value)}
          rows={3}
          placeholder="Optional internal note for verification"
        />
      </FormField>

      <Button
        type="button"
        className="mb-6 w-full"
        isLoading={isSubmitting && activeAction === null}
        loadingText="Verifying incident..."
        onClick={() => runAction(() => adminIncidentService.verify(incident.id, verifyComment))}
      >
        Verify incident
      </Button>

      {activeAction !== "reject" ? (
        <Button
          type="button"
          variant="secondary"
          className="mb-3 w-full"
          onClick={() => setActiveAction("reject")}
        >
          Reject incident
        </Button>
      ) : (
        <div className="mb-3 space-y-3 rounded-md border border-border p-4">
          <FormField label="Rejection reason" htmlFor="reject-comment" required>
            <Textarea
              id="reject-comment"
              value={rejectComment}
              onChange={(event) => setRejectComment(event.target.value)}
              rows={4}
              required
              placeholder="Explain why this report cannot be verified."
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              isLoading={isSubmitting}
              loadingText="Rejecting incident..."
              onClick={() => {
                if (!rejectComment.trim()) {
                  setFormError("A rejection reason is required.");
                  return;
                }
                void runAction(() => adminIncidentService.reject(incident.id, rejectComment));
              }}
            >
              Confirm reject
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {activeAction !== "info" ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setActiveAction("info")}
        >
          Request more information
        </Button>
      ) : (
        <div className="mt-3 space-y-3 rounded-md border border-border p-4">
          <FormField label="Message to student" htmlFor="info-comment" required>
            <Textarea
              id="info-comment"
              value={infoComment}
              onChange={(event) => setInfoComment(event.target.value)}
              rows={4}
              required
              placeholder="Describe what additional information the student should provide."
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              type="button"
              isLoading={isSubmitting}
              loadingText="Sending request..."
              onClick={() => {
                if (!infoComment.trim()) {
                  setFormError("A message to the student is required.");
                  return;
                }
                void runAction(() => adminIncidentService.requestInfo(incident.id, infoComment));
              }}
            >
              Send request
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveAction(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {formError ? (
        <p className="mt-4 text-sm text-danger">{formError}</p>
      ) : null}
    </div>
  );
}
