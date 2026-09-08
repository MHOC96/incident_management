import type { AccountStatus } from "@/types";
import { getAccountStatusClassName, getAccountStatusLabel } from "@/lib/format";

type AccountStatusBadgeProps = {
  status: AccountStatus;
};

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium ${getAccountStatusClassName(status)}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {getAccountStatusLabel(status)}
    </span>
  );
}
