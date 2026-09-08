"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { PageContainer } from "@/components/layout/PageContainer";

function NewIncidentContent() {
  return (
    <PageContainer width="app">
      <section className="py-10">
        <h1 className="text-[32px] font-semibold mb-2">Report an incident</h1>
        <p className="text-text-secondary mb-8 max-w-2xl">
          Help the university identify and resolve an issue.
        </p>
        <IncidentForm />
      </section>
    </PageContainer>
  );
}

export default function NewIncidentPage() {
  return (
    <RequireAuth allowedRoles={["STUDENT"]}>
      <NewIncidentContent />
    </RequireAuth>
  );
}
