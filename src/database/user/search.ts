import { db } from "../../db";
import { likeTerm, type Stored, toUser } from "../rows";
import type { User } from "../types";

const matching = db.query<Stored<User>, [{ term: string }]>(
  `SELECT * FROM "User"
    WHERE slug LIKE '%' || $term || '%' ESCAPE '\\'
       OR name LIKE '%' || $term || '%' ESCAPE '\\'`,
);

export default async (search: string): Promise<User[]> =>
  matching.all({ term: likeTerm(search) }).map(toUser);
