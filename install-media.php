<?php
/**
 * Script de Instalação do Sistema de Média para Chat
 * Cria as tabelas necessárias para suportar upload de ficheiros
 */

require_once 'config/database.php';

$mensagem = '';
$erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['instalar'])) {
    // Criar pasta de uploads se não existir
    $upload_dir = 'uploads/chat/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // SQL para criar tabelas
    $sql_statements = [
        // Tabela de Mensagens de Chat com Suporte a Ficheiros
        "CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            group_id INT,
            conteudo TEXT,
            tipo_mensagem ENUM('texto', 'imagem', 'video', 'audio', 'documento') DEFAULT 'texto',
            ficheiro_path VARCHAR(255),
            ficheiro_nome VARCHAR(255),
            ficheiro_tamanho INT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
            INDEX idx_user_id (user_id),
            INDEX idx_group_id (group_id),
            INDEX idx_data_criacao (data_criacao)
        )",
        
        // Tabela de Ficheiros de Chat (opcional, para metadados adicionais)
        "CREATE TABLE IF NOT EXISTS chat_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            tipo_ficheiro VARCHAR(50),
            caminho_ficheiro VARCHAR(255) NOT NULL,
            nome_original VARCHAR(255) NOT NULL,
            tamanho_ficheiro INT,
            duracao INT,
            largura INT,
            altura INT,
            data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
            INDEX idx_message_id (message_id)
        )"
    ];

    $erro_sql = false;
    foreach ($sql_statements as $sql) {
        if (!$conn->query($sql)) {
            $erro .= "Erro ao executar: " . $conn->error . "<br>";
            $erro_sql = true;
        }
    }

    if (!$erro_sql) {
        $mensagem = '✅ Sistema de média instalado com sucesso!<br>';
        $mensagem .= 'Tabelas criadas: chat_messages e chat_files<br>';
        $mensagem .= 'Pasta de uploads: ' . $upload_dir;
    } else {
        $mensagem .= "Alguns erros ocorreram, mas as tabelas podem ter sido criadas.";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalar Sistema de Média - ISPOTEC Online</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #003366;
            text-align: center;
        }
        .alert {
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .alert-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .alert-info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .btn {
            background-color: #003366;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .btn:hover {
            background-color: #002244;
        }
        ul {
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Instalar Sistema de Média</h1>
        
        <div class="alert alert-info">
            <strong>Sistema de Upload de Ficheiros</strong><br>
            Este sistema permite que os utilizadores compartilhem imagens, vídeos, áudios e documentos no chat de grupos e chat global.
        </div>

        <?php if ($mensagem): ?>
            <div class="alert alert-success">
                <?php echo $mensagem; ?>
            </div>
            <a href="dashboard/index.php" class="btn" style="display: inline-block; text-align: center; text-decoration: none; padding: 12px 30px; width: auto;">Voltar ao Dashboard</a>
        <?php elseif ($erro): ?>
            <div class="alert alert-error">
                <?php echo $erro; ?>
            </div>
        <?php else: ?>
            <h2>Funcionalidades Incluídas:</h2>
            <ul>
                <li>✅ Upload de Imagens (JPG, PNG, GIF, WebP)</li>
                <li>✅ Upload de Vídeos (MP4, AVI, MOV, MKV, WebM)</li>
                <li>✅ Upload de Áudios (MP3, WAV, OGG, M4A, AAC)</li>
                <li>✅ Upload de Documentos (PDF, Word, Excel, PowerPoint)</li>
                <li>✅ Reprodução integrada de mídia</li>
                <li>✅ Download direto de ficheiros</li>
                <li>✅ Validação de tipo e tamanho</li>
                <li>✅ Nomes de ficheiro seguros</li>
            </ul>

            <h2>Limites de Tamanho:</h2>
            <ul>
                <li>Imagens: até 10 MB</li>
                <li>Vídeos: até 100 MB</li>
                <li>Áudios: até 50 MB</li>
                <li>Documentos: até 50 MB</li>
            </ul>

            <form method="POST">
                <input type="hidden" name="instalar" value="1">
                <button type="submit" class="btn">Instalar Sistema de Média</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
