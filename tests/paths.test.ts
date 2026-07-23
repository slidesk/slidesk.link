import { describe, expect, test } from "bun:test";
import { isValidUuid, safeJoin } from "../src/services/paths";

describe("isValidUuid", () => {
  test("accepts a canonical uuid", () => {
    expect(isValidUuid("018f8f8e-0000-7000-8000-000000000000")).toBe(true);
    expect(isValidUuid(Bun.randomUUIDv7())).toBe(true);
  });

  test("rejects traversal and garbage", () => {
    expect(isValidUuid("../../etc/passwd")).toBe(false);
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("")).toBe(false);
    expect(isValidUuid("018f8f8e-0000-7000-8000-00000000000")).toBe(false);
  });
});

describe("safeJoin", () => {
  const base = "/srv/app/presentations/x";

  test("resolves a normal nested file", () => {
    expect(safeJoin(base, "assets/img.png")).toBe(
      "/srv/app/presentations/x/assets/img.png",
    );
  });

  test("allows the base itself", () => {
    expect(safeJoin(base, ".")).toBe("/srv/app/presentations/x");
  });

  test("blocks path traversal in the middle", () => {
    expect(safeJoin(base, "sub/../../../etc/passwd")).toBeNull();
  });

  test("blocks a plain parent escape", () => {
    expect(safeJoin(base, "../secret")).toBeNull();
  });

  test("blocks absolute path escape", () => {
    expect(safeJoin(base, "/etc/passwd")).toBeNull();
  });

  test("does not treat a sibling prefix as inside", () => {
    expect(safeJoin("/srv/app/a", "../ab")).toBeNull();
  });
});
