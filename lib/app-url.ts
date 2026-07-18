/**
 * Absolute base URL of this deployment, used to build the tracking-snippet
 * install tag. The snippet runs on the *customer's* page, so its script src
 * and collection endpoint must be absolute — a relative "/lambda-snippet.js"
 * would resolve against the customer's own origin.
 *
 * Set NEXT_PUBLIC_APP_URL to your canonical domain in production. Falls back
 * to Vercel's provided production URL, then to an empty string (relative) for
 * same-origin local development.
 */
export function appBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "";
}
