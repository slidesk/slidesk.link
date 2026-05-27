import { db } from "../../db";

const addonModels = ["plugin", "component", "theme", "template"] as const;
type AddonKind = (typeof addonModels)[number];

type OgAddonData = {
  slug: string;
  description: string;
  userName: string;
  userSlug: string;
  avatarUrl: string | null;
} | null;

export default async (kind: string, userSlug: string, addonSlug: string): Promise<OgAddonData> => {
  if (!(addonModels as readonly string[]).includes(kind)) return null;

  const user = await db.user.findFirst({ where: { slug: { equals: userSlug } } });
  if (!user) return null;

  const model = kind as AddonKind;
  let addon: { slug: string; description: string } | null = null;

  switch (model) {
    case "plugin":
      addon = await db.plugin.findFirst({
        where: { slug: { equals: addonSlug }, userId: { equals: user.id } },
      });
      break;
    case "component":
      addon = await db.component.findFirst({
        where: { slug: { equals: addonSlug }, userId: { equals: user.id } },
      });
      break;
    case "theme":
      addon = await db.theme.findFirst({
        where: { slug: { equals: addonSlug }, userId: { equals: user.id } },
      });
      break;
    case "template":
      addon = await db.template.findFirst({
        where: { slug: { equals: addonSlug }, userId: { equals: user.id } },
      });
      break;
  }

  if (!addon) return null;

  return {
    slug: addon.slug,
    description: addon.description,
    userName: user.name ?? user.slug,
    userSlug: user.slug,
    avatarUrl: user.avatarUrl,
  };
};
