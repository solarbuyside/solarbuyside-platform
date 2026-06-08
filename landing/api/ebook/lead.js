// Serverless (Vercel) — substitui o /api/ebook/lead do Render.
// Grava o lead no Supabase, adiciona à lista 4 (Ebook) no Brevo com atributos
// e envia o e-mail com o link do teaser (PDF).
const BREVO = "https://api.brevo.com/v3";
const EBOOK_LIST_ID = 4;
const PDF_URL =
  process.env.BREVO_PDF_URL ||
  "https://solarbuyside.com.br/assets/V2_Teaser_Codigo_Vendedor_Consultivo.pdf";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Método não permitido" });
    return;
  }
  try {
    const { nome, sobrenome, celular } = req.body || {};
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!nome || !sobrenome || !email || !celular) {
      res.status(400).json({ success: false, message: "Todos os campos são obrigatórios" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: "Email inválido" });
      return;
    }
    const sms = String(celular).replace(/\D/g, "");
    if (sms.length < 10 || sms.length > 11) {
      res.status(400).json({ success: false, message: "Celular inválido (10 ou 11 dígitos)" });
      return;
    }
    const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0];
    const ua = (req.headers["user-agent"] || "").toString();

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/ebook_leads`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ nome, sobrenome, email, celular: sms, ip_address: ip, user_agent: ua }),
      }).catch((e) => console.error("[ebook] supabase:", e?.message));
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      await fetch(`${BREVO}/contacts`, {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          email,
          listIds: [EBOOK_LIST_ID],
          updateEnabled: true,
          attributes: { NOME: nome, SOBRENOME: sobrenome, SMS: sms },
        }),
      }).catch((e) => console.error("[ebook] brevo contact:", e?.message));

      await fetch(`${BREVO}/smtp/email`, {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || "Solar Buy-Side",
            email: process.env.BREVO_SENDER_EMAIL || "contato@solarbuyside.com.br",
          },
          to: [{ email, name: `${nome} ${sobrenome}` }],
          subject: "Seu teaser do Código do Vendedor Consultivo",
          htmlContent: `<p>Olá, ${escapeHtml(nome)}!</p><p>Aqui está o seu teaser gratuito do <strong>Código do Vendedor Consultivo</strong>:</p><p><a href="${PDF_URL}">Baixar o teaser (PDF)</a></p><p>Equipe Solar Buy-Side</p>`,
        }),
      }).catch((e) => console.error("[ebook] brevo email:", e?.message));
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[ebook] erro:", err?.message);
    res.status(200).json({ success: true });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}
