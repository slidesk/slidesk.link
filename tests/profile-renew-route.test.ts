import { describe, expect, mock, test } from "bun:test";
import { SignJWT } from "jose";
import { JWT_SECRET } from "../src/services/env";

const updateMany = mock().mockResolvedValue({ count: 0 });

mock.module("../src/db", () => ({
  db: {
    hostedPresentation: {
      updateMany,
    },
  },
}));

const tokenFor = (id: number) =>
  new SignJWT({ id })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(JWT_SECRET));

describe("PUT /profile/hosted/:id/renew", () => {
  test("returns 401 without a valid session", async () => {
    const { default: profile } = await import("../src/routes/profile");
    const res = await profile.handle(
      new Request("http://localhost/profile/hosted/nonexistent/renew", {
        method: "PUT",
      }),
    );
    expect(res.status).toBe(401);
  });

  test("returns 404 for an id the user does not own", async () => {
    const token = await tokenFor(42);
    const { default: profile } = await import("../src/routes/profile");
    const res = await profile.handle(
      new Request("http://localhost/profile/hosted/nonexistent/renew", {
        method: "PUT",
        headers: { cookie: `auth=${token}` },
      }),
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "nonexistent", userId: 42 },
      data: { createdAt: expect.any(Date) },
    });
    expect(res.status).toBe(404);
  });
});
