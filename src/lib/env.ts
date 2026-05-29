const DEFAULT_SUPABASE_URL = "https://phuomgqgucrcljwddrmq.supabase.co";

function cleanEnv(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : undefined;
}

export function getPublicSupabaseConfig() {
  const url =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    cleanEnv(process.env.Project_URL_SUPABASE) ??
    cleanEnv(process.env.PROJECT_URL_SUPABASE) ??
    DEFAULT_SUPABASE_URL;
  const publishableKey =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    cleanEnv(process.env.PUBLISHABLE_KEY_SUPABASE) ??
    cleanEnv(process.env.ANON_PUBLIC_SUPABASE);

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for browser usage, or PUBLISHABLE_KEY_SUPABASE for server-only usage.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseSecretKey() {
  return (
    cleanEnv(process.env.SUPABASE_SECRET_KEY) ??
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    cleanEnv(process.env.SECRET_KEYS_SUPABASE) ??
    cleanEnv(process.env.SERVICE_ROLE_SUPABASE)
  );
}

export function getAdminEmails() {
  const raw = cleanEnv(process.env.ADMIN_EMAILS) ?? "gab.feelix@gmail.com";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getAppUrl() {
  const explicitUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL);
  if (explicitUrl) return explicitUrl;

  const vercelProductionUrl = cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProductionUrl) return `https://${vercelProductionUrl}`;

  const vercelUrl = cleanEnv(process.env.VERCEL_URL);
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}
