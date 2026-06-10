"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  BookOpen,
  History,
  UserCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { markOnboardedAction } from "./onboarding-actions";

type Slide = {
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: Sparkles,
    badge: "Bem-vindo",
    title: "Bem-vindo à Plataforma Solar Buy-Side!",
    body: "Aqui você aprende a comprar seu sistema solar como um profissional e compara propostas com critério. Vamos te mostrar o essencial em alguns passos.",
  },
  {
    icon: FileSpreadsheet,
    badge: "Avaliações",
    title: "Compare propostas em uma tabela",
    body: "Na aba Avaliações você cadastra os fornecedores, preenche os dados de cada proposta e a plataforma pontua empresa, tecnologia e viabilidade — lado a lado, para você escolher as melhores.",
  },
  {
    icon: BookOpen,
    badge: "Manual",
    title: "O Manual completo de compra",
    body: "O guia definitivo de compra de sistema solar, com índice navegável e busca. Acompanhe seu progresso de leitura e continue de onde parou, a qualquer momento.",
  },
  {
    icon: History,
    badge: "Histórico",
    title: "Acompanhe seu histórico",
    body: "Toda a sua atividade fica registrada na aba Histórico — avaliações criadas, respostas de fornecedores e decisões — para você consultar quando precisar.",
  },
  {
    icon: UserCircle,
    badge: "Perfil & Legal",
    title: "Seu perfil no canto superior direito",
    body: "No menu do seu perfil (canto superior direito) você acessa Configurações, os Termos de Uso, a Política de Privacidade e as Medidas Antipirataria. É também por lá que você sai da conta.",
  },
];

/** Evento global para reabrir o tour a partir do menu do perfil. */
export const OPEN_ONBOARDING_EVENT = "sbs:open-onboarding";

export function OnboardingModal({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = React.useState(autoOpen);
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  // Reabrir o tour quando o usuário clica em "Ver tour de boas-vindas".
  React.useEffect(() => {
    function reopen() {
      setStep(0);
      setOpen(true);
    }
    window.addEventListener(OPEN_ONBOARDING_EVENT, reopen);
    return () => window.removeEventListener(OPEN_ONBOARDING_EVENT, reopen);
  }, []);

  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];
  const Icon = slide.icon;

  async function finish() {
    setSaving(true);
    try {
      await markOnboardedAction();
    } catch {
      /* não bloqueia o usuário se falhar */
    }
    setSaving(false);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 sm:rounded-2xl">
        {/* Pular */}
        <button
          onClick={finish}
          disabled={saving}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          Pular <X className="h-3.5 w-3.5" />
        </button>

        {/* Topo ilustrado */}
        <div className="relative flex flex-col items-center gap-4 bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d] px-8 pb-8 pt-10 text-center text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 80%)",
            }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <span className="relative rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            {slide.badge}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="px-7 py-6 text-center sm:px-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{slide.title}</h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-slate-500">{slide.body}</p>

          {/* Indicadores */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Passo ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-slate-200 hover:bg-slate-300",
                )}
              />
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          {isLast ? (
            <button
              onClick={finish}
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-[1px] hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              Começar a usar
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(SLIDES.length - 1, s + 1))}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-[1px] hover:bg-primary/90 active:scale-[0.98]"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
