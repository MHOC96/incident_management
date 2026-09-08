"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { formatApiError, getFieldErrors } from "@/lib/errors";
import { authService } from "@/services/auth";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    mc_number: "",
    department: "",
    year: "",
    password: "",
    password_confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setErrors({});
    setIsSubmitting(true);

    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        mc_number: form.mc_number.trim(),
        department: form.department.trim(),
        year: form.year ? Number(form.year) : null,
        password: form.password,
        password_confirm: form.password_confirm,
      });
      router.push("/login?registered=1");
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't create your account. Please review the form."));
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1" noValidate>
      <FormField label="Full name" htmlFor="name" required error={errors.name}>
        <Input
          id="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="As shown on your student identity card"
          hasError={Boolean(errors.name)}
          required
        />
      </FormField>

      <FormField label="Email" htmlFor="email" required error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="name@student.usj.ac.lk"
          hasError={Boolean(errors.email)}
          required
        />
      </FormField>

      <FormField
        label="MC number"
        htmlFor="mc_number"
        required
        error={errors.mc_number}
        hint="Your university registration number as shown on your identity card."
      >
        <Input
          id="mc_number"
          value={form.mc_number}
          onChange={(event) => updateField("mc_number", event.target.value)}
          placeholder="MC/2024/001"
          hasError={Boolean(errors.mc_number)}
          required
        />
      </FormField>

      <FormField label="Contact number" htmlFor="phone" required error={errors.phone}>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="0712345678"
          hasError={Boolean(errors.phone)}
          required
        />
      </FormField>

      <FormField label="Department" htmlFor="department" required error={errors.department}>
        <Input
          id="department"
          value={form.department}
          onChange={(event) => updateField("department", event.target.value)}
          placeholder="Department of Business Management"
          hasError={Boolean(errors.department)}
          required
        />
      </FormField>

      <FormField
        label="Academic year"
        htmlFor="year"
        required
        error={errors.year}
        hint="Enter your current year of study (1 to 4 for undergraduate)."
      >
        <Input
          id="year"
          type="number"
          min={1}
          max={10}
          value={form.year}
          onChange={(event) => updateField("year", event.target.value)}
          placeholder="2"
          hasError={Boolean(errors.year)}
          required
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        required
        error={errors.password}
        hint="At least 8 characters. Use a password you do not use elsewhere."
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          hasError={Boolean(errors.password)}
          required
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="password_confirm"
        required
        error={errors.password_confirm}
      >
        <Input
          id="password_confirm"
          type="password"
          autoComplete="new-password"
          value={form.password_confirm}
          onChange={(event) => updateField("password_confirm", event.target.value)}
          hasError={Boolean(errors.password_confirm)}
          required
        />
      </FormField>

      {formError ? (
        <p className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting} loadingText="Creating account...">
        Create account
      </Button>

      <p className="pt-4 text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </form>
  );
}
