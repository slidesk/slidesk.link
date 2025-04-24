import { db } from "../db";

export default async (ids: string[]) =>
  await db.hostedPresentation.deleteMany({ where: { id: { in: ids } } });
