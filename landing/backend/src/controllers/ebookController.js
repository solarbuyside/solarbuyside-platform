const db = require('../config/database');
const { addContact, sendTransactionalEmail, LIST_IDS, TEMPLATE_IDS } = require('../services/brevoService');

const PDF_URL =
  process.env.BREVO_PDF_URL ||
  'https://solarbuyside.com.br/assets/V2_Teaser_Codigo_Vendedor_Consultivo.pdf';

// Save ebook lead
exports.saveLead = async (req, res) => {
  try {
    const { nome, sobrenome, email, celular } = req.body;

    // Validate required fields
    if (!nome || !sobrenome || !email || !celular) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Normalize email: trim and lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Normalize celular: remove non-digits
    const normalizedCelular = celular.replace(/\D/g, '');

    // Validate celular format (10 or 11 Brazilian digits)
    if (normalizedCelular.length < 10 || normalizedCelular.length > 11) {
      return res.status(400).json({
        success: false,
        message: 'Celular inválido. Use formato brasileiro (10 ou 11 dígitos)'
      });
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Persist to DB. If the insert fails we still run the Brevo sync below so
    // the lead gets the teaser email and lands on the list — the DB row is for
    // /admin reporting, not a gate on email delivery.
    let insertId = null;
    try {
      const [result] = await db.query(
        'INSERT INTO ebook_leads (nome, sobrenome, email, celular, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, sobrenome, normalizedEmail, normalizedCelular, ipAddress, userAgent]
      );
      insertId = result.insertId;
    } catch (dbError) {
      console.error('[ebook] DB insert failed (continuing with Brevo sync):', dbError);
    }

    // Brevo SMS field requires E.164-style format (+55 country code for BR)
    const brevoSms = `+55${normalizedCelular}`;

    // Fire Brevo integration (non-blocking on failure)
    addContact({
      email: normalizedEmail,
      listIds: [LIST_IDS.interessados],
      attributes: {
        NOME: nome,
        SOBRENOME: sobrenome,
        SMS: brevoSms,
      },
    }).catch((err) => console.error('[ebook] Brevo addContact crashed:', err));

    // TEMPORARIAMENTE DESATIVADO: o envio automático do teaser está pausado
    // enquanto a funcionalidade está em produção. O lead continua sendo
    // capturado no Brevo (addContact acima). Para reativar, basta descomentar.
    // sendTransactionalEmail({
    //   to: [{ email: normalizedEmail, name: `${nome} ${sobrenome}` }],
    //   templateId: TEMPLATE_IDS.ebookTeaser,
    //   params: { NOME: nome, PDF_URL },
    // }).catch((err) => console.error('[ebook] Brevo sendEmail crashed:', err));

    res.status(201).json({
      success: true,
      message: 'Dados salvos com sucesso!',
      data: {
        id: insertId,
        nome,
        sobrenome,
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar dados'
    });
  }
};

// Get all leads (admin only)
exports.getAllLeads = async (req, res) => {
  try {
    const [leads] = await db.query(
      'SELECT id, nome, sobrenome, email, celular, downloaded_at FROM ebook_leads ORDER BY downloaded_at DESC'
    );

    res.status(200).json({
      success: true,
      data: leads,
      total: leads.length
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar leads'
    });
  }
};
