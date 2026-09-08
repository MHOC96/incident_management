import { PageContainer } from "@/components/layout/PageContainer";
import { PublicIncidentList } from "@/components/incidents/PublicIncidentList";

export default function IncidentsPage() {
  return (
    <PageContainer>
      <section className="py-10">
        <h1 className="text-[32px] font-semibold mb-2">Public incidents</h1>
        <p className="text-text-secondary mb-8 max-w-2xl">
          Browse verified incidents that have been marked as publicly visible.
        </p>
        <PublicIncidentList />
      </section>
    </PageContainer>
  );
}
