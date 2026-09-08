export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 sm:gap-4 sm:py-8 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="space-y-1 text-sm text-text-secondary">
          <p className="font-medium text-foreground">
            University of Sri Jayewardenepura
          </p>
          <p>Faculty of Management Studies and Commerce</p>
        </div>
        <p className="text-sm text-text-muted md:text-right">
          Incident Reporting and Resolution Management System
          <span className="mt-1 block text-xs">© {year}</span>
        </p>
      </div>
    </footer>
  );
}
