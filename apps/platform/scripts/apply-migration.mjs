#!/usr/bin/env node
/**
 * Aplica um arquivo .sql de supabase/migrations no projeto, via Management API
 * (o CLI do Supabase não está ligado neste repo — as migrations são aplicadas
 * à mão, ver docs/OPERATIONS.md).
 *
 * Usa SUPABASE_PERSONAL_ACCESS_TOKEN de apps/platform/.env.local.
 *
 *   node apps/platform/scripts/apply-migration.mjs supabase/migrations/0021_x.sql
 *   node apps/platform/scripts/apply-migration.mjs <arquivo> --dry   # só imprime
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const platformRoot = resolve(here, "..");

function loadEnv(path) {
  const out = {};
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const [fileArg, ...rest] = process.argv.slice(2);
const dry = rest.includes("--dry");
if (!fileArg) {
  console.error("uso: node scripts/apply-migration.mjs <arquivo.sql> [--dry]");
  process.exit(1);
}

const env = loadEnv(resolve(platformRoot, ".env.local"));
const token = env.SUPABASE_PERSONAL_ACCESS_TOKEN;
const url = env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];

if (!token || !ref) {
  console.error("Faltam SUPABASE_PERSONAL_ACCESS_TOKEN / NEXT_PUBLIC_SUPABASE_URL em apps/platform/.env.local");
  process.exit(1);
}

const sql = readFileSync(resolve(platformRoot, fileArg), "utf8");

if (dry) {
  console.log(`-- dry-run: projeto ${ref}, arquivo ${fileArg}\n`);
  console.log(sql);
  process.exit(0);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`FALHOU ${res.status}: ${body}`);
  process.exit(1);
}
console.log(`OK  ${fileArg} aplicada em ${ref}`);
if (body && body !== "[]") console.log(body);
