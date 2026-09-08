import { RegisterForm } from "@/components/auth/RegisterForm";
import { PageContainer } from "@/components/layout/PageContainer";

export default function RegisterPage() {
  return (
    <PageContainer width="public">
      <section className="mx-auto max-w-md py-16">
        <p className="font-serif text-sm text-text-secondary mb-2">
          University of Sri Jayewardenepura
        </p>
        <h1 className="text-[22px] font-semibold mb-2">Student registration</h1>
        <p className="text-sm text-text-secondary mb-8">
          Create a student account to report and track incidents.
        </p>
        <RegisterForm />
      </section>
    </PageContainer>
  );
}
