import { checkPasswordRequirements, PASSWORD_REQUIREMENTS } from "@/lib/passwordRequirements";

type PasswordRequirementsProps = {
  password: string;
};

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const results = checkPasswordRequirements(password);
  const completedCount = PASSWORD_REQUIREMENTS.filter(
    (requirement) => results[requirement.id],
  ).length;
  const allMet = completedCount === PASSWORD_REQUIREMENTS.length;

  return (
    <div
      className="mt-3 rounded-md border border-border bg-background px-3 py-3"
      aria-live="polite"
      aria-label="Password requirements"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Create a strong password</p>
        <p className="text-xs text-text-muted">
          {allMet ? "All set" : `${completedCount} of ${PASSWORD_REQUIREMENTS.length} complete`}
        </p>
      </div>

      <p className="mb-3 text-xs text-text-secondary">
        Use a password you do not use on other websites.
      </p>

      <ul className="space-y-2">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const met = results[requirement.id];

          return (
            <li
              key={requirement.id}
              className={`flex items-start gap-2.5 text-sm ${
                met ? "text-success" : "text-text-secondary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${
                  met
                    ? "border-success bg-success text-white"
                    : "border-border bg-surface text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={met ? "font-medium" : undefined}>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
