import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicIncidentList } from "@/components/incidents/PublicIncidentList";
import { LinkButton } from "@/components/ui/LinkButton";

export default function HomePage() {
  return (
    <>
      <section className="portal-introduction">
        <div className="site-width">
          <h1>Incident Reporting & Resolution</h1>
          <p>Report university-related issues and track their progress through review and resolution.</p>
          <LinkButton href="/student/incidents/new">
            Report an incident
            <ArrowRight size={18} className="ml-3" aria-hidden="true" />
          </LinkButton>
        </div>
      </section>
      <section className="site-width incident-register">
        <div className="section-heading">
          <h2>Recent public incidents</h2>
          <Link href="/incidents">
            View all incidents <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className="section-intro">Verified incidents marked for public viewing.</p>
        <PublicIncidentList limit={5} />
      </section>
    </>
  );
}
