import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export interface CalendarItem {
  date: string;
  location: string;
  status: number;
  title: string;
}

/** Groups sessions by day, most recent first. */
export function SessionCalendar({ items }: { items: CalendarItem[] }) {
  const byDay = new Map<string, CalendarItem[]>();
  for (const it of items) {
    const key = formatDate(it.date);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(it);
    else byDay.set(key, [it]);
  }
  const days = [...byDay.entries()].sort(
    (a, b) =>
      new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime(),
  );

  if (days.length === 0)
    return (
      <p className="text-sm text-muted-foreground">No sessions to show.</p>
    );

  return (
    <div className="flex flex-col gap-6">
      {days.map(([day, sessions]) => (
        <div key={day} className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <div className="w-32 shrink-0 pt-1 text-sm font-semibold text-muted-foreground">
            {day}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {sessions.map((s, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: no stable id
                key={i}
                className="flex items-center justify-between gap-3 rounded-md border bg-card/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.location}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
