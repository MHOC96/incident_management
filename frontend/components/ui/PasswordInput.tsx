"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { PasswordRequirements } from "@/components/ui/PasswordRequirements";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  hasError?: boolean;
  showRequirements?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      hasError = false,
      showRequirements = false,
      className = "",
      value,
      id,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const password = String(value ?? "");

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            hasError={hasError}
            className={`pr-11 ${className}`}
            value={value}
            {...props}
          />
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
            className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-r-md text-text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {showRequirements ? <PasswordRequirements password={password} /> : null}
      </div>
    );
  },
);
