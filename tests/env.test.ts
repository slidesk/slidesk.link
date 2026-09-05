import { describe, expect, test } from "bun:test";
import { HOST, HOST_IS_HTTPS, resolveHost } from "../src/services/env";

describe("resolveHost", () => {
  test("falls back to the local host when unset or empty", () => {
    expect(resolveHost(undefined)).toBe("http://localhost:3000");
    expect(resolveHost("")).toBe("http://localhost:3000");
  });

  test("keeps a valid absolute URL as-is", () => {
    expect(resolveHost("https://slidesk.link")).toBe("https://slidesk.link");
    expect(resolveHost("http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
  });

  test("strips trailing slashes so links do not double up", () => {
    expect(resolveHost("https://slidesk.link/")).toBe("https://slidesk.link");
    expect(resolveHost("https://slidesk.link///")).toBe("https://slidesk.link");
    expect(`${resolveHost("https://slidesk.link/")}/login`).toBe(
      "https://slidesk.link/login",
    );
  });

  test("throws on a value that is not an absolute URL", () => {
    // the shape that used to yield "undefined/login/github/authorized"
    expect(() => resolveHost("slidesk.link")).toThrow(/absolute URL/);
    expect(() => resolveHost("/login")).toThrow(/absolute URL/);
    expect(() => resolveHost("not a url")).toThrow(/absolute URL/);
  });

  test("throws on a non-http(s) scheme", () => {
    expect(() => resolveHost("ftp://slidesk.link")).toThrow(/http\(s\)/);
    expect(() => resolveHost("javascript:alert(1)")).toThrow(/http\(s\)/);
  });
});

describe("HOST_IS_HTTPS", () => {
  test("follows the scheme, not a hardcoded localhost URL", () => {
    // every local form must stay non-secure, whatever the host or port
    for (const host of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4000",
      "http://0.0.0.0:3000",
    ]) {
      expect(resolveHost(host).startsWith("https://")).toBe(false);
    }
    expect(resolveHost("https://slidesk.link").startsWith("https://")).toBe(
      true,
    );
  });
});

describe("module constants", () => {
  test("HOST is normalised and HOST_IS_HTTPS agrees with it", () => {
    expect(HOST).not.toEndWith("/");
    expect(HOST).toMatch(/^https?:\/\//);
    expect(HOST_IS_HTTPS).toBe(HOST.startsWith("https://"));
  });
});
