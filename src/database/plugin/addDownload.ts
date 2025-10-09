import { db } from "../../db";

export default async (userId: number, slug: string, inc: number) =>
  await db.plugin.update({
    where: {
      userId_slug: {
        userId,
        slug,
      },
    },
    data: {
      downloaded: inc,
    },
  });
