import { db } from "../db";

export default async (uuid: string) =>
  await db.hostedPresentation.create({
    data: { id: uuid },
  });
