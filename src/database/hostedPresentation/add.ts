import { db } from "../../db";
import { type Stored, toHostedPresentation } from "../rows";
import type { HostedPresentation } from "../types";

const insert = db.query<
  Stored<HostedPresentation>,
  [Stored<HostedPresentation>]
>(
  `INSERT INTO "HostedPresentation" (id, userId, createdAt)
        VALUES ($id, $userId, $createdAt)
     RETURNING *`,
);

export default async (
  uuid: string,
  userId: number,
): Promise<HostedPresentation> =>
  toHostedPresentation(
    insert.get({
      id: uuid,
      userId,
      createdAt: Date.now(),
    }) as Stored<HostedPresentation>,
  );
