"use client";

import * as React from "react";
import { RotateCcw, X } from "lucide-react";

/**
 * Aviso (mobile, retrato) sugerindo girar o celular para ler a tabela larga do
 * comparativo na horizontal. Some quando já está em paisagem, quando o usuário
 * fecha, ou em telas grandes.
 */
export function RotateHint() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem("sbs.rotateHint") === "1";
    } catch {
      /* ignora */
    }
    const isPhone = window.matchMedia("(max-width: 767px)");
    const isPortrait = window.matchMedia("(orientation: portrait)");
    function update() {
      setShow(!dismissed && isPhone.matches && isPortrait.matches);
    }
    update();
    isPhone.addEventListener("change", update);
    isPortrait.addEventListener("change", update);
    return () => {
      isPhone.removeEventListener("change", update);
      isPortrait.removeEventListener("change", update);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.sessionStorage.setItem("sbs.rotateHint", "1");
    } catch {
      /* ignora */
    }
  }

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-3.5 py-2.5 md:hidden">
      <RotateCcw className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 text-[13px] leading-snug text-slate-700">
        Para ver a comparação completa, <strong className="font-bold">vire o celular na horizontal</strong>.
      </p>
      <button onClick={dismiss} className="shrink-0 rounded-md p-1 text-slate-400 hover:text-slate-600" title="Fechar">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
