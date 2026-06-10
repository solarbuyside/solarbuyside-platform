import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { listLegalDocs } from "@/lib/legal/admin";
import { LegalEditor } from "./editor";

export default async function AdminLegalPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const docs = await listLegalDocs();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-600">Documentos legais</span>
        </div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <Scale className="h-7 w-7 text-primary" />
          Documentos legais
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Edite os textos de Termos, Privacidade e Antipirataria — da <strong>Landing</strong> e da{" "}
          <strong>Plataforma</strong>. Salvar reflete nas páginas (sem deploy).
        </p>
      </div>

      <LegalEditor docs={docs} />
    </div>
  );
}
