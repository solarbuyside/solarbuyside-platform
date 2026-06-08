import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { CircleAlert, MailCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";
import { verify2faToken, TWO_FA_COOKIE } from "@/lib/auth/two-factor";
import { VerifyForm } from "./verify-form";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const head = user.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const email = (data?.claims?.email as string | undefined) ?? "";

  if (!userId) redirect("/login");
  if (isAdminEmail(email)) redirect("/dashboard"); // admins não usam 2FA

  const cookieStore = await cookies();
  if (verify2faToken(userId, cookieStore.get(TWO_FA_COOKIE)?.value)) {
    redirect("/dashboard"); // já verificado neste login
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-5">
      <div className="w-full max-w-md">
        {params.error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <MailCheck className="h-4 w-4 shrink-0" />
            {params.message}
          </div>
        )}
        <VerifyForm email={maskEmail(email)} sent={params.sent === "1"} />
      </div>
    </main>
  );
}
