import { db } from "../../db";

export default async (search: string) =>
  await db.component.findMany({
    where: {
      OR: [{ slug: { contains: search } }, { tags: { contains: search } }],
    },
    include: { user: true },
    orderBy: { slug: "asc" },
  });
