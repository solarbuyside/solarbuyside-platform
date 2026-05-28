"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  Zap, 
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createComparisonDraftAction } from "../actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRESET_PLACEHOLDERS = [
  "Ex: Soli Solar",
  "Ex: Renova Energia",
  "Ex: EcoPower Brasil",
  "Ex: Neosolar",
  "Ex: Blue Sol Energia",
  "Ex: SunVolt Tech"
];

export default function NovaAvaliacaoPage() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [title, setTitle] = React.useState("Avaliação Solar Residencial");
  const [competitors, setCompetitors] = React.useState<string[]>(["", "", ""]);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleAddCompetitor = () => {
    if (competitors.length >= 6) return;
    setCompetitors([...competitors, ""]);
    setError(null);
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length <= 2) {
      setError("Você precisa de pelo menos 2 fornecedores para realizar uma comparação.");
      return;
    }
    const updated = [...competitors];
    updated.splice(index, 1);
    setCompetitors(updated);
    setError(null);
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
    if (error) setError(null);
  };

  // Pre-fill some names on click for testing/convenience
  const fillMockData = () => {
    setTitle("Avaliação Solar Gabriel");
    setCompetitors(["RENOVA", "SOLI SOLAR", "ECOPOWER", ""]);
    setError(null);
  };

  const validateStep1 = () => {
    if (title.trim().length < 3) {
      setError("O nome da avaliação deve conter no mínimo 3 caracteres.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateStep1()) return;

    // Filter out empty names
    const activeCompetitors = competitors.map(c => c.trim()).filter(Boolean);

    if (activeCompetitors.length < 2) {
      setError("Por favor, preencha o nome de pelo menos 2 fornecedores.");
      return;
    }

    if (activeCompetitors.length > 6) {
      setError("O limite máximo de fornecedores para comparação é 6.");
      return;
    }

    // Construct FormData to submit to our Server Action
    const formData = new FormData();
    formData.append("title", title.trim());
    activeCompetitors.forEach(name => {
      formData.append("competitorNames", name);
    });

    startTransition(async () => {
      try {
        await createComparisonDraftAction(formData);
      } catch (err: unknown) {
        // Next.js redirect internally throws a NEXT_REDIRECT error which is normal behavior.
        // We only show errors if it's not a redirect
        const message = err instanceof Error ? err.message : "";
        if (message && !message.includes("NEXT_REDIRECT")) {
          setError(message || "Erro inesperado ao criar a avaliação. Tente novamente.");
        }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Navigation Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <Link href="/avaliacoes" className="hover:text-primary transition-colors">
              Avaliações
            </Link>
            <span>/</span>
            <span className="text-slate-600">Nova Comparação</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Nova Comparação
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure seu projeto e adicione os fornecedores para iniciar a análise técnica e viabilidade.
          </p>
        </div>

        <Link
          href="/avaliacoes"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:border-primary/50 hover:bg-slate-200 transition-all duration-200 ease-in-out active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lista
        </Link>
      </div>

      {/* Grid: Form and Side-info card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Wizard Form Container */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Step Indicator Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  step === 1 
                    ? "bg-primary text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                )}
              >
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Passo 1</span>
                <span className="text-sm font-bold text-slate-800">Escopo do Projeto</span>
              </div>
            </div>

            <div className="flex-1 max-w-[80px] md:max-w-xs mx-4 h-0.5 bg-slate-200 rounded relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: step === 1 ? "0%" : "100%" }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  step === 2 
                    ? "bg-primary text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                )}
              >
                2
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Passo 2</span>
                <span className="text-sm font-bold text-slate-800">Fornecedores Solares</span>
              </div>
            </div>
          </div>

          {/* Form Box */}
          <Card className="border-slate-200/80 shadow-md bg-white overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
              
              {/* STEP 1 CONTENT */}
              {step === 1 && (
                <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Nome do Projeto e Avaliação
                    </h3>
                    <p className="text-xs text-slate-500">
                      Escolha um título representativo. Isso ajudará você e seu cliente a identificar facilmente este estudo comparativo no histórico da plataforma.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="title" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Nome da avaliação <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
                      <input
                        id="title"
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full h-13 pl-12 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                        placeholder="Ex: Avaliação Residencial Gabriel - 10kWp"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Dica: Tente incluir a potência estimada ou o nome do cliente no título.
                    </span>
                  </div>

                  {/* Suggestion pill shortcut */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs font-semibold text-slate-500">Sugestões rápidas:</span>
                    <button
                      type="button"
                      onClick={() => setTitle("Avaliação Solar Residencial Gabriel")}
                      className="text-xs bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary border border-slate-200 px-3 py-1 rounded-full transition-all"
                    >
                      Residencial Gabriel
                    </button>
                    <button
                      type="button"
                      onClick={() => setTitle("Projeto Comercial Solar SP")}
                      className="text-xs bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary border border-slate-200 px-3 py-1 rounded-full transition-all"
                    >
                      Comercial SP
                    </button>
                    <button
                      type="button"
                      onClick={fillMockData}
                      className="text-xs bg-orange-500/10 text-orange-600 border border-orange-500/20 px-3 py-1 rounded-full transition-all flex items-center gap-1 hover:bg-orange-500/20"
                    >
                      <Sparkles className="h-3 w-3" /> Preencher Rascunho Completo
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 CONTENT */}
              {step === 2 && (
                <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Fornecedores em Disputa
                    </h3>
                    <p className="text-xs text-slate-500">
                      Adicione de 2 a 6 empresas fornecedoras que enviaram propostas comerciais de energia solar. Os campos em branco serão desconsiderados.
                    </p>
                  </div>

                  {/* Dynamic Fields List */}
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {competitors.map((name, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-sm font-bold">
                          #{index + 1}
                        </div>
                        
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleCompetitorChange(index, e.target.value)}
                            required={index < 2}
                            placeholder={PRESET_PLACEHOLDERS[index] || `Fornecedor ${index + 1}`}
                            className={cn(
                              "w-full h-11 px-4 rounded-lg bg-slate-50 border text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none",
                              index < 2 ? "border-slate-200/80" : "border-slate-200"
                            )}
                          />
                          {index < 2 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/70 uppercase">
                              Obrigatório
                            </span>
                          )}
                        </div>

                        {competitors.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(index)}
                            disabled={isPending}
                            className="p-3 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-150 active:scale-95 disabled:opacity-50"
                            title="Remover fornecedor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Dynamic slots helper */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">
                      {competitors.length} de 6 vagas preenchidas
                    </span>

                    {competitors.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddCompetitor}
                        disabled={isPending}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 text-xs font-bold text-primary hover:bg-primary/20 transition-all active:scale-[0.97] disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar Fornecedor
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="p-4 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in shake duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="font-semibold">{error}</div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="p-6 bg-slate-50/50 flex items-center justify-between gap-4">
                
                {/* Cancel or back */}
                {step === 1 ? (
                  <Link
                    href="/avaliacoes"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-[0.98]"
                  >
                    Cancelar
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null); }}
                    disabled={isPending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>
                )}

                {/* Confirm or forward */}
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.2)] active:scale-[0.98]"
                  >
                    Avançar
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                      "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_15px_rgba(249,115,22,0.3)] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed",
                      isPending && "relative overflow-hidden"
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Criando Rascunho...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-white text-white" />
                        Criar Rascunho da Comparação
                      </>
                    )}
                  </button>
                )}

              </div>
            </form>
          </Card>
        </div>

        {/* Info Column Sidebar (Right Side on large screen) */}
        <div className="space-y-6">
          
          {/* Guide Card */}
          <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-[#020719] text-white p-5 border-b border-white/5 relative">
              {/* Background gradient hint */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Guia de Comparação</CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">Solar Buy-Side Platform</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
              
              <div className="space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Objetivo Principal
                </span>
                <p>
                  O assistente cria uma estrutura de rascunho. Posteriormente, você poderá preencher os detalhes técnicos, garantindo uma comparação baseada em dados reais e na planilha padrão de referência do Solar Buy-Side.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Mínimo de Fornecedores
                </span>
                <p>
                  A comparação exige no mínimo <strong>2 concorrentes</strong> e aceita no máximo <strong>6</strong> para manter a legibilidade das tabelas e a solidez estatística da matriz de avaliação.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Como a pontuação é calculada?
                </span>
                <p>
                  A plataforma pontua cada fornecedor baseado em critérios técnicos (garantias, equipamentos, potência) e na reputação comercial. Conforme as regras, o cálculo é feito em TypeScript puro isolado.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Escolha exatamente 2 finalistas no painel técnico após a criação.</span>
              </div>
            </CardContent>
          </Card>

          {/* Dica do Especialista Widget */}
          <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-primary/10 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
              <Zap className="h-28 w-28 text-primary" />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="orange" className="text-[10px]">RECOMENDADO</Badge>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dica do sistema</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Agrupe propostas com prazos similares</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Para obter uma matriz de viabilidade financeira coerente, tente cadastrar fornecedores cujos orçamentos possuam validades próximas.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
