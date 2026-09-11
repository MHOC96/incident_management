import { PageBanner } from "@/components/layout/PageBanner";

const steps = [
  ["Submit", "Describe the incident, provide its location, and add evidence if available."],
  ["Review", "An administrator reviews and verifies the report."],
  ["Assign", "The Dean assigns a responsible official."],
  ["Resolve", "The official updates progress and reports the resolution."],
  ["Close", "The Dean reviews the resolution and closes the incident."],
];

export default function AboutPage() {
  return (
    <>
      <PageBanner title="About the service" />
      <section className="site-width service-description">
        <h2>Reporting and resolution</h2>
        <p>This system manages incident reports for the Faculty of Management Studies and Commerce.</p>
        <ol className="workflow-list">
          {steps.map(([title, description], index) => (
            <li key={title}>
              <span className="workflow-step-number" aria-label={`Step ${index + 1}`}>
                <span className="workflow-step-digit workflow-step-digit-leading" aria-hidden="true">
                  0
                </span>
                <span className="workflow-step-digit workflow-step-digit-unit" aria-hidden="true">
                  {index + 1}
                </span>
              </span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-6">Verified public incidents are visible to everyone. Private and restricted reports are available only to authorized users.</p>
      </section>
    </>
  );
}
