"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { formatApiError } from "@/lib/errors";
import { getStatusLabel } from "@/lib/format";
import { placeholders } from "@/lib/placeholders";
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

  function handleCancel() {
    setActiveAction(null);
    setFormError("");
  }

  if (!canReview) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 md:p-5">
        <h2 className="text-[18px] font-semibold">Review complete</h2>
        <p className="mt-2 text-sm text-text-secondary">
          This incident is currently{" "}
          <span className="font-medium text-foreground">
            {getStatusLabel(incident.status)}
          </span>
          . No further verification action is required.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          You can still review the report details, timeline, and communication on this page.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 md:p-5">
      <h2 className="text-[18px] font-semibold">Review decision</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Verify if the report is complete. Reject only if it is invalid. Request more
        information if details are missing.
      </p>

      {formError ? (
        <p className="mt-4 text-sm text-danger" role="alert">{formError}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        <FormField label="Internal note (optional)" htmlFor="verify-comment">
          <Textarea
            id="verify-comment"
            value={verifyComment}
            onChange={(event) => setVerifyComment(event.target.value)}
            rows={3}
            placeholder={placeholders.verificationNote}
            className="resize-none"
          />
        </FormField>

        <Button
          type="button"
          className="w-full"
          isLoading={isSubmitting && activeAction === null}
          loadingText="Verifying incident..."
          onClick={() => runAction(() => adminIncidentService.verify(incident.id, verifyComment))}
        >
          Verify incident
        </Button>

        {activeAction === "reject" ? (
          <div className="space-y-3 rounded-md border border-border p-4">
            <FormField label="Rejection reason" htmlFor="reject-comment" required>
              <Textarea
                id="reject-comment"
                value={rejectComment}
                onChange={(event) => setRejectComment(event.target.value)}
                rows={4}
                required
                placeholder={placeholders.rejectionReason}
                className="resize-none"
              />
            </FormField>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="danger"
                className="min-h-11 w-full sm:w-auto"
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
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full sm:w-auto"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : activeAction === "info" ? (
          <div className="space-y-3 rounded-md border border-border p-4">
            <FormField label="Message to student" htmlFor="info-comment" required>
              <Textarea
                id="info-comment"
                value={infoComment}
                onChange={(event) => setInfoComment(event.target.value)}
                rows={4}
                required
                placeholder={placeholders.infoRequest}
                className="resize-none"
              />
            </FormField>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
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
                Confirm request
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full sm:w-auto"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setActiveAction("reject");
                setFormError("");
              }}
            >
              Reject incident
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setActiveAction("info");
                setFormError("");
              }}
            >
              Request more information
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
