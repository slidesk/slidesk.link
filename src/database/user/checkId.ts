import { db } from "../../db";

export default async (id: number) =>
  await db.user.findFirst({ where: { id: { equals: id } } });
