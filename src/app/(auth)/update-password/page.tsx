import { updatePasswordAction } from "../actions";

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8fafc] px-6 text-[#020719]">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Nova senha</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Crie uma senha nova para continuar usando a plataforma.
        </p>

        {params.error ? (
          <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            {params.error}
          </div>
        ) : null}

        <form action={updatePasswordAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Nova senha
            <input
              className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
              minLength={8}
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Confirmar senha
            <input
              className="h-11 rounded-md border border-slate-300 px-3 text-base outline-none focus:border-[#f97316] focus:ring-2 focus:ring-orange-100"
              minLength={8}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <button className="h-11 rounded-md bg-[#f97316] px-4 font-semibold text-white transition hover:bg-[#ea580c]">
            Atualizar senha
          </button>
        </form>
      </section>
    </main>
  );
}
