import { db } from "../../db";

// Bumps the user's updatedAt so /sitemap.xml <lastmod> stays accurate after
// changes that don't otherwise touch the user row (addon upload, talks import).
export default async (id: number) =>
  await db.user.update({ where: { id }, data: { updatedAt: new Date() } });
