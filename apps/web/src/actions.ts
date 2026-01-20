export async function getTurnstileSiteKey(): Promise<string> {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    throw new Error("Turnstile site key is not configured");
  }
  return siteKey;
}
