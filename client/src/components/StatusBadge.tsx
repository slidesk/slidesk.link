import type { LucideIcon } from "lucide-react";
import { Check, Clock, X } from "lucide-react";

import { cn } from "@/lib/utils";

const MAP: Record<
  number,
  { label: string; icon: LucideIcon; className: string }
> = {
  0: {
    label: "Rejected",
    icon: X,
    className: "bg-destructive/15 text-destructive",
  },
  1: {
    label: "Accepted",
    icon: Check,
    className: "bg-status-accepted/15 text-status-accepted",
  },
  2: {
    label: "Declined",
    icon: X,
    className: "bg-status-declined/15 text-status-declined",
  },
  3: {
    label: "Pending",
    icon: Clock,
    className: "bg-status-pending/15 text-status-pending",
  },
};

export function StatusBadge({ status }: { status: number }) {
  const s = MAP[status] ?? MAP[3];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        s.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}
