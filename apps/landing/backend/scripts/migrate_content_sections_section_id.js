#!/usr/bin/env node
/**
 * Ensure content_sections has section_id column and index.
 *
 * Safe migration strategy:
 * - If section_id already exists: do nothing.
 * - If only id exists:
 *   1) add section_id as nullable VARCHAR(50)
 *   2) backfill from id
 *   3) mark as NOT NULL
 *   4) create UNIQUE index on section_id
 *
 * This script does NOT drop the legacy id column.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getDbConfig = () => ({
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
  user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQL_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE,
});

const hasColumn = async (connection, tableName, columnName) => {
  const [rows] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
};

const hasIndex = async (connection, tableName, indexName) => {
  const [rows] = await connection.query(
    `
      SELECT INDEX_NAME
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      LIMIT 1
    `,
    [tableName, indexName]
  );

  return rows.length > 0;
};

async function run() {
  const dbConfig = getDbConfig();

  if (!dbConfig.user || !dbConfig.database) {
    throw new Error('Missing DB credentials. Configure DB_USERNAME/DB_USER and DB_DATABASE/DB_NAME.');
  }

  const connection = await mysql.createConnection(dbConfig);

  try {
    const tableName = 'content_sections';

    const sectionIdExists = await hasColumn(connection, tableName, 'section_id');
    if (sectionIdExists) {
      console.log('section_id already exists. No migration needed.');
      return;
    }

    const idExists = await hasColumn(connection, tableName, 'id');
    if (!idExists) {
      throw new Error('Neither section_id nor id column exists in content_sections.');
    }

    console.log('Migrating content_sections: id -> section_id (non-destructive)');

    await connection.query(`
      ALTER TABLE content_sections
      ADD COLUMN section_id VARCHAR(50) NULL AFTER id
    `);

    await connection.query(`
      UPDATE content_sections
      SET section_id = CAST(id AS CHAR(50))
      WHERE section_id IS NULL OR section_id = ''
    `);

    await connection.query(`
      ALTER TABLE content_sections
      MODIFY COLUMN section_id VARCHAR(50) NOT NULL
    `);

    const uniqueIndexName = 'uk_content_sections_section_id';
    const indexExists = await hasIndex(connection, tableName, uniqueIndexName);
    if (!indexExists) {
      await connection.query(`
        CREATE UNIQUE INDEX uk_content_sections_section_id
        ON content_sections (section_id)
      `);
    }

    console.log('Migration completed successfully.');
    console.log('Legacy id column was kept intentionally for safety.');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});

