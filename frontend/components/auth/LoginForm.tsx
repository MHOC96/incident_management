"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { formatApiError, getFieldErrors } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { getDashboardRoute } from "@/lib/routes";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setErrors({});
    setIsSubmitting(true);

    try {
      const profile = await login(email.trim(), password);
      router.push(getDashboardRoute(profile.role));
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't sign you in. Please check your details."));
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" noValidate>
      <FormField label="Email" htmlFor="email" required error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholders.email}
          hasError={Boolean(errors.email)}
          required
        />
      </FormField>

      <FormField label="Password" htmlFor="password" required error={errors.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={placeholders.password}
          hasError={Boolean(errors.password)}
          required
        />
      </FormField>

      {formError ? (
        <p className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <p className="mb-4 text-sm text-text-secondary">
        Contact the faculty office if you cannot sign in.
      </p>

      <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting} loadingText="Signing in...">
        Sign in
      </Button>

      <p className="pt-4 text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
          Register as a student
        </Link>
      </p>
    </form>
  );
}
