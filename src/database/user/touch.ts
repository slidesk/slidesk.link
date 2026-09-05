import { db } from "../../db";
import type { WriteResult } from "../types";

const touch = db.query(
  `UPDATE "User" SET updatedAt = $updatedAt WHERE id = $id`,
);

// Bumps the user's updatedAt so /sitemap.xml <lastmod> stays accurate after
// changes that don't otherwise touch the user row (addon upload, talks import).
export default async (id: number): Promise<WriteResult> => ({
  count: touch.run({ id, updatedAt: Date.now() }).changes,
});
