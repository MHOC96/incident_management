"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { IncidentForm } from "@/components/incidents/IncidentForm";
import { PageContainer } from "@/components/layout/PageContainer";

function NewIncidentContent() {
  return (
    <PageContainer width="app">
      <section className="py-8 md:py-10">
        <h1 className="mb-2 text-[26px] font-semibold md:text-[32px]">Report an incident</h1>
        <p className="mb-6 max-w-2xl text-text-secondary md:mb-8">
          Tell us what happened, where it is, and add a photo if you can.
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
