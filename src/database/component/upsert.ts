import { db } from "../../db";

export default async (
  slug: string,
  userId: number,
  tags: string,
  description: string,
) =>
  await db.component.upsert({
    create: { slug, userId, tags, description },
    update: { tags, description },
    where: { slug, userId },
  });
