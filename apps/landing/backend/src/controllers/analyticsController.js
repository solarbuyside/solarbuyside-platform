const db = require('../config/database');

// Valid event types
const VALID_EVENT_TYPES = [
  'page_view',
  'section_view',
  'ebook_download',
  'newsletter_subscribe',
  'buy_click'
];

// Track analytics event
exports.trackEvent = async (req, res) => {
  try {
    const { event_type, page_url, section_name, session_id } = req.body;

    // Validate required fields
    if (!event_type || !session_id) {
      return res.status(400).json({
        success: false,
        message: 'event_type e session_id são obrigatórios'
      });
    }

    // Validate event_type
    if (!VALID_EVENT_TYPES.includes(event_type)) {
      return res.status(400).json({
        success: false,
        message: `event_type inválido. Use: ${VALID_EVENT_TYPES.join(', ')}`
      });
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Upsert analytics_sessions (usando timezone de Brasília - BRT/GMT-3)
    // Only increment pages_visited for page_view events
    const brazilTime = `CONVERT_TZ(NOW(), '+00:00', '-03:00')`;
    if (event_type === 'page_view') {
      await db.query(`
        INSERT INTO analytics_sessions (session_id, first_seen, last_seen, pages_visited, ip_address, user_agent)
        VALUES (?, ${brazilTime}, ${brazilTime}, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          last_seen = ${brazilTime},
          pages_visited = pages_visited + 1
      `, [session_id, ipAddress, userAgent]);
    } else {
      // For other events, just update last_seen without incrementing pages_visited
      await db.query(`
        INSERT INTO analytics_sessions (session_id, first_seen, last_seen, pages_visited, ip_address, user_agent)
        VALUES (?, ${brazilTime}, ${brazilTime}, 0, ?, ?)
        ON DUPLICATE KEY UPDATE
          last_seen = ${brazilTime}
      `, [session_id, ipAddress, userAgent]);
    }

    // Insert analytics_events
    const [result] = await db.query(`
      INSERT INTO analytics_events (event_type, user_session, page_url, section_name, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [event_type, session_id, page_url || null, section_name || null, ipAddress, userAgent]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        event_type
      }
    });
  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao rastrear evento'
    });
  }
};

// Get analytics summary (admin only)
exports.getMetrics = async (req, res) => {
  try {
    // Get date range from query params or default to last 30 days
    const { start_date, end_date } = req.query;

    // Definir período de consulta
    let sessionWhere, eventsWhere, sessionParams, eventsParams;

    if (start_date && end_date) {
      // Comparar apenas as datas (ignorando hora) já que os timestamps estão em BRT
      sessionWhere = 'DATE(first_seen) >= ? AND DATE(first_seen) <= ?';
      eventsWhere = 'DATE(timestamp) >= ? AND DATE(timestamp) <= ?';
      sessionParams = [start_date, end_date];
      eventsParams = [start_date, end_date];
    } else {
      // Últimos 30 dias usando timezone de Brasília
      sessionWhere = 'first_seen >= DATE_SUB(CONVERT_TZ(NOW(), \'+00:00\', \'-03:00\'), INTERVAL 30 DAY)';
      eventsWhere = 'timestamp >= DATE_SUB(CONVERT_TZ(NOW(), \'+00:00\', \'-03:00\'), INTERVAL 30 DAY)';
      sessionParams = [];
      eventsParams = [];
    }

    // Total unique visitors
    const [visitorsResult] = await db.query(
      `SELECT COUNT(DISTINCT session_id) as total_visitors
       FROM analytics_sessions
       WHERE ${sessionWhere}`,
      sessionParams
    );

    // Average time on site
    const [avgTimeResult] = await db.query(
      `SELECT AVG(TIMESTAMPDIFF(SECOND, first_seen, last_seen)) as avg_time_seconds
       FROM analytics_sessions
       WHERE ${sessionWhere}
         AND TIMESTAMPDIFF(SECOND, first_seen, last_seen) > 0`,
      sessionParams
    );

    // Average sections viewed per session
    const [sectionsResult] = await db.query(
      `SELECT AVG(section_count) as avg_sections
       FROM (
         SELECT user_session, COUNT(DISTINCT section_name) as section_count
         FROM analytics_events
         WHERE event_type = 'section_view'
           AND ${eventsWhere}
         GROUP BY user_session
       ) as section_stats`,
      eventsParams
    );

    // Ebook downloads
    const [ebookResult] = await db.query(
      `SELECT COUNT(*) as ebook_downloads
       FROM analytics_events
       WHERE event_type = 'ebook_download'
         AND ${eventsWhere}`,
      eventsParams
    );

    // Newsletter subscriptions
    const [newsletterResult] = await db.query(
      `SELECT COUNT(*) as newsletter_subs
       FROM analytics_events
       WHERE event_type = 'newsletter_subscribe'
         AND ${eventsWhere}`,
      eventsParams
    );

    // Buy button clicks
    const [buyResult] = await db.query(
      `SELECT COUNT(*) as buy_clicks
       FROM analytics_events
       WHERE event_type = 'buy_click'
         AND ${eventsWhere}`,
      eventsParams
    );

    // Daily stats for chart (usando timezone de Brasília - BRT/GMT-3)
    const [dailyStats] = await db.query(
      `SELECT
         DATE(CONVERT_TZ(timestamp, '+00:00', '-03:00')) as date,
         COUNT(DISTINCT user_session) as visitors,
         SUM(CASE WHEN event_type = 'ebook_download' THEN 1 ELSE 0 END) as ebook_downloads,
         SUM(CASE WHEN event_type = 'newsletter_subscribe' THEN 1 ELSE 0 END) as newsletter_subs,
         SUM(CASE WHEN event_type = 'buy_click' THEN 1 ELSE 0 END) as buy_clicks
       FROM analytics_events
       WHERE ${eventsWhere}
       GROUP BY DATE(CONVERT_TZ(timestamp, '+00:00', '-03:00'))
       ORDER BY date ASC`,
      eventsParams
    );

    // Section funnel stats - calcular tempo como diferença entre seção atual e próxima seção
    // Usar uma subquery para obter o próximo evento e calcular a diferença
    const [sectionStats] = await db.query(
      `SELECT
         e1.section_name,
         COUNT(DISTINCT e1.user_session) as unique_visitors,
         COUNT(e1.id) as total_views,
         AVG(
           CASE
             WHEN e2.timestamp IS NOT NULL
             THEN TIMESTAMPDIFF(SECOND, e1.timestamp, e2.timestamp)
             ELSE NULL
           END
         ) as avg_time_seconds
       FROM analytics_events e1
       LEFT JOIN analytics_events e2 ON (
         e2.user_session = e1.user_session
         AND e2.event_type = 'section_view'
         AND e2.timestamp > e1.timestamp
         AND e2.id = (
           SELECT MIN(e3.id)
           FROM analytics_events e3
           WHERE e3.user_session = e1.user_session
             AND e3.event_type = 'section_view'
             AND e3.timestamp > e1.timestamp
             AND ${eventsWhere.replace(/timestamp/g, 'e3.timestamp')}
         )
         AND ${eventsWhere.replace(/timestamp/g, 'e2.timestamp')}
       )
       WHERE e1.event_type = 'section_view'
         AND e1.section_name IS NOT NULL
         AND ${eventsWhere.replace(/timestamp/g, 'e1.timestamp')}
       GROUP BY e1.section_name
       ORDER BY
         CASE e1.section_name
           WHEN 'hero' THEN 1
           WHEN 'contexto' THEN 2
           WHEN 'video-section' THEN 3
           WHEN 'audiencia' THEN 4
           WHEN 'manual-strategic' THEN 5
           WHEN 'depoimentos' THEN 6
           WHEN 'story-bridge' THEN 7
           WHEN 'seller-code' THEN 8
           WHEN 'oferta' THEN 9
           WHEN 'buyer-wave' THEN 10
           WHEN 'authority' THEN 11
           WHEN 'oferta-final' THEN 12
           WHEN 'lead-magnet' THEN 13
           WHEN 'newsletter' THEN 14
           WHEN 'faq' THEN 15
           ELSE 16
         END`,
      [...eventsParams, ...eventsParams, ...eventsParams] // 3x porque temos 3 WHERE clauses
    );

    res.status(200).json({
      success: true,
      data: {
        total_visitors: visitorsResult[0].total_visitors || 0,
        avg_time_on_site: Math.round(avgTimeResult[0].avg_time_seconds || 0),
        avg_sections_depth: sectionsResult[0].avg_sections ? parseFloat(Number(sectionsResult[0].avg_sections).toFixed(2)) : 0,
        ebook_downloads: ebookResult[0].ebook_downloads || 0,
        newsletter_subs: newsletterResult[0].newsletter_subs || 0,
        buy_clicks: buyResult[0].buy_clicks || 0,
        daily_stats: dailyStats,
        section_funnel: sectionStats.map(s => ({
          section_name: s.section_name,
          unique_visitors: s.unique_visitors || 0,
          total_views: s.total_views || 0,
          avg_time_seconds: Math.round(s.avg_time_seconds || 0)
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar métricas'
    });
  }
};
