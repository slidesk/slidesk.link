import { db } from "../../db";

export default async (userid: number, data: { [key: string]: string }) =>
  await db.user.update({ where: { id: userid }, data });
