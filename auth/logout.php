<?php
/**
 * Logout - Terminar Sessão
 */

session_start();

require_once '../config/config.php';
require_once '../classes/Auth.php';

// Fazer logout
Auth::logout();

// Redirecionar para página inicial
header('Location: ' . SITE_URL . 'index.php?logout=1');
exit;
?>
