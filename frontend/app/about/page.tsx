import { PageContainer } from "@/components/layout/PageContainer";

export default function AboutPage() {
  return (
    <PageContainer>
      <section className="py-12 max-w-2xl">
        <p className="font-serif text-sm text-text-secondary mb-2">
          University of Sri Jayewardenepura
        </p>
        <h1 className="text-[32px] font-semibold mb-4">About this system</h1>
        <div className="space-y-4 text-text-secondary">
          <p>
            This system supports incident reporting and resolution for the Faculty of
            Management Studies and Commerce.
          </p>
          <p>
            Students may register to report and track incidents. University officials
            access the system through Dean-issued invitations. Public users may browse
            verified public incidents without an account.
          </p>
          <p>
            Reports follow a controlled process: student submission, administrative
            verification, Dean assignment, official resolution, and Dean closure.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
