import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { AuthShell, AuthAlert } from "../_components/auth-shell";

type CadastroPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Acesso pela compra</h2>
        <p className="mt-1 text-sm text-slate-500">
          O acesso à plataforma é um bônus de quem adquire o Manual Solar Buy-Side.
        </p>
      </div>

      <AuthAlert error={params.error} message={params.message} />

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          Ao comprar o <strong>Manual de Compra Solar Buy-Side</strong>, seu acesso é liberado
          automaticamente com o mesmo e-mail usado na compra. Você recebe um e-mail para criar a
          senha e entrar.
        </p>
        <a
          href="https://solarbuyside.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/95 active:scale-[0.98]"
        >
          Quero adquirir o Manual
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem acesso?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
