import { AddonCard } from "@/components/AddonCard";
import { ADDON_KINDS, ADDON_META } from "@/lib/addon-meta";
import type { AddonKind, SearchAddon, SearchResponse } from "@/types/api";

function Section({ kind, items }: { kind: AddonKind; items: SearchAddon[] }) {
  const meta = ADDON_META[kind];
  const Icon = meta.icon;
  return (
    <section
      id={`section-${meta.plural}`}
      aria-labelledby={`heading-${meta.plural}`}
      className="scroll-mt-24"
    >
      <h2
        id={`heading-${meta.plural}`}
        className="mb-4 flex items-center gap-2 text-xl font-semibold"
      >
        <Icon className="h-5 w-5 text-primary" />
        {meta.labelPlural}
        <span className="text-sm font-normal text-muted-foreground">
          ({items.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {items.map((addon) => (
          <AddonCard
            key={`${addon.user}/${addon.slug}`}
            kind={kind}
            addon={addon}
          />
        ))}
      </div>
    </section>
  );
}

/** Renders every non-empty addon kind present in `data` as a grid section. */
export function AddonSections({ data }: { data: SearchResponse }) {
  const sections = ADDON_KINDS.map((kind) => ({
    kind,
    items: (data[ADDON_META[kind].plural] as SearchAddon[]) ?? [],
  })).filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col gap-12">
      {sections.map((s) => (
        <Section key={s.kind} kind={s.kind} items={s.items} />
      ))}
    </div>
  );
}
