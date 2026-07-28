/**
 * Shared URL helpers for primary website capture on user creation.
 * Keep Edge Function copies in sync if this logic changes.
 */

/** Returns true when the string is a plausible http(s) URL (or bare domain). */
export function isPlausibleWebsiteInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    normaliseWebsiteUrl(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Trim, ensure https:// if bare domain, lowercase host.
 * Throws if the value cannot be parsed as http(s).
 */
export function normaliseWebsiteUrl(raw: string): string {
  let input = raw.trim();
  if (!input) {
    throw new Error("URL is empty");
  }
  if (/\s/.test(input)) {
    throw new Error("URL must not contain spaces");
  }
  if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("URL is not valid");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://");
  }
  parsed.hostname = parsed.hostname.toLowerCase();
  if (
    (parsed.protocol === "https:" && parsed.port === "443") ||
    (parsed.protocol === "http:" && parsed.port === "80")
  ) {
    parsed.port = "";
  }
  if (!parsed.pathname || parsed.pathname === "/") {
    return parsed.origin;
  }
  if (parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

/** Hostname without www. and without path, for the websites.name column. */
export function websiteDisplayName(url: string): string {
  const parsed = new URL(url);
  let host = parsed.hostname.toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  return host;
}

/** Microlink screenshot URL used as an <img src>. */
export function microlinkScreenshotUrl(websiteUrl: string): string {
  const params = new URLSearchParams({
    url: websiteUrl,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": "1280",
    "viewport.height": "800",
    waitUntil: "networkidle2",
  });
  return `https://api.microlink.io/?${params.toString()}`;
}
