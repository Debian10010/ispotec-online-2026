-- ISPOTEC.ONLINE - Script de Criação de Tabelas
-- Executar no MySQL/XAMPP

CREATE DATABASE IF NOT EXISTS ispotec_online;
USE ispotec_online;

-- Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo ENUM('estudante', 'docente', 'especialista', 'admin') NOT NULL DEFAULT 'estudante',
    curso VARCHAR(255),
    nivel_academico VARCHAR(100),
    bio TEXT,
    foto_perfil VARCHAR(255),
    status ENUM('pendente', 'aprovado', 'bloqueado') NOT NULL DEFAULT 'pendente',
    data_registo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Grupos (Disciplinas/Módulos)
CREATE TABLE IF NOT EXISTS groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    disciplina VARCHAR(255),
    modulo VARCHAR(255),
    criado_por INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Membros dos Grupos
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id)
);

-- Tabela de Publicações
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT,
    conteudo TEXT NOT NULL,
    titulo VARCHAR(255),
    tipo ENUM('discussao', 'material', 'artigo', 'projeto') DEFAULT 'discussao',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Ficheiros/Anexos
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id INT,
    nome_ficheiro VARCHAR(255) NOT NULL,
    caminho_ficheiro VARCHAR(255) NOT NULL,
    tipo_ficheiro VARCHAR(50),
    tamanho_ficheiro INT,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Portfólio
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    ficheiro VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(50),
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar utilizador admin padrão (email: admin@ispotec.online, password: Admin123!)
INSERT INTO users (nome, email, password, tipo, status) 
VALUES ('Administrador', 'admin@ispotec.online', '$2y$12$U9UVT5zLHZ8bY5.U5L5J.eXYqJq.H5nVvP1j5Q7K5L5L5L5L5L5L5', 'admin', 'aprovado')
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

-- Índices para otimização
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_group_id ON group_members(group_id);
CREATE INDEX idx_post_user ON posts(user_id);
CREATE INDEX idx_post_group ON posts(group_id);
CREATE INDEX idx_comment_post ON comments(post_id);
