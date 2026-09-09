import type { ReactNode } from "react";
import { PageBanner } from "./PageBanner";

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageBanner title={title} eyebrow="Account access" />
      <div className="site-width account-content">
        <section className="auth-panel">{children}</section>
      </div>
    </>
  );
}
