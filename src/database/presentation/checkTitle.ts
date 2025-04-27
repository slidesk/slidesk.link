import { db } from "../../db";

export default async (title: string) =>
  await db.presentation.findFirst({ where: { title: { equals: title } } });
