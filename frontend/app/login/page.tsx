import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

type LoginPageProps = { searchParams: Promise<{ registered?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <AuthLayout title="Sign in"><h2>Welcome back</h2><p className="text-sm text-text-secondary">Enter your university account details to continue.</p>{params.registered ? <p className="border border-success/20 bg-success/5 px-3 py-2 text-sm text-success" role="status">Your student account was created. You can sign in now.</p> : null}<LoginForm /></AuthLayout>;
}
