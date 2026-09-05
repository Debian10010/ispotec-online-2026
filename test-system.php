<?php
/**
 * ISPOTEC.ONLINE - Script de Verificação do Sistema
 * Testa todos os componentes críticos
 */

require_once 'config/config.php';
require_once 'classes/Database.php';
require_once 'classes/Auth.php';
require_once 'classes/User.php';

$testes = [];

// Teste 1: Conexão com BD
try {
    $conn = Database::getInstance()->getConnection();
    $testes['Conexão com BD'] = ['status' => 'OK', 'mensagem' => 'Ligado com sucesso'];
} catch (Exception $e) {
    $testes['Conexão com BD'] = ['status' => 'ERRO', 'mensagem' => $e->getMessage()];
}

// Teste 2: Tabelas Críticas
$tabelas_requeridas = ['users', 'groups', 'posts', 'comments', 'group_members'];
foreach ($tabelas_requeridas as $tabela) {
    $resultado = $conn->query("SHOW TABLES LIKE '$tabela'");
    if ($resultado->num_rows > 0) {
        $testes["Tabela: $tabela"] = ['status' => 'OK', 'mensagem' => 'Existe'];
    } else {
        $testes["Tabela: $tabela"] = ['status' => 'AVISO', 'mensagem' => 'Não encontrada'];
    }
}

// Teste 3: Tabela de Chat
$resultado = $conn->query("SHOW TABLES LIKE 'chat_messages'");
if ($resultado->num_rows > 0) {
    $testes['Chat Global'] = ['status' => 'OK', 'mensagem' => 'Tabela criada'];
} else {
    $testes['Chat Global'] = ['status' => 'AVISO', 'mensagem' => 'Execute install-chat.php'];
}

// Teste 4: Admin padrão
$resultado = $conn->query("SELECT id FROM users WHERE email = 'admin@ispotec.online' LIMIT 1");
if ($resultado->num_rows > 0) {
    $testes['Admin Padrão'] = ['status' => 'OK', 'mensagem' => 'admin@ispotec.online existe'];
} else {
    $testes['Admin Padrão'] = ['status' => 'AVISO', 'mensagem' => 'Execute install.php'];
}

// Teste 5: Pastas de Upload
$upload_dir = 'uploads/';
if (is_dir($upload_dir) && is_writable($upload_dir)) {
    $testes['Pasta de Uploads'] = ['status' => 'OK', 'mensagem' => 'Existe e é escrevível'];
} else {
    $testes['Pasta de Uploads'] = ['status' => 'AVISO', 'mensagem' => 'Criar pasta uploads/'];
}

// Teste 6: Session Handling
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    $resultado = 'OK';
} else {
    $resultado = 'Session já iniciada';
}
$testes['Session Handling'] = ['status' => 'OK', 'mensagem' => $resultado];

?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISPOTEC Online - Testes do Sistema</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 2rem;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #001f3f;
            border-bottom: 3px solid #0055a4;
            padding-bottom: 1rem;
        }
        .teste {
            padding: 1rem;
            margin: 1rem 0;
            border-left: 4px solid #ccc;
            border-radius: 4px;
        }
        .teste.ok {
            background-color: #d4edda;
            border-left-color: #2ecc71;
        }
        .teste.erro {
            background-color: #f8d7da;
            border-left-color: #e74c3c;
        }
        .teste.aviso {
            background-color: #fff3cd;
            border-left-color: #ff9800;
        }
        .teste-titulo {
            font-weight: bold;
            margin-bottom: 0.3rem;
        }
        .teste-msg {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .resumo {
            margin-top: 2rem;
            padding: 1rem;
            background-color: #e8f4f8;
            border-radius: 4px;
            border-left: 4px solid #0055a4;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ISPOTEC Online - Verificação do Sistema</h1>
        
        <?php foreach ($testes as $nome => $teste): ?>
            <div class="teste <?php echo strtolower($teste['status']); ?>">
                <div class="teste-titulo">
                    <?php 
                    $icon = [
                        'OK' => '✓',
                        'ERRO' => '✗',
                        'AVISO' => '⚠'
                    ];
                    echo $icon[$teste['status']] . ' ' . $nome;
                    ?>
                </div>
                <div class="teste-msg"><?php echo $teste['mensagem']; ?></div>
            </div>
        <?php endforeach; ?>

        <div class="resumo">
            <h2 style="margin-top: 0; color: #0055a4;">Próximos Passos</h2>
            <ol>
                <li>Se houver ERROS, revise a configuração de BD em <code>config/database.php</code></li>
                <li>Se faltar a tabela de Chat, execute <a href="install-chat.php">install-chat.php</a></li>
                <li>Se faltar o Admin, execute <a href="install.php">install.php</a></li>
                <li>Se faltar a pasta uploads/, crie-a com chmod 777</li>
                <li>Agora aceda a <a href="index.php">ISPOTEC Online</a></li>
            </ol>
        </div>
    </div>
</body>
</html>
