import { db } from "../../db";

export default async (userId: number) =>
  await db.hostedPresentation.findMany({
    where: { userId: { equals: userId } },
  });
