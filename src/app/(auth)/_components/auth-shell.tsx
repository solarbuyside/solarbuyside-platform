import * as React from "react";
import { Zap, ShieldCheck, ListChecks, Trophy } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Empresa e tecnologia no centro",
    text: "Pontue cada fornecedor por critérios objetivos, não só pelo preço.",
  },
  {
    icon: ListChecks,
    title: "Preenchimento em passos",
    text: "Insira os dados de cada proposta com clareza e salve automaticamente.",
  },
  {
    icon: Trophy,
    title: "Escolha dois finalistas",
    text: "O sistema recomenda pelo ranking; a decisão final é sempre sua.",
  },
];

/**
 * Premium split-screen layout shared by all auth pages (login, signup, reset,
 * update). Left: dark brand panel (design.md sidebar tone). Right: the form card.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(2,7,25,0.25)] lg:min-h-[calc(100vh-4rem)]">
        {/* Brand panel */}
        <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d] p-10 text-white lg:flex xl:p-12">
          {/* Solar-panel grid texture (faint, fades out toward edges) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage:
                "radial-gradient(120% 90% at 70% 20%, black 30%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(120% 90% at 70% 20%, black 30%, transparent 80%)",
            }}
          />
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Brand */}
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 shadow-[0_0_18px_rgba(249,115,22,0.25)]">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold leading-none tracking-tight">Solar Buy-Side</p>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                SaaS Platform
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="relative max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Compre energia solar com critério
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight">
              Compare propostas solares e decida com confiança.
            </h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Organize vendedores, pontue empresa e tecnologia, use a viabilidade financeira como
              comparativo e escolha duas finalistas para negociar melhor.
            </p>
          </div>

          {/* Highlights */}
          <ul className="relative space-y-4">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs leading-5 text-slate-400">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Form panel */}
        <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14">
          {/* Mobile brand (shown when the dark panel is hidden) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Zap className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Solar Buy-Side
            </span>
          </div>

          <div className="mx-auto w-full max-w-sm">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function AuthAlert({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;
  return (
    <>
      {error ? (
        <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}
    </>
  );
}
