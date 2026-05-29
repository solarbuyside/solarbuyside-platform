import {
  GraduationCap,
  Sun,
  Cpu,
  Wallet,
  ShieldCheck,
  FileSearch,
  Trophy,
  Clock,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Lesson = { title: string; minutes: number };
type Module = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  level: "Iniciante" | "Intermediário" | "Avançado";
  lessons: Lesson[];
};

const MODULES: Module[] = [
  {
    title: "Fundamentos da energia solar",
    description: "Como funciona um sistema fotovoltaico, componentes e o básico de geração.",
    icon: Sun,
    level: "Iniciante",
    lessons: [
      { title: "O que é energia solar fotovoltaica", minutes: 8 },
      { title: "Módulos, inversores e estruturas", minutes: 12 },
      { title: "Geração, consumo e compensação", minutes: 10 },
    ],
  },
  {
    title: "Avaliando a empresa instaladora",
    description: "O que separa uma empresa confiável: CREA, experiência, garantias e suporte.",
    icon: ShieldCheck,
    level: "Iniciante",
    lessons: [
      { title: "Registro CREA e responsável técnico", minutes: 7 },
      { title: "Tempo de mercado e histórico de instalações", minutes: 9 },
      { title: "Garantias de projeto e assistência técnica", minutes: 11 },
    ],
  },
  {
    title: "Lendo a proposta técnica",
    description: "Potência, módulos, inversor, sobrecarga e eficiência — sem cair em pegadinhas.",
    icon: Cpu,
    level: "Intermediário",
    lessons: [
      { title: "Dimensionamento e potência (kWp)", minutes: 14 },
      { title: "Tiers de fabricantes de módulo e inversor", minutes: 12 },
      { title: "Sobrecarga do inversor: a faixa ideal", minutes: 10 },
      { title: "Eficiência e garantia de performance", minutes: 9 },
    ],
  },
  {
    title: "Viabilidade financeira",
    description: "Payback, ROI, inflação de energia e por que o menor preço engana.",
    icon: Wallet,
    level: "Intermediário",
    lessons: [
      { title: "Payback simples e retorno do capital", minutes: 13 },
      { title: "Economia acumulada em 25 anos", minutes: 10 },
      { title: "Premissas que distorcem a viabilidade", minutes: 11 },
    ],
  },
  {
    title: "Pesquisando reputação",
    description: "Como investigar Reclame Aqui, fabricantes e distribuidores antes de fechar.",
    icon: FileSearch,
    level: "Intermediário",
    lessons: [
      { title: "Interpretando o Reclame Aqui", minutes: 8 },
      { title: "Reputação de fabricantes e distribuidoras", minutes: 9 },
    ],
  },
  {
    title: "Decidindo entre finalistas",
    description: "Equilibrando empresa, tecnologia e preço para a melhor escolha.",
    icon: Trophy,
    level: "Avançado",
    lessons: [
      { title: "Montando a matriz de comparação", minutes: 12 },
      { title: "Negociando com os dois finalistas", minutes: 14 },
    ],
  },
];

const LEVEL_VARIANT: Record<Module["level"], "emerald" | "orange" | "secondary"> = {
  Iniciante: "emerald",
  Intermediário: "orange",
  Avançado: "secondary",
};

export default function CursoPage() {
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = MODULES.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.minutes, 0),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            Aprendizado
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Curso Solar Buy-Side</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aprenda a comprar energia solar com critério — da tecnologia à negociação final.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium">
            <PlayCircle className="h-3.5 w-3.5 text-primary" />
            {MODULES.length} módulos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            {totalLessons} aulas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            ~{Math.round(totalMinutes / 60)}h de conteúdo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod, idx) => {
          const Icon = mod.icon;
          const mins = mod.lessons.reduce((s, l) => s + l.minutes, 0);
          return (
            <div
              key={mod.title}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_4px_20px_rgba(249,115,22,0.12)]"
            >
              <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={LEVEL_VARIANT[mod.level]} className="text-[10px]">
                  {mod.level}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Módulo {idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{mod.description}</p>

                <ul className="mt-4 space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.title} className="flex items-center gap-2 text-xs text-slate-600">
                      <PlayCircle className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-primary/60" />
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-[10px] text-slate-400">{lesson.minutes}min</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    {mod.lessons.length} aulas · {mins}min
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <PlayCircle className="h-3.5 w-3.5" />
                    Em breve
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
