#!/usr/bin/env node
/**
 * Reset admin passwords - Gera senhas fortes e salva em arquivo local
 * NUNCA imprime senhas no terminal
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BCRYPT_COST = 12;
const PASSWORD_LENGTH = 24;
const OUTPUT_FILE = path.resolve(__dirname, '../.local/admin_passwords.txt');

/**
 * Generate a strong random password
 */
function generateStrongPassword(length = PASSWORD_LENGTH) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

async function resetPasswords() {
  let connection;
  const credentials = [];

  try {
    console.log('🔐 Starting admin password reset...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Database connected');

    // Get all admin users
    console.log('\n📝 Fetching admin users...');
    const [users] = await connection.query(`
      SELECT id, email, name
      FROM admin_users
      ORDER BY id
    `);

    if (users.length === 0) {
      console.log('⚠️  No admin users found');
      return;
    }

    console.log(`📊 Found ${users.length} admin user(s)`);

    // Generate new passwords and update
    console.log('\n📝 Generating strong passwords and updating database...');

    for (const user of users) {
      console.log(`   Processing: ${user.email}`);

      // Generate strong password
      const newPassword = generateStrongPassword();

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_COST);

      // Update database
      await connection.query(`
        UPDATE admin_users
        SET password_hash = ?, password = ''
        WHERE id = ?
      `, [hashedPassword, user.id]);

      // Store credentials for file
      credentials.push({
        email: user.email,
        name: user.name,
        password: newPassword
      });

      console.log(`   ✅ Password reset`);
    }

    // Ensure .local directory exists
    const localDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(localDir, { recursive: true });

    // Write credentials to file
    console.log(`\n📝 Writing credentials to file...`);

    const fileContent = [
      '# Admin Passwords - Generated ' + new Date().toISOString(),
      '# KEEP THIS FILE SECURE AND DELETE AFTER SAVING PASSWORDS',
      '# This file is ignored by git',
      '',
      ...credentials.map(c =>
        `Email: ${c.email}\nName: ${c.name}\nPassword: ${c.password}\n---`
      )
    ].join('\n');

    await fs.writeFile(OUTPUT_FILE, fileContent, 'utf8');

    console.log(`\n✅ ✅ ✅ SUCCESS!`);
    console.log(`🔒 All admin passwords have been reset`);
    console.log(`📁 Credentials saved to: ${OUTPUT_FILE}`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   1. Open the file and save the passwords securely`);
    console.log(`   2. Delete the file after saving`);
    console.log(`   3. Share passwords via secure channel only\n`);

  } catch (error) {
    console.error('\n❌ Password reset failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run reset
if (require.main === module) {
  resetPasswords()
    .then(() => {
      console.log('\n🎉 Password reset completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { resetPasswords };
