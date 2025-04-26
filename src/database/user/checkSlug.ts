import { db } from "../../db";

export default async (slug: string) =>
  await db.user.findFirst({ where: { slug: { equals: slug } } });
