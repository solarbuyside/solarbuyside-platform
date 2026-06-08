import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, RotateCcw, AlertTriangle, TrendingUp } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getSalesOverview } from "@/lib/greenn/sales";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paga", cls: "bg-emerald-500/10 text-emerald-600" },
  refunded: { label: "Reembolsada", cls: "bg-amber-500/10 text-amber-600" },
  chargedback: { label: "Chargeback", cls: "bg-red-500/10 text-red-600" },
  refused: { label: "Recusada", cls: "bg-slate-100 text-slate-500" },
  waiting_payment: { label: "Aguardando", cls: "bg-slate-100 text-slate-500" },
};

export default async function AdminVendasPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) notFound();

  const { paid, refunded, chargedback, net, recent } = await getSalesOverview();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-600">Vendas</span>
        </div>
        <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
          <ShoppingCart className="h-7 w-7 text-primary" />
          Vendas (Greenn)
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Eventos recebidos do webhook da Greenn. Vendas líquidas = pagas − reembolsos − chargebacks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={ShoppingCart} label="Pagas" value={paid} cls="text-emerald-600" />
        <Kpi icon={RotateCcw} label="Reembolsadas" value={refunded} cls="text-amber-600" />
        <Kpi icon={AlertTriangle} label="Chargebacks" value={chargedback} cls="text-red-600" />
        <Kpi icon={TrendingUp} label="Líquidas" value={net} cls="text-slate-900" />
      </div>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          Eventos recentes
        </h3>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-400 shadow-sm">
            Nenhum evento ainda. Quando houver compras na Greenn, aparecem aqui.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#09143c] text-white">
                  {["E-mail", "Status", "Pedido", "Quando"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((e, i) => {
                  const s = STATUS_LABEL[e.status ?? ""] ?? { label: e.status ?? "—", cls: "bg-slate-100 text-slate-500" };
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-4 py-2 text-slate-700">{e.email ?? "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-2 font-mono text-[12px] text-slate-500">{e.orderId ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500">{fmtDate(e.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  cls,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  cls: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className={`mt-2 text-3xl font-extrabold ${cls}`}>{value}</p>
    </div>
  );
}
