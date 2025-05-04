import { db } from "../../db";

export default async (id: string) =>
  await db.hostedPresentation.delete({
    where: { id: id },
  });
