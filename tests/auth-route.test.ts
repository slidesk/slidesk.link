import { beforeAll, describe, expect, test } from "bun:test";
import { SignJWT } from "jose";
import { JWT_SECRET } from "../src/services/env";
import { seedUser } from "./helpers/db";

let auth: { handle: (request: Request) => Promise<Response> };
let session: string;

const authRequest = (query = "", cookie?: string) =>
  auth.handle(
    new Request(`http://localhost/auth${query}`, {
      headers: cookie ? { cookie } : undefined,
    }),
  );

beforeAll(async () => {
  ({ default: auth } = await import("../src/routes/auth"));
  session = await new SignJWT({ id: seedUser("cli") })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(JWT_SECRET));
});

describe("GET /auth", () => {
  test("hands the token to the CLI on its default port", async () => {
    const res = await authRequest("", `auth=${session}`);
    expect(res.headers.get("location")).toBe(
      "http://localhost:1337/auth/token-cli",
    );
  });

  test("hands the token to the port the CLI asked for", async () => {
    const res = await authRequest("?port=51043", `auth=${session}`);
    expect(res.headers.get("location")).toBe(
      "http://localhost:51043/auth/token-cli",
    );
  });

  test("ignores a port outside the user range", async () => {
    for (const port of ["80", "70000", "abc"]) {
      const res = await authRequest(`?port=${port}`, `auth=${session}`);
      expect(res.headers.get("location")).toBe(
        "http://localhost:1337/auth/token-cli",
      );
    }
  });

  test("hands back the state the CLI sent", async () => {
    const state = "0123456789abcdef-state";
    const res = await authRequest(
      `?port=51043&state=${state}`,
      `auth=${session}`,
    );
    expect(res.headers.get("location")).toBe(
      `http://localhost:51043/auth/token-cli?state=${state}`,
    );
  });

  test("ignores a state that is not a plain random value", async () => {
    for (const state of ["short", "a".repeat(65), "0123456789abcdef&x=1"]) {
      const res = await authRequest(
        `?state=${encodeURIComponent(state)}`,
        `auth=${session}`,
      );
      expect(res.headers.get("location")).toBe(
        "http://localhost:1337/auth/token-cli",
      );
    }
  });

  test("remembers the state across the GitHub login", async () => {
    const state = "0123456789abcdef-state";
    const res = await authRequest(`?port=51043&state=${state}`);
    expect(res.headers.get("set-cookie")).toContain(`clistate=${state}`);
    const back = await authRequest(
      "",
      `auth=${session}; cli=51043; clistate=${state}`,
    );
    expect(back.headers.get("location")).toBe(
      `http://localhost:51043/auth/token-cli?state=${state}`,
    );
  });

  test("remembers the port across the GitHub login", async () => {
    const res = await authRequest("?port=51043");
    expect(res.headers.get("location")).toBe("/login?from=cli");
    expect(res.headers.get("set-cookie")).toContain("cli=51043");
    const back = await authRequest("", `auth=${session}; cli=51043`);
    expect(back.headers.get("location")).toBe(
      "http://localhost:51043/auth/token-cli",
    );
  });
});
