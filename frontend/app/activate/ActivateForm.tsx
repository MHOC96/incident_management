"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatApiError } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { officialService } from "@/services/officials";

export function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Activation link is invalid.");
      return;
    }

    setIsSubmitting(true);
    try {
      await officialService.activate(token, password, passwordConfirm);
      setSuccess(true);
    } catch (submitError) {
      setError(formatApiError(submitError, "We couldn't activate your account."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer width="public">
      <section className="mx-auto max-w-md py-10 md:py-16">
        <p className="font-serif text-sm text-text-secondary mb-2">
          University of Sri Jayewardenepura
        </p>
        <h1 className="text-[22px] font-semibold mb-2">Activate official account</h1>
        <p className="text-sm text-text-secondary mb-6">
          Set a password to activate your official university account.
        </p>

        {success ? (
          <div className="space-y-4">
            <p className="rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
              Your account is active. You can sign in now.
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Password" htmlFor="password" required>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={placeholders.password}
                showRequirements
                required
              />
            </FormField>
            <FormField label="Confirm password" htmlFor="password_confirm" required>
              <PasswordInput
                id="password_confirm"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder={placeholders.passwordConfirm}
                required
              />
            </FormField>
            {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" isLoading={isSubmitting} loadingText="Activating account...">
              Activate account
            </Button>
          </form>
        )}
      </section>
    </PageContainer>
  );
}
