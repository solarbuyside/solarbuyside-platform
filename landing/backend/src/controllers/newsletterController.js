const db = require('../config/database');
const { addContact, sendTransactionalEmail, LIST_IDS, TEMPLATE_IDS } = require('../services/brevoService');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
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

    // Get IP and User Agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Persist to DB. A duplicate email is NOT a hard failure here: the Brevo
    // sync below is idempotent and must still run so a re-submit (or a contact
    // that exists in our DB but never reached Brevo) is guaranteed on the list.
    let insertId = null;
    let isDuplicate = false;
    try {
      const [result] = await db.query(
        'INSERT INTO newsletter_subscribers (email, ip_address, user_agent) VALUES (?, ?, ?)',
        [normalizedEmail, ipAddress, userAgent]
      );
      insertId = result.insertId;
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        isDuplicate = true;
      } else {
        throw dbError;
      }
    }

    // Brevo sync runs regardless of DB duplicate — addContact upserts the
    // contact onto the list, sendTransactionalEmail re-sends the welcome
    // (harmless on a re-subscribe). Both are non-blocking on failure.
    addContact({
      email: normalizedEmail,
      listIds: [LIST_IDS.newsletter],
    }).catch((err) => console.error('[newsletter] Brevo addContact crashed:', err));

    sendTransactionalEmail({
      to: [{ email: normalizedEmail }],
      templateId: TEMPLATE_IDS.newsletterWelcome,
    }).catch((err) => console.error('[newsletter] Brevo sendEmail crashed:', err));

    res.status(isDuplicate ? 200 : 201).json({
      success: true,
      message: 'Email cadastrado com sucesso!',
      data: {
        id: insertId,
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar email'
    });
  }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
  try {
    const [subscribers] = await db.query(
      'SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );

    res.status(200).json({
      success: true,
      data: subscribers,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Erro ao buscar inscritos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar inscritos'
    });
  }
};
