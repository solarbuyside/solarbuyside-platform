import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LANDING_SCHEMA, buildSectionGroups, subviewsOf, isComposite } from "../field-schema";

const labelsDe = (gs: { label: string }[]) => gs.map((g) => g.label);

describe("subvisões", () => {
  it("todo rótulo declarado numa subvisão existe no manifesto", () => {
    for (const [sectionId, schema] of Object.entries(LANDING_SCHEMA)) {
      const reais = new Set(schema.groups.map((g) => g.label));
      for (const v of schema.subviews ?? []) {
        for (const l of v.groups) {
          expect(reais.has(l), `${sectionId}/${v.id}: grupo "${l}" não existe`).toBe(true);
        }
      }
    }
  });

  it("nenhum grupo aparece em duas subvisões", () => {
    for (const [sectionId, schema] of Object.entries(LANDING_SCHEMA)) {
      const vistos = new Set<string>();
      for (const v of schema.subviews ?? []) {
        for (const l of v.groups) {
          expect(vistos.has(l), `${sectionId}: "${l}" repetido`).toBe(false);
          vistos.add(l);
        }
      }
    }
  });

  it("a oferta não perde campo nenhum ao ser repartida", () => {
    const chaves = (subview: string | null) =>
      buildSectionGroups("pricing", [], [], subview).groups.flatMap((g) =>
        g.fields.flatMap((f) => (isComposite(f) ? f.parts.map((p) => p.key) : [f.key])),
      );
    const inteira = new Set(
      LANDING_SCHEMA.pricing.groups.flatMap((g) =>
        g.fields.flatMap((f) => (isComposite(f) ? f.parts.map((p) => p.key) : [f.key])),
      ),
    );
    const repartida = new Set([
      ...chaves(null),
      ...subviewsOf("pricing").flatMap((v) => chaves(v.id)),
    ]);
    expect([...inteira].filter((k) => !repartida.has(k))).toEqual([]);
    expect(repartida.size).toBe(inteira.size);
  });

  it("cada subvisão devolve só os seus grupos, na ordem declarada", () => {
    for (const v of subviewsOf("pricing")) {
      expect(labelsDe(buildSectionGroups("pricing", [], [], v.id).groups)).toEqual(v.groups);
    }
  });

  it("a tela principal da oferta fica sem grupos (tudo tem recorte)", () => {
    expect(buildSectionGroups("pricing", [], [], null).groups).toEqual([]);
  });

  it("campo órfão do banco cai na tela principal, nunca dentro de um recorte", () => {
    const principal = buildSectionGroups("pricing", ["chaveNovaQualquer"], [], null).groups;
    expect(labelsDe(principal)).toContain("Outros campos");
    for (const v of subviewsOf("pricing")) {
      expect(labelsDe(buildSectionGroups("pricing", ["chaveNovaQualquer"], [], v.id).groups)).not.toContain(
        "Outros campos",
      );
    }
  });

  it("seção sem subvisões continua devolvendo tudo de uma vez", () => {
    const gs = buildSectionGroups("faq", [], [], null).groups;
    expect(labelsDe(gs)).toEqual(LANDING_SCHEMA.faq.groups.map((g) => g.label));
  });
});

describe("pré-lançamento (seção lancamento)", () => {
  // Pares 'chave', 'valor' do jsonb_build_object da migration que cria a seção.
  const seed = (() => {
    const sql = readFileSync(
      fileURLToPath(new URL("../../../../supabase/migrations/0026_landing_prelancamento.sql", import.meta.url)),
      "utf8",
    );
    const corpo = sql.slice(sql.indexOf("jsonb_build_object("), sql.indexOf(") as t"));
    const pares = [...corpo.matchAll(/'([^']+)',\s*'((?:[^']|'')*)'/g)];
    return new Map(pares.map((m) => [m[1], m[2].replace(/''/g, "'")]));
  })();

  const campos = LANDING_SCHEMA.lancamento.groups.flatMap((g) => g.fields).filter((f) => !isComposite(f));

  it("o default de cada campo do editor é o mesmo texto semeado no banco", () => {
    expect(seed.size).toBeGreaterThan(20);
    for (const f of campos) {
      if (isComposite(f) || f.defaultValue === undefined) continue;
      expect(seed.get(f.key), `chave ${f.key}`).toBe(f.defaultValue);
    }
  });

  it("toda chave semeada tem campo no editor", () => {
    const chaves = new Set(campos.map((f) => (isComposite(f) ? "" : f.key)));
    expect([...seed.keys()].filter((k) => !chaves.has(k))).toEqual([]);
  });

  it("vem logo depois da Oferta na barra lateral", () => {
    expect(LANDING_SCHEMA.lancamento.order).toBeGreaterThan(LANDING_SCHEMA.pricing.order);
    expect(LANDING_SCHEMA.lancamento.order).toBeLessThan(LANDING_SCHEMA.faq.order);
  });
});
