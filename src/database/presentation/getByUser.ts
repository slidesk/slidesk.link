import { db } from "../../db";

export default async (userId: number) =>
  await db.presentation.findMany({ where: { userId: { equals: userId } } });
