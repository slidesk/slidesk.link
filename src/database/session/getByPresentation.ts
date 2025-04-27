import { db } from "../../db";

export default async (presentationId: number) =>
  await db.session.findMany({
    where: { presentationId: { equals: presentationId } },
  });
