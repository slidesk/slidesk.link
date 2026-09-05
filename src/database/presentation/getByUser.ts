import { db } from "../../db";
import { type Stored, toPresentation } from "../rows";
import type { Presentation, Session } from "../types";
import { withSessions } from "./sessions";

const byUser = db.query<Stored<Presentation>, [{ userId: number }]>(
  `SELECT * FROM "Presentation" WHERE userId = $userId`,
);

export default async (
  userId: number,
): Promise<(Presentation & { Session: Session[] })[]> =>
  withSessions(byUser.all({ userId }).map(toPresentation));
