import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function RegisterPage() {
  return <AuthLayout title="Student registration"><h2>Create your student account</h2><p className="text-sm text-text-secondary">Use your student details to register and start reporting incidents.</p><RegisterForm /></AuthLayout>;
}
