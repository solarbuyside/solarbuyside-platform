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
  GripVertical,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LandingSection } from "@/lib/landing/content-admin";
import { MAX_LOGOS } from "@/lib/landing/field-schema";
import { saveLandingSectionAction } from "./actions";
import { ImageField } from "./image-field";

/**
 * Editor dos logos de "Apoiadores institucionais" (Francis, revisão 22-23/07).
 *
 * A lista alimenta UM lugar da página: a seção de apoiadores, agrupada por
 * categoria (4ª dobra desde a revisão de 06/08). A visão `{ kind: "cat" }`
 * edita uma categoria ou "todas"; a ordem das categorias na página é a ordem em
 * que elas aparecem nesta lista.
 *
 * Até 06/08 existia uma segunda visão, `{ kind: "band" }`, para escolher quem
 * subia para a faixa de logos que rolava abaixo do Hero e em que ordem. A faixa
 * foi eliminada (slide 3) e a visão saiu junto: sem faixa, marcar "na faixa" ou
 * "fora" não faria nada em lugar nenhum. As chaves logoNBandOff/logoNBandPos
 * ficaram órfãs no banco e deixaram de ser lidas e escritas.
 *
 * `hidden` continua: logo guardado, fora do ar (marca sem autorização de uso).
 *
 * Grava como logo{i}Src (images) + logo{i}Name/Cat/Desc/Url/Hidden (texts),
 * renumerando do zero a cada salvamento — mesma mecânica do editor de
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
};

export type LogosView = { kind: "cat"; cat: string | null };

const blank: Logo = {
  src: "",
  name: "",
  cat: "",
  desc: "",
  url: "",
  hidden: false,
};

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
  // Posição sendo arrastada e posição sob o cursor (para a linha-guia).
  const [arrastando, setArrastando] = React.useState<number | null>(null);
  const [alvo, setAlvo] = React.useState<number | null>(null);
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
    if (view.cat == null) return logos.map((_, i) => i);
    return logos.map((l, i) => [l, i] as const).filter(([l]) => catDe(l) === view.cat).map(([, i]) => i);
  }, [logos, view]);

  const update = <K extends keyof Logo>(i: number, key: K, value: Logo[K]) =>
    setLogos((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));

  /** Novo logo já nasce na categoria da visão aberta. */
  const add = () =>
    setLogos((ls) => {
      const cat = view.cat && view.cat !== SEM_CATEGORIA ? view.cat : "";
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
  const move = (i: number, delta: number) => {
    const pos = visiveis.indexOf(i);
    reordenar(pos, pos + delta);
  };

  /**
   * Move o item da posição `de` para a posição `para`, DENTRO da visão atual.
   *
   * Mexe na lista mesmo, mas só entre vizinhos da própria categoria: senão o
   * logo saltaria para o meio de outro grupo, já que é a ordem da lista que
   * define o agrupamento na página.
   */
  const reordenar = (de: number, para: number) => {
    if (de === para || para < 0 || para >= visiveis.length) return;
    const nova = [...visiveis];
    const [movido] = nova.splice(de, 1);
    nova.splice(para, 0, movido);

    setLogos((ls) => {
      const copy = [...ls];
      // Os mesmos slots da visão, agora preenchidos na ordem nova.
      nova.forEach((origem, k) => {
        copy[visiveis[k]] = ls[origem];
      });
      return copy;
    });
  };

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
          <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
            Arraste pela alça <GripVertical className="inline h-3 w-3 -translate-y-px" /> para
            reordenar.
            {view.cat != null && (
              <>
                {" "}Para mover um logo de categoria, troque o campo{" "}
                <span className="font-semibold text-slate-500">Categoria</span> dentro do card.
              </>
            )}
          </p>
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
              draggable
              onDragStart={() => setArrastando(pos)}
              onDragOver={(e) => {
                e.preventDefault();
                if (alvo !== pos) setAlvo(pos);
              }}
              onDragEnd={() => {
                setArrastando(null);
                setAlvo(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (arrastando != null) reordenar(arrastando, pos);
                setArrastando(null);
                setAlvo(null);
              }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                logo.hidden ? "border-slate-200 bg-slate-50/70" : "border-slate-200",
                arrastando === pos && "opacity-40",
                alvo === pos && arrastando != null && arrastando !== pos && "ring-2 ring-primary/50",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {/* Alça: sinaliza que o card se arrasta. As setas continuam
                      ali como alternativa (toque e teclado não arrastam). */}
                  <GripVertical
                    className="h-4 w-4 cursor-grab text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
                  />
                  Logo {pos + 1}
                  {logo.hidden && (
                    <span className="rounded bg-slate-200 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      Oculto
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
