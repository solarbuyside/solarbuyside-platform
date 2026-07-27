"use client";

import * as React from "react";
import { Loader2, Upload, Trash2, Link2, ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Campo de imagem do editor da landing.
 *
 * Antes era um input de texto onde se colava um caminho — imagem nova exigia
 * commitar o arquivo no repo e fazer deploy, ou seja, dependia de dev. Agora o
 * cliente arrasta o arquivo (ou clica) e o upload vai pro Supabase Storage,
 * devolvendo a URL pública que fica salva no mesmo campo de sempre.
 *
 * O caminho por URL continua existindo, escondido atrás de "usar um endereço":
 * todas as imagens atuais são caminhos do repo (`/assets/...`) e precisam
 * continuar editáveis, mas isso não pode ser a primeira coisa que ele vê.
 */

export function ImageField({
  value,
  onChange,
  folder,
  /** Altura da caixa de preview. Miniatura nos itens de lista (logos). */
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  folder: string;
  compact?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [showUrl, setShowUrl] = React.useState(false);
  // Guarda QUAL endereço falhou, não um booleano: assim trocar a imagem já
  // limpa o aviso sozinho, sem um efeito que ressincroniza estado.
  const [brokenSrc, setBrokenSrc] = React.useState<string | null>(null);
  const broken = brokenSrc === value;

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/landing/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Falha ao enviar a imagem.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div className="grid gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex items-center gap-3 rounded-lg border border-dashed p-3 transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/60",
        )}
      >
        {/* Miniatura / vazio */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white",
            compact ? "h-12 w-16" : "h-20 w-28",
          )}
        >
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              onError={() => setBrokenSrc(value)}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageOff className="h-4 w-4 text-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "Enviando…" : value ? "Trocar imagem" : "Enviar imagem"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-600"
            >
              <Link2 className="h-3.5 w-3.5" />
              {showUrl ? "esconder endereço" : "usar um endereço"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
            Arraste o arquivo aqui ou clique em enviar. PNG, JPG, WEBP, GIF ou SVG, até 5 MB.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = ""; // permite reenviar o mesmo arquivo
          }}
        />
      </div>

      {showUrl && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/assets/exemplo.png ou https://…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      )}

      {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
      {value && broken && !error && (
        <p className="text-[11px] text-amber-600">
          Não consegui carregar esta imagem — confira o endereço ou envie o arquivo de novo.
        </p>
      )}
    </div>
  );
}
