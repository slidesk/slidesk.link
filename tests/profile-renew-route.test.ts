import { beforeAll, describe, expect, test } from "bun:test";
import { SignJWT } from "jose";
import { JWT_SECRET } from "../src/services/env";
import { seedHosted, seedUser } from "./helpers/db";

let profile: { handle: (request: Request) => Promise<Response> };
let userId: number;

const tokenFor = (id: number) =>
  new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(JWT_SECRET));

const renewRequest = (id: string, cookie?: string) =>
  profile.handle(
    new Request(`http://localhost/profile/hosted/${id}/renew`, {
      method: "PUT",
      headers: cookie ? { cookie } : undefined,
    }),
  );

beforeAll(async () => {
  ({ default: profile } = await import("../src/routes/profile"));
  userId = seedUser("renew-route");
  seedHosted("owned", userId, 1_000);
  seedHosted("someone-elses", seedUser("renew-route-other"), 1_000);
});

describe("PUT /profile/hosted/:id/renew", () => {
  test("returns 401 without a valid session", async () => {
    expect((await renewRequest("owned")).status).toBe(401);
  });

  test("returns 404 for an id the user does not own", async () => {
    const token = await tokenFor(userId);
    expect((await renewRequest("someone-elses", `auth=${token}`)).status).toBe(
      404,
    );
  });

  test("returns 404 for an unknown id", async () => {
    const token = await tokenFor(userId);
    expect((await renewRequest("nonexistent", `auth=${token}`)).status).toBe(
      404,
    );
  });

  test("renews an owned presentation and returns its new createdAt", async () => {
    const before = Date.now();
    const token = await tokenFor(userId);
    const res = await renewRequest("owned", `auth=${token}`);
    expect(res.status).toBe(200);
    const { createdAt } = (await res.json()) as { createdAt: string };
    expect(new Date(createdAt).getTime()).toBeGreaterThanOrEqual(before);
  });
});
