"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountStatusBadge } from "@/components/users/AccountStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Select } from "@/components/ui/Select";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatApiError } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { formatSriLankaPhoneInput, getSriLankaPhoneError } from "@/lib/phone";
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
};

const emptyForm: OfficialFormState = {
  name: "",
  email: "",
  phone: "",
  position: "",
};

function DeanUsersContent() {
  const [showCreateForm, setShowCreateForm] = useState(false);
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

    const phoneError = form.phone.trim() ? getSriLankaPhoneError(form.phone, false) : "";
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setIsSubmitting(true);
    try {
      await officialService.create({
        name: form.name,
        email: form.email,
        phone: form.phone.trim() ? formatSriLankaPhoneInput(form.phone) : "",
        position: form.position,
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
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:text-primary-dark"
      >
        Back to overview
      </Link>

      <h1 className="mt-6 mb-2 text-[26px] font-semibold md:text-[32px]">Official accounts</h1>
      <p className="text-text-secondary mb-8">
        Create and manage official accounts. Officials activate their own passwords by email.
      </p>

      <Button className="account-toggle w-full sm:w-auto" aria-expanded={showCreateForm} aria-controls="create-official-form" onClick={() => setShowCreateForm(open => !open)}>
        {showCreateForm ? "Hide account form" : "Create official account"}
      </Button>
      {error && !showCreateForm ? <p role="alert" className="mb-4 text-danger">{error}</p> : null}
      <div className={showCreateForm ? "official-accounts-layout with-form" : "official-accounts-layout"}>
        {showCreateForm ? (
        <form
          id="create-official-form"
          onSubmit={handleSubmit}
          className="min-w-0 border border-border bg-surface p-4 md:p-6"
        >
          <h2 className="text-[18px] font-semibold mb-4">Create official account</h2>

          <FormField label="Full name" htmlFor="name" required>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder={placeholders.fullName}
              required
            />
          </FormField>

          <FormField label="Official email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder={placeholders.officialEmail}
              required
            />
          </FormField>

          <FormField
            label="Contact number"
            htmlFor="phone"
            hint="Optional. Enter your mobile number after +94."
          >
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              placeholder={placeholders.phone}
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
        </form>) : null}

        <div className="official-list incident-table min-w-0 border border-border bg-surface">
          <div className="border-b border-border px-4 py-4 md:px-6">
            <h2 className="text-[18px] font-semibold">Officials</h2>
          </div>
          {isLoading ? (
            <div className="animate-pulse px-4 py-8 md:px-6">
              <div className="h-4 w-1/3 rounded-sm bg-border" />
            </div>
          ) : officials.length === 0 ? (
            <div className="px-4 py-8 md:px-6">
              <p className="font-medium">No official accounts yet.</p>
              <p className="mt-1 text-sm text-text-secondary">
                Select “Create official account” to invite your first official.
              </p>
            </div>
          ) : (
            <>
              <div className="incident-table-records divide-y divide-border">
                {officials.map((official) => (
                  <div key={official.id} className="px-4 py-4">
                    <p className="font-medium">{official.name}</p>
                    <p className="text-sm text-text-muted">{official.email}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {getPositionLabel(official.position)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <AccountStatusBadge status={official.status} />
                      <span className="text-xs text-text-muted">
                        {formatDate(official.created_at)}
                      </span>
                    </div>
                    <div className="mt-3">
                      {official.status !== "INVITED" ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => toggleStatus(official)}
                        >
                          {official.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                        </Button>
                      ) : (
                        <span className="text-sm text-text-muted">Invitation pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="incident-table-grid">
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
            </>
          )}
        </div>
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
