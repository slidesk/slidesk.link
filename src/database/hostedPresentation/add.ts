import { db } from "../../db";

export default async (uuid: string, userId: number) =>
  await db.hostedPresentation.create({
    data: { id: uuid, userId },
  });
