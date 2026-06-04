/**
 * Política de acesso à plataforma (épico GREENN + Brevo) — slide 1.
 *
 * ⚠️ NÃO INTEGRADO AINDA. A plataforma de billing (GREENN) e o envio de e-mail
 * (Brevo) ainda não estão instalados. Este módulo só fixa as REGRAS DE TEMPO e
 * expõe os pontos de integração como stubs, para que a implementação futura
 * tenha o contrato pronto. Nenhuma destas funções deve ser chamada em produção
 * até a integração ser concluída.
 *
 * Fluxo desejado (a implementar):
 *   1. Cliente compra o Manual no checkout GREENN (confirma e-mail, celular, senha).
 *   2. Webhook GREENN (compra) → cria/ativa o acesso e dispara e-mail via Brevo.
 *   3. Acesso válido por ACCESS_VALIDITY_MONTHS a partir do cadastro.
 *   4. Pedido de reembolso dentro de REFUND_WINDOW_DAYS → bloqueia o acesso.
 *
 * Decisão: confirmação/entrega de acesso por E-MAIL (Brevo). SMS foi descartado.
 */

/** Validade do acesso a partir da criação da conta. */
export const ACCESS_VALIDITY_MONTHS = 6;

/** Janela de direito de arrependimento (reembolso bloqueia o acesso). */
export const REFUND_WINDOW_DAYS = 7;

/**
 * Identidade e textos dos e-mails transacionais (Brevo) — print 04.06.
 * TODO(brevo): usar no template de confirmação quando a integração existir.
 * O remetente deve aparecer como "Solar Buy-Side" (não "me"/contato@…) e o
 * assunto/corpo em português.
 */
export const EMAIL_SENDER_NAME = "Solar Buy-Side";
export const EMAIL_SENDER_ADDRESS = "contato@buyside.com.br";
export const EMAIL_CONFIRM_SUBJECT =
  "Bem-vindo à Plataforma Solar Buy-Side: confirme seu endereço de e-mail";
export const EMAIL_CONFIRM_INTRO =
  "Bem-vindo à Plataforma Solar Buy-Side! Confirme seu endereço de e-mail clicando no link abaixo para concluir o cadastro.";

/** Calcula a data de expiração do acesso (validade de 6 meses). */
export function computeAccessExpiry(purchasedAt: Date): Date {
  const expiry = new Date(purchasedAt);
  expiry.setMonth(expiry.getMonth() + ACCESS_VALIDITY_MONTHS);
  return expiry;
}

/** Fim da janela de arrependimento (7 dias após a compra). */
export function computeRefundDeadline(purchasedAt: Date): Date {
  const deadline = new Date(purchasedAt);
  deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
  return deadline;
}

/** Acesso está dentro do prazo de validade? */
export function isAccessValid(expiresAt: Date, now: Date): boolean {
  return now < expiresAt;
}

// --- Pontos de integração (STUBS — implementar quando GREENN/Brevo existirem) ---

export type GreennPurchaseEvent = {
  email: string;
  phone?: string;
  purchasedAt: string; // ISO
  orderId: string;
};

export type GreennRefundEvent = {
  email: string;
  orderId: string;
  refundedAt: string; // ISO
};

/**
 * TODO(greenn): tratar webhook de compra — criar conta/acesso com validade de
 * 6 meses e disparar o e-mail de acesso via Brevo. Não implementado.
 */
export async function handleGreennPurchase(event: GreennPurchaseEvent): Promise<void> {
  void event;
  throw new Error("handleGreennPurchase: integração GREENN/Brevo não implementada.");
}

/**
 * TODO(greenn): tratar webhook de reembolso — se dentro da janela de 7 dias,
 * bloquear o acesso. Não implementado.
 */
export async function handleGreennRefund(event: GreennRefundEvent): Promise<void> {
  void event;
  throw new Error("handleGreennRefund: integração GREENN/Brevo não implementada.");
}

/**
 * TODO(brevo): enviar e-mail de acesso (login + senha cadastrados) via Brevo.
 * SMS foi descartado — usar apenas e-mail. Não implementado.
 */
export async function sendAccessEmail(to: string): Promise<void> {
  void to;
  throw new Error("sendAccessEmail: integração Brevo não implementada.");
}

/**
 * TODO(cron): job diário que nega acesso a contas com validade expirada
 * (6 meses). Agendar quando a plataforma/billing estiver instalada.
 */
export async function expireStaleAccessJob(): Promise<void> {
  throw new Error("expireStaleAccessJob: CRON de expiração não implementado.");
}
