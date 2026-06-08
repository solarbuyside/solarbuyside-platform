import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listLandingSections, getLandingGlobals } from "@/lib/landing/content-admin";
import { LandingEditor } from "./editor";

export default async function AdminLandingPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const [sections, globals] = await Promise.all([listLandingSections(), getLandingGlobals()]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-600">Conteúdo da Landing</span>
        </div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <FileText className="h-7 w-7 text-primary" />
          Conteúdo da Landing
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Edite os textos da landing page. As alterações são salvas no Supabase e refletem na LP
          (a landing lê daqui; este conteúdo sobrescreve os textos padrão).
        </p>
      </div>

      <LandingEditor sections={sections} globals={globals} />
    </div>
  );
}
