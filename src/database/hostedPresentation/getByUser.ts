import { db } from "../../db";
import { type Stored, toHostedPresentation } from "../rows";
import type { HostedPresentation } from "../types";

const byUser = db.query<Stored<HostedPresentation>, [{ userId: number }]>(
  `SELECT * FROM "HostedPresentation"
    WHERE userId = $userId
    ORDER BY createdAt DESC`,
);

export default async (userId: number): Promise<HostedPresentation[]> =>
  byUser.all({ userId }).map(toHostedPresentation);
