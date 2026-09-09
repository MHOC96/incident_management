import { WorkspaceNavigation } from "./WorkspaceNavigation";
import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  width?: "public" | "app";
};

const maxWidthClass = {
  public: "max-w-[1320px]",
  app: "workspace-container",
};

export function PageContainer({
  children,
  width = "public",
}: PageContainerProps) {
  return (
    <div
      className={`page-container mx-auto w-full min-w-0 px-[22px] md:px-10 ${maxWidthClass[width]}`}
    >
      {width === "app" ? <WorkspaceNavigation /> : null}
      {children}
    </div>
  );
}
