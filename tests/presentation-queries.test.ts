import { beforeAll, describe, expect, test } from "bun:test";
import addPresentation from "../src/database/presentation/add";
import getPresentationsByUser from "../src/database/presentation/getByUser";
import presentationSearch from "../src/database/presentation/search";
import updatePresentation from "../src/database/presentation/update";
import addSession from "../src/database/session/add";
import deleteSessionsByPresentationId from "../src/database/session/deleteByPresentationId";
import { seedUser } from "./helpers/db";

let userId: number;
let withSessions: number;
let withoutSessions: number;

beforeAll(async () => {
  userId = seedUser("talks-author");
  const first = await addPresentation({
    userId,
    title: "Bun, créons une CLI",
    abstract: "Un abstract sur Bun",
  });
  withSessions = first.id;
  const second = await addPresentation({ userId, title: "Zzz no sessions" });
  withoutSessions = second.id;

  await addSession({
    presentationId: withSessions,
    location: "DevFest",
    date: new Date("2026-01-15T00:00:00Z"),
    status: 1,
  });
  await addSession({
    presentationId: withSessions,
    location: "TouraineTech",
    date: new Date("2026-03-01T00:00:00Z"),
    status: 0,
  });
});

describe("presentation queries", () => {
  test("add returns the row with hydrated dates and null optionals", async () => {
    const presentation = await addPresentation({ userId, title: "Bare talk" });
    expect(presentation.abstract).toBeNull();
    expect(presentation.url).toBeNull();
    expect(presentation.createdAt).toBeInstanceOf(Date);
    expect(presentation.id).toBeGreaterThan(0);
  });

  test("getByUser attaches each presentation's sessions", async () => {
    const presentations = await getPresentationsByUser(userId);
    const found = presentations.find((p) => p.id === withSessions);
    expect(found?.Session.map((s) => s.location).toSorted()).toEqual([
      "DevFest",
      "TouraineTech",
    ]);
    expect(found?.Session[0].date).toBeInstanceOf(Date);
  });

  test("getByUser returns an empty Session list rather than omitting it", async () => {
    const presentations = await getPresentationsByUser(userId);
    expect(
      presentations.find((p) => p.id === withoutSessions)?.Session,
    ).toEqual([]);
  });

  test("getByUser is scoped to the user", async () => {
    expect(await getPresentationsByUser(seedUser("talks-nobody"))).toEqual([]);
  });

  test("search matches title or abstract, ordered by title", async () => {
    const byTitle = await presentationSearch("créons");
    expect(byTitle.map((p) => p.title)).toEqual(["Bun, créons une CLI"]);
    const byAbstract = await presentationSearch("abstract sur bun");
    expect(byAbstract.map((p) => p.id)).toEqual([withSessions]);
  });

  test("search returns the author and the sessions", async () => {
    const [talk] = await presentationSearch("créons");
    expect(talk.user.slug).toBe("talks-author");
    expect(talk.Session).toHaveLength(2);
    // the joined author's columns must not bleed onto the presentation
    expect(talk).not.toHaveProperty("user_slug");
    expect(talk).not.toHaveProperty("token");
  });

  test("update overwrites the row and bumps updatedAt", async () => {
    const before = await getPresentationsByUser(userId);
    const original = before.find((p) => p.id === withoutSessions);
    expect(
      await updatePresentation({
        id: withoutSessions,
        userId,
        title: "Zzz renamed",
        abstract: "now with an abstract",
      }),
    ).toEqual({ count: 1 });
    const after = (await getPresentationsByUser(userId)).find(
      (p) => p.id === withoutSessions,
    );
    expect(after?.title).toBe("Zzz renamed");
    expect(after?.abstract).toBe("now with an abstract");
    expect(after?.url).toBeNull();
    expect(after?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      original?.updatedAt.getTime() ?? 0,
    );
  });

  test("deleteByPresentationId reports how many sessions it removed", async () => {
    expect(await deleteSessionsByPresentationId(withSessions)).toEqual({
      count: 2,
    });
    expect(await deleteSessionsByPresentationId(withSessions)).toEqual({
      count: 0,
    });
  });
});
