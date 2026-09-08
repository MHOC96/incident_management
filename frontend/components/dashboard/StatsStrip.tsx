type StatItem = {
  value: number;
  label: string;
};

type StatsStripProps = {
  items: StatItem[];
};

export function StatsStrip({ items }: StatsStripProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-6 border border-border bg-surface p-6 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[22px] font-semibold leading-none">{item.value}</p>
          <p className="mt-2 text-sm text-text-secondary">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
