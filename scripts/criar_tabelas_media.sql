-- ISPOTEC.ONLINE - Tabelas para Sistema de Média em Chat
-- Criar tabelas para suportar upload de ficheiros em mensagens

-- Tabela de Mensagens de Chat com Suporte a Ficheiros
CREATE TABLE IF NOT EXISTS chat_messages (
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
);

-- Tabela de Ficheiros de Chat
CREATE TABLE IF NOT EXISTS chat_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    tipo_ficheiro VARCHAR(50),
    caminho_ficheiro VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    tamanho_ficheiro INT,
    duracao INT COMMENT 'Para áudios e vídeos em segundos',
    largura INT COMMENT 'Para imagens',
    altura INT COMMENT 'Para imagens',
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id)
);
