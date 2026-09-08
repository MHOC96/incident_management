type IncidentPageStateProps = {
  message: string;
  tone?: "neutral" | "danger";
};

export function IncidentPageState({
  message,
  tone = "neutral",
}: IncidentPageStateProps) {
  return (
    <section className="py-10 md:py-12">
      <div
        className={`rounded-lg border px-4 py-8 text-sm md:px-6 ${
          tone === "danger"
            ? "border-danger/20 bg-danger/5 text-danger"
            : "border-border bg-surface text-text-secondary"
        }`}
      >
        {message}
      </div>
    </section>
  );
}

export function IncidentPageSkeleton() {
  return (
    <section className="animate-pulse space-y-4 py-8 md:py-10">
      <div className="h-4 w-32 rounded-sm bg-border" />
      <div className="h-8 w-3/4 max-w-xl rounded-sm bg-border" />
      <div className="h-4 w-1/2 rounded-sm bg-border" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-64 rounded-lg border border-border bg-surface" />
        <div className="h-48 rounded-lg border border-border bg-surface" />
      </div>
    </section>
  );
}
