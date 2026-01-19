"use server";

export async function getTurnstileSiteKey(): Promise<string> {
  const siteKey = process.env.TURNSTILE_SITE_KEY;
  if (!siteKey) {
    throw new Error("Turnstile site key is not configured");
  }
  return siteKey;
}
