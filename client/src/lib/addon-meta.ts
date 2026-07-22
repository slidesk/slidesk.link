import type { LucideIcon } from "lucide-react";
import { Blocks, LayoutTemplate, Palette, Puzzle } from "lucide-react";
import type { AddonKind, SearchKind } from "@/types/api";

export interface AddonMeta {
  kind: AddonKind;
  /** plural key as used by the search API + routes */
  plural: SearchKind & ("plugins" | "components" | "themes" | "templates");
  label: string;
  labelPlural: string;
  path: string;
  icon: LucideIcon;
}

export const ADDON_META: Record<AddonKind, AddonMeta> = {
  plugin: {
    kind: "plugin",
    plural: "plugins",
    label: "Plugin",
    labelPlural: "Plugins",
    path: "/plugins",
    icon: Puzzle,
  },
  component: {
    kind: "component",
    plural: "components",
    label: "Component",
    labelPlural: "Components",
    path: "/components",
    icon: Blocks,
  },
  theme: {
    kind: "theme",
    plural: "themes",
    label: "Theme",
    labelPlural: "Themes",
    path: "/themes",
    icon: Palette,
  },
  template: {
    kind: "template",
    plural: "templates",
    label: "Template",
    labelPlural: "Templates",
    path: "/templates",
    icon: LayoutTemplate,
  },
};

export const ADDON_KINDS = Object.keys(ADDON_META) as AddonKind[];

/** The CLI command to install a given addon. */
export const installCommand = (kind: AddonKind, user: string, slug: string) =>
  `slidesk ${kind} install @${user}/${slug}`;
