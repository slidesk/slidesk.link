import { AddonNav } from "@/components/AddonNav";
import { AddonSections } from "@/components/AddonSections";
import { Skeleton } from "@/components/ui/skeleton";
import { buildAddonGroups } from "@/lib/addon-groups";
import { ADDON_META } from "@/lib/addon-meta";
import { useDocumentTitle } from "@/lib/hooks/use-document-title";
import { useHashScroll } from "@/lib/hooks/use-hash-scroll";
import { useAddons } from "@/lib/queries";
import type { AddonKind } from "@/types/api";

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  );
}

export function AddonListPage({ kind }: { kind: AddonKind }) {
  const meta = ADDON_META[kind];
  const Icon = meta.icon;
  useDocumentTitle(`${meta.labelPlural} | SliDesk.link`);

  const { data, isLoading, isError } = useAddons(kind);
  const groups = data ? buildAddonGroups(data) : [];
  const isEmpty = data ? groups.length === 0 : false;

  useHashScroll(!!data && !isEmpty);

  return (
    <main className="container py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Icon className="h-7 w-7 text-primary" />
          {meta.labelPlural}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Community {meta.labelPlural.toLowerCase()} for SliDesk — install with
          the CLI.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          {isLoading && <LoadingGrid />}
          {isError && (
            <p className="text-destructive">
              Failed to load {meta.labelPlural}.
            </p>
          )}
          {isEmpty && (
            <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              No {meta.label.toLowerCase()} published yet.
            </p>
          )}
          {data && !isEmpty && <AddonSections data={data} />}
        </div>
        {data && !isEmpty && (
          <aside>
            <AddonNav groups={groups} />
          </aside>
        )}
      </div>
    </main>
  );
}
