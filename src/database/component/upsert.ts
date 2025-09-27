import { db } from "../../db";

export default async (slug: string, userId: number, tags: string) =>
  await db.component.upsert({
    create: { slug, userId, tags },
    update: { tags },
    where: { slug, userId },
  });
