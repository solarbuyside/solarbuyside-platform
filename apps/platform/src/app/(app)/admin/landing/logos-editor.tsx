"use client";

import * as React from "react";
import {
  Check,
  Loader2,
  CircleAlert,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Images,
  Eye,
  EyeOff,
  GalleryHorizontalEnd,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing/content-admin";
import { MAX_LOGOS } from "@/lib/landing/field-schema";
import { saveLandingSectionAction } from "./actions";
import { ImageField } from "./image-field";

/**
 * Editor dos logos de "Apoiadores institucionais" (Francis, revisão 22-23/07).
 *
 * Uma lista só alimenta dois lugares da página: a faixa que rola abaixo do Hero
 * e a seção de apoiadores, agrupada por categoria. Por isso o editor tem duas
 * visões da MESMA lista (prop `view`):
 *
 *  - `{ kind: "cat" }`  — edição por categoria (ou "todas"). É onde se cadastra
 *    o logo, escolhe a categoria e define a ordem. A ordem das categorias na
 *    página é a ordem em que elas aparecem nesta lista.
 *  - `{ kind: "band" }` — só escolhe quem sobe para a faixa do topo. Nenhum
 *    cadastro aqui, é uma tela de marcar/desmarcar.
 *
 * Dois níveis de visibilidade, de propósito:
 *  - `hidden`  → guardado, fora dos dois lugares (marca sem autorização de uso).
 *  - `bandOff` → na seção sim, na faixa não.
 *
 * Grava como logo{i}Src (images) + logo{i}Name/Cat/Desc/Url/Hidden/BandOff
 * (texts), renumerando do zero a cada salvamento — mesma mecânica do editor de
 * depoimentos. O componente fica montado ao trocar de visão, então mudança não
 * salva numa categoria não se perde ao olhar outra.
 */

type SaveState = "idle" | "saving" | "saved" | "error";
type Logo = {
  src: string;
  name: string;
  cat: string;
  desc: string;
  url: string;
  hidden: boolean;
  bandOff: boolean;
};

export type LogosView = { kind: "cat"; cat: string | null } | { kind: "band" };

const blank: Logo = { src: "", name: "", cat: "", desc: "", url: "", hidden: false, bandOff: false };

const SEM_CATEGORIA = "Sem categoria";

function parseLogos(section: LandingSection): Logo[] {
  const t = section.texts;
  const img = section.images;
  const logos: Logo[] = [];
  for (let i = 1; i <= MAX_LOGOS; i++) {
    // Só entra quem tem conteúdo. O banco guarda slots vazios (`logo7Name: ""`)
    // de salvamentos anteriores; listá-los enchia o editor de cards em branco.
    const src = (img[`logo${i}Src`] ?? "").trim();
    const name = (t[`logo${i}Name`] ?? "").trim();
    if (!src && !name) continue;
    logos.push({
      src: img[`logo${i}Src`] ?? "",
      name: t[`logo${i}Name`] ?? "",
      cat: t[`logo${i}Cat`] ?? "",
      desc: t[`logo${i}Desc`] ?? "",
      url: t[`logo${i}Url`] ?? "",
      hidden: t[`logo${i}Hidden`] === "1",
      bandOff: t[`logo${i}BandOff`] === "1",
    });
  }
  return logos;
}

/** Categorias na ordem em que aparecem na lista — é a ordem da página. */
export function categoriasDe(section: LandingSection): string[] {
  const out: string[] = [];
  for (const l of parseLogos(section)) {
    const c = l.cat.trim() || SEM_CATEGORIA;
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

export function LogosEditor({
  section,
  view,
  onSaved,
}: {
  section: LandingSection;
  view: LogosView;
  onSaved?: () => void;
}) {
  const [logos, setLogos] = React.useState<Logo[]>(() => parseLogos(section));
  const [state, setState] = React.useState<SaveState>("idle");
  const [, start] = React.useTransition();

  // Categorias já usadas viram sugestão, pra ele não digitar variações
  // ("Fabricantes" vs "Fabricante") que quebrariam o agrupamento.
  const categorias = React.useMemo(
    () => Array.from(new Set(logos.map((l) => l.cat.trim()).filter(Boolean))),
    [logos],
  );

  const catDe = (l: Logo) => l.cat.trim() || SEM_CATEGORIA;

  /** Índices (na lista completa) que a visão atual mostra. */
  const visiveis = React.useMemo(() => {
    if (view.kind === "band") {
      // A faixa só oferece quem não está guardado — logo oculto não vai a
      // lugar nenhum, marcá-lo aqui não teria efeito e só confundiria.
      return logos.map((l, i) => [l, i] as const).filter(([l]) => !l.hidden).map(([, i]) => i);
    }
    if (view.cat == null) return logos.map((_, i) => i);
    return logos.map((l, i) => [l, i] as const).filter(([l]) => catDe(l) === view.cat).map(([, i]) => i);
  }, [logos, view]);

  const update = <K extends keyof Logo>(i: number, key: K, value: Logo[K]) =>
    setLogos((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));

  /** Novo logo já nasce na categoria da visão aberta. */
  const add = () =>
    setLogos((ls) => {
      const cat = view.kind === "cat" && view.cat && view.cat !== SEM_CATEGORIA ? view.cat : "";
      const novo = { ...blank, cat };
      if (!cat) return [...ls, novo];
      // Entra logo depois do último da mesma categoria, para não quebrar o
      // agrupamento (a página agrupa por ordem de aparição).
      const ultimo = ls.reduce((acc, l, i) => (catDe(l) === cat ? i : acc), -1);
      if (ultimo === -1) return [...ls, novo];
      const copy = [...ls];
      copy.splice(ultimo + 1, 0, novo);
      return copy;
    });

  const remove = (i: number) => setLogos((ls) => ls.filter((_, idx) => idx !== i));

  /**
   * Sobe/desce dentro da visão atual. Troca com o vizinho DA MESMA visão, não
   * com o vizinho na lista completa — senão mover um logo dentro de
   * "Fabricantes" o jogaria para o meio de outra categoria.
   */
  const move = (i: number, delta: number) =>
    setLogos((ls) => {
      const pos = visiveis.indexOf(i);
      const alvo = visiveis[pos + delta];
      if (alvo === undefined) return ls;
      const copy = [...ls];
      [copy[i], copy[alvo]] = [copy[alvo], copy[i]];
      return copy;
    });

  function save() {
    setState("saving");
    start(async () => {
      try {
        // Preserva as chaves que não são de logo e regrava logo{i}* renumerados.
        const texts: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.texts)) if (!/^logo\d+/.test(k)) texts[k] = v;
        const images: Record<string, string> = {};
        for (const [k, v] of Object.entries(section.images)) if (!/^logo\d+/.test(k)) images[k] = v;
        const usadosList = logos.filter((l) => l.src.trim() || l.name.trim());
        usadosList.forEach((l, idx) => {
          const i = idx + 1;
          images[`logo${i}Src`] = l.src.trim();
          texts[`logo${i}Name`] = l.name.trim();
          texts[`logo${i}Cat`] = l.cat.trim();
          texts[`logo${i}Desc`] = l.desc.trim();
          texts[`logo${i}Url`] = l.url.trim();
          texts[`logo${i}Hidden`] = l.hidden ? "1" : "";
          texts[`logo${i}BandOff`] = l.bandOff ? "1" : "";
        });

        // Zera as posições que sobraram. Apagar a chave não basta: a landing
        // usa o ContentData versionado como base e o banco por cima, então uma
        // posição AUSENTE no banco faz o logo antigo do código reaparecer na
        // página (foi o que duplicou a Stäubli em 26/07). String vazia
        // sobrescreve de verdade e o hook ignora item sem imagem.
        for (let i = usadosList.length + 1; i <= MAX_LOGOS; i++) {
          images[`logo${i}Src`] = "";
          texts[`logo${i}Name`] = "";
          texts[`logo${i}Cat`] = "";
          texts[`logo${i}Desc`] = "";
          texts[`logo${i}Url`] = "";
          texts[`logo${i}Hidden`] = "";
          texts[`logo${i}BandOff`] = "";
        }

        await saveLandingSectionAction("apoiadores", texts, images);
        onSaved?.();
        setState("saved");
        setTimeout(() => setState("idle"), 1500);
      } catch {
        setState("error");
      }
    });
  }

  if (view.kind === "band") {
    return (
      <BandView
        logos={logos}
        indices={visiveis}
        onToggle={(i) => update(i, "bandOff", !logos[i].bandOff)}
        state={state}
        onSave={save}
      />
    );
  }

  const titulo = view.cat == null ? "Todos os logos" : view.cat;
  const naPagina = visiveis.filter((i) => !logos[i].hidden).length;
  const ocultos = visiveis.length - naPagina;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Images className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{titulo}</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {naPagina} na página{ocultos > 0 && `, ${ocultos} oculto(s)`}
            {view.cat == null && " — a ordem das categorias segue esta lista"}
          </p>
          {view.cat != null && (
            <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
              Para mover um logo de categoria, troque o campo{" "}
              <span className="font-semibold text-slate-500">Categoria</span> dentro do card.
            </p>
          )}
        </div>
        <SaveButton state={state} onClick={save} />
      </div>

      <datalist id="categorias-apoiadores">
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="space-y-4 p-6">
        {visiveis.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
            Nenhum logo nesta categoria ainda. Use “Adicionar logo” abaixo.
          </p>
        )}

        {visiveis.map((i, pos) => {
          const logo = logos[i];
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                logo.hidden ? "border-slate-200 bg-slate-50/70" : "border-slate-200",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Logo {pos + 1}
                  {logo.hidden && (
                    <span className="rounded bg-slate-200 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Oculto
                    </span>
                  )}
                  {!logo.hidden && logo.bandOff && (
                    <span className="rounded bg-slate-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Fora da faixa
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  {/* Ocultar em vez de remover: o cadastro fica salvo (imagem,
                      categoria, texto do card) e some da página com um clique.
                      É o caso de marca sem autorização de uso ainda. */}
                  <button
                    onClick={() => update(i, "hidden", !logo.hidden)}
                    aria-pressed={logo.hidden}
                    className={cn(
                      "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold transition-colors",
                      logo.hidden
                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                    title={
                      logo.hidden
                        ? "Está oculto — clique para exibir na página"
                        : "Ocultar da página sem apagar o cadastro"
                    }
                  >
                    {logo.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {logo.hidden ? "Oculto" : "Exibindo"}
                  </button>
                  <IconBtn label="Subir" onClick={() => move(i, -1)} disabled={pos === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Descer"
                    onClick={() => move(i, 1)}
                    disabled={pos === visiveis.length - 1}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </IconBtn>
                  <button
                    onClick={() => remove(i)}
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              </div>

              <div className={cn("grid gap-3", logo.hidden && "opacity-60")}>
                <ImageField
                  value={logo.src}
                  onChange={(v) => update(i, "src", v)}
                  folder="apoiadores"
                  compact
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nome da empresa" value={logo.name} onChange={(v) => update(i, "name", v)} />
                  <Field
                    label="Categoria"
                    value={logo.cat}
                    onChange={(v) => update(i, "cat", v)}
                    list="categorias-apoiadores"
                    placeholder="Ex.: Fabricantes"
                  />
                </div>
                <Field
                  label="Texto do card (aparece ao passar o mouse)"
                  value={logo.desc}
                  onChange={(v) => update(i, "desc", v)}
                  area
                />
                <Field
                  label="Link do site (opcional)"
                  value={logo.url}
                  onChange={(v) => update(i, "url", v)}
                  placeholder="https://exemplo.com.br"
                />
              </div>
            </div>
          );
        })}

        {/* Trava no MAX_LOGOS: a landing lê logo1…logo30, então um logo 31
            seria salvo no banco e nunca apareceria na página. */}
        <div className="flex items-center gap-3">
          <button
            onClick={add}
            disabled={logos.length >= MAX_LOGOS}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4" />
            Adicionar logo{view.cat != null && view.cat !== SEM_CATEGORIA ? ` em ${view.cat}` : ""}
          </button>
          {logos.length >= MAX_LOGOS && (
            <span className="text-[11px] text-slate-500">
              Limite de {MAX_LOGOS} logos. Remova ou oculte um para adicionar outro.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Visão "Faixa do topo": marcar/desmarcar quem sobe para a faixa.
 *
 * Sem campos de cadastro de propósito — aqui ele só escolhe. Editar nome,
 * imagem ou categoria continua sendo nas visões por categoria, para não haver
 * dois lugares que fazem a mesma coisa.
 */
function BandView({
  logos,
  indices,
  onToggle,
  state,
  onSave,
}: {
  logos: Logo[];
  indices: number[];
  onToggle: (i: number) => void;
  state: SaveState;
  onSave: () => void;
}) {
  const naFaixa = indices.filter((i) => !logos[i].bandOff).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <GalleryHorizontalEnd className="h-4 w-4 shrink-0 text-primary" />
            Faixa de apoiadores (topo)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {naFaixa} de {indices.length} na faixa que rola abaixo do topo.
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
            A lista vem dos apoiadores cadastrados, somando todas as categorias. Tirar da faixa{" "}
            <span className="font-semibold text-slate-500">não</span> tira da seção lá embaixo.
          </p>
        </div>
        <SaveButton state={state} onClick={onSave} />
      </div>

      <div className="p-6">
        {indices.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
            Nenhum apoiador ativo. Cadastre em “Apoiadores institucionais”.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {indices.map((i) => {
              const logo = logos[i];
              const on = !logo.bandOff;
              return (
                <button
                  key={i}
                  onClick={() => onToggle(i)}
                  aria-pressed={on}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    on
                      ? "border-primary/40 bg-primary/5"
                      : "border-slate-200 bg-slate-50/60 opacity-70 hover:opacity-100",
                  )}
                >
                  <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                    {logo.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo.src} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-[9px] text-slate-300">sem img</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {logo.name || "(sem nome)"}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">
                      {logo.cat || SEM_CATEGORIA}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                      on ? "bg-primary/15 text-primary" : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {on ? "Na faixa" : "Fora"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  area,
  placeholder,
  list,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
  placeholder?: string;
  list?: string;
}) {
  const cls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15";
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={cn(cls, "py-2")}
        />
      ) : (
        <input
          value={value}
          list={list}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(cls, "h-10")}
        />
      )}
    </label>
  );
}

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
  const map = {
    idle: { icon: <Save className="h-3.5 w-3.5" />, label: "Salvar", cls: "bg-primary text-white hover:bg-primary/95" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Salvando…", cls: "bg-primary/70 text-white" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, label: "Salvo", cls: "bg-emerald-500 text-white" },
    error: { icon: <CircleAlert className="h-3.5 w-3.5" />, label: "Erro", cls: "bg-destructive text-white" },
  }[state];
  return (
    <button
      onClick={onClick}
      disabled={state === "saving"}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-80",
        map.cls,
      )}
    >
      {map.icon}
      {map.label}
    </button>
  );
}
