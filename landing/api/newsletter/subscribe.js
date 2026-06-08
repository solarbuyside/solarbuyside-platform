// Serverless (Vercel) — substitui o /api/newsletter/subscribe do Render.
// Grava o lead no Supabase e adiciona o contato à lista 3 (Newsletter) no Brevo.
const BREVO = "https://api.brevo.com/v3";
const NEWSLETTER_LIST_ID = 3;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Método não permitido" });
    return;
  }
  try {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: "Email inválido" });
      return;
    }
    const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0];
    const ua = (req.headers["user-agent"] || "").toString();

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      await fetch(`${url}/rest/v1/newsletter_subscribers`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "content-type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({ email, ip_address: ip, user_agent: ua }),
      }).catch((e) => console.error("[newsletter] supabase:", e?.message));
    }

    if (process.env.BREVO_API_KEY) {
      await fetch(`${BREVO}/contacts`, {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ email, listIds: [NEWSLETTER_LIST_ID], updateEnabled: true }),
      }).catch((e) => console.error("[newsletter] brevo:", e?.message));
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[newsletter] erro:", err?.message);
    res.status(200).json({ success: true }); // não bloqueia o usuário
  }
}
