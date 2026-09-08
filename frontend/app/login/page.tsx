import { LoginForm } from "@/components/auth/LoginForm";
import { PageContainer } from "@/components/layout/PageContainer";

type LoginPageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <PageContainer width="public">
      <section className="mx-auto max-w-md py-10 md:py-16">
        <p className="font-serif text-sm text-text-secondary mb-2">
          University of Sri Jayewardenepura
        </p>
        <h1 className="text-[22px] font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-text-secondary mb-8">
          Sign in with your university account. Students register separately. Officials activate via invitation.
        </p>

        {params.registered ? (
          <p className="mb-6 rounded-md border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
            Your student account was created. You can sign in now.
          </p>
        ) : null}

        <LoginForm />
      </section>
    </PageContainer>
  );
}
