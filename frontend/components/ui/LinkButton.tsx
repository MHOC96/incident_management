import Link from "next/link";
import type { ComponentProps } from "react";

type LinkButtonVariant = "primary" | "secondary";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: LinkButtonVariant;
};

const variantClasses: Record<LinkButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark hover:text-white focus-visible:outline-primary",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-hover hover:text-foreground",
};

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-[2px] px-5 py-2 text-center leading-snug text-sm font-medium no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
