"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Toast, useToast } from "@/components/ui/Toast";
import { getPositionLabel, getPriorityLabel } from "@/lib/format";
import { formatApiError } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { deanIncidentService, responsiblePartyService } from "@/services/deanIncidents";
import { officialService } from "@/services/officials";
import type {
  DeanIncident,
  IncidentPriority,
  OfficialAccount,
  ResponsibleParty,
} from "@/types";

type DeanAssignPanelProps = {
  incident: DeanIncident;
  onUpdated: (incident: DeanIncident) => void;
};

const priorityOptions: IncidentPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function DeanAssignPanel({ incident, onUpdated }: DeanAssignPanelProps) {
  const [officials, setOfficials] = useState<OfficialAccount[]>([]);
  const [parties, setParties] = useState<ResponsibleParty[]>([]);
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [responsibleParty, setResponsibleParty] = useState("");
  const [priority, setPriority] = useState(incident.priority ?? "MEDIUM");
  const [comment, setComment] = useState("");
  const [closeComment, setCloseComment] = useState("");
  const [reopenComment, setReopenComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<
    null | "priority" | "assign" | "close" | "reopen"
  >(null);
  const { message, showToast, dismissToast } = useToast();

  useEffect(() => {
    setPriority(incident.priority ?? "MEDIUM");
  }, [incident.priority]);

  useEffect(() => {
    void (async () => {
      try {
        const [officialData, partyData] = await Promise.all([
          officialService.listActive(),
          responsiblePartyService.list(),
        ]);
        setOfficials(officialData);
        setParties(partyData);
      } catch {
        setError("We couldn't load assignment options.");
      }
    })();
  }, []);

  async function handleAssign() {
    setError("");
    setIsSubmitting("assign");
    try {
      if (!assignedOfficial) {
        setError("Select an official before assigning this incident.");
        return;
      }
      const updated = await deanIncidentService.assign(incident.id, {
        assigned_official: Number(assignedOfficial),
        responsible_party: responsibleParty ? Number(responsibleParty) : null,
        comment,
        priority,
      });
      onUpdated(updated);
      showToast("Incident assigned successfully.");
    } catch (assignError) {
      setError(formatApiError(assignError, "We couldn't assign this incident."));
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handlePriorityUpdate() {
    setError("");
    setIsSubmitting("priority");
    try {
      const updated = await deanIncidentService.setPriority(incident.id, priority);
      onUpdated(updated);
      showToast("Priority updated.");
    } catch (priorityError) {
      setError(formatApiError(priorityError, "We couldn't update priority."));
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handleClose() {
    setError("");
    setIsSubmitting("close");
    try {
      const updated = await deanIncidentService.close(incident.id, closeComment);
      onUpdated(updated);
      showToast("Incident closed.");
    } catch (closeError) {
      setError(formatApiError(closeError, "We couldn't close this incident."));
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handleReopen() {
    setError("");
    setIsSubmitting("reopen");
    try {
      const updated = await deanIncidentService.reopen(incident.id, reopenComment);
      onUpdated(updated);
      showToast("Incident returned for additional work.");
    } catch (reopenError) {
      setError(formatApiError(reopenError, "We couldn't reopen this incident."));
    } finally {
      setIsSubmitting(null);
    }
  }

  const canAssign =
    incident.status === "FORWARDED_TO_DEAN" ||
    incident.status === "ASSIGNED" ||
    incident.status === "IN_PROGRESS";

  const canClose = incident.status === "RESOLVED";
  const canReopen = incident.status === "RESOLVED";

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
          <h2 className="text-[18px] font-semibold mb-4">Priority</h2>
          <FormField label="Official priority" htmlFor="priority">
            <Select
              id="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as IncidentPriority)}
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {getPriorityLabel(option)}
                </option>
              ))}
            </Select>
          </FormField>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            isLoading={isSubmitting === "priority"}
            loadingText="Updating priority..."
            onClick={handlePriorityUpdate}
          >
            Update priority
          </Button>
        </div>

        {canAssign ? (
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="text-[18px] font-semibold mb-4">Assignment</h2>
            <FormField label="Assigned official" htmlFor="official" required>
              <Select
                id="official"
                value={assignedOfficial}
                onChange={(event) => setAssignedOfficial(event.target.value)}
                required
                searchPlaceholder="Search officials..."
              >
                <option value="">Select official</option>
                {officials.map((official) => (
                  <option key={official.id} value={official.id}>
                    {official.name} ({getPositionLabel(official.position)})
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Responsible party" htmlFor="party">
              <Select
                id="party"
                value={responsibleParty}
                onChange={(event) => setResponsibleParty(event.target.value)}
                searchPlaceholder="Search responsible parties..."
              >
                <option value="">Optional</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Assignment comment" htmlFor="comment">
              <Textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder={placeholders.assignmentComment}
              />
            </FormField>
            <Button
              type="button"
              className="w-full"
              isLoading={isSubmitting === "assign"}
              loadingText="Assigning incident..."
              disabled={!assignedOfficial}
              onClick={handleAssign}
            >
              Assign incident
            </Button>
          </div>
        ) : null}

        {canClose ? (
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="text-[18px] font-semibold mb-4">Close incident</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Review the official resolution before closing this incident.
            </p>
            <FormField label="Closure note (optional)" htmlFor="close-comment">
              <Textarea
                id="close-comment"
                value={closeComment}
                onChange={(event) => setCloseComment(event.target.value)}
                rows={3}
                placeholder={placeholders.closureNote}
              />
            </FormField>
            <Button
              type="button"
              className="w-full"
              isLoading={isSubmitting === "close"}
              loadingText="Closing incident..."
              onClick={handleClose}
            >
              Close incident
            </Button>
          </div>
        ) : null}

        {canReopen ? (
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="text-[18px] font-semibold mb-4">Return for additional work</h2>
            <FormField label="Reason (optional)" htmlFor="reopen-comment">
              <Textarea
                id="reopen-comment"
                value={reopenComment}
                onChange={(event) => setReopenComment(event.target.value)}
                rows={3}
                placeholder={placeholders.reopenReason}
              />
            </FormField>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              isLoading={isSubmitting === "reopen"}
              loadingText="Returning incident..."
              onClick={handleReopen}
            >
              Return to in progress
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>

      {message ? <Toast message={message} onDismiss={dismissToast} /> : null}
    </>
  );
}
