import { db } from "../../db";
import { type Stored, toSession } from "../rows";
import type { Presentation, Session } from "../types";

const byPresentationIds = db.query<Stored<Session>, [{ ids: string }]>(
  `SELECT * FROM "Session"
    WHERE presentationId IN (SELECT value FROM json_each($ids))`,
);

/**
 * Attach each presentation's sessions under the `Session` key, the shape the
 * speaker page and the search route consume.
 */
export const withSessions = <T extends Presentation>(
  presentations: T[],
): (T & { Session: Session[] })[] => {
  if (presentations.length === 0) return [];

  const grouped = new Map<number, Session[]>();
  for (const row of byPresentationIds.all({
    ids: JSON.stringify(presentations.map((p) => p.id)),
  })) {
    const session = toSession(row);
    const sessions = grouped.get(session.presentationId);
    if (sessions) sessions.push(session);
    else grouped.set(session.presentationId, [session]);
  }

  return presentations.map((presentation) => ({
    ...presentation,
    Session: grouped.get(presentation.id) ?? [],
  }));
};
