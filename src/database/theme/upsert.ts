import { db } from "../../db";

export default async (slug: string, userId: number, tags: string) =>
  await db.theme.upsert({
    create: { slug, userId, tags },
    update: { tags },
    where: { slug, userId },
  });
