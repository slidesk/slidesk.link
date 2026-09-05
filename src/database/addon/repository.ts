import { db } from "../../db";
import {
  type JoinedUserRow,
  likeTerm,
  toJoinedUser,
  USER_JOIN_COLUMNS,
} from "../rows";
import type { Addon, User } from "../types";

export type AddonKind = "plugin" | "component" | "theme" | "template";

// The four addon models (Plugin/Component/Theme/Template) are structurally
// identical, so a single row shape describes any of them.
export type AddonRow = Addon;
export type AddonRowWithUser = AddonRow & { user: User };

export interface AddonRepository {
  upsert(
    slug: string,
    userId: number,
    tags: string,
    description: string,
  ): Promise<void>;
  search(term: string): Promise<AddonRowWithUser[]>;
  getByUser(userId: number): Promise<AddonRowWithUser[]>;
  getByUserAndSlug(userId: number, slug: string): Promise<AddonRow | null>;
  delete(userId: number, slug: string): Promise<void>;
  addDownload(userId: number, slug: string, downloaded: number): Promise<void>;
}

const ADDON_COLUMNS = `a.userId, a.slug, a.tags, a.description, a.downloaded`;

const toAddonWithUser = (row: AddonRow & JoinedUserRow): AddonRowWithUser => ({
  userId: row.userId,
  slug: row.slug,
  tags: row.tags,
  description: row.description,
  downloaded: row.downloaded,
  user: toJoinedUser(row),
});

/**
 * Builds the repository for one addon table. `table` and `searchField` are
 * module-level constants (never user input), so they are safe to interpolate
 * into the statements below.
 */
const build = (
  table: "Plugin" | "Component" | "Theme" | "Template",
  searchField: "tags" | "description",
): AddonRepository => {
  const upsert = db.query<
    void,
    [{ slug: string; userId: number; tags: string; description: string }]
  >(
    `INSERT INTO "${table}" (userId, slug, tags, description)
          VALUES ($userId, $slug, $tags, $description)
     ON CONFLICT (userId, slug)
     DO UPDATE SET tags = $tags, description = $description`,
  );
  const search = db.query<AddonRow & JoinedUserRow, [{ term: string }]>(
    `SELECT ${ADDON_COLUMNS}, ${USER_JOIN_COLUMNS}
       FROM "${table}" a
       JOIN "User" u ON u.id = a.userId
      WHERE a.slug LIKE '%' || $term || '%' ESCAPE '\\'
         OR a."${searchField}" LIKE '%' || $term || '%' ESCAPE '\\'
      ORDER BY a.slug ASC`,
  );
  const byUser = db.query<AddonRow & JoinedUserRow, [{ userId: number }]>(
    `SELECT ${ADDON_COLUMNS}, ${USER_JOIN_COLUMNS}
       FROM "${table}" a
       JOIN "User" u ON u.id = a.userId
      WHERE a.userId = $userId`,
  );
  const byUserAndSlug = db.query<AddonRow, [{ userId: number; slug: string }]>(
    `SELECT userId, slug, tags, description, downloaded
       FROM "${table}"
      WHERE userId = $userId AND slug = $slug
      LIMIT 1`,
  );
  const remove = db.query(
    `DELETE FROM "${table}" WHERE userId = $userId AND slug = $slug`,
  );
  const setDownloads = db.query(
    `UPDATE "${table}"
        SET downloaded = $downloaded
      WHERE userId = $userId AND slug = $slug`,
  );

  return {
    upsert: async (slug, userId, tags, description) => {
      upsert.run({ slug, userId, tags, description });
    },
    search: async (term) =>
      search.all({ term: likeTerm(term) }).map(toAddonWithUser),
    getByUser: async (userId) => byUser.all({ userId }).map(toAddonWithUser),
    getByUserAndSlug: async (userId, slug) =>
      byUserAndSlug.get({ userId, slug }),
    delete: async (userId, slug) => {
      remove.run({ userId, slug });
    },
    addDownload: async (userId, slug, downloaded) => {
      setDownloads.run({ userId, slug, downloaded });
    },
  };
};

export const addonRepositories: Record<AddonKind, AddonRepository> = {
  plugin: build("Plugin", "tags"),
  component: build("Component", "tags"),
  theme: build("Theme", "description"),
  template: build("Template", "description"),
};

export const authorizedKinds = Object.keys(addonRepositories) as AddonKind[];

export const isAddonKind = (value: string): value is AddonKind =>
  Object.hasOwn(addonRepositories, value);
