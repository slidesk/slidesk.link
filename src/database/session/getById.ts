import { db } from "../../db";

export default async (id: number) =>
  await db.session.findFirst({
    where: { id: id },
  });
