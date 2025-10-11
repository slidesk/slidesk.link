import { db } from "../../db";

export default async (userId: number, slug: string) =>
  await db.template.findFirst({
    where: { slug: { equals: slug }, userId: { equals: userId } },
  });
