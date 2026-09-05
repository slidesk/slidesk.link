import checkSlug from "../user/checkSlug";
import { addonRepositories, isAddonKind } from "./repository";

type OgAddonData = {
  slug: string;
  description: string;
  userName: string;
  userSlug: string;
  avatarUrl: string | null;
} | null;

export default async (
  kind: string,
  userSlug: string,
  addonSlug: string,
): Promise<OgAddonData> => {
  if (!isAddonKind(kind)) return null;

  const user = await checkSlug(userSlug);
  if (!user) return null;

  const addon = await addonRepositories[kind].getByUserAndSlug(
    user.id,
    addonSlug,
  );
  if (!addon) return null;

  return {
    slug: addon.slug,
    description: addon.description,
    userName: user.name ?? user.slug,
    userSlug: user.slug,
    avatarUrl: user.avatarUrl,
  };
};
