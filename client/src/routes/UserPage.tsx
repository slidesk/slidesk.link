import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { AddonNav } from "@/components/AddonNav";
import { AddonSections } from "@/components/AddonSections";
import { HtmlContent } from "@/components/HtmlContent";
import { PdfViewerDialog } from "@/components/PdfViewerDialog";
import { RecentTalksTOC } from "@/components/RecentTalksTOC";
import type { CalendarItem } from "@/components/SessionCalendar";
import { SessionCalendar } from "@/components/SessionCalendar";
import { SessionRow } from "@/components/SessionRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildAddonGroups } from "@/lib/addon-groups";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useHashScroll } from "@/lib/hooks/use-hash-scroll";
import { useUserPage } from "@/lib/queries";
import { initials } from "@/lib/utils";
import type { SearchResponse, UserPageData } from "@/types/api";

/** Adapt the per-user addon payload to the shared SearchResponse shape. */
function toAddonData(data: UserPageData): SearchResponse {
  const map = (
    list: { slug: string; downloaded: number; descriptionHtml: string }[],
  ) =>
    list.map((a) => ({
      slug: a.slug,
      downloaded: a.downloaded,
      description: a.descriptionHtml,
      user: data.slug,
    }));
  return {
    plugins: map(data.plugins),
    components: map(data.components),
    templates: map(data.templates),
    themes: data.themes.map((t) => ({
      slug: t.slug,
      downloaded: t.downloaded,
      description:
        t.descriptionHtml +
        t.previews
          .map(
            (b64) =>
              `<img src="data:image/webp;base64,${b64}" alt="" loading="lazy" width="320" />`,
          )
          .join(""),
      user: data.slug,
    })),
    users: [],
    talks: [],
  };
}

function TalksSection({ data }: { data: UserPageData }) {
  const [showRejected, setShowRejected] = useState(false);
  const hasRejected = data.talks.some((t) =>
    t.sessions.some((s) => s.status === 0),
  );

  const visible = (status: number) => showRejected || status !== 0;

  const calendarItems: CalendarItem[] = data.talks.flatMap((t) =>
    t.sessions
      .filter((s) => visible(s.status))
      .map((s) => ({
        date: s.date,
        location: s.location,
        status: s.status,
        title: t.title,
      })),
  );

  if (data.talks.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Talks</h2>
        {hasRejected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRejected((v) => !v)}
          >
            {showRejected ? "Hide rejected" : "Show rejected"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex flex-col gap-6">
            {data.talks.map((t) => {
              const sessions = t.sessions.filter((s) => visible(s.status));
              return (
                <Card key={t.id} id={`t${t.id}`} className="scroll-mt-24 p-5">
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  {t.abstractHtml && (
                    <HtmlContent html={t.abstractHtml} className="mt-2" />
                  )}
                  {sessions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      {sessions.map((s, i) => (
                        <SessionRow
                          // biome-ignore lint/suspicious/noArrayIndexKey: no stable id
                          key={i}
                          session={s}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <SessionCalendar items={calendarItems} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export function UserPage() {
  const { slug = "" } = useParams();
  const { data, isLoading, isError } = useUserPage(slug);
  useDocumentTitle(data ? `${data.name} | SliDesk.link` : "SliDesk.link");

  const addonData = useMemo(() => (data ? toAddonData(data) : null), [data]);
  const groups = addonData ? buildAddonGroups(addonData) : [];
  useHashScroll(!!data);

  if (isLoading)
    return (
      <main className="container py-10">
        <Skeleton className="h-40 w-full" />
      </main>
    );

  if (isError || !data || !addonData)
    return (
      <main className="container flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="mt-2 text-muted-foreground">
          No speaker page exists for “{slug}”.
        </p>
      </main>
    );

  return (
    <PdfViewerDialog>
      <main className="container py-10">
        {/* Hero */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border p-6 glass">
            <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
            <p className="mt-1 text-muted-foreground">@{data.slug}</p>
            {data.bioHtml && (
              <HtmlContent html={data.bioHtml} className="mt-4 text-base" />
            )}
            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {data.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
          <aside className="flex flex-col gap-6">
            <div className="flex justify-center lg:justify-start">
              <Avatar className="h-32 w-32 border">
                {data.avatarUrl && (
                  <AvatarImage src={data.avatarUrl} alt={data.name} />
                )}
                <AvatarFallback>{initials(data.name)}</AvatarFallback>
              </Avatar>
            </div>
            <RecentTalksTOC talks={data.talks} />
          </aside>
        </div>

        {(data.talks.length > 0 || groups.length > 0) && (
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex min-w-0 flex-col gap-12">
              <TalksSection data={data} />
              {groups.length > 0 && (
                <section>
                  <h2 className="mb-6 text-2xl font-bold tracking-tight">
                    Addons
                  </h2>
                  <AddonSections data={addonData} />
                </section>
              )}
            </div>
            <aside>
              <AddonNav
                groups={groups}
                talks={data.talks.map((t) => ({
                  id: `t${t.id}`,
                  title: t.title,
                }))}
              />
            </aside>
          </div>
        )}
      </main>
    </PdfViewerDialog>
  );
}
