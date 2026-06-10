-- Docker seed script for testing
-- Creates all tables and inserts test data

USE solar_buyside_test;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT '',
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_email (email),
  INDEX idx_subscribed_at (subscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ebook_leads table
CREATE TABLE IF NOT EXISTS ebook_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  sobrenome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_email (email),
  INDEX idx_downloaded_at (downloaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id VARCHAR(36) PRIMARY KEY,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  pages_visited INT DEFAULT 1,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_first_seen (first_seen),
  INDEX idx_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create analytics_events table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  section_id VARCHAR(50) PRIMARY KEY,
  section_name VARCHAR(100) NOT NULL,
  texts JSON,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create global_assets table
CREATE TABLE IF NOT EXISTS global_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_key VARCHAR(50) UNIQUE NOT NULL,
  asset_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert test admin user (password: testpass123 hashed with bcrypt cost 12)
INSERT INTO admin_users (email, password_hash, name) VALUES
('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eFj7vH/Y9T0O', 'Test Admin');

-- Insert test newsletter subscribers
INSERT INTO newsletter_subscribers (email, ip_address, user_agent) VALUES
('test1@example.com', '127.0.0.1', 'Test User Agent'),
('test2@example.com', '127.0.0.1', 'Test User Agent');

-- Insert test ebook leads
INSERT INTO ebook_leads (nome, sobrenome, email, celular, ip_address, user_agent) VALUES
('João', 'Silva', 'joao@example.com', '11987654321', '127.0.0.1', 'Test User Agent'),
('Maria', 'Santos', 'maria@example.com', '11976543210', '127.0.0.1', 'Test User Agent');

-- Insert test analytics sessions
INSERT INTO analytics_sessions (session_id, first_seen, last_seen, pages_visited, ip_address) VALUES
('test-session-1', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, 5, '127.0.0.1'),
('test-session-2', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 3, '127.0.0.1'),
('test-session-3', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 7, '127.0.0.1');

-- Insert test analytics events
INSERT INTO analytics_events (event_type, user_session, page_url, section_name, timestamp, ip_address) VALUES
('page_view', 'test-session-1', '/', NULL, NOW() - INTERVAL 5 DAY, '127.0.0.1'),
('section_view', 'test-session-1', '/', 'hero', NOW() - INTERVAL 5 DAY, '127.0.0.1'),
('section_view', 'test-session-1', '/', 'contexto', NOW() - INTERVAL 5 DAY, '127.0.0.1'),
('ebook_download', 'test-session-1', '/', NULL, NOW() - INTERVAL 5 DAY, '127.0.0.1'),
('page_view', 'test-session-2', '/', NULL, NOW() - INTERVAL 3 DAY, '127.0.0.1'),
('newsletter_subscribe', 'test-session-2', '/', NULL, NOW() - INTERVAL 3 DAY, '127.0.0.1'),
('page_view', 'test-session-3', '/', NULL, NOW() - INTERVAL 1 DAY, '127.0.0.1'),
('buy_click', 'test-session-3', '/', NULL, NOW() - INTERVAL 1 DAY, '127.0.0.1');

-- Insert global settings
INSERT INTO global_settings (setting_key, setting_value) VALUES
('whatsappNumber', '5511987654321'),
('purchaseLink', 'https://pay.example.com/solar-buyside');
