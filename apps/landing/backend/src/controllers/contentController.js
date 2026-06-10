const db = require('../config/database');

let sectionIdColumnCache = null;

const parseJsonField = (value) => {
  if (value === null || value === undefined) return {};
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return {};

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('WARN: invalid JSON field in content_sections:', error.message);
    return {};
  }
};

const getSectionIdColumn = async () => {
  if (sectionIdColumnCache) {
    return sectionIdColumnCache;
  }

  const [rows] = await db.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'content_sections'
      AND COLUMN_NAME = 'section_id'
    LIMIT 1
  `);

  sectionIdColumnCache = rows.length > 0 ? 'section_id' : 'id';
  return sectionIdColumnCache;
};

const normalizeSection = (row) => ({
  id: row.section_id,
  name: row.section_name,
  texts: parseJsonField(row.texts),
  images: parseJsonField(row.images)
});

// Get all content sections
exports.getAllSections = async (req, res) => {
  try {
    const sectionIdColumn = await getSectionIdColumn();
    const [sections] = await db.query(
      `SELECT ${sectionIdColumn} AS section_id, section_name, texts, images FROM content_sections`
    );

    res.status(200).json({
      success: true,
      data: sections.map(normalizeSection)
    });
  } catch (error) {
    console.error('Erro ao buscar secoes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar secoes'
    });
  }
};

// Get single section
exports.getSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const sectionIdColumn = await getSectionIdColumn();

    const [sections] = await db.query(
      `SELECT ${sectionIdColumn} AS section_id, section_name, texts, images
       FROM content_sections
       WHERE ${sectionIdColumn} = ?`,
      [sectionId]
    );

    if (sections.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Secao nao encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: normalizeSection(sections[0])
    });
  } catch (error) {
    console.error('Erro ao buscar secao:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar secao'
    });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { section_name, texts, images } = req.body;
    const sectionIdColumn = await getSectionIdColumn();

    // Check if section exists
    const [existing] = await db.query(
      `SELECT ${sectionIdColumn} AS section_id
       FROM content_sections
       WHERE ${sectionIdColumn} = ?`,
      [sectionId]
    );

    if (existing.length === 0) {
      // Insert new section
      await db.query(
        `INSERT INTO content_sections (${sectionIdColumn}, section_name, texts, images)
         VALUES (?, ?, ?, ?)`,
        [sectionId, section_name, JSON.stringify(texts || {}), JSON.stringify(images || {})]
      );
    } else {
      // Update existing section
      await db.query(
        `UPDATE content_sections
         SET section_name = ?, texts = ?, images = ?
         WHERE ${sectionIdColumn} = ?`,
        [section_name, JSON.stringify(texts || {}), JSON.stringify(images || {}), sectionId]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Secao atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar secao:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar secao'
    });
  }
};

// Get global assets
exports.getGlobalAssets = async (req, res) => {
  try {
    const [assets] = await db.query('SELECT asset_key, asset_value FROM global_assets');

    const assetsObject = {};
    assets.forEach(asset => {
      assetsObject[asset.asset_key] = asset.asset_value;
    });

    res.status(200).json({
      success: true,
      data: assetsObject
    });
  } catch (error) {
    console.error('Erro ao buscar assets:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar assets'
    });
  }
};

// Update global asset
exports.updateGlobalAsset = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        message: 'Key e value sao obrigatorios'
      });
    }

    await db.query(
      'INSERT INTO global_assets (asset_key, asset_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE asset_value = ?',
      [key, value, value]
    );

    res.status(200).json({
      success: true,
      message: 'Asset atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar asset:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar asset'
    });
  }
};

// Get global settings
exports.getGlobalSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT setting_key, setting_value FROM global_settings');

    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });

    res.status(200).json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Erro ao buscar settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar settings'
    });
  }
};

// Update global setting
exports.updateGlobalSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        success: false,
        message: 'Key e value sao obrigatorios'
      });
    }

    await db.query(
      'INSERT INTO global_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, value, value]
    );

    res.status(200).json({
      success: true,
      message: 'Setting atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar setting:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar setting'
    });
  }
};
