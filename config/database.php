<?php
/**
 * ISPOTEC.ONLINE - Database Configuration
 */

// Carrega a classe Database
require_once __DIR__ . '/../classes/Database.php';

// Cria conexão global
$database = new Database();
$conn = $database->connect();
?>
