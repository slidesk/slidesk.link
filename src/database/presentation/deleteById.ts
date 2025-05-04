import { db } from "../../db";

export default async (id: number) =>
  await db.presentation.delete({
    where: { id: id },
  });
