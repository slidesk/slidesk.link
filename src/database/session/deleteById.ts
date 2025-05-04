import { db } from "../../db";

export default async (id: number) =>
  await db.session.delete({
    where: { id: id },
  });
