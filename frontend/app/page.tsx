import { PageContainer } from "@/components/layout/PageContainer";
import { PublicIncidentList } from "@/components/incidents/PublicIncidentList";
import { LinkButton } from "@/components/ui/LinkButton";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="py-12 md:py-16">
        <p className="font-serif text-lg text-text-secondary mb-3">
          University of Sri Jayewardenepura
        </p>
        <h1 className="mb-4 max-w-2xl text-[26px] font-semibold leading-tight text-foreground md:text-[32px]">
          Incident Reporting and Resolution
        </h1>
        <p className="text-text-secondary max-w-xl mb-8">
          Report university-related issues and follow their progress through official review and resolution.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton href="/incidents" className="w-full sm:w-auto">
            View public incidents
          </LinkButton>
          <LinkButton href="/login" variant="secondary" className="w-full sm:w-auto">
            Sign in to report
          </LinkButton>
        </div>
      </section>

      <section className="border-t border-border py-10">
        <h2 className="text-[22px] font-semibold mb-2">Recent public incidents</h2>
        <p className="text-text-muted text-sm mb-6">
          Verified incidents marked as public are listed here.
        </p>
        <PublicIncidentList limit={5} />
      </section>
    </PageContainer>
  );
}
