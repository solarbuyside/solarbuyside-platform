import { notFound } from "next/navigation";
import { Zap } from "lucide-react";

import { resolveShareToken } from "@/lib/comparisons/share";
import { ResponderForm } from "./responder-form";

type ResponderPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResponderPage({ params }: ResponderPageProps) {
  const { token } = await params;
  const target = await resolveShareToken(token).catch(() => null);

  if (!target) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Brand bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Zap className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">Solar Buy-Side</p>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Formulário do fornecedor
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Proposta de {target.companyName}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Preencha os dados técnicos e financeiros da sua proposta. Suas respostas são enviadas
            diretamente ao comprador. Não é necessário criar conta.
          </p>
        </div>

        <ResponderForm
          token={token}
          initialTechnical={target.technical}
          initialFinancial={target.financial}
        />
      </div>
    </main>
  );
}
