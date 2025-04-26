import { db } from "../../db";

export default async (userId: number) =>
  await db.hostedPresentation.count({ where: { userId: { equals: userId } } });
