import { db } from "../../db";

export default async (token: string) =>
  await db.user.findFirst({ where: { token: { equals: token } } });
