"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/hooks/useAuth";
import { formatRoleLabel } from "@/lib/incidentRoutes";
import { formatApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import {
  canWriteChannel,
  getChannelHelperText,
  getDefaultChannel,
  getVisibleChannels,
  MESSAGE_CHANNEL_LABELS,
} from "@/lib/messageChannels";
import { placeholders } from "@/lib/placeholders";
import { messageService } from "@/services/messages";
import type { IncidentMessage, IncidentStatus, MessageChannel } from "@/types";

type IncidentMessagesProps = {
  incidentId: number;
  incidentStatus: IncidentStatus;
  hasAssignedOfficial?: boolean;
  readOnly?: boolean;
};

function MessageBubble({
  message,
  isOwn,
}: {
  message: IncidentMessage;
  isOwn: boolean;
}) {
  return (
    <div className={`chat-message-row ${isOwn ? "chat-message-row-own" : "chat-message-row-other"}`}>
      <div className={`chat-bubble ${isOwn ? "chat-bubble-own" : "chat-bubble-other"}`}>
        {!isOwn ? (
          <p className="chat-bubble-sender">
            {message.sender_name}
            <span className="chat-bubble-role">{formatRoleLabel(message.sender_role)}</span>
          </p>
        ) : null}
        <p className="chat-bubble-content">{message.content}</p>
        <time className="chat-bubble-time" dateTime={message.created_at}>
          {formatDate(message.created_at)}
        </time>
      </div>
    </div>
  );
}

export function IncidentMessages({
  incidentId,
  incidentStatus,
  hasAssignedOfficial = false,
  readOnly = false,
}: IncidentMessagesProps) {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<MessageChannel>("STUDENT_ADMIN");
  const [messages, setMessages] = useState<IncidentMessage[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const channels = useMemo(
    () =>
      user
        ? getVisibleChannels(user.role, incidentStatus, hasAssignedOfficial)
        : [],
    [user, incidentStatus, hasAssignedOfficial],
  );

  const canWriteActiveChannel = user
    ? canWriteChannel(user.role, activeChannel, incidentStatus, hasAssignedOfficial) &&
      !readOnly
    : false;

  const channelHelperText = user
    ? getChannelHelperText(activeChannel, user.role, incidentStatus)
    : "";

  useEffect(() => {
    if (!user || channels.length === 0) {
      return;
    }
    if (!channels.includes(activeChannel)) {
      setActiveChannel(getDefaultChannel(user.role, incidentStatus, hasAssignedOfficial));
    }
  }, [user, channels, activeChannel, incidentStatus, hasAssignedOfficial]);

  useEffect(() => {
    if (!user || !channels.includes(activeChannel)) {
      return;
    }

    let ignore = false;
    setIsLoading(true);
    setError("");

    void (async () => {
      try {
        const response = await messageService.list(incidentId, activeChannel);
        if (!ignore) {
          setMessages(response.results);
        }
      } catch {
        if (!ignore) {
          setError("We couldn't load messages.");
          setMessages([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [incidentId, activeChannel, user, channels]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollTop = list.scrollHeight;
  }, [messages, activeChannel, isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !canWriteActiveChannel) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const created = await messageService.create(incidentId, content.trim(), activeChannel);
      setContent("");
      setMessages((items) => [...items, created]);
    } catch (submitError) {
      setError(formatApiError(submitError, "We couldn't send your message."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user || channels.length === 0) {
    return null;
  }

  return (
    <div
      id="incident-messages"
      tabIndex={-1}
      className="incident-messages rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 className="text-[18px] font-semibold mb-2">Communication</h2>
      <p className="mb-4 text-sm text-text-secondary">
        Messages are private to you and the relevant university office handling this report.
      </p>

      <div className="message-channel-tabs" role="tablist" aria-label="Communication channels">
        {channels.map((channel) => (
          <button
            key={channel}
            type="button"
            role="tab"
            aria-selected={activeChannel === channel}
            className={`message-channel-tab ${activeChannel === channel ? "is-active" : ""}`}
            onClick={() => setActiveChannel(channel)}
          >
            {MESSAGE_CHANNEL_LABELS[channel]}
          </button>
        ))}
      </div>

      {channelHelperText ? (
        <p className="mb-3 text-sm text-text-secondary">{channelHelperText}</p>
      ) : null}

      <div
        ref={listRef}
        className="incident-messages-list chat-thread"
        role="log"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <p className="chat-thread-empty">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="chat-thread-empty">
            {canWriteActiveChannel
              ? "No messages in this channel yet. Send the first message below."
              : "No messages in this channel yet."}
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === user.id}
            />
          ))
        )}
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {canWriteActiveChannel ? (
        <form onSubmit={handleSubmit} className="chat-compose">
          <FormField
            label={`Message ${MESSAGE_CHANNEL_LABELS[activeChannel].toLowerCase()}`}
            htmlFor="message-content"
            required
          >
            <Textarea
              id="message-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              required
              placeholder={placeholders.message}
              className="resize-y"
            />
          </FormField>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!content.trim()}
            isLoading={isSubmitting}
            loadingText="Sending message..."
          >
            Send message
          </Button>
        </form>
      ) : readOnly ? (
        <p className="text-sm text-text-secondary">
          Messaging is closed for this report.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          This channel is not available for your role at the current stage.
        </p>
      )}
    </div>
  );
}
