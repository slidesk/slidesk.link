import { resolve, sep } from "node:path";

export const APP_DIR = `${process.cwd()}/app`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate a string is a canonical UUID (as produced by Bun.randomUUIDv7). */
export const isValidUuid = (value: string): boolean => UUID_RE.test(value);

/**
 * Resolve `segments` under `base` and guarantee the result stays inside `base`.
 * Returns `null` when the resulting path would escape (path traversal).
 */
export const safeJoin = (
  base: string,
  ...segments: string[]
): string | null => {
  const normalizedBase = resolve(base);
  const target = resolve(normalizedBase, ...segments);
  if (target !== normalizedBase && !target.startsWith(normalizedBase + sep)) {
    return null;
  }
  return target;
};
