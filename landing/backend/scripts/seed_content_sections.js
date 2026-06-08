#!/usr/bin/env node
/**
 * Seed content_sections from src/contexts/ContentData.ts
 *
 * Default behavior:
 * - Inserts only missing sections
 * - Preserves existing rows/content
 *
 * Optional:
 * - --force : updates existing rows too
 * - --with-defaults : writes default texts/images from ContentData.ts
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const forceUpdate = process.argv.includes('--force');
const withDefaults = process.argv.includes('--with-defaults');
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');

if (showHelp) {
  console.log(`
Usage:
  node scripts/seed_content_sections.js
  node scripts/seed_content_sections.js --with-defaults
  node scripts/seed_content_sections.js --force --with-defaults

Flags:
  --with-defaults   Use texts/images from ContentData.ts (default is empty payload)
  --force           Update existing rows too (otherwise inserts only missing sections)
  --help, -h        Show this help
`);
  process.exit(0);
}

const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function getDbConfig() {
  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQL_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE,
  };
}

function loadInitialContent() {
  const contentPath = path.resolve(__dirname, '../../src/contexts/ContentData.ts');
  const source = fs.readFileSync(contentPath, 'utf8');

  const exportIndex = source.indexOf('export const initialContent');
  if (exportIndex === -1) {
    throw new Error('initialContent export not found in ContentData.ts');
  }

  const arrayStart = source.indexOf('[', exportIndex);
  const arrayEnd = source.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    throw new Error('Could not parse initialContent array');
  }

  const rawArray = source.slice(arrayStart, arrayEnd + 1);
  const script = new vm.Script(`(${rawArray})`);
  const data = script.runInNewContext({});

  if (!Array.isArray(data)) {
    throw new Error('Parsed initialContent is not an array');
  }

  return data;
}

async function detectIdColumn(connection) {
  const [rows] = await connection.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'content_sections'
      AND COLUMN_NAME = 'section_id'
    LIMIT 1
  `);

  return rows.length > 0 ? 'section_id' : 'id';
}

async function run() {
  const dbConfig = getDbConfig();

  if (!dbConfig.user || !dbConfig.database) {
    throw new Error('Missing DB credentials. Configure DB_USERNAME/DB_USER and DB_DATABASE/DB_NAME.');
  }

  const sections = loadInitialContent();
  const connection = await mysql.createConnection(dbConfig);

  try {
    const idColumn = await detectIdColumn(connection);
    console.log(`Using content_sections id column: ${idColumn}`);
    console.log(`Mode: ${forceUpdate ? 'upsert (force)' : 'insert missing only'} | payload=${withDefaults ? 'defaults' : 'empty'}`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const section of sections) {
      const sectionId = String(section.id || '').trim();
      if (!sectionId) continue;

      const sectionName = String(section.name || sectionId);
      const texts = JSON.stringify(withDefaults ? (section.texts || {}) : {});
      const images = JSON.stringify(withDefaults ? (section.images || {}) : {});

      const [existing] = await connection.query(
        `SELECT ${idColumn} AS section_id FROM content_sections WHERE ${idColumn} = ? LIMIT 1`,
        [sectionId]
      );

      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO content_sections (${idColumn}, section_name, texts, images) VALUES (?, ?, ?, ?)`,
          [sectionId, sectionName, texts, images]
        );
        inserted += 1;
        continue;
      }

      if (forceUpdate) {
        await connection.query(
          `UPDATE content_sections SET section_name = ?, texts = ?, images = ? WHERE ${idColumn} = ?`,
          [sectionName, texts, images, sectionId]
        );
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped}`);
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
