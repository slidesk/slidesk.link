import { db } from "../../db";

export default async (githubId: number) =>
  await db.user.findFirst({ where: { githubId: { equals: githubId } } });
