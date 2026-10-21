-- ====================================================================
-- ISPOTEC ONLINE & IFOPTEC ONLINE - MIGRAÇÃO MULTI-INSTITUIÇÃO
-- Suporta segregação segura dos dados entre ISPOTEC e IFOPTEC
-- Executar no MySQL/MariaDB
-- ====================================================================

USE ispotec_online;

-- 1. Tabela de Instituições
CREATE TABLE IF NOT EXISTS instituicoes (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sigla VARCHAR(50) NOT NULL,
    nivel_ensino ENUM('superior', 'medio', 'ambos') NOT NULL DEFAULT 'superior',
    slogan VARCHAR(255),
    logo VARCHAR(255),
    email_contato VARCHAR(255),
    telefones VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir as instituições oficiais
INSERT INTO instituicoes (id, nome, sigla, nivel_ensino, slogan, logo, email_contato, telefones)
VALUES
('ispotec', 'Instituto Superior Politécnico e de Tecnologias', 'ISPOTEC', 'superior', 'Inovação, Ciência e Excelência no Ensino Superior', '/assets/img/logo-ispotec.png', 'ifoptec.politecnica@gmail.com', '878787442 | 877906666 | 873045610')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), sigla = VALUES(sigla);

INSERT INTO instituicoes (id, nome, sigla, nivel_ensino, slogan, logo, email_contato, telefones)
VALUES
('ifoptec', 'Instituto de Formação Politécnica e de Tecnologias', 'IFOPTEC', 'medio', 'Formar • Inovar • Transformar — O seu futuro começa aqui!', '/assets/img/logo-ifoptec.png', 'ifoptec.politecnica@gmail.com', '840726974 | 870726974 | 869700700')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), sigla = VALUES(sigla);

-- 2. Tabela de Cursos por Instituição
CREATE TABLE IF NOT EXISTS cursos_instituicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao_id VARCHAR(50) NOT NULL,
    codigo VARCHAR(50),
    nome VARCHAR(255) NOT NULL,
    tipo ENUM('licenciatura', 'mestrado', 'doutoramento', 'tecnico_medio', 'curta_duracao') NOT NULL,
    duracao VARCHAR(100) NOT NULL,
    propina_mensal DECIMAL(10,2) DEFAULT 0.00,
    taxa_matricula DECIMAL(10,2) DEFAULT 0.00,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- Inserir cursos padrão do IFOPTEC
INSERT INTO cursos_instituicao (instituicao_id, nome, tipo, duracao, propina_mensal, taxa_matricula) VALUES
('ifoptec', 'Iniciação em Saúde-Cuidados Primários', 'curta_duracao', '6 meses', 3500.00, 2000.00),
('ifoptec', 'Emergências e Primeiros Socorros', 'curta_duracao', '6 meses', 3500.00, 2000.00),
('ifoptec', 'Higiene e Saúde no Trabalho', 'curta_duracao', '6 meses', 3500.00, 2000.00),
('ifoptec', 'Técnico de Medicina Geral', 'tecnico_medio', '3 anos', 3800.00, 3500.00),
('ifoptec', 'Técnico de Enfermagem Geral', 'tecnico_medio', '3 anos', 3800.00, 3500.00),
('ifoptec', 'Enfermagem de Saúde Materno e Infantil', 'tecnico_medio', '3 anos', 3800.00, 3500.00),
('ifoptec', 'Técnico de Farmácia', 'tecnico_medio', '3 anos', 3800.00, 3500.00),
('ifoptec', 'Gestão e Administração Hospitalar', 'tecnico_medio', '3 anos', 3800.00, 3500.00),
('ifoptec', 'Técnico de Saúde Preventiva - Agente Polivalente de Saúde', 'tecnico_medio', '3 anos', 3800.00, 3500.00);

-- 3. Adicionar coluna instituicao_id nas tabelas existentes (com fallback seguro para ISPOTEC)
ALTER TABLE users ADD COLUMN IF NOT EXISTS instituicao_id VARCHAR(50) DEFAULT 'ispotec';
UPDATE users SET instituicao_id = 'ispotec' WHERE instituicao_id IS NULL;

ALTER TABLE groups ADD COLUMN IF NOT EXISTS instituicao_id VARCHAR(50) DEFAULT 'ispotec';
UPDATE groups SET instituicao_id = 'ispotec' WHERE instituicao_id IS NULL;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS instituicao_id VARCHAR(50) DEFAULT 'ispotec';
UPDATE posts SET instituicao_id = 'ispotec' WHERE instituicao_id IS NULL;

-- 4. Tabela de Polos / Unidades Físicas
CREATE TABLE IF NOT EXISTS polos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao_id VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    telefones VARCHAR(255),
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE CASCADE
);

INSERT INTO polos (instituicao_id, nome, endereco, telefones) VALUES
('ispotec', 'Campus Principal Matola', 'Rua da Mozal, 5453-Matola', '878787442 / 877906666'),
('ifoptec', 'Polo Matola-Rio', 'Rua da Mozal, Matola-Rio', '840726974 / 870726974 / 869700700');
