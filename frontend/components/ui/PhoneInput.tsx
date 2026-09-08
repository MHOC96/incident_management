"use client";

import { placeholders } from "@/lib/placeholders";
import { fromNationalInput, SRI_LANKA_COUNTRY_CODE, toNationalDisplay } from "@/lib/phone";
import { SriLankaFlag } from "@/components/ui/SriLankaFlag";

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  required?: boolean;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function PhoneInput({
  id,
  value,
  onChange,
  hasError = false,
  required = false,
  placeholder = placeholders.phone,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: PhoneInputProps) {
  return (
    <div className={`phone-input ${hasError ? "phone-input--error" : ""}`}>
      <span className="phone-input__flag">
        <SriLankaFlag />
      </span>
      <span className="phone-input__prefix" aria-hidden="true">
        {SRI_LANKA_COUNTRY_CODE}
      </span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="phone-input__field"
        value={toNationalDisplay(value)}
        placeholder={placeholder}
        onChange={(event) => onChange(fromNationalInput(event.target.value))}
      />
    </div>
  );
}
