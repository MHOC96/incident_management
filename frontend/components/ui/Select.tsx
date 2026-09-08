import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({ hasError = false, className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`h-11 w-full min-w-0 appearance-none rounded-md border bg-surface px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        hasError ? "border-danger" : "border-border"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
