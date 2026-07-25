import { ADDON_KINDS, ADDON_META } from "@/lib/addon-meta";
import type { SearchAddon, SearchResponse } from "@/types/api";

export type AddonSort = "name" | "popularity";

const byName = (a: SearchAddon, b: SearchAddon) =>
  a.slug.localeCompare(b.slug) || a.user.localeCompare(b.user);

const byPopularity = (a: SearchAddon, b: SearchAddon) =>
  b.downloaded - a.downloaded || byName(a, b);

/** Returns a copy of `data` with every addon list reordered. */
export function sortAddons(
  data: SearchResponse,
  sort: AddonSort,
): SearchResponse {
  const compare = sort === "popularity" ? byPopularity : byName;
  const next = { ...data };
  for (const kind of ADDON_KINDS) {
    const plural = ADDON_META[kind].plural;
    const list = next[plural];
    if (list) next[plural] = [...list].sort(compare);
  }
  return next;
}
