"use client";

import * as React from "react";
import Link from "next/link";
import {
  calculateComparisonResult,
} from "@/domain/comparisons/scoring";
import { applyAutoScores } from "@/domain/comparisons/auto-scoring";
import {
  companyScoreDefinitions,
  technicalScoreDefinitions,
} from "@/domain/comparisons/score-definitions";
import type {
  ComparisonInput,
  ComparisonResult,
  ScoreDefinition,
} from "@/domain/comparisons/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Award,
  Zap,
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  RotateCcw,
  Search,
  BarChart3,
  Pencil,
} from "lucide-react";

export type DashboardPersistence = {
  onScoreSettingChange?: (
    comparisonId: string,
    criterionKey: string,
    enabled: boolean,
    weight: number,
  ) => Promise<void> | void;
  onFinalistsChange?: (comparisonId: string, finalistIds: string[]) => Promise<void> | void;
};

type DashboardViewProps = {
  initialComparison: ComparisonInput;
  /** When true, data is illustrative only (the /dashboard demo). */
  demo?: boolean;
  /** When true, hides the standalone page header (used inside the phase flow). */
  embedded?: boolean;
  /** When true, shows only the comparison tables (no ranking cards). */
  tableOnly?: boolean;
  persistence?: DashboardPersistence;
};

export function DashboardView({
  initialComparison,
  demo = false,
  embedded = false,
  tableOnly = false,
  persistence,
}: DashboardViewProps) {
  const [comparison, setComparison] = React.useState<ComparisonInput>(() =>
    JSON.parse(JSON.stringify(initialComparison)),
  );

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "company" | "technical" | "settings"
  >("overview");
  const [searchQuery, setSearchQuery] = React.useState("");

  const result: ComparisonResult = React.useMemo(
    () => calculateComparisonResult(applyAutoScores(comparison)),
    [comparison],
  );

  const handleToggleFinalist = (competitorId: string) => {
    setComparison((prev) => {
      const currentFinalists = [...prev.selectedFinalistIds];
      const isCurrentlySelected = currentFinalists.includes(competitorId);

      let nextFinalists: string[];
      if (isCurrentlySelected) {
        nextFinalists = currentFinalists.filter((id) => id !== competitorId);
      } else if (currentFinalists.length >= 2) {
        nextFinalists = [currentFinalists[1], competitorId];
      } else {
        nextFinalists = [...currentFinalists, competitorId];
      }

      void persistence?.onFinalistsChange?.(prev.id, nextFinalists);
      return { ...prev, selectedFinalistIds: nextFinalists };
    });
  };

  const handleResetSettings = () => {
    setComparison(JSON.parse(JSON.stringify(initialComparison)));
  };

  const handleToggleCriterion = (key: string, defaultEnabled: boolean) => {
    setComparison((prev) => {
      const settings = [...prev.scoreSettings];
      const index = settings.findIndex((s) => s.criterionKey === key);
      let enabled: boolean;
      let weight: number;

      if (index > -1) {
        enabled = !settings[index].enabled;
        weight = settings[index].weight;
        settings[index] = { ...settings[index], enabled };
      } else {
        enabled = !defaultEnabled;
        weight = 1;
        settings.push({ criterionKey: key, enabled, weight });
      }

      void persistence?.onScoreSettingChange?.(prev.id, key, enabled, weight);
      return { ...prev, scoreSettings: settings };
    });
  };

  const handleUpdateWeight = (key: string, weightValue: number) => {
    const validWeight = Math.max(1, Math.min(10, weightValue));
    setComparison((prev) => {
      const settings = [...prev.scoreSettings];
      const index = settings.findIndex((s) => s.criterionKey === key);
      let enabled: boolean;

      if (index > -1) {
        enabled = settings[index].enabled;
        settings[index] = { ...settings[index], weight: validWeight };
      } else {
        enabled = true;
        settings.push({ criterionKey: key, enabled: true, weight: validWeight });
      }

      void persistence?.onScoreSettingChange?.(prev.id, key, enabled, validWeight);
      return { ...prev, scoreSettings: settings };
    });
  };

  const getCriterionStatus = (key: string, defaultEnabled: boolean) => {
    const setting = comparison.scoreSettings.find((s) => s.criterionKey === key);
    return {
      enabled: setting ? setting.enabled : defaultEnabled,
      weight: setting ? setting.weight : 1,
    };
  };

  const filteredCompetitors = result.competitors.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getInsightStyles = (severity: string) => {
    switch (severity) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
          cardBg: "bg-emerald-50 border-emerald-200/60",
          text: "text-emerald-800",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
          cardBg: "bg-amber-50 border-amber-200/60",
          text: "text-amber-800",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
          cardBg: "bg-sky-50 border-sky-200/60",
          text: "text-sky-800",
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      {!embedded && (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-semibold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {demo ? "Modo Demonstração" : "Análise Ativa"}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ID: {comparison.id.slice(0, 8)}...
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{comparison.title}</h2>
          <p className="text-sm text-slate-600 mt-1">
            Compare propostas e selecione exatamente dois finalistas com base em critérios técnicos,
            empresariais e financeiros.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!demo && (
            <Link
              href={`/avaliacoes/${comparison.id}/preencher`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-primary/50 hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar Dados
            </Link>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetSettings}
            className="flex items-center gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar
          </Button>
          {demo && (
            <Badge variant="orange" className="text-[11px] py-1 px-3">
              Dados de exemplo
            </Badge>
          )}
        </div>
      </div>
      )}

      {demo && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-200/60 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          <Info className="h-4 w-4 shrink-0" />
          Esta é uma demonstração com dados de exemplo. Crie uma avaliação real em{" "}
          <Link href="/avaliacoes/nova" className="font-bold underline">
            Nova Avaliação
          </Link>
          .
        </div>
      )}

      {/* Insights */}
      {result.insights.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Insights &amp; Recomendações Automáticas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.insights.map((insight, idx) => {
              const styles = getInsightStyles(insight.severity);
              return (
                <div
                  key={idx}
                  className={`flex gap-3 p-4 rounded-xl border ${styles.cardBg} transition-all duration-200 hover:scale-[1.01]`}
                >
                  {styles.icon}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{insight.title}</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${styles.text}`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Ranking cards */}
      {!tableOnly && (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Classificação Geral dos Fornecedores
            </h3>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 w-full rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitors
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((competitor) => {
              const isRecommended = result.recommendedFinalistIds.includes(competitor.competitorId);
              const isSelected = comparison.selectedFinalistIds.includes(competitor.competitorId);

              return (
                <Card
                  key={competitor.competitorId}
                  hoverGlow
                  className={cn(
                    "relative overflow-hidden flex flex-col justify-between bg-white border border-slate-200/80 shadow-sm",
                    isSelected &&
                      "border-primary/60 shadow-[0_4px_20px_rgba(249,115,22,0.1)] ring-1 ring-primary/20",
                  )}
                >
                  <div className="absolute top-0 right-0 bg-[#020719] text-white text-xs px-3 py-1.5 font-bold rounded-bl-xl flex items-center gap-1.5 shadow-sm">
                    <span>Rank</span>
                    <span className="text-primary font-extrabold text-sm">{competitor.rank}</span>
                  </div>

                  <CardHeader className="pb-3 pr-20">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                      <span className="truncate">{competitor.companyName}</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Posição original na proposta: #{competitor.position}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div className="grid grid-cols-3 gap-2 py-3 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          Geral
                        </span>
                        <span className="text-lg font-bold text-slate-900 block mt-0.5">
                          {competitor.totalScore.grade10}
                        </span>
                        <span className="text-[9px] text-slate-400">/10</span>
                      </div>
                      <div className="text-center border-x border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          Empresa
                        </span>
                        <span className="text-base font-semibold text-slate-800 block mt-0.5">
                          {competitor.companyScore.grade10}
                        </span>
                        <span className="text-[9px] text-slate-400">/10</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                          Técnico
                        </span>
                        <span className="text-base font-semibold text-slate-800 block mt-0.5">
                          {competitor.technicalScore.grade10}
                        </span>
                        <span className="text-[9px] text-slate-400">/10</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Investimento Total:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrencyBRL(competitor.investment)}
                        </span>
                      </div>
                      {competitor.pricePerPoint && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Custo por Ponto:</span>
                          <span className="text-slate-700">
                            {formatCurrencyBRL(competitor.pricePerPoint)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                        <span className="text-slate-500">Pontos de Atenção:</span>
                        <Badge
                          variant={competitor.riskFlags.length > 0 ? "warning" : "success"}
                          className="text-[10px]"
                        >
                          {competitor.riskFlags.length}{" "}
                          {competitor.riskFlags.length === 1 ? "alerta" : "alertas"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {isRecommended && (
                        <Badge variant="orange" className="text-[9px] uppercase tracking-wide">
                          Sugestão do Sistema
                        </Badge>
                      )}
                      {competitor.totalScore.grade10 >= 8.5 && (
                        <Badge variant="emerald" className="text-[9px] uppercase tracking-wide">
                          Score Altíssimo
                        </Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 flex items-center justify-between bg-slate-50/50 border-t border-slate-100/50">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Selecionar como Finalista
                    </span>
                    <button
                      onClick={() => handleToggleFinalist(competitor.competitorId)}
                      className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                    >
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                          <CheckSquare className="h-5 w-5 text-primary" />
                          <span>Finalista</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
                          <Square className="h-5 w-5 text-slate-400" />
                          <span>Selecionar</span>
                        </div>
                      )}
                    </button>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </section>
      )}

      {/* Tabs */}
      <section className="space-y-6">
        <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
          {(
            [
              { id: "overview", label: "Visão Geral das Propostas", icon: BarChart3 },
              { id: "company", label: "Planilha de Fornecedores (Empresarial)", icon: ShieldCheck },
              { id: "technical", label: "Avaliação Tecnológica (Técnica)", icon: Zap },
              { id: "settings", label: "Ajustar Pesos e Critérios", icon: Sliders },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all select-none whitespace-nowrap cursor-pointer",
                  activeTab === tab.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-800">
                Ficha Comparativa Geral de Desempenho
              </h4>
              <span className="text-xs text-slate-500">
                Selecione exatamente dois finalistas nas caixas à direita
              </span>
            </div>

            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Investimento</TableHead>
                    <TableHead>Grade Geral (/10)</TableHead>
                    <TableHead>Grade Empresa (/10)</TableHead>
                    <TableHead>Grade Técnica (/10)</TableHead>
                    <TableHead>Custo p/ Ponto</TableHead>
                    <TableHead>Alertas de Risco</TableHead>
                    <TableHead className="text-right">Finalista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetitors.map((competitor) => {
                    const isSelected = comparison.selectedFinalistIds.includes(
                      competitor.competitorId,
                    );
                    return (
                      <TableRow key={competitor.competitorId} isSelectedFinalist={isSelected}>
                        <TableCell className="font-bold text-slate-900 flex items-center gap-2">
                          {competitor.companyName}
                          {isSelected && (
                            <Badge variant="orange" className="text-[9px]">
                              FINALISTA
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {formatCurrencyBRL(competitor.investment)}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-950 bg-slate-100 border border-slate-200/60 py-1 px-2.5 rounded text-sm">
                            {competitor.totalScore.grade10}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {competitor.companyScore.grade10}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {competitor.technicalScore.grade10}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">
                          {formatCurrencyBRL(competitor.pricePerPoint)}
                        </TableCell>
                        <TableCell>
                          {competitor.riskFlags.length > 0 ? (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              <span>{competitor.riskFlags.length} flags</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span>Excelente</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleToggleFinalist(competitor.competitorId)}
                            className="focus:outline-none cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-primary inline" />
                            ) : (
                              <Square className="h-5 w-5 text-slate-400 inline" />
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-500" /> Detalhes dos Pontos de Atenção
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.competitors.map((c) => {
                  if (c.riskFlags.length === 0) return null;
                  return (
                    <div
                      key={c.competitorId}
                      className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {c.companyName}
                      </p>
                      <ul className="space-y-1 list-disc list-inside">
                        {c.riskFlags.map((flag, idx) => (
                          <li key={idx} className="text-slate-600 text-[11px] leading-relaxed">
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {(activeTab === "company" || activeTab === "technical") && (
          <ScoreTab
            definitions={
              activeTab === "company" ? companyScoreDefinitions : technicalScoreDefinitions
            }
            title={
              activeTab === "company"
                ? "Pontuações dos Critérios Empresariais"
                : "Pontuações dos Critérios Tecnológicos e de Geração"
            }
            comparison={comparison}
            filteredCompetitors={filteredCompetitors}
            getCriterionStatus={getCriterionStatus}
            categoryGrade={(c) =>
              activeTab === "company" ? c.companyScore : c.technicalScore
            }
            onGoSettings={() => setActiveTab("settings")}
          />
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-slate-800">
                Personalização Dinâmica de Pesos e Critérios
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Ative/desative critérios ou mude os pesos. As pontuações recalculam na hora
                {demo ? " (não salvo no modo demo)." : " e são salvas automaticamente."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SettingsColumn
                title="Critérios Empresariais (Empresa)"
                icon={ShieldCheck}
                definitions={companyScoreDefinitions}
                getCriterionStatus={getCriterionStatus}
                onToggle={handleToggleCriterion}
                onWeight={handleUpdateWeight}
              />
              <SettingsColumn
                title="Critérios Tecnológicos (Técnicos)"
                icon={Zap}
                definitions={technicalScoreDefinitions}
                getCriterionStatus={getCriterionStatus}
                onToggle={handleToggleCriterion}
                onWeight={handleUpdateWeight}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

type ScoreDef = ScoreDefinition;

function ScoreTab({
  definitions,
  title,
  comparison,
  filteredCompetitors,
  getCriterionStatus,
  categoryGrade,
  onGoSettings,
}: {
  definitions: readonly ScoreDef[];
  title: string;
  comparison: ComparisonInput;
  filteredCompetitors: ComparisonResult["competitors"];
  getCriterionStatus: (key: string, defaultEnabled: boolean) => { enabled: boolean; weight: number };
  categoryGrade: (c: ComparisonResult["competitors"][number]) => {
    grade10: number;
    points: number;
    maxPoints: number;
  };
  onGoSettings: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        <Button variant="secondary" size="sm" className="text-xs" onClick={onGoSettings}>
          Configurar Pesos dos Critérios
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-80">Critério de Avaliação</TableHead>
              {filteredCompetitors.map((c) => (
                <TableHead key={c.competitorId} className="text-center text-white">
                  {c.companyName}
                </TableHead>
              ))}
              <TableHead className="text-center w-24 text-white">Peso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {definitions.map((def) => {
              const status = getCriterionStatus(def.key, def.defaultEnabled);
              if (!status.enabled) return null;
              return (
                <TableRow key={def.key}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{def.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{def.rubric}</div>
                  </TableCell>
                  {filteredCompetitors.map((c) => {
                    const entry = comparison.scoreEntries.find(
                      (e) => e.competitorId === c.competitorId && e.criterionKey === def.key,
                    );
                    return (
                      <TableCell key={c.competitorId} className="text-center">
                        <span className="font-bold text-slate-800">
                          {entry?.score !== undefined && entry?.score !== null ? entry.score : "-"}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">pts</span>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold text-primary">
                    x{status.weight}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-[#09143c]/5 font-bold border-t border-slate-200">
              <TableCell className="text-slate-850 uppercase tracking-wider text-xs">
                Nota Consolidada
              </TableCell>
              {filteredCompetitors.map((c) => {
                const grade = categoryGrade(c);
                return (
                  <TableCell key={c.competitorId} className="text-center">
                    <span className="text-base text-slate-950 font-bold block">{grade.grade10}</span>
                    <span className="text-[10px] text-slate-500 block font-normal">
                      {grade.points} / {grade.maxPoints} pts
                    </span>
                  </TableCell>
                );
              })}
              <TableCell className="text-center text-slate-500">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function SettingsColumn({
  title,
  icon: Icon,
  definitions,
  getCriterionStatus,
  onToggle,
  onWeight,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  definitions: readonly ScoreDef[];
  getCriterionStatus: (key: string, defaultEnabled: boolean) => { enabled: boolean; weight: number };
  onToggle: (key: string, defaultEnabled: boolean) => void;
  onWeight: (key: string, weight: number) => void;
}) {
  return (
    <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
      <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Icon className="h-4.5 w-4.5 text-primary" />
        {title}
      </h5>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {definitions.map((def) => {
          const status = getCriterionStatus(def.key, def.defaultEnabled);
          return (
            <div
              key={def.key}
              className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-slate-50"
            >
              <div className="flex-1 min-w-0">
                <label className="text-xs font-bold text-slate-800 block truncate">
                  {def.label}
                </label>
                <span className="text-[10px] text-slate-500 block truncate">{def.rubric}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {status.enabled && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5">
                    <span className="text-[10px] text-slate-500">peso:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={status.weight}
                      onChange={(e) => onWeight(def.key, parseInt(e.target.value) || 1)}
                      className="w-8 bg-transparent text-center font-bold text-xs text-primary focus:outline-none"
                    />
                  </div>
                )}
                <Switch
                  checked={status.enabled}
                  onCheckedChange={() => onToggle(def.key, def.defaultEnabled)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
