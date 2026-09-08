import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PublicIncidentList } from "@/components/incidents/PublicIncidentList";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="py-12 md:py-16">
        <p className="font-serif text-lg text-text-secondary mb-3">
          University of Sri Jayewardenepura
        </p>
        <h1 className="text-[32px] font-semibold leading-tight text-foreground mb-4 max-w-2xl">
          Incident Reporting and Resolution
        </h1>
        <p className="text-text-secondary max-w-xl mb-8">
          Report university-related issues and follow their progress through official review and resolution.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/incidents"
            className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            View public incidents
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Sign in to report
          </Link>
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
