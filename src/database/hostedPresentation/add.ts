import { db } from "../../db";
import { type Stored, toHostedPresentation } from "../rows";
import type { HostedPresentation } from "../types";

const insert = db.query<
  Stored<HostedPresentation>,
  [Stored<HostedPresentation> & { speakerToken: string | null }]
>(
  `INSERT INTO "HostedPresentation" (id, userId, createdAt, speakerToken)
        VALUES ($id, $userId, $createdAt, $speakerToken)
     RETURNING *`,
);

export default async (
  uuid: string,
  userId: number,
  speakerToken: string | null = null,
): Promise<HostedPresentation> =>
  toHostedPresentation(
    insert.get({
      id: uuid,
      userId,
      createdAt: Date.now(),
      speakerToken,
    }) as Stored<HostedPresentation>,
  );
