import { Suspense } from "react";
import { ActivateForm } from "./ActivateForm";

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-sm text-text-secondary">Loading...</div>}>
      <ActivateForm />
    </Suspense>
  );
}
