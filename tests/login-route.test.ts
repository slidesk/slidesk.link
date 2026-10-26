import { beforeAll, describe, expect, test } from "bun:test";

let login: { handle: (request: Request) => Promise<Response> };

const loginRequest = (query = "") =>
  login.handle(
    new Request(`http://localhost/login${query}`, {
      headers: { cookie: "cli=51043" },
    }),
  );

beforeAll(async () => {
  ({ default: login } = await import("../src/routes/login"));
});

describe("GET /login", () => {
  test("forgets an abandoned CLI login on a web login", async () => {
    const res = await loginRequest();
    expect(res.headers.getSetCookie().join()).toMatch(/cli=;.*Max-Age=0/i);
  });

  test("keeps the CLI port when the login comes from /auth", async () => {
    const res = await loginRequest("?from=cli");
    expect(res.headers.getSetCookie().join()).not.toContain("cli=");
  });
});
