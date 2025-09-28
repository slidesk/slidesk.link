import { db } from "../../db";

export default async (search: string) =>
  await db.plugin.findMany({
    where: { slug: { contains: search }, tags: { contains: search } },
    include: { user: true },
  });
