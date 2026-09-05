import { db } from "../../db";

const expired = db.query<{ id: string }, [{ before: number }]>(
  `SELECT id FROM "HostedPresentation" WHERE createdAt < $before`,
);

/** Ids of the hosted presentations uploaded before `before`, for the cleanup cron. */
export default async (before: Date): Promise<string[]> =>
  expired.all({ before: before.getTime() }).map((row) => row.id);
