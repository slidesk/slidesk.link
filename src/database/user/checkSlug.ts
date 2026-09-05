import { db } from "../../db";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

const bySlug = db.query<Stored<User>, [{ slug: string }]>(
  `SELECT * FROM "User" WHERE slug = $slug LIMIT 1`,
);

export default async (slug: string): Promise<User | null> => {
  const row = bySlug.get({ slug });
  return row && toUser(row);
};
