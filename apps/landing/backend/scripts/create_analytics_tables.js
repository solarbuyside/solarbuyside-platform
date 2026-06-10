#!/usr/bin/env node
/**
 * Create analytics tracking tables
 * - analytics_events: track all user interactions
 * - analytics_sessions: track user sessions
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAnalyticsTables() {
  let connection;

  try {
    console.log('📊 Creating analytics tables...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    console.log('✅ Database connected');

    // Create analytics_sessions table
    console.log('\n📝 Creating analytics_sessions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS analytics_sessions (
        session_id VARCHAR(36) PRIMARY KEY,
        first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        pages_visited INT DEFAULT 1,
        ip_address VARCHAR(45),
        user_agent TEXT,
        INDEX idx_first_seen (first_seen),
        INDEX idx_ip (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ Table created');

    // Create analytics_events table
    console.log('\n📝 Creating analytics_events table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type ENUM('page_view', 'section_view', 'ebook_download', 'newsletter_subscribe', 'buy_click') NOT NULL,
        user_session VARCHAR(36),
        page_url VARCHAR(255),
        section_name VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        INDEX idx_event_type (event_type),
        INDEX idx_session (user_session),
        INDEX idx_timestamp (timestamp),
        FOREIGN KEY (user_session) REFERENCES analytics_sessions(session_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ Table created');

    console.log('\n✅ Analytics tables created successfully!\n');

  } catch (error) {
    console.error('\n❌ Failed to create tables:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

if (require.main === module) {
  createAnalyticsTables()
    .then(() => {
      console.log('\n🎉 Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { createAnalyticsTables };
