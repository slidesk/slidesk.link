const LOCAL_HOST = "http://localhost:3000";

const isProduction = (): boolean =>
  Boolean(Bun.env.HOST) && Bun.env.HOST !== LOCAL_HOST;

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
