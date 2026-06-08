import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, FileText, Users, BarChart3, ShoppingCart, ArrowRight, TrendingUp, Scale } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getAdminOverview } from "@/lib/admin/overview";
import { getSalesOverview } from "@/lib/greenn/sales";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const [overview, sales] = await Promise.all([getAdminOverview(), getSalesOverview()]);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-6">
        <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Super Admin
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Painel Administrativo</h2>
        <p className="mt-1 text-sm text-slate-500">
          Organizado em <strong>Vendas</strong>, <strong>Landing Page</strong> e <strong>Plataforma</strong>.
        </p>
      </div>

      {/* VENDAS (Greenn) */}
      <Section title="Vendas (Greenn)" icon={ShoppingCart}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Pagas" value={sales.paid} accent="text-emerald-600" />
          <Kpi label="Reembolsadas" value={sales.refunded} accent="text-amber-600" />
          <Kpi label="Chargebacks" value={sales.chargedback} accent="text-red-600" />
          <Kpi label="Líquidas" value={sales.net} accent="text-slate-900" icon={TrendingUp} />
        </div>
        <Link
          href="/admin/vendas"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Ver todas as vendas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Section>

      {/* LANDING PAGE */}
      <Section title="Landing Page" icon={FileText}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NavCard
            href="/admin/landing"
            icon={FileText}
            title="Conteúdo da Landing"
            desc="Editar textos, imagens, depoimentos e configurações (link de venda, WhatsApp)."
          />
          <NavCard
            href="/admin/leads"
            icon={Users}
            title="Leads"
            desc="Inscritos da newsletter e do teaser (ebook), capturados pela LP."
          />
          <NavCard
            href="https://vercel.com/francis-solarbuyside/solarbuyside-landing/analytics"
            external
            icon={BarChart3}
            title="Métricas da LP (Vercel)"
            desc="Tráfego e performance (Web Analytics + Speed Insights)."
          />
          <NavCard
            href="/admin/legal"
            icon={Scale}
            title="Documentos legais"
            desc="Termos, Privacidade e Antipirataria — da Landing e da Plataforma."
          />
        </div>
      </Section>

      {/* PLATAFORMA */}
      <Section title="Plataforma" icon={ShieldCheck}>
        <AdminDashboard overview={overview} />
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
        {label}
      </div>
      <p className={`mt-1.5 text-2xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}

function NavCard({
  href,
  icon: Icon,
  title,
  desc,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
    </>
  );
  const cls =
    "block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
