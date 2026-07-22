import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AddonSections } from "@/components/AddonSections";
import { HtmlContent } from "@/components/HtmlContent";
import { SessionRow } from "@/components/SessionRow";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useHashScroll } from "@/lib/hooks/use-hash-scroll";
import { useSearch } from "@/lib/queries";
import type { SearchKind } from "@/types/api";

const FILTERS: { key: SearchKind; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "talks", label: "Talks" },
  { key: "plugins", label: "Plugins" },
  { key: "components", label: "Components" },
  { key: "themes", label: "Themes" },
  { key: "templates", label: "Templates" },
];

export function SearchPage() {
  useDocumentTitle("Search | SliDesk.link");

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [checked, setChecked] = useState<Record<SearchKind, boolean>>({
    users: true,
    talks: true,
    plugins: true,
    components: true,
    themes: true,
    templates: true,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(t);
  }, [term]);

  const kinds = useMemo(
    () => FILTERS.map((f) => f.key).filter((k) => checked[k]),
    [checked],
  );

  const { data, isLoading, isFetching } = useSearch(debounced, kinds);

  const hasResults =
    !!data &&
    data.users.length +
      data.talks.length +
      data.plugins.length +
      data.components.length +
      data.themes.length +
      data.templates.length >
      0;

  useHashScroll(hasResults);

  const searching = debounced.trim().length >= 3;

  return (
    <main className="container py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Find speakers, talks and addons across SliDesk.
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        <Input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search… (min. 3 characters)"
          className="h-11 text-base"
          autoFocus
        />
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {FILTERS.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <Checkbox
                id={`filter-${f.key}`}
                checked={checked[f.key]}
                onCheckedChange={(v) =>
                  setChecked((c) => ({ ...c, [f.key]: v === true }))
                }
              />
              <Label htmlFor={`filter-${f.key}`} className="cursor-pointer">
                {f.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {!searching && (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Type at least 3 characters to search.
          </p>
        )}

        {searching && isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}

        {searching && !isLoading && !hasResults && (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No results{isFetching ? "…" : ` for "${debounced}"`}.
          </p>
        )}

        {data && hasResults && (
          <div className="flex flex-col gap-12">
            {data.users.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">Users</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.users.map((u) => (
                    <Card key={u.slug} className="p-4">
                      <Link to={`/u/${u.slug}`} className="group block">
                        <h3 className="font-semibold group-hover:text-primary">
                          {u.name || u.slug}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          @{u.slug}
                        </p>
                      </Link>
                      {u.bio && <HtmlContent html={u.bio} className="mt-2" />}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {data.talks.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">Talks</h2>
                <div className="flex flex-col gap-4">
                  {data.talks.map((t, i) => (
                    <Card key={`${t.user}-${i}`} className="p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold">{t.title}</h3>
                        <Link
                          to={`/u/${t.user}`}
                          className="shrink-0 text-xs text-primary hover:underline"
                        >
                          @{t.user}
                        </Link>
                      </div>
                      {t.abstract && (
                        <HtmlContent html={t.abstract} className="mt-2" />
                      )}
                      {t.sessions.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {t.sessions.map((s, j) => (
                            <SessionRow
                              // biome-ignore lint/suspicious/noArrayIndexKey: sessions lack a stable id
                              key={j}
                              session={s}
                            />
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <AddonSections data={data} />
          </div>
        )}
      </div>
    </main>
  );
}
