import { db } from "../../db";

export default async (search: string) =>
  await db.user.findMany({
    where: {
      OR: [{ slug: { contains: search } }, { name: { contains: search } }],
    },
  });
