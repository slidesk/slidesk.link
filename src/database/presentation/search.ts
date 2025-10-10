import { db } from "../../db";

export default async (search: string) =>
  await db.presentation.findMany({
    where: {
      OR: [{ title: { contains: search } }, { abstract: { contains: search } }],
    },
    include: { user: true, Session: true },
  });
