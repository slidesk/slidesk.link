import { db } from "../../db";

export default async (presentationId: number) =>
  await db.session.deleteMany({
    where: { presentationId: { equals: presentationId } },
  });
