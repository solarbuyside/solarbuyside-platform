#!/usr/bin/env node
/**
 * Adicionar usuários específicos ao sistema
 * Uso: node add_users.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BCRYPT_COST = 12;

const USERS = [
  {
    email: 'gab.feelix@gmail.com',
    password: 'gafe3622',
    name: 'Gabriel Felix'
  },
  {
    email: 'francis_poloni@yahoo.com.br',
    password: 'Nerac47600@',
    name: 'Francis Poloni'
  }
];

async function addUsers() {
  let connection;

  try {
    console.log('👥 Adicionando usuários ao sistema...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Database connected\n');

    for (const user of USERS) {
      const normalizedEmail = user.email.trim().toLowerCase();
      const hashedPassword = await bcrypt.hash(user.password, BCRYPT_COST);

      // Check if user exists
      const [existing] = await connection.query(
        'SELECT id FROM admin_users WHERE email = ?',
        [normalizedEmail]
      );

      if (existing.length > 0) {
        // Update existing user
        await connection.query(
          'UPDATE admin_users SET password_hash = ?, name = ?, password = "" WHERE email = ?',
          [hashedPassword, user.name, normalizedEmail]
        );
        console.log(`✅ Atualizado: ${normalizedEmail}`);
      } else {
        // Insert new user
        await connection.query(
          'INSERT INTO admin_users (email, password_hash, name, password) VALUES (?, ?, ?, "")',
          [normalizedEmail, hashedPassword, user.name]
        );
        console.log(`✅ Criado: ${normalizedEmail}`);
      }
    }

    console.log('\n✅ Todos os usuários foram processados!');

    // Show final list
    const [users] = await connection.query('SELECT id, email, name FROM admin_users ORDER BY id');
    console.log('\n📋 Usuários no sistema:');
    console.table(users);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  addUsers()
    .then(() => {
      console.log('\n🎉 Concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { addUsers };
