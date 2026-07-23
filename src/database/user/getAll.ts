import { db } from "../../db";

// All speakers, for the public /users directory. Ordered by display name
// (falling back to slug) so the listing is stable and alphabetical.
export default async () =>
  await db.user.findMany({
    select: { slug: true, name: true, bio: true, url: true, avatarUrl: true },
    orderBy: [{ name: "asc" }, { slug: "asc" }],
  });
