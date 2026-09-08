export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "8 or more characters",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (password) => /\d/.test(password),
  },
];

export function checkPasswordRequirements(password: string) {
  return PASSWORD_REQUIREMENTS.reduce<Record<string, boolean>>((results, requirement) => {
    results[requirement.id] = requirement.test(password);
    return results;
  }, {});
}

export function meetsPasswordRequirements(password: string) {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
}
