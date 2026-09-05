import { db } from "../../db";
import type { SlideskLinkUser } from "../../types";
import { type Stored, toUser } from "../rows";
import type { User } from "../types";

const insert = db.query<Stored<User>, [Omit<Stored<User>, "id">]>(
  `INSERT INTO "User" (slug, name, bio, url, avatarUrl, token, createdAt, updatedAt, githubId)
        VALUES ($slug, $name, $bio, $url, $avatarUrl, $token, $createdAt, $updatedAt, $githubId)
     RETURNING *`,
);

export default async (user: SlideskLinkUser): Promise<User> =>
  toUser(
    insert.get({
      slug: user.slug,
      name: user.name,
      bio: user.bio,
      url: user.url,
      avatarUrl: user.avatarUrl,
      token: user.token,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
      githubId: user.githubId,
    }) as Stored<User>,
  );
