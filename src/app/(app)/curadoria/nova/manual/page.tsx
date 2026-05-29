import { FileText } from "lucide-react";

import { ReviewEditor } from "../review-editor";

export default function CuradoriaManualPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-5">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Curadoria</span>
          <span>/</span>
          <span className="text-slate-600">Texto manual</span>
        </div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <FileText className="h-6 w-6 text-primary" />
          Analisar contrato (texto)
        </h2>
        <p className="mt-1 text-sm text-slate-500">Cole o texto do contrato para a análise por regras.</p>
      </div>

      <ReviewEditor mode="manual" />
    </div>
  );
}
