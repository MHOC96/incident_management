import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in">
      <h2>Welcome back</h2>
      <p className="text-sm text-text-secondary">
        Enter your university username and password to continue.
      </p>
      <LoginForm />
    </AuthLayout>
  );
}
