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
 * Equipe interna PADRÃO (e-mail → papel). Desde a migration 0028 o papel de
 * verdade vem da tabela user_roles (o Francis troca pelo /admin/usuarios);
 * este mapa só vale para quem ainda não tem papel salvo no banco, e para as
 * contas protegidas (sempre). Ver src/lib/auth/roles.ts. Pode ser
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

/**
 * Contas protegidas: o papel delas é SEMPRE o do mapa acima (a tabela
 * user_roles é ignorada) e ninguém pelo painel consegue trocar o papel,
 * bloquear ou remover. É a conta do desenvolvedor, que precisa continuar
 * entrando no painel aconteça o que acontecer com os outros papéis.
 */
const PROTECTED_ACCOUNTS: readonly string[] = ["gab.feelix@gmail.com"];

export function isProtectedAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return PROTECTED_ACCOUNTS.includes(email.trim().toLowerCase());
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

/**
 * Deploy Hook (Vercel) da landing. O Publicar do /admin dispara este hook para
 * rebuildar a LP: o HTML servido é pré-renderizado no build, então sem rebuild
 * o Google e as IAs continuam lendo o conteúdo anterior (o navegador não —
 * o JS hidrata com o banco).
 */
export function getLandingDeployHookUrl() {
  return cleanEnv(process.env.LANDING_DEPLOY_HOOK_URL);
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
