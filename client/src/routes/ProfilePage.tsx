import {
  Blocks,
  LayoutTemplate,
  Palette,
  Presentation,
  Puzzle,
  RotateCw,
  Server,
  Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ApiTokenCard } from "@/components/profile/ApiTokenCard";
import { ConfirmDelete, CrudList } from "@/components/profile/CrudList";
import { DangerZone } from "@/components/profile/DangerZone";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { SessionRow } from "@/components/SessionRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useDeleteProfileItem, useProfile, useRenewHosted } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { ProfileAddon, ProfilePresentation } from "@/types/api";

export function ProfilePage() {
  useDocumentTitle("Your profile | SliDesk.link");
  const { data, isLoading, error } = useProfile();
  const del = useDeleteProfileItem();
  const renew = useRenewHosted();

  const unauthorized = error instanceof ApiError && error.status === 401;
  useEffect(() => {
    if (unauthorized) window.location.href = "/login/";
  }, [unauthorized]);

  if (isLoading || unauthorized) {
    return (
      <main className="container flex flex-col gap-4 py-10">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="container py-10">
        <p className="text-destructive">Could not load your profile.</p>
      </main>
    );
  }

  const addon = (
    title: string,
    icon: typeof Puzzle,
    items: ProfileAddon[],
    type: "plugin" | "component" | "template" | "theme",
  ) => (
    <CrudList
      title={title}
      icon={icon}
      items={items}
      getKey={(a) => a.slug}
      primary={(a) => a.slug}
      secondary={(a) => `${a.downloaded} download(s)`}
      onDelete={(a) => del.mutate({ type, id: a.slug })}
    />
  );

  return (
    <main className="container flex max-w-4xl flex-col gap-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>

      <EditProfileForm initial={data.form} />
      <ApiTokenCard token={data.token} />

      <CrudList
        title="Hosted presentations"
        icon={Server}
        items={data.hosted}
        getKey={(h) => h.id}
        primary={(h) => (
          <a
            href={`https://slidesk.link/s/${h.id}/`}
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline"
          >
            {h.id}
          </a>
        )}
        secondary={(h) => formatDate(h.createdAt)}
        onDelete={(h) => del.mutate({ type: "hosted", id: h.id })}
        actions={(h) => (
          <Button
            variant="link"
            size="sm"
            className="h-8 shrink-0 px-1 text-muted-foreground hover:text-primary"
            onClick={() =>
              renew.mutate(h.id, {
                onSuccess: () => toast.success("Presentation renewed"),
                onError: () => toast.error("Could not renew presentation"),
              })
            }
            disabled={renew.isPending}
          >
            {renew.isPending && renew.variables === h.id ? (
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Renew</span>
            )}
          </Button>
        )}
        emptyText="No hosted presentations."
      />

      <TalksCard
        presentations={data.presentations}
        onDeletePresentation={(id) => del.mutate({ type: "presentation", id })}
        onDeleteSession={(id) => del.mutate({ type: "session", id })}
      />

      {addon("Plugins", Puzzle, data.plugins, "plugin")}
      {addon("Components", Blocks, data.components, "component")}
      {addon("Templates", LayoutTemplate, data.templates, "template")}
      {addon("Themes", Palette, data.themes, "theme")}

      <DangerZone />
    </main>
  );
}

function TalksCard({
  presentations,
  onDeletePresentation,
  onDeleteSession,
}: {
  presentations: ProfilePresentation[];
  onDeletePresentation: (id: number) => void;
  onDeleteSession: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Presentation className="h-4 w-4 text-primary" />
          Talks
          <span className="text-sm font-normal text-muted-foreground">
            ({presentations.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {presentations.length === 0 && (
          <p className="text-sm text-muted-foreground">No talks yet.</p>
        )}
        {presentations.map((p) => (
          <div key={p.id} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="truncate font-medium">{p.title}</h3>
              <ConfirmDelete
                onConfirm={() => onDeletePresentation(p.id)}
                description="This talk and all its sessions will be deleted."
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete talk"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {p.Session.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <SessionRow
                      session={{
                        date: s.date,
                        location: s.location,
                        url: s.url,
                        slides: s.slides,
                        video: s.video,
                        status: s.status,
                      }}
                    />
                  </div>
                  <ConfirmDelete
                    onConfirm={() => onDeleteSession(s.id)}
                    description="This session will be deleted."
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete session"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
