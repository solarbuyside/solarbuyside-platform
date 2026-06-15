const DEFAULT_SUPABASE_URL = "https://phuomgqgucrcljwddrmq.supabase.co";

export function cleanEnv(value: string | undefined) {
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

/**
 * Papéis da equipe interna (staff) com acesso ao painel admin.
 * - "admin": dono — pode tudo, inclusive remover/bloquear outros admins.
 * - "writer": acesso total ao painel, mas NÃO pode remover/bloquear um admin.
 */
export type StaffRole = "admin" | "writer";

/**
 * Equipe interna padrão (e-mail → papel). É a fonte de verdade de runtime para
 * o acesso ao painel e para as regras de proteção (writer não remove admin).
 * Mantido em config (não no banco) de propósito: a equipe é fixa e pequena, e
 * assim não há risco de se trancar fora por um UPDATE errado. Pode ser
 * estendido/ajustado via env STAFF_ROLES="email:admin,email:writer".
 */
const DEFAULT_STAFF_ROLES: Record<string, StaffRole> = {
  "francis_poloni@yahoo.com.br": "admin",
  "contato@buyside.com.br": "admin",
  "gab.feelix@gmail.com": "writer",
};

function parseStaffRolesEnv(): Record<string, StaffRole> {
  const raw = cleanEnv(process.env.STAFF_ROLES);
  if (!raw) return {};
  const out: Record<string, StaffRole> = {};
  for (const pair of raw.split(",")) {
    const [email, role] = pair.split(":").map((s) => s?.trim().toLowerCase());
    if (email && (role === "admin" || role === "writer")) out[email] = role;
  }
  return out;
}

/** Mapa efetivo de staff (defaults sobrescritos pelo env STAFF_ROLES). */
export function getStaffRoles(): Record<string, StaffRole> {
  return { ...DEFAULT_STAFF_ROLES, ...parseStaffRolesEnv() };
}

/** Papel de staff do e-mail ("admin"/"writer") ou null se não for da equipe. */
export function staffRoleForEmail(email: string | null | undefined): StaffRole | null {
  if (!email) return null;
  return getStaffRoles()[email.trim().toLowerCase()] ?? null;
}

export function getAdminEmails() {
  const raw = cleanEnv(process.env.ADMIN_EMAILS);
  const fromEnv = raw
    ? raw.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)
    : [];
  // Todo staff (admin + writer) tem acesso ao painel; soma com o que vier do env.
  return Array.from(new Set([...Object.keys(getStaffRoles()), ...fromEnv]));
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
