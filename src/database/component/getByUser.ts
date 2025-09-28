import { db } from "../../db";

export default async (userId: number) =>
  await db.component.findMany({
    where: { userId: { equals: userId } },
  });
