import { db } from "../../db";
import { type Stored, toSession } from "../rows";
import type { Session } from "../types";

const insert = db.query<Stored<Session>, [Omit<Stored<Session>, "id">]>(
  `INSERT INTO "Session" (presentationId, location, slides, url, video, status, date, createdAt, updatedAt)
        VALUES ($presentationId, $location, $slides, $url, $video, $status, $date, $createdAt, $updatedAt)
     RETURNING *`,
);

export default async (session: {
  presentationId: number;
  location: string;
  date: Date;
  video?: string;
  url?: string;
  slides?: string;
  status: number;
}): Promise<Session> => {
  const now = Date.now();
  return toSession(
    insert.get({
      presentationId: session.presentationId,
      location: session.location,
      slides: session.slides ?? null,
      url: session.url ?? null,
      video: session.video ?? null,
      status: session.status,
      date: session.date.getTime(),
      createdAt: now,
      updatedAt: now,
    }) as Stored<Session>,
  );
};
