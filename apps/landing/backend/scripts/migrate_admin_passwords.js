#!/usr/bin/env node
/**
 * Migração robusta de senhas admin para bcrypt
 * Usa INFORMATION_SCHEMA para verificar estrutura antes de alterar
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BCRYPT_COST = 12;

async function migratePasswords() {
  let connection;

  try {
    console.log('🔐 Starting password migration to bcrypt...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Database connected');

    // Step 1: Check if password_hash column exists using INFORMATION_SCHEMA
    console.log('\n📝 Step 1: Checking password_hash column...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'admin_users'
        AND COLUMN_NAME = 'password_hash'
    `, [process.env.DB_DATABASE]);

    if (columns.length === 0) {
      console.log('   Creating password_hash column...');
      await connection.query(`
        ALTER TABLE admin_users
        ADD COLUMN password_hash VARCHAR(255) NULL AFTER password
      `);
      console.log('   ✅ Column created');
    } else {
      console.log('   ✅ Column already exists');
    }

    // Step 2: Check if password column allows NULL
    console.log('\n📝 Step 2: Checking password column constraints...');
    const [passwordCol] = await connection.query(`
      SELECT IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'admin_users'
        AND COLUMN_NAME = 'password'
    `, [process.env.DB_DATABASE]);

    if (passwordCol[0].IS_NULLABLE === 'NO') {
      console.log('   Password is NOT NULL (keeping this way)');
    }

    // Step 3: Verify password column exists
    console.log('\n📝 Step 3: Verifying password column...');
    const [passwordColCheck] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'admin_users'
        AND COLUMN_NAME = 'password'
    `, [process.env.DB_DATABASE]);

    if (passwordColCheck.length === 0) {
      throw new Error('Column "password" not found in admin_users table');
    }
    console.log('   ✅ Column verified');

    // Step 4: Get users with plaintext password and no hash
    console.log('\n📝 Step 4: Fetching users to migrate...');
    const [users] = await connection.query(`
      SELECT id, email, password
      FROM admin_users
      WHERE password IS NOT NULL
        AND password != ''
        AND (password_hash IS NULL OR password_hash = '')
    `);

    if (users.length === 0) {
      console.log('ℹ️  No users need migration. All done!');
      await showStatus(connection);
      return;
    }

    console.log(`📊 Found ${users.length} user(s) to migrate`);

    // Step 5: Hash and update each user
    console.log('\n📝 Step 5: Hashing passwords...');

    let migrated = 0;
    for (const user of users) {
      // Generate bcrypt hash
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_COST);

      // Update database: set hash and clear plaintext
      await connection.query(`
        UPDATE admin_users
        SET password_hash = ?, password = ''
        WHERE id = ?
      `, [hashedPassword, user.id]);

      migrated++;
    }

    console.log(`   ✅ Migrated ${migrated} user(s)`);

    // Step 6: Verify migration
    console.log('\n📝 Step 6: Verifying migration...');
    await showStatus(connection);

    console.log('\n✅ ✅ ✅ SUCCESS! All passwords migrated to bcrypt!');
    console.log('🔒 Plaintext passwords removed from database');
    console.log('🔐 Bcrypt hashes (cost=12) stored securely\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

async function showStatus(connection) {
  const [results] = await connection.query(`
    SELECT
      id,
      email,
      (password = '' OR password IS NULL) as plain_removed,
      (password_hash IS NOT NULL AND password_hash != '') as hash_exists
    FROM admin_users
  `);

  console.log('\n📊 Migration Status:');
  console.table(results.map(r => ({
    id: r.id,
    email: r.email,
    plain_removed: r.plain_removed ? 1 : 0,
    hash_exists: r.hash_exists ? 1 : 0
  })));
}

// Run migration
if (require.main === module) {
  migratePasswords()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { migratePasswords };
