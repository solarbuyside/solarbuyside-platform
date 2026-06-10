const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
  user: process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQL_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE
};

if (!dbConfig.user || !dbConfig.database) {
  console.warn('WARN: Database env vars may be incomplete. Expected DB_USERNAME/DB_USER and DB_DATABASE/DB_NAME.');
}

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
