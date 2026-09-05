import { db } from "../../db";
import type { Stored } from "../rows";
import type { User } from "../types";

type Row = Pick<User, "slug" | "name" | "bio" | "url" | "avatarUrl"> & {
  updatedAt: Date;
};

// All speakers, for the public /users directory and /sitemap.xml. Ordered by
// display name (falling back to slug) so the listing is stable and alphabetical.
const all = db.query<Stored<Row>, []>(
  `SELECT slug, name, bio, url, avatarUrl, updatedAt
     FROM "User"
    ORDER BY name ASC, slug ASC`,
);

export default async (): Promise<Row[]> =>
  all.all().map((row) => ({ ...row, updatedAt: new Date(row.updatedAt) }));
