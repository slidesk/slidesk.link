import { db } from "../../db";

export default async (userId: number) =>
  await db.user.delete({
    where: {
      id: userId,
    },
  });
