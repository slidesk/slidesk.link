import { CalendarDays, FileText, LinkIcon, Video } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export interface SessionRowData {
  date: string;
  location: string;
  url: string | null;
  slides: string | null;
  video: string | null;
  status?: number;
  title?: string;
}

function ExternalLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof LinkIcon;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export function SessionRow({ session }: { session: SessionRowData }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card/50 px-3 py-2">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{formatDate(session.date)}</span>
          <span className="text-muted-foreground">·</span>
          <span className="truncate text-muted-foreground">
            {session.location}
          </span>
        </div>
        {session.title && (
          <p className="truncate text-xs text-muted-foreground">
            {session.title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        {session.status !== undefined && (
          <StatusBadge status={session.status} />
        )}
        {session.url && (
          <ExternalLink href={session.url} icon={LinkIcon} label="Event page" />
        )}
        {session.slides && (
          <ExternalLink href={session.slides} icon={FileText} label="Slides" />
        )}
        {session.video && (
          <ExternalLink href={session.video} icon={Video} label="Video" />
        )}
      </div>
    </div>
  );
}
