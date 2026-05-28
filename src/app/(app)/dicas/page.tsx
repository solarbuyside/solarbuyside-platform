import { CheckCircle2, ShieldCheck, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DicasPage() {
  const tips = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Garantia de Execução vs Garantia de Equipamento",
      desc: "Não confunda a garantia do módulo (que costuma ser de 25 anos dada pelo fabricante) com a garantia de projeto e execução (dada pela instaladora, geralmente 3 a 5 anos). Exija no mínimo 3 anos de garantia de execução para cobrir eventuais infiltrações ou falhas na fixação física.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      title: "Por que a confiabilidade do Inversor é crítica?",
      desc: "O inversor é o cérebro do sistema solar e a peça que mais sofre estresse elétrico. Marcas 'Tier 1' (como Fronius, GoodWe, Growatt) oferecem suporte pós-venda estruturado no Brasil e menores taxas de falha comparado a marcas desconhecidas importadas de baixo custo.",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-amber-600" />,
      title: "Payback Simples vs Custo por Ponto",
      desc: "Um fornecedor muito barato pode pontuar mal nos critérios de qualidade e garantia. Use a métrica de 'Custo por Ponto' (Investimento dividido pelos pontos técnicos acumulados) para encontrar a proposta que oferece o melhor custo-benefício real, e não apenas o menor preço nominal.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Guia de Boas Práticas Solar</h2>
        <p className="text-sm text-slate-500 mt-1">
          Dicas estratégicas para auxiliar o tomador de decisão a avaliar propostas e minimizar riscos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, idx) => (
          <Card key={idx} hoverGlow className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 shadow-sm">
                {tip.icon}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">{tip.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500">Dica #{idx + 1}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 text-xs leading-relaxed">{tip.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
