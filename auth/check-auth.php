<?php
/**
 * Script de Verificação de Autenticação
 * Usado em páginas que requerem login
 */

// Iniciar sessão se não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Importar configurações e classes
require_once dirname(dirname(__FILE__)) . '/config/config.php';
require_once dirname(dirname(__FILE__)) . '/config/database.php';
require_once dirname(dirname(__FILE__)) . '/classes/Auth.php';
require_once dirname(dirname(__FILE__)) . '/classes/User.php';

// Verificar se utilizador está autenticado
if (!isset($_SESSION['user_id'])) {
    header('Location: ' . SITE_URL . 'auth/login.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$user_tipo = $_SESSION['user_tipo'];
?>
