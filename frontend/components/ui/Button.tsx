import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-hover disabled:opacity-60",
  ghost: "text-primary hover:text-primary-dark disabled:opacity-60",
  danger:
    "border border-danger bg-surface text-danger hover:bg-danger/5 disabled:opacity-60",
};

export function Button({
  variant = "primary",
  isLoading = false,
  loadingText,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const label = isLoading ? (loadingText ?? children) : children;

  return (
    <button
      type={type}
      className={`inline-flex h-11 min-h-11 items-center justify-center rounded-md px-5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {label}
    </button>
  );
}
