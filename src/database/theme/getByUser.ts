import { db } from "../../db";

export default async (userId: number) =>
  await db.theme.findMany({
    where: { userId: { equals: userId } },
    include: { user: true },
  });
