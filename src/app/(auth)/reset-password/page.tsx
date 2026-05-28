import Link from "next/link";

import { resetPasswordAction } from "../actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-6 text-[#020719]">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Recuperar senha</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enviaremos um link seguro para criar uma nova senha.
        </p>

        {params.error ? (
          <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            {params.error}
          </div>
        ) : null}
        {params.message ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {params.message}
          </div>
        ) : null}

        <form action={resetPasswordAction} className="mt-6 grid gap-4">
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
          <button className="h-11 rounded-md bg-[#f97316] px-4 font-semibold text-white transition hover:bg-[#ea580c]">
            Enviar link
          </button>
        </form>

        <Link className="mt-5 inline-flex text-sm font-medium underline" href="/login">
          Voltar ao login
        </Link>
      </section>
    </main>
  );
}
