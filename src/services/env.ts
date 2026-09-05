const LOCAL_HOST = "http://localhost:3000";

/**
 * Validate and normalise a `HOST` value. Exported for the tests; the module
 * reads the environment once, below.
 *
 * An unset value means local development. A malformed one throws at startup:
 * every redirect URI and absolute link is built from this, so failing here
 * beats emitting `undefined/login/…` on the first OAuth round trip.
 */
export const resolveHost = (raw: string | undefined): string => {
  if (!raw) return LOCAL_HOST;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `HOST must be an absolute URL like ${LOCAL_HOST}, got "${raw}"`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`HOST must be http(s), got "${raw}"`);
  }

  // A trailing slash would double up in `${HOST}/login/…`.
  return raw.replace(/\/+$/, "");
};

/** Public base URL of this instance, without a trailing slash. */
export const HOST = resolveHost(Bun.env.HOST);

/**
 * Whether cookies may carry the `Secure` attribute, derived from the scheme
 * rather than compared against a literal localhost URL — otherwise serving dev
 * on 127.0.0.1, on another port, or with a trailing slash silently marks the
 * OAuth `state` cookie Secure.
 */
export const HOST_IS_HTTPS = HOST.startsWith("https://");

const isProduction = (): boolean => HOST !== LOCAL_HOST;

/**
 * Resolve a required secret. In production (HOST set to something other than
 * localhost) a missing value throws at startup instead of silently falling back
 * to a public, guessable default.
 */
const requireSecret = (name: string, devFallback: string): string => {
  const value = Bun.env[name];
  if (value) return value;
  if (isProduction()) {
    throw new Error(`${name} must be set in production`);
  }
  return devFallback;
};

export const JWT_SECRET = requireSecret("JWT_SECRET", "slidesk.link-dev-only");
