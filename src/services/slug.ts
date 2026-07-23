/**
 * Reduce an arbitrary name to a safe, letters-only slug.
 * Used for addon names so they can be embedded in file paths and URLs.
 */
export const slugify = (name: string): string =>
  name.toLowerCase().replace(/[^a-z]/g, "");
