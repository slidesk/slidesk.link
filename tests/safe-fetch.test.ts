import { describe, expect, test } from "bun:test";
import { assertSafeUrl, isPrivateIp } from "../src/services/safe-fetch";

describe("isPrivateIp", () => {
  test("flags private / loopback / link-local IPv4", () => {
    for (const ip of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254", // cloud metadata
      "100.64.0.1",
      "0.0.0.0",
    ]) {
      expect(isPrivateIp(ip)).toBe(true);
    }
  });

  test("allows public IPv4", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.15.0.1", "172.32.0.1"]) {
      expect(isPrivateIp(ip)).toBe(false);
    }
  });

  test("flags loopback / local IPv6 and mapped IPv4", () => {
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
    expect(isPrivateIp("fd00::1")).toBe(true);
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true);
  });
});

describe("assertSafeUrl", () => {
  test("rejects non-http protocols", async () => {
    await expect(assertSafeUrl("file:///etc/passwd")).rejects.toThrow();
    await expect(assertSafeUrl("ftp://example.com")).rejects.toThrow();
  });

  test("rejects malformed urls", async () => {
    await expect(assertSafeUrl("not a url")).rejects.toThrow();
  });

  test("rejects localhost and internal literal IPs", async () => {
    await expect(assertSafeUrl("http://localhost/x")).rejects.toThrow();
    await expect(assertSafeUrl("http://127.0.0.1/x")).rejects.toThrow();
    await expect(
      assertSafeUrl("http://169.254.169.254/latest/meta-data"),
    ).rejects.toThrow();
    await expect(assertSafeUrl("http://[::1]/x")).rejects.toThrow();
  });

  test("accepts a public literal IP", async () => {
    const url = await assertSafeUrl("https://1.1.1.1/file.pdf");
    expect(url.hostname).toBe("1.1.1.1");
  });
});
