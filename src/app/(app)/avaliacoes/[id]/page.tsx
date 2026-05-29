import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  User, 
  FileSpreadsheet, 
  Sliders,
  ChevronRight,
  TrendingUp,
  Info
} from "lucide-react";

import { getComparisonSummary } from "@/lib/comparisons/repository";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AvaliacaoPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AvaliacaoPage({ params }: AvaliacaoPageProps) {
  const { id } = await params;
  const comparison = await getComparisonSummary(id).catch(() => null);

  if (!comparison) {
    notFound();
  }

  // Format date helper
  const createdDate = new Date(comparison.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Breadcrumb Navigation Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Link href="/avaliacoes" className="hover:text-primary transition-colors">
              Avaliações
            </Link>
            <span>/</span>
            <span className="text-slate-600">ID: {comparison.id.slice(0, 8)}...</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {comparison.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Rascunho de análise estruturado. Avance para o painel de avaliação técnica para inserir pesos e notas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/avaliacoes"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-primary/50 hover:bg-slate-200 transition-all duration-200 ease-in-out active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Lista
          </Link>

          <Link
            href={`/avaliacoes/${comparison.id}/preencher`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground outline-none transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.25)] active:scale-[0.98]"
          >
            <Sliders className="h-4 w-4" />
            Preencher Dados das Propostas
          </Link>
        </div>
      </div>

      {/* Success Success Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Comparação Criada com Sucesso!</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              O rascunho da planilha foi gravado no Supabase. O sistema está pronto para comparar os {comparison.competitorCount} fornecedores cadastrados.
            </p>
          </div>
        </div>
        <Badge variant="emerald" className="py-1 px-3 uppercase tracking-wider text-[10px] font-bold">
          Rascunho Ativo
        </Badge>
      </div>

      {/* Main Grid: Details and Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Details Box */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">Resumo da Estrutura</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Dados do rascunho de comparação</CardDescription>
                </div>
                <Badge variant="orange" className="text-[10px] uppercase font-bold">
                  {comparison.competitorCount} Fornecedores
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Properties row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID da Comparação</span>
                  <span className="text-sm font-semibold text-slate-800 break-all">{comparison.id}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Criado por</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    Gabriel Barbosa
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data de Criação</span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    {createdDate}
                  </span>
                </div>
              </div>

              {/* Competitors List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lista de Fornecedores Cadastrados
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {comparison.competitors.map((competitor) => (
                    <div 
                      key={competitor.id}
                      className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold shrink-0">
                          #{competitor.position}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">
                          {competitor.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">Pendente Dados</Badge>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-slate-50/30 p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <span className="text-xs text-slate-500">
                O arquivo original <i>Planilha de avaliacao de propostas Solar Buy-Side.xlsx</i> serve como base conceitual.
              </span>
              
              <Link
                href={`/avaliacoes/${comparison.id}/preencher`}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 group active:translate-x-0.5 transition-transform"
              >
                Começar Preenchimento <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Recommendations & Wizard Guidance */}
        <div className="space-y-6">
          
          {/* Next Steps Box */}
          <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#020719] text-white p-5 border-b border-white/5 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Próximos Passos</CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">Guia de fluxo da plataforma</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
              
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-primary font-bold text-[10px]">
                  1
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Preencher os Dados</span>
                  <p>Insira os dados de cada proposta passo a passo (empresa, técnico e financeiro).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400 font-bold text-[10px]">
                  2
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Inserir Dados das Propostas</span>
                  <p>Preencha os valores comerciais, prazos de entrega, garantias de inversores, e nota de histórico comercial.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-400 font-bold text-[10px]">
                  3
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Escolher Finalistas</span>
                  <p>Marque exatamente dois finalistas para gerar a comparação final de viabilidade.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>O algoritmo calculará os scores baseados na camada pura de domínio em TypeScript.</span>
              </div>

            </CardContent>
          </Card>

          {/* Dica da Planilha */}
          <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-primary/10 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
              <FileSpreadsheet className="h-28 w-28 text-primary" />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="orange" className="text-[10px]">XLSX COMPATÍVEL</Badge>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Exportador</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Pronto para Exportação</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Ao finalizar a parametrização dos fornecedores, você poderá gerar um relatório em formato Excel `.xlsx` idêntico à planilha de referência do projeto.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
