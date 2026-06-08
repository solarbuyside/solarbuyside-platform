import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticação por e-mail (recuperação de senha, 1º acesso Greenn,
 * confirmação). Estabelece a sessão server-side a partir do `token_hash`
 * (verifyOtp) ou do `code` (PKCE), grava os cookies e segue para `next`.
 *
 * Sem esta rota, o link do e-mail levaria direto ao /update-password sem
 * sessão e o updateUser() falharia com "Auth session missing".
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/update-password";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/update-password";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link inválido ou expirado. Solicite um novo.")}`,
  );
}
