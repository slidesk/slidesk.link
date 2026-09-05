import { db } from "../../db";
import {
  type JoinedUserRow,
  likeTerm,
  type Stored,
  toJoinedUser,
  toPresentation,
  USER_JOIN_COLUMNS,
} from "../rows";
import type { Presentation, Session, User } from "../types";
import { withSessions } from "./sessions";

const matching = db.query<
  Stored<Presentation> & JoinedUserRow,
  [{ term: string }]
>(
  `SELECT p.*, ${USER_JOIN_COLUMNS}
     FROM "Presentation" p
     JOIN "User" u ON u.id = p.userId
    WHERE p.title LIKE '%' || $term || '%' ESCAPE '\\'
       OR p.abstract LIKE '%' || $term || '%' ESCAPE '\\'
    ORDER BY p.title ASC`,
);

export default async (
  search: string,
): Promise<(Presentation & { user: User; Session: Session[] })[]> =>
  withSessions(
    matching.all({ term: likeTerm(search) }).map((row) => ({
      ...toPresentation(row),
      user: toJoinedUser(row),
    })),
  );
