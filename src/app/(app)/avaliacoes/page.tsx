import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AvaliacoesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Avaliações Solar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e crie novas planilhas de comparação para seus fornecedores de energia solar.
          </p>
        </div>
        <Link
          href="/avaliacoes/nova"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground outline-none transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-[0_4px_15px_rgba(249,115,22,0.2)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nova Avaliação
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Comparison card */}
        <Card hoverGlow className="border-primary/20 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="orange" className="text-[10px]">ATIVO</Badge>
              <span className="text-[10px] text-slate-400 font-semibold">27.05.2026</span>
            </div>
            <CardTitle className="text-lg text-slate-900">Avaliação Residencial Gabriel</CardTitle>
            <CardDescription className="text-xs text-slate-500">6 Fornecedores • 2 Finalistas definidos</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-700 space-y-2">
            <p><strong>Melhor avaliado:</strong> SOLI SOLAR (9.2/10)</p>
            <p><strong>Finalistas escolhidos:</strong> RENOVA, SOLI SOLAR</p>
            <p className="text-[10px] text-slate-400">Criado a partir da planilha: <i>Solar Buy-Side 27.05.2026-1.xlsx</i></p>
          </CardContent>
          <CardFooter className="pt-4 justify-between bg-slate-50/50 border-t border-slate-100">
            <span className="text-xs text-slate-500">Ver detalhes técnicos</span>
            <Link href="/dashboard" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Abrir Painel <ArrowRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Dummy comparison card 2 */}
        <Card hoverGlow className="opacity-60 bg-white border border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-[10px]">CONCLUÍDO</Badge>
              <span className="text-[10px] text-slate-400 font-semibold">12.04.2026</span>
            </div>
            <CardTitle className="text-lg text-slate-900">Projeto Comercial Solar SP</CardTitle>
            <CardDescription className="text-xs text-slate-500">3 Fornecedores • Contrato Fechado</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p><strong>Melhor avaliado:</strong> ENERGIA SGE (8.4/10)</p>
            <p><strong>Vencedor contratado:</strong> ENERGIA SGE</p>
            <p className="text-[10px] text-slate-400">Armazenado no banco de dados Supabase</p>
          </CardContent>
          <CardFooter className="pt-4 justify-between bg-slate-50/50 border-t border-slate-100">
            <span className="text-xs text-slate-500">Arquivado</span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1 cursor-not-allowed">
              Visualizar <ArrowRight className="h-3 w-3" />
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
