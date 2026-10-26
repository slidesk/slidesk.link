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

  test("remembers the port across the GitHub login", async () => {
    const res = await authRequest("?port=51043");
    expect(res.headers.get("location")).toBe("/login");
    expect(res.headers.get("set-cookie")).toContain("cli=51043");
    const back = await authRequest("", `auth=${session}; cli=51043`);
    expect(back.headers.get("location")).toBe(
      "http://localhost:51043/auth/token-cli",
    );
  });
});
