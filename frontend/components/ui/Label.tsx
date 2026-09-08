import type { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ required = false, children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`mb-2 block text-sm font-medium text-foreground ${className}`}
      {...props}
    >
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}
