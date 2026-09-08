import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ActivateForm } from "./ActivateForm";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <PageContainer width="public">
          <p className="mx-auto max-w-md py-10 text-sm text-text-secondary md:py-16">
            Loading...
          </p>
        </PageContainer>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
