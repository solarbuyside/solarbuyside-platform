import { Lightbulb } from "lucide-react";

export default function GuiasPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Guias</h2>
        <p className="text-sm text-slate-500 mt-1">
          Conteúdo de apoio à análise de propostas.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Em produção</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Ainda não há conteúdo nesta seção. Em breve disponibilizaremos os guias por aqui.
        </p>
      </div>
    </div>
  );
}
