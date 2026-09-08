import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  width?: "public" | "app";
};

const maxWidthClass = {
  public: "max-w-[1200px]",
  app: "max-w-[1400px]",
};

export function PageContainer({
  children,
  width = "public",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-4 md:px-6 ${maxWidthClass[width]}`}
    >
      {children}
    </div>
  );
}
