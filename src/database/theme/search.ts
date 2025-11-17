import { db } from "../../db";

export default async (search: string) =>
  await db.theme.findMany({
    where: {
      OR: [
        { slug: { contains: search } },
        { description: { contains: search } },
      ],
    },
    include: { user: true },
    orderBy: { slug: "asc" },
  });
