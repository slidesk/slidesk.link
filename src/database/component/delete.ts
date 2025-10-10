import { db } from "../../db";

export default async (userId: number, slug: string) =>
  await db.component.delete({
    where: {
      userId_slug: {
        userId,
        slug,
      },
    },
  });
