import addPresentation from "../database/presentation/add";
import checkTitle from "../database/presentation/checkTitle";
import addSession from "../database/session/add";
import deleteSessions from "../database/session/deleteByPresentationId";
import type { SlideskLinkUser } from "../types";
import { parse } from "yaml";
import createUserPage from "./createUserPage";

export default async (yml: string, user: SlideskLinkUser) => {
  const parsed = parse(yml);
  let pres = await checkTitle(parsed.title, Number(user.id));
  if (!pres)
    pres = await addPresentation({
      userId: Number(user.id),
      title: parsed.title,
      abstract: parsed.abstract,
      url: parsed.url,
    });
  await deleteSessions(pres.id);
  if (parsed.sessions) {
    for await (const session of [...parsed.sessions]) {
      let status = 1;
      if (typeof session.status !== "undefined") {
        if (session.status === "rejected") status = 0;
        else if (session.status === "declined") status = 2;
        else if (session.status === "pending") status = 3;
      }
      await addSession({
        presentationId: pres.id,
        location: session.location,
        url: session.link,
        video: session.video,
        slides: session.slides,
        date: new Date(session.date),
        status,
      });
    }
  }
  await createUserPage(user);
};
