import { db } from "../../db";

export default async (userId: number) =>
  await db.plugin.findMany({
    where: { userId: { equals: userId } },
  });
