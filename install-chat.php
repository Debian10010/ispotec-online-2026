<?php
/**
 * ISPOTEC.ONLINE - Script de Instalação do Chat Global
 * Execute este ficheiro uma vez para criar a tabela de chat
 */

require_once 'config/config.php';
require_once 'classes/Database.php';

$conn = Database::getInstance()->getConnection();

// SQL para criar tabela de chat global
$sql = "CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    conteudo LONGTEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_data_criacao (data_criacao),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo '<div style="background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 5px; font-size: 1.2rem;">';
    echo '✓ Tabela de chat global criada com sucesso!';
    echo '</div>';
    echo '<p style="margin-top: 1rem;"><a href="index.php">Voltar à página inicial</a></p>';
} else {
    echo '<div style="background-color: #f8d7da; color: #721c24; padding: 1rem; border-radius: 5px; font-size: 1.2rem;">';
    echo '✗ Erro ao criar tabela: ' . $conn->error;
    echo '</div>';
}
?>
