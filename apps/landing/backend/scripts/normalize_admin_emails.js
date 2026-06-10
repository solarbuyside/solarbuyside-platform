#!/usr/bin/env node
/**
 * Normalizar emails de admin_users para LOWER(TRIM(email))
 * Executa apenas em emails que precisam de normalização
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function normalizeEmails() {
  let connection;

  try {
    console.log('📧 Starting email normalization...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Database connected');

    // Execute normalization (only updates emails that need it)
    console.log('\n📝 Normalizing emails...');
    const [result] = await connection.query(`
      UPDATE admin_users
      SET email = LOWER(TRIM(email))
      WHERE email != LOWER(TRIM(email))
    `);

    const totalUpdated = result.affectedRows || 0;

    console.log(`\n📊 Normalization complete:`);
    console.log(`   Total updated: ${totalUpdated}`);
    console.log(`   Status: ${totalUpdated >= 0 ? 'OK' : 'FAIL'}\n`);

  } catch (error) {
    console.error('\n❌ Normalization failed:', error.message);
    console.log('   Status: FAIL\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run normalization
if (require.main === module) {
  normalizeEmails()
    .then(() => {
      console.log('\n✅ Email normalization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { normalizeEmails };
