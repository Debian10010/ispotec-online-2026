-- =============================================================================
-- TABELA DE PRÉ-INSCRIÇÕES E GESTÃO DE CANDIDATURAS - ANO ACADÉMICO 2027
-- INSTITUTO SUPERIOR POLITÉCNICO E DE TECNOLOGIAS (ISPOTEC)
-- =============================================================================

CREATE TABLE IF NOT EXISTS `candidaturas_2027` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero_candidatura` VARCHAR(32) NOT NULL UNIQUE,
  `instituicao` VARCHAR(32) NOT NULL DEFAULT 'ispotec',
  
  -- Dados Pessoais do Candidato
  `nome_completo` VARCHAR(255) NOT NULL,
  `data_nascimento` DATE NOT NULL,
  `bi` VARCHAR(50) NOT NULL,
  `foto_url` TEXT NULL,
  `provincia` VARCHAR(100) NOT NULL DEFAULT 'Maputo Província',
  `distrito` VARCHAR(100) NULL,
  `bairro` VARCHAR(150) NULL,
  `morada_completa` TEXT NULL,
  `telefone_principal` VARCHAR(30) NOT NULL,
  `telefone_adicional_1` VARCHAR(30) NULL,
  `telefone_adicional_2` VARCHAR(30) NULL,
  `nome_encarregado` VARCHAR(255) NOT NULL,
  `contacto_encarregado` VARCHAR(30) NOT NULL,
  `local_trabalho` VARCHAR(255) NULL,

  -- Dados Académicos
  `curso_id` VARCHAR(100) NOT NULL,
  `curso_nome` VARCHAR(255) NOT NULL,
  `grau_academico` VARCHAR(50) NOT NULL, -- Mestrado, Licenciatura, Pós-graduação, etc.
  `regime` ENUM('Laboral', 'Pós-laboral') NOT NULL,
  `modalidade` ENUM('Presencial', 'Semi-presencial', 'Distância (Online)') NOT NULL,
  `nivel_ingresso` VARCHAR(100) NOT NULL, -- 12.ª Classe, Ensino Técnico, Técnico Médio, Licenciatura, Outro
  `instituicao_proveniencia` VARCHAR(255) NULL,
  `ano_conclusao` YEAR NULL,
  `propina_mensal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `taxa_matricula` DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  -- Documentos e Comprovativo
  `comprovativo_pagamento_url` TEXT NULL,
  `bi_doc_url` TEXT NULL,
  `certificado_doc_url` TEXT NULL,

  -- Estados do Processo e Auditoria
  `estado_candidatura` ENUM(
    'Submetida',
    'Em análise',
    'A aguardar documentos',
    'A aguardar validação de pagamento',
    'Aprovada',
    'Rejeitada',
    'Rascunho'
  ) NOT NULL DEFAULT 'Submetida',

  `estado_pagamento` ENUM(
    'Pendente de verificação',
    'Validado',
    'Rejeitado'
  ) NOT NULL DEFAULT 'Pendente de verificação',

  `observacoes_admin` TEXT NULL,
  `historico_auditoria` JSON NULL,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_num_candidatura` (`numero_candidatura`),
  INDEX `idx_bi` (`bi`),
  INDEX `idx_telefone` (`telefone_principal`),
  INDEX `idx_curso` (`curso_id`),
  INDEX `idx_estado` (`estado_candidatura`),
  INDEX `idx_estado_pagamento` (`estado_pagamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
