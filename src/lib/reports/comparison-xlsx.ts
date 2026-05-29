import ExcelJS from "exceljs";

import {
  companyScoreDefinitions,
  technicalScoreDefinitions,
} from "@/domain/comparisons/score-definitions";
import { applyAutoScores } from "@/domain/comparisons/auto-scoring";
import { calculateComparisonResult } from "@/domain/comparisons/scoring";
import type { ComparisonInput, ScoreDefinition } from "@/domain/comparisons/types";

const NAVY = "FF09143C";
const ORANGE = "FFF97316";
const LIGHT = "FFF1F5F9";
const WHITE = "FFFFFFFF";

function headerRow(ws: ExcelJS.Worksheet, rowIdx: number, labels: string[]) {
  const row = ws.getRow(rowIdx);
  labels.forEach((label, i) => {
    const cell = row.getCell(i + 1);
    cell.value = label;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.font = { color: { argb: WHITE }, bold: true, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "center", wrapText: true };
  });
  row.height = 26;
}

function scoreFor(comparison: ComparisonInput, competitorId: string, key: string) {
  const entry = comparison.scoreEntries.find(
    (e) => e.competitorId === competitorId && e.criterionKey === key,
  );
  return entry?.score ?? null;
}

function buildScoreSheet(
  wb: ExcelJS.Workbook,
  title: string,
  definitions: readonly ScoreDefinition[],
  comparison: ComparisonInput,
  resolved: ComparisonInput,
) {
  const ws = wb.addWorksheet(title);
  const competitors = comparison.competitors;

  ws.getColumn(1).width = 44;
  competitors.forEach((_, i) => (ws.getColumn(i + 2).width = 18));

  // Title band
  ws.mergeCells(1, 1, 1, competitors.length + 1);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = title;
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  titleCell.font = { color: { argb: WHITE }, bold: true, size: 13 };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 30;

  headerRow(ws, 2, ["Critério", ...competitors.map((c) => c.companyName)]);

  let r = 3;
  for (const def of definitions) {
    const row = ws.getRow(r);
    row.getCell(1).value = def.label;
    row.getCell(1).font = { size: 10 };
    row.getCell(1).alignment = { wrapText: true, vertical: "middle" };
    competitors.forEach((c, i) => {
      const cell = row.getCell(i + 2);
      // Resolved score = manual override or auto-suggested.
      const value = scoreFor(resolved, c.id, def.key);
      cell.value = value ?? "-";
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = { size: 11 };
    });
    if (r % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
      });
    }
    r += 1;
  }

  // Consolidated row
  const result = calculateComparisonResult(resolved);
  const totalRow = ws.getRow(r);
  totalRow.getCell(1).value = "Nota consolidada (/10)";
  totalRow.getCell(1).font = { bold: true };
  const category = definitions === companyScoreDefinitions ? "company" : "technical";
  competitors.forEach((c, i) => {
    const res = result.competitors.find((x) => x.competitorId === c.id);
    const grade = category === "company" ? res?.companyScore.grade10 : res?.technicalScore.grade10;
    const cell = totalRow.getCell(i + 2);
    cell.value = grade ?? 0;
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: "center" };
  });
  totalRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
  });
}

export async function buildComparisonWorkbook(comparison: ComparisonInput): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Solar Buy-Side";
  wb.created = new Date();

  const resolved = applyAutoScores(comparison);
  const result = calculateComparisonResult(resolved);

  // --- Sheet: Pontuação Geral ------------------------------------------------
  const overview = wb.addWorksheet("Pontuação Geral");
  overview.getColumn(1).width = 28;
  comparison.competitors.forEach((_, i) => (overview.getColumn(i + 2).width = 18));

  overview.mergeCells(1, 1, 1, comparison.competitors.length + 1);
  const oTitle = overview.getCell(1, 1);
  oTitle.value = `🏆 ${comparison.title} — Resultado Final`;
  oTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  oTitle.font = { color: { argb: WHITE }, bold: true, size: 14 };
  oTitle.alignment = { vertical: "middle", indent: 1 };
  overview.getRow(1).height = 32;

  headerRow(overview, 2, ["Item", ...comparison.competitors.map((c) => c.companyName)]);

  const ranked = result.competitors;
  function line(rowIdx: number, label: string, pick: (id: string) => string | number) {
    const row = overview.getRow(rowIdx);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: label.includes("Nota") || label.includes("Decisão") };
    comparison.competitors.forEach((c, i) => {
      const cell = row.getCell(i + 2);
      cell.value = pick(c.id);
      cell.alignment = { horizontal: "center" };
    });
  }

  const byId = (id: string) => ranked.find((x) => x.competitorId === id);
  line(3, "Investimento (R$)", (id) => byId(id)?.investment ?? "-");
  line(4, "Nota Empresa (/10)", (id) => byId(id)?.companyScore.grade10 ?? 0);
  line(5, "Nota Técnica (/10)", (id) => byId(id)?.technicalScore.grade10 ?? 0);
  line(6, "Nota Geral (/10)", (id) => byId(id)?.totalScore.grade10 ?? 0);
  line(7, "Ranking", (id) => byId(id)?.rank ?? "-");
  line(8, "Decisão do comprador", (id) =>
    comparison.selectedFinalistIds.includes(id) ? "🏆 Finalista" : "—",
  );

  // Highlight the "Nota Geral" row
  overview.getRow(6).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } };
    cell.font = { bold: true, color: { argb: ORANGE } };
    if (cell.address.startsWith("A")) cell.font = { bold: true };
  });

  // --- Sheets: Avaliação Empresas / Tecnológica ------------------------------
  buildScoreSheet(wb, "Avaliação Empresas", companyScoreDefinitions, comparison, resolved);
  buildScoreSheet(wb, "Avaliação Tecnológica", technicalScoreDefinitions, comparison, resolved);

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
