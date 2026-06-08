/**
 * Brevo (Sendinblue) integration.
 *
 * Adds contacts to lists and (optionally) updates attributes. The actual
 * welcome email + PDF link is sent by Brevo automations configured in the
 * dashboard (trigger: "contact added to list X" -> send template).
 *
 * Requires BREVO_API_KEY env var. Uses native fetch (Node 18+).
 */

const BREVO_API_BASE = 'https://api.brevo.com/v3';

const LIST_IDS = {
  newsletter: 3,   // Newsletter list
  interessados: 4, // Ebook leads list
};

const TEMPLATE_IDS = {
  newsletterWelcome: 1, // "Solar Buy-Side — Newsletter Boas-vindas"
  ebookTeaser: 2,       // "Solar Buy-Side — Ebook Teaser (Código do Vendedor)"
};

/**
 * Adds (or updates) a contact in Brevo and assigns them to a list.
 * Idempotent: if the contact already exists, attributes are updated and
 * the list assignment is appended (no duplicates, no error).
 *
 * @param {Object} params
 * @param {string} params.email           Contact email (required)
 * @param {number[]} params.listIds       Brevo list IDs to add contact to
 * @param {Object} [params.attributes]    Custom attributes (NOME, SOBRENOME, CELULAR, etc.)
 * @returns {Promise<{ok: boolean, status: number, body?: any, error?: string}>}
 */
async function addContact({ email, listIds, attributes = {} }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('[brevo] BREVO_API_KEY not set — skipping contact sync');
    return { ok: false, status: 0, error: 'BREVO_API_KEY missing' };
  }

  if (!email) {
    return { ok: false, status: 400, error: 'email required' };
  }

  const payload = {
    email,
    listIds,
    attributes,
    updateEnabled: true, // upsert behavior — won't fail on duplicates
  };

  try {
    const response = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }

    if (!response.ok) {
      console.error(`[brevo] addContact failed ${response.status}:`, body);
      return { ok: false, status: response.status, body };
    }

    return { ok: true, status: response.status, body };
  } catch (err) {
    console.error('[brevo] addContact network error:', err.message);
    return { ok: false, status: 0, error: err.message };
  }
}

/**
 * Send a transactional email via Brevo SMTP API.
 * Supports both inline HTML and saved Brevo templates (templateId + params).
 * When templateId is provided, the template's sender/subject apply unless overridden.
 *
 * @param {Object} opts
 * @param {{ email: string, name?: string }[]} opts.to
 * @param {number} [opts.templateId]   Brevo template ID (preferred — editable via dashboard)
 * @param {Object} [opts.params]       Template variable substitutions (e.g. {NOME, PDF_URL})
 * @param {string} [opts.subject]      Required when templateId is not provided
 * @param {string} [opts.htmlContent]  Required when templateId is not provided
 * @param {{ name: string, email: string }} [opts.sender]
 * @returns {Promise<{ok: boolean, status: number, body?: any, error?: string}>}
 */
async function sendTransactionalEmail({ to, templateId, params, subject, htmlContent, sender }) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn('[brevo] BREVO_API_KEY not set — skipping email send');
    return { ok: false, status: 0, error: 'BREVO_API_KEY missing' };
  }

  const defaultSender = {
    name: process.env.BREVO_SENDER_NAME || 'Solar Buy-Side',
    email: process.env.BREVO_SENDER_EMAIL || 'contato@buyside.com.br',
  };

  const payload = { to };
  if (templateId) {
    payload.templateId = templateId;
    if (params) payload.params = params;
    if (sender) payload.sender = sender;
    if (subject) payload.subject = subject;
  } else {
    payload.sender = sender || defaultSender;
    payload.subject = subject;
    payload.htmlContent = htmlContent;
  }

  try {
    const response = await fetch(`${BREVO_API_BASE}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }

    if (!response.ok) {
      console.error(`[brevo] sendTransactionalEmail failed ${response.status}:`, body);
      return { ok: false, status: response.status, body };
    }

    return { ok: true, status: response.status, body };
  } catch (err) {
    console.error('[brevo] sendTransactionalEmail network error:', err.message);
    return { ok: false, status: 0, error: err.message };
  }
}

module.exports = {
  addContact,
  sendTransactionalEmail,
  LIST_IDS,
  TEMPLATE_IDS,
};
