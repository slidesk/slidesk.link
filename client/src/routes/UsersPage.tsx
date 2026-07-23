import { ExternalLink, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { HtmlContent } from "@/components/HtmlContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useUsers } from "@/lib/queries";
import { initials } from "@/lib/utils";
import type { UserListItem } from "@/types/api";

function UserCard({ user }: { user: UserListItem }) {
  const name = user.name || user.slug;
  return (
    <Card className="flex gap-4 p-5">
      <Link to={`/u/${user.slug}`} className="shrink-0" aria-label={name}>
        <Avatar className="h-16 w-16 border">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <Link to={`/u/${user.slug}`} className="group min-w-0">
            <h2 className="truncate text-lg font-semibold group-hover:text-primary">
              {name}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              @{user.slug}
            </p>
          </Link>
          {user.url && (
            <a
              href={user.url}
              target="_blank"
              rel="noopener"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {user.url.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
        {user.bioHtml && (
          <HtmlContent
            html={user.bioHtml}
            className="mt-2 line-clamp-3 [&_p]:my-0"
          />
        )}
      </div>
    </Card>
  );
}

export function UsersPage() {
  useDocumentTitle("Users | SliDesk.link");
  const { data, isLoading, isError } = useUsers();

  return (
    <main className="container py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-7 w-7 text-primary" />
          Users
        </h1>
        <p className="mt-2 text-muted-foreground">
          Speakers and authors on SliDesk — browse their talks and addons.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-destructive">Failed to load users.</p>}

      {data && data.length === 0 && (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No users yet.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {data.map((user) => (
            <UserCard key={user.slug} user={user} />
          ))}
        </div>
      )}
    </main>
  );
}
