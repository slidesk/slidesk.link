import { ADDON_KINDS, ADDON_META } from "@/lib/addon-meta";
import type { AddonKind, SearchAddon, SearchResponse } from "@/types/api";

export const addonAnchorId = (user: string, slug: string) => `${user}__${slug}`;

export interface AddonNavItem {
  id: string;
  slug: string;
  user: string;
}
export interface AddonNavGroup {
  kind: AddonKind;
  items: AddonNavItem[];
}

/** Which addon sections are present, in kind order, with their items. */
export function buildAddonGroups(data: SearchResponse): AddonNavGroup[] {
  const groups: AddonNavGroup[] = [];
  for (const kind of ADDON_KINDS) {
    const list = data[ADDON_META[kind].plural] as SearchAddon[];
    if (list && list.length > 0) {
      groups.push({
        kind,
        items: list.map((a) => ({
          id: addonAnchorId(a.user, a.slug),
          slug: a.slug,
          user: a.user,
        })),
      });
    }
  }
  return groups;
}

export const allAddonIds = (groups: AddonNavGroup[]): string[] =>
  groups.flatMap((g) => g.items.map((i) => i.id));
