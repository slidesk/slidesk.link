import { db } from "../../db";

export default async (title: string, userId: number) =>
  await db.presentation.findFirst({
    where: { title: { equals: title }, userId: { equals: userId } },
  });
