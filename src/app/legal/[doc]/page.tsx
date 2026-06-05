import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LEGAL_DOCS, getLegalDoc } from "@/lib/legal/content";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const found = getLegalDoc(doc);
  return { title: found ? `${found.title} · Solar Buy-Side` : "Documento" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const found = getLegalDoc(doc);
  if (!found) notFound();

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Topo */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/favicon.png" alt="Solar Buy-Side" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold tracking-tight text-slate-900">Solar Buy-Side</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <article className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{found.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{found.subtitle}</p>

        {/* Navegação entre os documentos legais */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {LEGAL_DOCS.map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              className={
                d.slug === found.slug
                  ? "rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-200"
              }
            >
              {d.title}
            </Link>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          {found.blocks.map((block, i) =>
            block.type === "heading" ? (
              <h2 key={i} className="pt-4 text-lg font-bold text-slate-900">
                {block.text}
              </h2>
            ) : (
              <p key={i} className="text-justify text-[15px] leading-relaxed text-slate-700">
                {block.text}
              </p>
            ),
          )}
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-400">
          Buy-Side Soluções Inova Simples · CNPJ 55.463.086/0001-80 · Maringá-PR ·{" "}
          <a href="mailto:contato@buyside.com.br" className="font-semibold text-primary hover:underline">
            contato@buyside.com.br
          </a>
        </footer>
      </article>
    </main>
  );
}
