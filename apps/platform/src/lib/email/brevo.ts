import { cleanEnv } from "../env";

/**
 * Envio de e-mail transacional via Brevo (API v3). Server-only.
 *
 * Usado para o e-mail de ACESSO pós-compra (Greenn): o Supabase só gera o link
 * seguro (admin.generateLink, sem enviar nada) e este módulo entrega o e-mail
 * com o link pelo Brevo. Nenhum e-mail sai pelo Supabase.
 */

const BREVO_API_BASE = "https://api.brevo.com/v3";

function brevoConfig() {
  const apiKey = cleanEnv(process.env.BREVO_API_KEY);
  const senderName = cleanEnv(process.env.BREVO_SENDER_NAME) ?? "Solar Buy-Side";
  const senderEmail = cleanEnv(process.env.BREVO_SENDER_EMAIL) ?? "contato@solarbuyside.com.br";
  return { apiKey, senderName, senderEmail };
}

type SendResult = { ok: boolean; status: number; body?: unknown; error?: string };

export async function sendTransactionalEmail(opts: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}): Promise<SendResult> {
  const { apiKey, senderName, senderEmail } = brevoConfig();
  if (!apiKey) {
    console.warn("[brevo] BREVO_API_KEY ausente — e-mail não enviado");
    return { ok: false, status: 0, error: "BREVO_API_KEY missing" };
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: opts.to,
    subject: opts.subject,
    htmlContent: opts.htmlContent,
  };

  try {
    const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!response.ok) {
      console.error(`[brevo] sendTransactionalEmail falhou ${response.status}:`, body);
      return { ok: false, status: response.status, body };
    }
    return { ok: true, status: response.status, body };
  } catch (err) {
    const message = err instanceof Error ? err.message : "network error";
    console.error("[brevo] sendTransactionalEmail erro de rede:", message);
    return { ok: false, status: 0, error: message };
  }
}

/** E-mail de boas-vindas + link para criar a senha de acesso à plataforma. */
export async function sendAccessEmail(opts: {
  to: string;
  name?: string | null;
  actionLink: string;
}): Promise<SendResult> {
  const firstName = opts.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? `Olá, ${escapeHtml(firstName)}!` : "Olá!";
  const subject = "Seu acesso à Plataforma Solar Buy-Side";
  const htmlContent = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:20px;margin:0 0 8px;color:#0f172a;">${greeting}</h1>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px;">
        Sua compra foi confirmada e o acesso à Plataforma de Avaliação de Propostas Solar Buy-Side
        está liberado. Para começar, crie sua senha clicando no botão abaixo.
      </p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${escapeAttr(opts.actionLink)}"
           style="background:#f97316;color:#ffffff;text-decoration:none;font-weight:bold;
                  font-size:15px;padding:14px 28px;border-radius:10px;display:inline-block;">
          Criar minha senha e acessar
        </a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 16px;">
        Seu acesso é válido por 6 meses a partir da ativação. Use o mesmo e-mail desta mensagem para entrar.
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;">
        Se você não reconhece esta compra, ignore este e-mail ou fale com a gente em
        <a href="mailto:contato@solarbuyside.com.br" style="color:#f97316;">contato@solarbuyside.com.br</a>.
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">Equipe Solar Buy-Side</p>
    </div>
  </body>
</html>`;

  return sendTransactionalEmail({
    to: [{ email: opts.to, name: opts.name ?? undefined }],
    subject,
    htmlContent,
  });
}

/**
 * Conta criada pela equipe no /admin/usuarios: manda o login e a senha que o
 * admin definiu, com o botão para entrar. Sem link mágico: a pessoa entra
 * pelo /login normal (comprador ainda recebe o código 2FA na hora).
 */
export function buildNewAccountEmail(opts: {
  name?: string | null;
  email: string;
  password: string;
  loginUrl: string;
  roleLabel: string;
}): { subject: string; htmlContent: string } {
  const firstName = opts.name?.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? `Olá, ${escapeHtml(firstName)}!` : "Olá!";
  const subject = "Sua conta na Plataforma Solar Buy-Side";
  const htmlContent = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:20px;margin:0 0 8px;color:#0f172a;">${greeting}</h1>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px;">
        A equipe Solar Buy-Side criou uma conta para você na Plataforma de Avaliação de Propostas,
        com o perfil de <strong>${escapeHtml(opts.roleLabel)}</strong>. Estes são os seus dados de acesso:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0"
             style="width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;margin:0 0 8px;">
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#64748b;">E-mail</div>
            <div style="font-size:15px;color:#0f172a;margin-top:4px;">${escapeHtml(opts.email)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 18px;">
            <div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Senha</div>
            <div style="font-size:17px;font-family:'Courier New',Courier,monospace;font-weight:bold;letter-spacing:1px;color:#0f172a;margin-top:4px;">${escapeHtml(opts.password)}</div>
          </td>
        </tr>
      </table>
      <p style="text-align:center;margin:28px 0;">
        <a href="${escapeAttr(opts.loginUrl)}"
           style="background:#f97316;color:#ffffff;text-decoration:none;font-weight:bold;
                  font-size:15px;padding:14px 28px;border-radius:10px;display:inline-block;">
          Entrar na plataforma
        </a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0 0 16px;">
        Por segurança, troque a senha depois do primeiro acesso, em Configurações &gt; Trocar senha.
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;">
        Se você não esperava este e-mail, fale com a gente em
        <a href="mailto:contato@solarbuyside.com.br" style="color:#f97316;">contato@solarbuyside.com.br</a>.
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:16px 0 0;">Equipe Solar Buy-Side</p>
    </div>
  </body>
</html>`;
  return { subject, htmlContent };
}

export async function sendNewAccountEmail(opts: {
  to: string;
  name?: string | null;
  password: string;
  loginUrl: string;
  roleLabel: string;
}): Promise<SendResult> {
  const { subject, htmlContent } = buildNewAccountEmail({ ...opts, email: opts.to });
  return sendTransactionalEmail({
    to: [{ email: opts.to, name: opts.name ?? undefined }],
    subject,
    htmlContent,
  });
}

/** E-mail com o código de verificação (2FA) do login. */
export async function sendLoginCodeEmail(email: string, code: string): Promise<SendResult> {
  const subject = "Seu código de acesso — Solar Buy-Side";
  const htmlContent = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="font-size:20px;margin:0 0 8px;">Código de acesso</h1>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 12px;">
        Use o código abaixo para concluir o login na Plataforma Solar Buy-Side:
      </p>
      <p style="text-align:center;font-size:34px;font-weight:bold;letter-spacing:6px;color:#f97316;margin:20px 0;">${escapeHtml(code)}</p>
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">
        O código expira em 10 minutos. Se não foi você que tentou entrar, ignore este e-mail e troque sua senha.
      </p>
      <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;">Equipe Solar Buy-Side</p>
    </div>
  </body>
</html>`;
  return sendTransactionalEmail({ to: [{ email }], subject, htmlContent });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}
