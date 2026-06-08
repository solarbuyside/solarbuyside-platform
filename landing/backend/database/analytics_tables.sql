-- Tabelas para Analytics
-- Criadas para o sistema de métricas do painel admin

-- Tabela de sessões de usuários
CREATE TABLE IF NOT EXISTS `analytics_sessions` (
  `session_id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `first_seen` DATETIME NOT NULL,
  `last_seen` DATETIME NOT NULL,
  `pages_visited` INT NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  INDEX `idx_first_seen` (`first_seen`),
  INDEX `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `user_session` VARCHAR(255) NOT NULL,
  `page_url` VARCHAR(500) DEFAULT NULL,
  `section_name` VARCHAR(100) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_user_session` (`user_session`),
  INDEX `idx_timestamp` (`timestamp`),
  FOREIGN KEY (`user_session`) REFERENCES `analytics_sessions`(`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices compostos para otimizar queries do dashboard
CREATE INDEX `idx_events_type_timestamp` ON `analytics_events` (`event_type`, `timestamp`);
CREATE INDEX `idx_sessions_first_seen` ON `analytics_sessions` (`first_seen`);
