"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { formatApiError, getFieldErrors } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { meetsPasswordRequirements } from "@/lib/passwordRequirements";
import { authService } from "@/services/auth";

type ChangePasswordFormProps = {
  showIntro?: boolean;
};

export function ChangePasswordForm({ showIntro = true }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setErrors({});

    if (newPassword !== confirmPassword) {
      setErrors({ new_password_confirm: "Passwords do not match." });
      return;
    }
    if (!meetsPasswordRequirements(newPassword)) {
      setErrors({ new_password: "Password does not meet the required format." });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been updated. Use it the next time you sign in.");
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't update your password."));
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-surface p-4 md:p-6">
      <h2 className={`text-[18px] font-semibold ${showIntro ? "" : "mb-4"}`}>Change password</h2>
      {showIntro ? (
        <p className="mt-1 mb-4 text-sm text-text-secondary">
          After your first sign-in you may replace the university CPM number with a personal password.
        </p>
      ) : null}

      <FormField
        label="Current password"
        htmlFor="current_password"
        required
        error={errors.current_password}
      >
        <PasswordInput
          id="current_password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder={placeholders.password}
          hasError={Boolean(errors.current_password)}
          required
        />
      </FormField>

      <FormField label="New password" htmlFor="new_password" required error={errors.new_password}>
        <PasswordInput
          id="new_password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder={placeholders.password}
          hasError={Boolean(errors.new_password)}
          showRequirements
          required
        />
      </FormField>

      <FormField
        label="Confirm new password"
        htmlFor="new_password_confirm"
        required
        error={errors.new_password_confirm}
      >
        <PasswordInput
          id="new_password_confirm"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={placeholders.passwordConfirm}
          hasError={Boolean(errors.new_password_confirm)}
          required
        />
      </FormField>

      {formError ? (
        <p className="mb-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      {success ? (
        <p className="mb-3 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success" role="status">
          {success}
        </p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} loadingText="Updating password...">
        Update password
      </Button>
    </form>
  );
}
