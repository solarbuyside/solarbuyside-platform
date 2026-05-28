import { History, Calendar, Award, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoricoPage() {
  const historyItems = [
    {
      id: "1",
      date: "27 de Maio, 2026 - 15:30",
      action: "Finalistas atualizados",
      details: "Você escolheu RENOVA e SOLI SOLAR como os finalistas oficiais do projeto residencial.",
      user: "Gabriel Barbosa",
    },
    {
      id: "2",
      date: "27 de Maio, 2026 - 14:15",
      action: "Planilha XLSX importada",
      details: "Importação com sucesso de 'Planilha de avaliacao de propostas Solar Buy-Side 27.05.2026-1.xlsx' contendo 6 fornecedores.",
      user: "Gabriel Barbosa",
    },
    {
      id: "3",
      date: "12 de Abril, 2026 - 09:00",
      action: "Avaliação Concluída",
      details: "Projeto Comercial Solar SP foi fechado e assinado com o fornecedor ENERGIA SGE.",
      user: "Gabriel Barbosa",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">Histórico de Atividades</h2>
        <p className="text-sm text-slate-500 mt-1">
          Registro completo de auditoria das decisões de compra e alterações de critérios solares.
        </p>
      </div>

      <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-8 py-2">
        {historyItems.map((item) => (
          <div key={item.id} className="relative">
            {/* Dot marker */}
            <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary border-4 border-[#f8fafc] shadow-[0_0_8px_rgba(249,115,22,0.3)]" />

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.date}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <Badge variant="orange" className="w-fit text-[9px] uppercase tracking-wide">
                  {item.action}
                </Badge>
              </div>

              <Card className="bg-white border-slate-200 shadow-sm max-w-2xl">
                <CardContent className="p-4 space-y-1">
                  <p className="text-sm text-slate-700">{item.details}</p>
                  <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400">
                    <span>Executor: {item.user}</span>
                    <span className="flex items-center gap-0.5 hover:text-slate-600 cursor-pointer">
                      Ver log <ExternalLink className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
