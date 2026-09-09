import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export function Textarea({ hasError = false, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-[2px] border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        hasError ? "border-danger" : "border-border"
      } ${className}`}
      {...props}
    />
  );
}
