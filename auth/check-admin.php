<?php
/**
 * Script de Verificação de Administrador
 * Usado em páginas que requerem privilégios de admin
 */

// Carregar verificação de autenticação primeiro
require_once 'check-auth.php';

// Verificar se é administrador
if (!Auth::ehAdmin()) {
    // Se não for admin, redirecionar para dashboard normal
    header('Location: ' . SITE_URL . 'dashboard/');
    exit;
}
?>
