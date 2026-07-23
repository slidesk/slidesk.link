import { CalendarDays } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { UserTalk } from "@/types/api";

interface RecentItem {
  presentationId: number;
  title: string;
  date: string;
  location: string;
}

export function RecentTalksTOC({ talks }: { talks: UserTalk[] }) {
  const recent: RecentItem[] = talks
    .flatMap((t) =>
      t.sessions
        .filter((s) => s.status === 1)
        .map((s) => ({
          presentationId: t.id,
          title: t.title,
          date: s.date,
          location: s.location,
        })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Recent talks
      </p>
      <div className="flex flex-col gap-2">
        {recent.map((r, i) => (
          <a
            key={`${r.presentationId}-${i}`}
            href={`#t${r.presentationId}`}
            className="block"
          >
            <Card className="p-3 transition-colors hover:border-primary/50 hover:bg-accent/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(r.date)} · {r.location}
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-medium">{r.title}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
