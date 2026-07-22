import { describe, expect, test } from "bun:test";
import { slugify } from "../src/services/slug";

describe("slugify", () => {
  test("keeps only lowercase letters", () => {
    expect(slugify("My Cool Plugin 42!")).toBe("mycoolplugin");
    expect(slugify("Accénts-and_symbols")).toBe("accntsandsymbols");
  });

  test("strips path-traversal characters", () => {
    expect(slugify("../../etc/passwd")).toBe("etcpasswd");
    expect(slugify("foo/../bar")).toBe("foobar");
  });

  test("returns empty string when no letters", () => {
    expect(slugify("123 456")).toBe("");
    expect(slugify("")).toBe("");
  });
});
