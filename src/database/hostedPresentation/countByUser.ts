import { db } from "../../db";

const countByUser = db.query<{ count: number }, [{ userId: number }]>(
  `SELECT count(*) AS count FROM "HostedPresentation" WHERE userId = $userId`,
);

export default async (userId: number): Promise<number> =>
  countByUser.get({ userId })?.count ?? 0;
