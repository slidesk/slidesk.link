import { db } from "../../db";

export default async (id: number, userId: number) =>
  await db.presentation.findFirst({
    where: { id: { equals: id }, userId: { equals: userId } },
  });
