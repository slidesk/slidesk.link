import { beforeAll, describe, expect, test } from "bun:test";
import { addonRepositories } from "../src/database/addon/repository";
import { seedUser } from "./helpers/db";

const plugin = addonRepositories.plugin;
const theme = addonRepositories.theme;

let alice: number;
let bob: number;

beforeAll(async () => {
  alice = seedUser("addon-alice");
  bob = seedUser("addon-bob");
  await plugin.upsert("mermaid", alice, "diagram|chart", "Draws diagrams");
  await plugin.upsert("counter", bob, "widget", "Counts things");
  await theme.upsert("dark", alice, "[]", "A dark theme");
  await theme.upsert("wide", alice, "[]", "Covers 100% of the slide");
});

describe("addon repository", () => {
  test("upsert inserts once then updates in place", async () => {
    await plugin.upsert("mermaid", alice, "diagram", "Updated");
    const rows = await plugin.getByUser(alice);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      slug: "mermaid",
      tags: "diagram",
      description: "Updated",
      downloaded: 0,
    });
  });

  test("getByUser joins the author without leaking their token", async () => {
    const [row] = await plugin.getByUser(bob);
    expect(row.user.slug).toBe("addon-bob");
    expect(row.user.createdAt).toBeInstanceOf(Date);
    expect(row).not.toHaveProperty("token");
    expect(row).not.toHaveProperty("user_token");
  });

  test("search matches the slug and the kind's search field", async () => {
    expect((await plugin.search("merm")).map((r) => r.slug)).toEqual([
      "mermaid",
    ]);
    // plugins search their tags…
    expect((await plugin.search("widget")).map((r) => r.slug)).toEqual([
      "counter",
    ]);
    // …while themes search their description.
    expect((await theme.search("dark theme")).map((r) => r.slug)).toEqual([
      "dark",
    ]);
  });

  test("search is scoped to one kind and sorted by slug", async () => {
    expect((await plugin.search("")).map((r) => r.slug)).toEqual([
      "counter",
      "mermaid",
    ]);
    expect((await theme.search("")).map((r) => r.slug)).toEqual([
      "dark",
      "wide",
    ]);
  });

  test("search treats LIKE wildcards in the term literally", async () => {
    // Unescaped, "%" and "_" would match every theme instead of only the one
    // whose description actually contains those characters.
    expect((await theme.search("%")).map((r) => r.slug)).toEqual(["wide"]);
    expect((await theme.search("100%")).map((r) => r.slug)).toEqual(["wide"]);
    expect(await theme.search("_")).toEqual([]);
  });

  test("getByUserAndSlug is scoped to the owner", async () => {
    expect(await plugin.getByUserAndSlug(alice, "mermaid")).toMatchObject({
      slug: "mermaid",
      userId: alice,
    });
    expect(await plugin.getByUserAndSlug(bob, "mermaid")).toBeNull();
  });

  test("addDownload stores the new count", async () => {
    await plugin.addDownload(bob, "counter", 7);
    expect(await plugin.getByUserAndSlug(bob, "counter")).toMatchObject({
      downloaded: 7,
    });
  });

  test("delete removes only the owner's addon of that kind", async () => {
    await plugin.delete(bob, "counter");
    expect(await plugin.getByUserAndSlug(bob, "counter")).toBeNull();
    // the theme with a different slug and the other author are untouched
    expect(await plugin.getByUserAndSlug(alice, "mermaid")).not.toBeNull();
    expect(await theme.getByUserAndSlug(alice, "dark")).not.toBeNull();
  });
});
