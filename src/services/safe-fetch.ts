import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** Returns true for loopback, private, link-local and other non-routable IPs. */
export const isPrivateIp = (ip: string): boolean => {
  // Normalise IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const addr = mapped ? mapped[1] : ip;

  if (isIP(addr) === 4) {
    const [a, b] = addr.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true; // this-host / private / loopback
    if (a === 169 && b === 254) return true; // link-local (cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }

  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true; // unspecified / loopback
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  return false;
};

/**
 * Validate a user-supplied URL before fetching it, to prevent SSRF.
 * Only http(s) is allowed and the resolved host must not be a private/internal
 * address. Returns the parsed URL or throws.
 */
export const assertSafeUrl = async (raw: string): Promise<URL> => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("Blocked host");
  }

  // Literal IP in the URL: check directly.
  if (isIP(host) && isPrivateIp(host)) {
    throw new Error("Blocked host");
  }

  // Domain name: resolve and reject if it points at an internal address.
  if (!isIP(host)) {
    const { address } = await lookup(host);
    if (isPrivateIp(address)) throw new Error("Blocked host");
  }

  return url;
};
