<?php
// Script temporário para criar tabelas de analytics
// IMPORTANTE: Delete este arquivo após executar!

$host = 'localhost';
$database = 'fran4942_solar_buyside';
$username = 'fran4942_solar';
$password = 'Nerac47600@';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Conectado ao banco de dados...\n<br>";

    // Criar tabela analytics_sessions
    $sql1 = "CREATE TABLE IF NOT EXISTS `analytics_sessions` (
      `session_id` VARCHAR(255) NOT NULL PRIMARY KEY,
      `first_seen` DATETIME NOT NULL,
      `last_seen` DATETIME NOT NULL,
      `pages_visited` INT NOT NULL DEFAULT 0,
      `ip_address` VARCHAR(45) DEFAULT NULL,
      `user_agent` TEXT DEFAULT NULL,
      INDEX `idx_first_seen` (`first_seen`),
      INDEX `idx_last_seen` (`last_seen`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql1);
    echo "✅ Tabela 'analytics_sessions' criada com sucesso!\n<br>";

    // Criar tabela analytics_events
    $sql2 = "CREATE TABLE IF NOT EXISTS `analytics_events` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql2);
    echo "✅ Tabela 'analytics_events' criada com sucesso!\n<br>";

    // Criar índices compostos
    $sql3 = "CREATE INDEX IF NOT EXISTS `idx_events_type_timestamp` ON `analytics_events` (`event_type`, `timestamp`)";
    $pdo->exec($sql3);
    echo "✅ Índices criados com sucesso!\n<br>";

    echo "\n<br><strong>🎉 Todas as tabelas foram criadas com sucesso!</strong>\n<br>";
    echo "<strong style='color: red;'>⚠️ IMPORTANTE: Delete este arquivo agora por segurança!</strong>";

} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>
