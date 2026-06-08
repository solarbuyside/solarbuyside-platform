import { AlertTriangle, Mail } from "lucide-react";

/**
 * Aviso de contagem regressiva: aparece nos últimos 15 dias de acesso.
 * A renovação é via NOVA compra do Manual + Código — daí o CTA "falar com o
 * administrador" (e-mail para contato@solarbuyside.com.br).
 */
export function ExpiryBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 3;
  const when =
    daysLeft <= 0 ? "hoje" : daysLeft === 1 ? "em 1 dia" : `em ${daysLeft} dias`;

  const subject = encodeURIComponent("Renovação de acesso — Solar Buy-Side");
  const body = encodeURIComponent(
    "Olá! Gostaria de renovar meu acesso à plataforma Solar Buy-Side (nova compra do Manual + Código). Podem me ajudar?",
  );
  const mailto = `mailto:contato@solarbuyside.com.br?subject=${subject}&body=${body}`;

  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        urgent
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${urgent ? "text-red-600" : "text-amber-600"}`} />
        <p className="text-sm leading-relaxed">
          <span className="font-bold">Seu acesso expira {when}.</span> Para continuar usando a plataforma,
          é necessária uma nova compra do Manual + Código. Fale com o administrador para renovar.
        </p>
      </div>
      <a
        href={mailto}
        className={[
          "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-bold text-white transition-all active:scale-[0.98]",
          urgent ? "bg-red-600 hover:bg-red-600/95" : "bg-amber-600 hover:bg-amber-600/95",
        ].join(" ")}
      >
        <Mail className="h-3.5 w-3.5" />
        Renovar acesso
      </a>
    </div>
  );
}
