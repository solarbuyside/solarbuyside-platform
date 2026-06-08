import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Download } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getLeadsOverview } from "@/lib/landing/leads";

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminLeadsPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const { newsletterCount, ebookCount, newsletter, ebook } = await getLeadsOverview();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-600">Leads</span>
        </div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <Users className="h-7 w-7 text-primary" />
          Leads da Landing
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Dados reais do Supabase (capturados pelos formulários da LP). Newsletter e Ebook.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <Kpi icon={Mail} label="Newsletter" value={newsletterCount} />
        <Kpi icon={Download} label="Ebook (teaser)" value={ebookCount} />
      </div>

      {/* Ebook leads */}
      <LeadTable
        title="Ebook — últimos 100"
        empty="Nenhum lead de ebook ainda."
        head={["Nome", "E-mail", "Celular", "Quando"]}
        rows={ebook.map((l) => [
          [l.nome, l.sobrenome].filter(Boolean).join(" ") || "—",
          l.email,
          l.celular || "—",
          fmtDate(l.createdAt),
        ])}
      />

      {/* Newsletter leads */}
      <LeadTable
        title="Newsletter — últimos 100"
        empty="Nenhum inscrito ainda."
        head={["E-mail", "Quando"]}
        rows={newsletter.map((l) => [l.email, fmtDate(l.createdAt)])}
      />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function LeadTable({
  title,
  empty,
  head,
  rows,
}: {
  title: string;
  empty: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-400 shadow-sm">
          {empty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#09143c] text-white">
                {head.map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                  {r.map((c, j) => (
                    <td key={j} className="px-4 py-2 text-slate-700">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
