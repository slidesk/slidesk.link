import addPresentation from "../database/presentation/add";
import checkTitle from "../database/presentation/checkTitle";
import addSession from "../database/session/add";
import deleteSessions from "../database/session/delete";
import type { SlideskLinkUser } from "../types";
import { parse } from "yaml";

export default async (yml: string, user: SlideskLinkUser) => {
  const parsed = parse(yml);
  let pres = await checkTitle(parsed.title);
  if (!pres)
    pres = await addPresentation({
      userId: Number(user.id),
      title: parsed.title,
      abstract: parsed.abstract,
      url: parsed.url,
    });
  await deleteSessions(pres.id);
  if (parsed.sessions) {
    [...parsed.sessions].forEach((session, _) => {
      addSession({
        presentationId: pres.id,
        location: session.location,
        url: session.link,
        video: session.video,
        slides: session.slides,
        date: new Date(session.date),
      });
    });
  }
};
