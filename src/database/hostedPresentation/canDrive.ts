import { db } from "../../db";

const select = db.query<{ speakerToken: string | null }, [{ id: string }]>(
  `SELECT speakerToken FROM "HostedPresentation" WHERE id = $id`,
);

/**
 * Whether a websocket client may broadcast on a hosted talk: it must carry the
 * speaker token, unless the talk was hosted by a CLI that did not send one.
 */
export default (id: string, token: string | undefined): boolean => {
  const row = select.get({ id });
  if (!row) return false;
  return row.speakerToken === null || row.speakerToken === token;
};
