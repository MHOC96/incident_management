import { PageContainer } from "@/components/layout/PageContainer";
import { PublicIncidentList } from "@/components/incidents/PublicIncidentList";

export default function IncidentsPage() {
  return (
    <PageContainer>
      <section className="py-8 md:py-10">
        <h1 className="mb-2 text-[26px] font-semibold md:text-[32px]">Public incidents</h1>
        <p className="text-text-secondary mb-8 max-w-2xl">
          Browse verified incidents that have been marked as publicly visible.
        </p>
        <PublicIncidentList />
      </section>
    </PageContainer>
  );
}
