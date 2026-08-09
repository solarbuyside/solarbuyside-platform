import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Funil da LP (Fase 5 do handoff de 28/07). Lê `landing_events` (migration
 * 0024) via service role e agrega em TypeScript — o volume é pequeno (dezenas
 * de eventos por visita, tráfego modesto); se um dia crescer, mover a
 * agregação para uma function SQL no Postgres.
 *
 * Só eventos da LP oficial (page_url = "/"): a /1 é salvaguarda congelada e
 * tem outra anatomia de seções — misturar distorceria o funil.
 *
 * A tabela começou a receber em 28/07/2026; o histórico anterior (~7,8 mil
 * eventos) está na MySQL do backend aposentado da Render.
 */

/**
 * Ordem narrativa real da LP — espelha SECTION_IDS de
 * apps/landing/src/v4/AppV4.tsx. Se as duas divergirem, o relatório desenha um
 * funil que sobe e desce em vez de cair: a leitura fica errada sem dar erro.
 *
 * Atualizada com a revisão de 06/08. Estava defasada desde 03/08 (mostrava
 * "Autores" em 2º e "Plataforma" em 11º quando na página eram 5º e 2º).
 *
 * `audiencia` saiu: a seção "Para quem o Método foi desenvolvido" foi
 * eliminada (slide 11). Não vale manter o degrau: um id que não existe mais na
 * página fica em 0 sessões / 0% para sempre e finge uma queda de 100%.
 */
const SECOES: { id: string; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "plataforma", label: "Plataforma" },
  { id: "proposito", label: "Para que servem" },
  { id: "apoiadores", label: "Apoiadores" },
  { id: "authority", label: "Mentores" },
  { id: "contexto", label: "Panorama" },
  { id: "video-section", label: "Vídeo" },
  { id: "manual-strategic", label: "Manual e Código" },
  { id: "transformacao", label: "Transformação" },
  { id: "retorno", label: "Retorno" },
  { id: "depoimento-lucas", label: "Depoimento Lucas" },
  { id: "depoimentos", label: "Depoimento Rodrigo" },
  { id: "compra-simples", label: "Compra simples" },
  { id: "equipe", label: "Capacite seu time" },
  { id: "oferta", label: "Oferta" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contato" },
];

export type FunilSecao = {
  id: string;
  label: string;
  sessoes: number;
  /** % sobre as sessões que viram o Hero (topo do funil). */
  pctDoTopo: number;
};

export type FunilDiario = { dia: string; sessoes: number; buyClicks: number };

export type LandingFunnel = {
  dias: number;
  sessoes: number;
  pageViews: number;
  buyClicks: number;
  sessoesComClique: number;
  /** sessões com clique em comprar / sessões (em %). */
  conversaoPct: number;
  funil: FunilSecao[];
  porDia: FunilDiario[];
  totalEventos: number;
  /** true se o teto de leitura foi atingido (agregado parcial). */
  truncado: boolean;
};

type Evento = {
  event_type: string;
  session_id: string;
  section_name: string | null;
  created_at: string;
};

const PAGINA = 1000; // teto de linhas por resposta do PostgREST no Supabase
const TETO = 50_000;

export async function getLandingFunnel(dias = 30): Promise<LandingFunnel> {
  const admin = createAdminClient();
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

  const eventos: Evento[] = [];
  let truncado = false;
  for (let inicio = 0; ; inicio += PAGINA) {
    if (inicio >= TETO) {
      truncado = true;
      break;
    }
    const { data, error } = await admin
      .from("landing_events")
      .select("event_type,session_id,section_name,created_at")
      .eq("page_url", "/")
      .gte("created_at", desde)
      .order("created_at", { ascending: true })
      .range(inicio, inicio + PAGINA - 1);
    if (error) throw new Error(error.message);
    eventos.push(...(data ?? []));
    if (!data || data.length < PAGINA) break;
  }

  const sessoes = new Set<string>();
  const sessoesComClique = new Set<string>();
  const porSecao = new Map<string, Set<string>>();
  const porDia = new Map<string, { sessoes: Set<string>; buyClicks: number }>();
  let pageViews = 0;
  let buyClicks = 0;

  for (const e of eventos) {
    sessoes.add(e.session_id);
    const dia = e.created_at.slice(0, 10);
    let d = porDia.get(dia);
    if (!d) porDia.set(dia, (d = { sessoes: new Set(), buyClicks: 0 }));
    d.sessoes.add(e.session_id);

    if (e.event_type === "page_view") pageViews += 1;
    if (e.event_type === "buy_click") {
      buyClicks += 1;
      sessoesComClique.add(e.session_id);
      d.buyClicks += 1;
    }
    if (e.event_type === "section_view" && e.section_name) {
      let s = porSecao.get(e.section_name);
      if (!s) porSecao.set(e.section_name, (s = new Set()));
      s.add(e.session_id);
    }
  }

  const topo = porSecao.get("hero")?.size ?? 0;
  const funil = SECOES.map(({ id, label }) => {
    const n = porSecao.get(id)?.size ?? 0;
    return { id, label, sessoes: n, pctDoTopo: topo > 0 ? Math.round((n / topo) * 100) : 0 };
  });

  return {
    dias,
    sessoes: sessoes.size,
    pageViews,
    buyClicks,
    sessoesComClique: sessoesComClique.size,
    conversaoPct: sessoes.size > 0 ? Math.round((sessoesComClique.size / sessoes.size) * 1000) / 10 : 0,
    funil,
    porDia: [...porDia.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dia, d]) => ({ dia, sessoes: d.sessoes.size, buyClicks: d.buyClicks })),
    totalEventos: eventos.length,
    truncado,
  };
}
