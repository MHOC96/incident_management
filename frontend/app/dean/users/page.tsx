"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountStatusBadge } from "@/components/users/AccountStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatApiError } from "@/lib/errors";
import { formatDate, getPositionLabel } from "@/lib/format";
import { officialService } from "@/services/officials";
import type { OfficialAccount, OfficialPosition } from "@/types";

const positions: OfficialPosition[] = [
  "VICE_CHANCELLOR",
  "HOD",
  "MAINTENANCE_OFFICER",
  "SECURITY_OFFICER",
  "OTHER",
];

type OfficialFormState = {
  name: string;
  email: string;
  phone: string;
  position: OfficialPosition | "";
  department: string;
};

const emptyForm: OfficialFormState = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "Faculty of Management Studies and Commerce",
};

function DeanUsersContent() {
  const [officials, setOfficials] = useState<OfficialAccount[]>([]);
  const [form, setForm] = useState<OfficialFormState>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadOfficials() {
    const data = await officialService.list();
    setOfficials(data);
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadOfficials();
      } catch {
        setError("We couldn't load official accounts.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.position) {
      setError("Select a position for the official account.");
      return;
    }
    setIsSubmitting(true);
    try {
      await officialService.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        position: form.position,
        department: form.department,
      });
      setSuccess("Official account created. An activation email has been sent.");
      setForm(emptyForm);
      await loadOfficials();
    } catch (submitError) {
      setError(formatApiError(submitError, "We couldn't create the official account."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleStatus(official: OfficialAccount) {
    const nextStatus = official.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await officialService.updateStatus(official.id, nextStatus);
      await loadOfficials();
    } catch {
      setError("We couldn't update official status.");
    }
  }

  return (
    <section className="py-10">
      <Link
        href="/dean/dashboard"
        className="text-sm font-medium text-primary hover:text-primary-dark"
      >
        Back to overview
      </Link>

      <h1 className="mt-6 text-[32px] font-semibold mb-2">Official accounts</h1>
      <p className="text-text-secondary mb-8">
        Create and manage official accounts. Officials activate their own passwords by email.
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-[18px] font-semibold">Officials</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse px-6 py-8">
              <div className="h-4 w-1/3 rounded-sm bg-border" />
            </div>
          ) : officials.length === 0 ? (
            <div className="px-6 py-8">
              <p className="font-medium">No official accounts yet.</p>
              <p className="mt-1 text-sm text-text-secondary">
                Use the form on the right to invite your first official.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Position</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officials.map((official) => (
                    <tr key={official.id} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-4">
                        <p className="font-medium">{official.name}</p>
                        <p className="text-text-muted">{official.email}</p>
                      </td>
                      <td className="px-6 py-4">{getPositionLabel(official.position)}</td>
                      <td className="px-6 py-4">
                        <AccountStatusBadge status={official.status} />
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {formatDate(official.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {official.status !== "INVITED" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => toggleStatus(official)}
                          >
                            {official.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                          </Button>
                        ) : (
                          <span className="text-sm text-text-muted">Invitation pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-border bg-surface p-6"
        >
          <h2 className="text-[18px] font-semibold mb-4">Create official account</h2>

          <FormField label="Full name" htmlFor="name" required>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Dr. Saman Perera"
              required
            />
          </FormField>

          <FormField label="Official email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="official@usj.ac.lk"
              required
            />
          </FormField>

          <FormField
            label="Contact number"
            htmlFor="phone"
            hint="Optional. Used for operational contact."
          >
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="0712345678"
            />
          </FormField>

          <FormField label="Position" htmlFor="position" required>
            <Select
              id="position"
              value={form.position}
              onChange={(event) =>
                setForm({ ...form, position: event.target.value as OfficialPosition | "" })
              }
              required
            >
              <option value="">Select position</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {getPositionLabel(position)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Department" htmlFor="department">
            <Input
              id="department"
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              placeholder="Faculty of Management Studies and Commerce"
            />
          </FormField>

          {success ? (
            <p role="status" className="mb-4 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
              {success}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mb-4 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            loadingText="Creating account..."
          >
            Create account
          </Button>
        </form>
      </div>
    </section>
  );
}

export default function DeanUsersPage() {
  return (
    <RequireAuth allowedRoles={["DEAN"]}>
      <PageContainer width="app">
        <DeanUsersContent />
      </PageContainer>
    </RequireAuth>
  );
}
