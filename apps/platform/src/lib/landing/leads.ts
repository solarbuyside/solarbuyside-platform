import { createAdminClient } from "@/lib/supabase/admin";

/** Leitura dos leads da landing (newsletter + ebook). Server-only. */

export type NewsletterLead = { email: string; createdAt: string };
export type EbookLead = {
  nome: string | null;
  sobrenome: string | null;
  email: string;
  celular: string | null;
  /** Ver ORIGENS_LEAD. */
  origem: string;
  createdAt: string;
};

/**
 * Formulários da LP que gravam em `ebook_leads`, com o rótulo do admin.
 * Espelha a lista fechada de apps/landing/api/ebook/lead.js.
 */
export const ORIGENS_LEAD: Record<string, string> = {
  teaser: "Teaser",
  "belenergy-credenciamento": "Credenciamento Belenergy",
  // Inscrição na live de lançamento (pré-lançamento, Francis 29/10/2026).
  "live-lancamento": "Live de lançamento",
};

export const rotuloOrigem = (origem: string | null | undefined): string => {
  const chave = origem ?? "teaser";
  return Object.hasOwn(ORIGENS_LEAD, chave) ? ORIGENS_LEAD[chave] : chave;
};

export type LeadsOverview = {
  newsletterCount: number;
  ebookCount: number;
  /** Inscritos na live de lançamento (origem "live-lancamento"). */
  liveCount: number;
  newsletter: NewsletterLead[];
  ebook: EbookLead[];
};

export async function getLeadsOverview(): Promise<LeadsOverview> {
  const admin = createAdminClient();
  const [nlHead, ebHead, liveHead, nlRows, ebRows] = await Promise.all([
    admin.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
    admin.from("ebook_leads").select("*", { count: "exact", head: true }),
    admin.from("ebook_leads").select("*", { count: "exact", head: true }).eq("origem", "live-lancamento"),
    admin
      .from("newsletter_subscribers")
      .select("email,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin
      .from("ebook_leads")
      .select("nome,sobrenome,email,celular,origem,created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    newsletterCount: nlHead.count ?? 0,
    ebookCount: ebHead.count ?? 0,
    liveCount: liveHead.count ?? 0,
    newsletter: (nlRows.data ?? []).map((r) => ({ email: r.email, createdAt: r.created_at })),
    ebook: (ebRows.data ?? []).map((r) => ({
      nome: r.nome,
      sobrenome: r.sobrenome,
      email: r.email,
      celular: r.celular,
      origem: r.origem ?? "teaser",
      createdAt: r.created_at,
    })),
  };
}

/**
 * TODOS os leads de uma origem, do mais antigo ao mais novo, para exportar.
 * O painel mostra só os 100 últimos; a lista da live passa disso fácil.
 * Pagina de 1000 em 1000 (teto padrão do PostgREST).
 */
export async function listLeadsByOrigem(origem: string): Promise<EbookLead[]> {
  const admin = createAdminClient();
  const PAGINA = 1000;
  const todos: EbookLead[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await admin
      .from("ebook_leads")
      .select("nome,sobrenome,email,celular,origem,created_at")
      .eq("origem", origem)
      .order("created_at", { ascending: true })
      .range(de, de + PAGINA - 1);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) {
      todos.push({
        nome: r.nome,
        sobrenome: r.sobrenome,
        email: r.email,
        celular: r.celular,
        origem: r.origem ?? "teaser",
        createdAt: r.created_at,
      });
    }
    if (!data || data.length < PAGINA) break;
  }
  return todos;
}

/**
 * CSV para o Excel em português: separador ";" (o "," é decimal no pt-BR) e
 * BOM no início, senão o Excel abre os acentos quebrados.
 */
export function leadsParaCsv(leads: EbookLead[]): string {
  const QUEBRA = "\r\n";
  const campo = (v: string) => (/[";\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const data = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  };
  const linhas = [
    ["Nome", "Sobrenome", "E-mail", "WhatsApp", "Origem", "Data"],
    ...leads.map((l) => [l.nome ?? "", l.sobrenome ?? "", l.email, l.celular ?? "", rotuloOrigem(l.origem), data(l.createdAt)]),
  ];
  // BOM do UTF-8 (U+FEFF), escrito por código para não ser um caractere invisível no fonte.
  return String.fromCharCode(0xfeff) + linhas.map((l) => l.map(campo).join(";")).join(QUEBRA) + QUEBRA;
}
