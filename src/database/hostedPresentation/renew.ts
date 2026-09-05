import { db } from "../../db";

export default async (id: string, userId: number) =>
  await db.hostedPresentation.updateMany({
    where: { id, userId },
    data: { createdAt: new Date() },
  });
