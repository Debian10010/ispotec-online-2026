<?php
/**
 * Teste de Conexão - ISPOTEC.ONLINE
 * Acesse: http://localhost/ispotec.online/test-connection.php
 */

echo "<!DOCTYPE html>
<html lang='pt'>
<head>
    <meta charset='UTF-8'>
    <title>ISPOTEC - Teste de Ligação</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #001f3f; }
        .ok { color: green; }
        .erro { color: red; }
        .info { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>ISPOTEC.ONLINE - Teste de Ligação</h1>";

// Teste 1: PHP
echo "<div class='info'><strong>PHP:</strong> <span class='ok'>" . PHP_VERSION . "</span></div>";

// Teste 2: MySQLi
if (extension_loaded('mysqli')) {
    echo "<div class='info'><strong>MySQLi:</strong> <span class='ok'>Instalado ✓</span></div>";
} else {
    echo "<div class='info'><strong>MySQLi:</strong> <span class='erro'>NÃO Instalado ✗</span></div>";
}

// Teste 3: Ficheiros de config
$ficheiros = [
    'config/config.php',
    'config/database.php',
    'includes/header.php',
    'includes/footer.php',
    'classes/Database.php',
    'classes/Auth.php',
    'classes/User.php'
];

echo "<h3>Ficheiros de Configuração:</h3>";
foreach ($ficheiros as $ficheiro) {
    if (file_exists($ficheiro)) {
        echo "<div class='info'><strong>$ficheiro:</strong> <span class='ok'>Existe ✓</span></div>";
    } else {
        echo "<div class='info'><strong>$ficheiro:</strong> <span class='erro'>FALTA ✗</span></div>";
    }
}

// Teste 4: Pastas de escrita
echo "<h3>Permissões de Pastas:</h3>";
$pastas = ['uploads', 'config'];
foreach ($pastas as $pasta) {
    if (!is_dir($pasta)) {
        mkdir($pasta, 0755, true);
    }
    if (is_writable($pasta)) {
        echo "<div class='info'><strong>$pasta:</strong> <span class='ok'>Escrita OK ✓</span></div>";
    } else {
        echo "<div class='info'><strong>$pasta:</strong> <span class='erro'>Sem escrita ✗</span></div>";
    }
}

// Teste 5: Ligação à BD
echo "<h3>Base de Dados:</h3>";
try {
    require_once 'config/config.php';
    require_once 'classes/Database.php';
    
    $db = new Database();
    $conn = $db->connect();
    
    echo "<div class='info'><strong>Ligação MySQL:</strong> <span class='ok'>Conectado ✓</span></div>";
    
    // Verificar tabelas
    $resultado = $conn->query("SHOW TABLES FROM ispotec_online");
    $num_tabelas = $resultado->num_rows;
    
    echo "<div class='info'><strong>Tabelas:</strong> <span class='ok'>$num_tabelas tabelas encontradas ✓</span></div>";
    
    // Verificar utilizadores
    $resultado = $conn->query("SELECT COUNT(*) as total FROM users");
    $row = $resultado->fetch_assoc();
    echo "<div class='info'><strong>Utilizadores:</strong> " . $row['total'] . " registados</div>";
    
    $db->closeConnection();
} catch (Exception $e) {
    echo "<div class='info'><strong>Ligação MySQL:</strong> <span class='erro'>Erro: " . $e->getMessage() . " ✗</span></div>";
}

echo "<p style='text-align: center; margin-top: 30px;'>
    <a href='index.php' style='background: #0055a4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voltar ao Início</a>
</p>
    </div>
</body>
</html>";
?>
