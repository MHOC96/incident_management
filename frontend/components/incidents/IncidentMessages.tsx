"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { formatRoleLabel } from "@/lib/incidentRoutes";
import { formatApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { messageService } from "@/services/messages";
import type { IncidentMessage } from "@/types";

type IncidentMessagesProps = {
  incidentId: number;
  allowInternal?: boolean;
  readOnly?: boolean;
};

export function IncidentMessages({
  incidentId,
  allowInternal = false,
  readOnly = false,
}: IncidentMessagesProps) {
  const [messages, setMessages] = useState<IncidentMessage[]>([]);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadMessages() {
    const response = await messageService.list(incidentId);
    setMessages(response.results);
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadMessages();
      } catch {
        setError("We couldn't load messages.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [incidentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await messageService.create(incidentId, content.trim(), isInternal);
      setContent("");
      setIsInternal(false);
      await loadMessages();
    } catch (submitError) {
      setError(formatApiError(submitError, "We couldn't send your message."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-[18px] font-semibold mb-4">Communication</h2>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="mb-4 text-sm text-text-secondary">
          No messages yet. Send an update about this incident below.
        </p>
      ) : (
        <div className="mb-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{message.sender_name}</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-xs text-text-muted">
                  {formatRoleLabel(message.sender_role)}
                </span>
                {message.is_internal ? (
                  <span className="rounded border border-warning/30 px-1.5 py-0.5 text-xs text-warning">
                    Internal
                  </span>
                ) : null}
                <span className="text-text-muted">{formatDate(message.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {readOnly ? null : (
        <form onSubmit={handleSubmit}>
          <FormField label="Write a message" htmlFor="message-content" required>
            <Textarea
              id="message-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              required
              placeholder="Write a message to participants on this incident."
            />
          </FormField>
          {allowInternal ? (
            <label htmlFor="message-internal" className="mb-4 flex items-center gap-2 text-sm text-text-secondary">
              <input
                id="message-internal"
                type="checkbox"
                checked={isInternal}
                onChange={(event) => setIsInternal(event.target.checked)}
                className="h-4 w-4"
              />
              Internal note (visible to staff only)
            </label>
          ) : null}
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
          <Button type="submit" isLoading={isSubmitting} loadingText="Sending message...">
            Send message
          </Button>
        </form>
      )}
    </div>
  );
}
