import { db } from "../../db";

export default async (slug: string, userId: number, tags: string) =>
  await db.plugin.upsert({
    create: { slug, userId, tags },
    update: { tags },
    where: { slug, userId },
  });
