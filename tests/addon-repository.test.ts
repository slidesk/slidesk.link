import { describe, expect, test } from "bun:test";
import {
  addonRepositories,
  authorizedKinds,
  isAddonKind,
} from "../src/database/addon/repository";

describe("addon registry", () => {
  test("exposes exactly the four addon kinds", () => {
    expect(authorizedKinds.toSorted()).toEqual([
      "component",
      "plugin",
      "template",
      "theme",
    ]);
  });

  test("every kind has a full repository", () => {
    for (const kind of authorizedKinds) {
      const repo = addonRepositories[kind];
      for (const op of [
        "upsert",
        "search",
        "getByUser",
        "getByUserAndSlug",
        "delete",
        "addDownload",
      ] as const) {
        expect(typeof repo[op]).toBe("function");
      }
    }
  });

  test("isAddonKind guards unknown kinds", () => {
    expect(isAddonKind("plugin")).toBe(true);
    expect(isAddonKind("theme")).toBe(true);
    expect(isAddonKind("presentation")).toBe(false);
    expect(isAddonKind("../plugin")).toBe(false);
    expect(isAddonKind("")).toBe(false);
  });
});
