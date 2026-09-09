import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const describedChild = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      "aria-invalid": Boolean(error) || undefined,
      "aria-describedby": describedBy || undefined,
    });
  });

  return (
    <div className="form-field mb-5">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mb-2 text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
      {describedChild}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
