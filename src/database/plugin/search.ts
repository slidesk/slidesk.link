import { db } from "../../db";

export default async (search: string) =>
  await db.plugin.findMany({
    where: {
      OR: [{ slug: { contains: search } }, { tags: { contains: search } }],
    },
    include: { user: true },
    orderBy: { slug: "asc" },
  });
