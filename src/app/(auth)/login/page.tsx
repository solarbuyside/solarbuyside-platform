import Link from "next/link";

import { signInAction, signUpAction } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-10 text-[#020719]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="flex flex-col justify-center rounded-lg bg-[#020719] p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">
              Solar Buy-Side
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
              Entre para comparar propostas solares com criterio.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/72">
              Organize vendedores, pontue empresa e tecnologia, preserve a viabilidade financeira
              como comparativo e escolha duas finalistas para negociar melhor.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {params.error ? (
              <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                {params.error}
              </div>
            ) : null}
            {params.message ? (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {params.message}
              </div>
            ) : null}

            <div className="grid gap-6">
              <form action={signInAction} className="grid gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Login</h2>
                  <p className="mt-1 text-sm text-slate-600">Acesse seu dashboard.</p>
                </div>
                <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
                <label className="grid gap-2 text-sm font-medium">
                  E-mail
                  <input
                    className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Senha
                  <input
                    className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button className="h-11 rounded-md bg-[#f97316] px-4 font-semibold text-white transition hover:bg-[#ea580c]">
                  Entrar
                </button>
                <Link className="text-sm font-medium text-[#020719] underline" href="/reset-password">
                  Esqueci minha senha
                </Link>
              </form>

              <div className="h-px bg-slate-200" />

              <form action={signUpAction} className="grid gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Criar conta</h2>
                  <p className="mt-1 text-sm text-slate-600">Comece com e-mail e senha.</p>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  Nome
                  <input
                    className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  E-mail
                  <input
                    className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Senha
                  <input
                    className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
                    minLength={8}
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </label>
                <button className="h-11 rounded-md border border-[#020719] px-4 font-semibold text-[#020719] transition hover:bg-slate-50">
                  Criar conta
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
