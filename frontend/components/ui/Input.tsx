import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function Input({ hasError = false, className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-md border bg-surface px-3 text-sm text-foreground placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        hasError ? "border-danger" : "border-border"
      } ${className}`}
      {...props}
    />
  );
}
