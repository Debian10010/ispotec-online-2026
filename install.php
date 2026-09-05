<?php
/**
 * Script de Instalação da ISPOTEC.ONLINE
 * Acesse: http://localhost/ispotec.online/install.php
 */

// Verificar se já foi instalado
$instalado_file = 'config/.installed';
if (file_exists($instalado_file)) {
    die('<h2 style="color: green;">Plataforma já instalada!</h2><p><a href="index.php">Clique aqui para voltar ao início</a></p>');
}

$passo = $_GET['passo'] ?? 1;
$mensagens = [];
$erros = [];

// Verificar requisitos
function verificarRequisitos() {
    global $mensagens, $erros;
    
    // PHP version
    if (version_compare(PHP_VERSION, '7.4.0', '>=')) {
        $mensagens[] = 'PHP ' . PHP_VERSION . ' - OK';
    } else {
        $erros[] = 'PHP 7.4+ necessário. Versão actual: ' . PHP_VERSION;
    }
    
    // Extensões
    if (extension_loaded('mysqli')) {
        $mensagens[] = 'Extensão MySQLi - OK';
    } else {
        $erros[] = 'Extensão MySQLi não encontrada';
    }
    
    if (extension_loaded('json')) {
        $mensagens[] = 'Extensão JSON - OK';
    } else {
        $erros[] = 'Extensão JSON não encontrada';
    }
    
    // Pastas de escrita
    $pastas = ['uploads', 'config'];
    foreach ($pastas as $pasta) {
        if (!is_dir($pasta)) {
            mkdir($pasta, 0755, true);
        }
        if (is_writable($pasta)) {
            $mensagens[] = "Pasta /$pasta - Escrita OK";
        } else {
            $erros[] = "Pasta /$pasta - Sem permissão de escrita";
        }
    }
    
    return count($erros) === 0;
}

// Testar conexão BD
function testarConexaoBD($host, $user, $password) {
    try {
        $conn = new mysqli($host, $user, $password);
        if ($conn->connect_error) {
            return ['sucesso' => false, 'erro' => $conn->connect_error];
        }
        $conn->close();
        return ['sucesso' => true];
    } catch (Exception $e) {
        return ['sucesso' => false, 'erro' => $e->getMessage()];
    }
}

// Criar BD e tabelas
function criarBD($host, $user, $password) {
    global $erros, $mensagens;
    
    $conn = new mysqli($host, $user, $password);
    if ($conn->connect_error) {
        $erros[] = 'Falha ao ligar: ' . $conn->connect_error;
        return false;
    }
    
    $sql = file_get_contents('scripts/criar_tabelas.sql');
    
    if (!$sql) {
        $erros[] = 'Não consegui ler o ficheiro SQL';
        return false;
    }
    
    // Dividir por ';' e executar cada comando
    $comandos = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($comandos as $comando) {
        if (!empty($comando)) {
            if (!$conn->query($comando)) {
                $erros[] = 'Erro SQL: ' . $conn->error;
                return false;
            }
        }
    }
    
    $mensagens[] = 'Base de dados criada com sucesso!';
    $conn->close();
    return true;
}

// Salvar configurações
function salvarConfig($host, $user, $password, $db) {
    $config = <<<PHP
<?php
// Auto-gerado por install.php
define('DB_HOST', '$host');
define('DB_USER', '$user');
define('DB_PASS', '$password');
define('DB_NAME', '$db');
define('INSTALADO', true);
?>
PHP;
    
    if (file_put_contents('config/.config', $config)) {
        return true;
    }
    return false;
}

?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISPOTEC.ONLINE - Instalação</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #001f3f, #0055a4);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        h1 {
            color: #001f3f;
            margin-bottom: 30px;
            text-align: center;
        }
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .step {
            width: 25%;
            height: 5px;
            background: #ddd;
            border-radius: 3px;
        }
        .step.active {
            background: #0055a4;
        }
        .message {
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .sucesso {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .erro {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        input:focus {
            outline: none;
            border-color: #0055a4;
            box-shadow: 0 0 5px rgba(0, 85, 164, 0.3);
        }
        button {
            background: #0055a4;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            margin-top: 20px;
        }
        button:hover {
            background: #001f3f;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ISPOTEC.ONLINE - Instalação</h1>
        
        <div class="step-indicator">
            <div class="step <?php echo $passo >= 1 ? 'active' : ''; ?>"></div>
            <div class="step <?php echo $passo >= 2 ? 'active' : ''; ?>"></div>
            <div class="step <?php echo $passo >= 3 ? 'active' : ''; ?>"></div>
            <div class="step <?php echo $passo >= 4 ? 'active' : ''; ?>"></div>
        </div>

        <?php if ($passo == 1): ?>
            <h2 style="color: #001f3f; margin-bottom: 20px;">Passo 1: Verificar Requisitos</h2>
            
            <?php verificarRequisitos(); ?>
            
            <?php foreach ($mensagens as $msg): ?>
                <div class="message sucesso">✓ <?php echo htmlspecialchars($msg); ?></div>
            <?php endforeach; ?>
            
            <?php foreach ($erros as $erro): ?>
                <div class="message erro">✗ <?php echo htmlspecialchars($erro); ?></div>
            <?php endforeach; ?>
            
            <?php if (empty($erros)): ?>
                <form method="get">
                    <input type="hidden" name="passo" value="2">
                    <button type="submit">Continuar para Passo 2</button>
                </form>
            <?php else: ?>
                <p style="color: red; margin-top: 20px;">Resolva os erros acima antes de continuar.</p>
            <?php endif; ?>

        <?php elseif ($passo == 2): ?>
            <h2 style="color: #001f3f; margin-bottom: 20px;">Passo 2: Configuração do MySQL</h2>
            
            <form method="post" action="?passo=3">
                <div class="form-group">
                    <label for="host">Host MySQL (padrão: localhost):</label>
                    <input type="text" id="host" name="host" value="localhost" required>
                </div>
                
                <div class="form-group">
                    <label for="user">Utilizador MySQL (padrão: root):</label>
                    <input type="text" id="user" name="user" value="root" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password MySQL (deixe vazio para XAMPP):</label>
                    <input type="password" id="password" name="password" value="">
                </div>
                
                <button type="submit">Testar Ligação</button>
            </form>

        <?php elseif ($passo == 3): ?>
            <h2 style="color: #001f3f; margin-bottom: 20px;">Passo 3: Testar Ligação</h2>
            
            <?php
            $host = $_POST['host'] ?? 'localhost';
            $user = $_POST['user'] ?? 'root';
            $password = $_POST['password'] ?? '';
            
            $resultado = testarConexaoBD($host, $user, $password);
            
            if ($resultado['sucesso']) {
                echo '<div class="message sucesso">✓ Ligação ao MySQL estabelecida com sucesso!</div>';
                echo '<form method="post" action="?passo=4">';
                echo '<input type="hidden" name="host" value="' . htmlspecialchars($host) . '">';
                echo '<input type="hidden" name="user" value="' . htmlspecialchars($user) . '">';
                echo '<input type="hidden" name="password" value="' . htmlspecialchars($password) . '">';
                echo '<button type="submit">Continuar para Passo 4</button>';
                echo '</form>';
            } else {
                echo '<div class="message erro">✗ Erro: ' . htmlspecialchars($resultado['erro']) . '</div>';
                echo '<a href="?passo=2" style="display: block; margin-top: 20px; color: #0055a4; text-align: center;">Voltar</a>';
            }
            ?>

        <?php elseif ($passo == 4): ?>
            <h2 style="color: #001f3f; margin-bottom: 20px;">Passo 4: Criar Base de Dados</h2>
            
            <?php
            $host = $_POST['host'] ?? 'localhost';
            $user = $_POST['user'] ?? 'root';
            $password = $_POST['password'] ?? '';
            $db = 'ispotec_online';
            
            if (criarBD($host, $user, $password)) {
                echo '<div class="message sucesso">✓ Base de dados criada com sucesso!</div>';
                
                if (salvarConfig($host, $user, $password, $db)) {
                    echo '<div class="message sucesso">✓ Configurações salvas!</div>';
                    
                    // Marcar como instalado
                    touch('config/.installed');
                    
                    echo '<p style="color: green; margin-top: 20px; text-align: center; font-weight: bold;">Instalação concluída!</p>';
                    echo '<p style="text-align: center; margin-top: 10px;">Credenciais padrão:<br>';
                    echo '<strong>Email:</strong> admin@ispotec.online<br>';
                    echo '<strong>Password:</strong> Admin123!</p>';
                    echo '<a href="index.php" style="display: block; margin-top: 20px; text-align: center; color: #0055a4; text-decoration: none;"><button>Ir para Página Inicial</button></a>';
                } else {
                    echo '<div class="message erro">Erro ao salvar configurações</div>';
                }
            } else {
                foreach ($erros as $erro) {
                    echo '<div class="message erro">✗ ' . htmlspecialchars($erro) . '</div>';
                }
            }
            ?>

        <?php endif; ?>
    </div>
</body>
</html>
