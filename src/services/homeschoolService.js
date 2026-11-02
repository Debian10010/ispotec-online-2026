import { groupService } from './groupService';
import { api } from './api';

const STORAGE_KEY_PREFIX = 'ispotec_homeschool_sala_';
const STORAGE_KEY_GROUPS = 'ispotec_homeschool_groups_data';

// Cursos institucionais padrão ISPOTEC
export const CURSOS_ISPOTEC = [
  'Mestrado em Saúde Pública',
  'Licenciatura em Psicologia Clínica e Saúde no Trabalho',
  'Licenciatura em Enfermagem Geral',
  'Licenciatura em Saúde Pública',
  'Licenciatura em Direito',
  'Licenciatura em Administração e Gestão de Recursos Humanos',
  'Licenciatura em Contabilidade e Finanças',
  'Licenciatura em Tecnologias de Informação',
  'Licenciatura em Engenharia Informática',
  'Licenciatura em Farmácia'
];

// Cursos institucionais IFOPTEC (Ensino Médio e Curta Duração)
export const CURSOS_IFOPTEC = [
  // Curta Duração
  'Iniciação em Saúde-Cuidados Primários',
  'Emergências e Primeiros Socorros',
  'Higiene e Saúde no Trabalho',
  // Técnico Médio
  'Técnico de Medicina Geral',
  'Técnico de Enfermagem Geral',
  'Enfermagem de Saúde Materno e Infantil',
  'Técnico de Farmácia',
  'Gestão e Administração Hospitalar',
  'Técnico de Saúde Preventiva - Agente Polivalente de Saúde'
];

// Cursos Técnicos Médios Oficiais IFOPTEC
export const CURSOS_TECNICOS_MEDIOS_IFOPTEC = [
  'Técnico de Medicina Geral',
  'Técnico de Enfermagem Geral',
  'Enfermagem de Saúde Materno e Infantil',
  'Técnico de Farmácia',
  'Gestão e Administração Hospitalar',
  'Técnico de Saúde Preventiva - Agente Polivalente de Saúde'
];

export const CURSOS_IFOPTEC_CATALOGO = [
  {
    id: 'medicina-geral',
    nome: 'Técnico de Medicina Geral',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '🩺',
    grau: 'Técnico Médio Profissionalizante',
    destaque: true,
    descricao: 'Formação sólida para diagnosticar, tratar e encaminhar patologias clínicas prevalentes, atuando nos centros de saúde e unidades hospitalares.',
    disciplinas: [
      'Anatomia e Fisiologia Humana',
      'Semiologia e Propedêutica Médica',
      'Farmacologia Aplicada',
      'Patologia Médica e Cirúrgica',
      'Saúde Comunitária e Epidemiologia',
      'Urgências Médicas e Suporte de Vida',
      'Saúde Materno-Infantil'
    ],
    saidasProfissionais: [
      'Centros de Saúde Urbanos e Rurais',
      'Hospitais Gerais e Distritais',
      'Clínicas Médicas e Postos de Saúde',
      'Programas Nacionais de Saúde Comunitária'
    ]
  },
  {
    id: 'enfermagem-geral',
    nome: 'Técnico de Enfermagem Geral',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '💉',
    grau: 'Técnico Médio Profissionalizante',
    destaque: true,
    descricao: 'Capacitação prática em cuidados de enfermagem integrados, administração terapêutica, assistência ao doente acamado e suporte hospitalar.',
    disciplinas: [
      'Fundamentos de Enfermagem',
      'Anatomia e Fisiologia',
      'Farmacologia em Enfermagem',
      'Enfermagem Médico-Cirúrgica',
      'Cuidados Pré e Pós-Operatórios',
      'Saúde Comunitária'
    ],
    saidasProfissionais: [
      'Serviços de Internamento e Consulta Externa',
      'Salas de Tratamento e Vacinação',
      'Unidades de Cuidados Continuados',
      'Empresas e Serviços de Saúde Ocupacional'
    ]
  },
  {
    id: 'saude-materno-infantil',
    nome: 'Enfermagem de Saúde Materno e Infantil',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '👶',
    grau: 'Técnico Médio Profissionalizante',
    destaque: true,
    descricao: 'Especialização no acompanhamento pré-natal, assistência humanizada ao parto, cuidados neonatais, puericultura e planeamento reprodutivo.',
    disciplinas: [
      'Saúde Reprodutiva e Sexual',
      'Obstetrícia e Vigilância Pré-Natal',
      'Assistência ao Parto e Puerpério',
      'Pediatria e Puericultura',
      'Nutrição Materno-Infantil e PAI (Vacinação)',
      'Planeamento Familiar'
    ],
    saidasProfissionais: [
      'Maternidades e Blocos de Parto',
      'Consultas Pré-Natais e de Criança Sadia',
      'Organizações de Apoio à Saúde da Mulher e da Criança'
    ]
  },
  {
    id: 'farmacia',
    nome: 'Técnico de Farmácia',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '💊',
    grau: 'Técnico Médio Profissionalizante',
    destaque: false,
    descricao: 'Gestão de medicamentos, farmacotécnica, controle de estoques, verificação de dosagens e atendimento de receituário farmacêutico.',
    disciplinas: [
      'Química Farmacêutica',
      'Farmacologia e Toxicologia',
      'Farmacotécnica e Formas Farmacêuticas',
      'Gestão e Logística de Medicamentos',
      'Dispensação e Deontologia Farmacêutica'
    ],
    saidasProfissionais: [
      'Farmácias Comunitárias e Privadas',
      'Farmácias Hospitalares e Centros de Distribuição',
      'Depósitos de Medicamentos'
    ]
  },
  {
    id: 'gestao-hospitalar',
    nome: 'Gestão e Administração Hospitalar',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '🏢',
    grau: 'Técnico Médio Profissionalizante',
    destaque: false,
    descricao: 'Gestão operacional de unidades de saúde, fluxos de pacientes, documentação clínica, faturamento, regulação e atendimento administrativo.',
    disciplinas: [
      'Princípios de Administração e Gestão Hospitalar',
      'Sistemas de Informação em Saúde (SIS)',
      'Contabilidade e Faturação em Saúde',
      'Logística e Aprovisionamento Hospitalar',
      'Legislação e Ética Hospitalar'
    ],
    saidasProfissionais: [
      'Administração de Clínicas e Hospitais',
      'Secretaria Clínica e Faturação Médica',
      'Gestão de Registos e Estatísticas em Saúde'
    ]
  },
  {
    id: 'saude-preventiva',
    nome: 'Técnico de Saúde Preventiva - Agente Polivalente de Saúde',
    tipo: 'Técnico Médio',
    categoria: 'tecnico_medio',
    duracao: '3 anos',
    duracaoMeses: 36,
    mensalidade: '3.800,00 Mts + 5% de IVA',
    valorMensalidade: 3800,
    matricula: '3.500 Mts',
    inscricao: 'Incluída na Matrícula',
    icone: '🛡️',
    grau: 'Técnico Médio Profissionalizante',
    destaque: false,
    descricao: 'Promoção ativa de saúde comunitária, saneamento, prevenção de epidemias, imunização, vigilância entomológica e educação sanitária.',
    disciplinas: [
      'Higiene e Saneamento do Meio',
      'Vigilância Epidemiológica',
      'Doenças Endémicas e Parasitologia',
      'Educação Comunitária em Saúde',
      'Prevenção e Controlo de Doenças Transmissíveis'
    ],
    saidasProfissionais: [
      'Brigadas de Saúde Comunitária',
      'Programas de Combate à Malária, Tuberculose e HIV',
      'Serviços Municipais de Saneamento e Higiene Pública'
    ]
  },
  // Curta Duração
  {
    id: 'iniciacao-saude',
    nome: 'Iniciação em Saúde-Cuidados Primários',
    tipo: 'Curta Duração',
    categoria: 'curta_duracao',
    duracao: '6 meses',
    duracaoMeses: 6,
    mensalidade: '3.500 Mts + 5% IVA',
    valorMensalidade: 3500,
    matricula: '2.000 Mts',
    inscricao: 'Inscrição Grátis',
    icone: '🏥',
    grau: 'Certificação Profissionalizante',
    destaque: true,
    descricao: 'Introdução intensiva aos conceitos e rotinas de cuidados primários de saúde, acolhimento de pacientes, sinais vitais e higiene hospitalar.',
    disciplinas: [
      'Introdução aos Serviços de Saúde',
      'Aferição de Sinais Vitais (Tensão, Pulso, Temperatura)',
      'Higiene e Biossegurança',
      'Acolhimento e Orientação ao Utente'
    ],
    saidasProfissionais: [
      'Apoio em Postos de Saúde e Consultórios',
      'Assistência Domiciliária a Pacientes',
      'Acolhimento Clínico'
    ]
  },
  {
    id: 'emergencias-primeiros-socorros',
    nome: 'Emergências e Primeiros Socorros',
    tipo: 'Curta Duração',
    categoria: 'curta_duracao',
    duracao: '6 meses',
    duracaoMeses: 6,
    mensalidade: '3.500 Mts + 5% IVA',
    valorMensalidade: 3500,
    matricula: '2.000 Mts',
    inscricao: 'Inscrição Grátis',
    icone: '🚨',
    grau: 'Certificação Profissionalizante',
    destaque: true,
    descricao: 'Técnicas de intervenção rápida, reanimação cardiopulmonar (RCP), controlo de hemorragias agudas, queimaduras e imobilização de fraturas.',
    disciplinas: [
      'Suporte Básico de Vida (SBV) para Adultos e Crianças',
      'Abordagem ao Politraumatizado',
      'Técnicas de Imobilização e Transporte',
      'Gestão de Crises e Triagem de Emergência'
    ],
    saidasProfissionais: [
      'Equipas de Segurança e Socorrismo em Empresas',
      'Apoio em Eventos Desportivos e Culturais',
      'Centros de Transporte de Doentes e Apoio a Ambulâncias'
    ]
  },
  {
    id: 'higiene-saude-trabalho',
    nome: 'Higiene e Saúde no Trabalho',
    tipo: 'Curta Duração',
    categoria: 'curta_duracao',
    duracao: '6 meses',
    duracaoMeses: 6,
    mensalidade: '3.500 Mts + 5% IVA',
    valorMensalidade: 3500,
    matricula: '2.000 Mts',
    inscricao: 'Inscrição Grátis',
    icone: '⛑️',
    grau: 'Certificação Profissionalizante',
    destaque: true,
    descricao: 'Normas de segurança ocupacional, identificação de riscos ambientais, equipamentos de proteção individual (EPI) e saúde do trabalhador.',
    disciplinas: [
      'Legislação de Higiene e Segurança no Trabalho',
      'Identificação e Mapeamento de Riscos no Posto de Trabalho',
      'Ergonomia e Prevenção de Lesões Laborais',
      'Planos de Emergência e Proteção Coletiva'
    ],
    saidasProfissionais: [
      'Setores de HST e Recursos Humanos de Empresas',
      'Fábricas, Obras, Armazéns e Indústria',
      'Auditoria Básica de Condições de Trabalho'
    ]
  }
];

export const REQUISITOS_MATRICULA_IFOPTEC = [
  'Cópia autenticada de Certificado da 10ª ou 12ª Classe ou equivalente',
  'Fotocópia de Bilhete de Identidade (BI) ou Passaporte',
  'Duas fotografias tipo passe atualizadas',
  'Cópia de NUIT (se tiver)',
  'Inscrição Online sem sair de casa'
];

export const POLOS_IFOPTEC = [
  {
    nome: 'Polo Matola-Rio',
    endereco: 'Rua da Mozal',
    telefones: ['840726974', '870726974', '869700700']
  },
  {
    nome: 'Polo Marracuene',
    endereco: 'Rua da Facim — Edifício Tanga | Ricatla',
    telefones: ['869700700']
  }
];

// Módulos / Disciplinas por curso
export const MODULOS_POR_CURSO = {
  'Licenciatura em Tecnologias de Informação': [
    'Programação Web',
    'Redes de Computadores',
    'Bases de Dados I & II',
    'Inteligência Artificial e Sistemas Especialistas',
    'Cibersegurança e Proteção de Dados',
    'Engenharia de Software',
    'Cloud Computing e DevOps'
  ],
  'Licenciatura em Engenharia Informática': [
    'Algoritmos e Estruturas de Dados',
    'Sistemas Operativos',
    'Arquitetura de Computadores',
    'Programação Orientada a Objetos',
    'Redes de Alta Velocidade',
    'Sistemas Distribuídos'
  ],
  'Licenciatura em Gestão de Empresas': [
    'Introdução à Gestão',
    'Comportamento Organizacional',
    'Marketing Estratégico',
    'Gestão Financeira',
    'Empreendedorismo e Inovação'
  ],
  'Licenciatura em Enfermagem Geral': [
    'Anatomia e Fisiologia Humana',
    'Fundamentos de Enfermagem',
    'Semiologia Médica',
    'Farmacologia Aplicada',
    'Saúde Comunitária e Preventiva'
  ],
  // IFOPTEC Módulos
  'Técnico de Medicina Geral': [
    'Anatomia e Fisiologia Humana',
    'Semiologia e Propedêutica Médica',
    'Farmacologia Aplicada',
    'Patologia Médica e Cirúrgica',
    'Saúde Comunitária e Epidemiologia',
    'Urgências Médicas e Suporte de Vida',
    'Saúde Materno-Infantil'
  ],
  'Técnico de Enfermagem Geral': [
    'Fundamentos de Enfermagem',
    'Anatomia e Fisiologia',
    'Farmacologia em Enfermagem',
    'Enfermagem Médico-Cirúrgica',
    'Cuidados Pré e Pós-Operatórios',
    'Saúde Comunitária'
  ],
  'Enfermagem de Saúde Materno e Infantil': [
    'Saúde Reprodutiva e Sexual',
    'Obstetrícia e Vigilância Pré-Natal',
    'Assistência ao Parto e Puerpério',
    'Pediatria e Puericultura',
    'Nutrição Materno-Infantil e Vacinação',
    'Planeamento Familiar'
  ],
  'Técnico de Farmácia': [
    'Química Farmacêutica',
    'Farmacologia e Toxicologia',
    'Farmacotécnica e Formas Farmacêuticas',
    'Gestão e Logística de Medicamentos',
    'Dispensação e Deontologia Farmacêutica'
  ],
  'Gestão e Administração Hospitalar': [
    'Princípios de Administração e Gestão Hospitalar',
    'Sistemas de Informação em Saúde (SIS)',
    'Contabilidade e Faturação em Saúde',
    'Logística e Aprovisionamento Hospitalar',
    'Legislação e Ética Hospitalar'
  ],
  'Técnico de Saúde Preventiva - Agente Polivalente de Saúde': [
    'Higiene e Saneamento do Meio',
    'Vigilância Epidemiológica',
    'Doenças Endémicas e Parasitologia',
    'Educação Comunitária em Saúde',
    'Prevenção e Controlo de Doenças Transmissíveis'
  ],
  'Iniciação em Saúde-Cuidados Primários': [
    'Introdução aos Serviços de Saúde',
    'Aferição de Sinais Vitais',
    'Higiene e Biossegurança',
    'Acolhimento e Orientação ao Utente'
  ],
  'Emergências e Primeiros Socorros': [
    'Suporte Básico de Vida (SBV)',
    'Abordagem ao Politraumatizado',
    'Técnicas de Imobilização e Transporte',
    'Gestão de Crises e Triagem de Emergência'
  ],
  'Higiene e Saúde no Trabalho': [
    'Legislação de Higiene e Segurança no Trabalho',
    'Identificação e Mapeamento de Riscos no Posto de Trabalho',
    'Ergonomia e Prevenção de Lesões Laborais',
    'Planos de Emergência e Proteção Coletiva'
  ]
};

// Dados padrão iniciais para cada sala virtual para garantir conteúdo rico imediato
const defaultSalaConteudo = {
  planoAnalitico: {
    unidadeCurricular: 'Programação Web e Tecnologias Conexas',
    cargaHoraria: '64 Horas (32h Teóricas + 32h Práticas)',
    cronograma: 'Fevereiro a Junho de 2026',
    objectivos: 'Capacitar os estudantes na conceção, desenvolvimento e implementação de aplicações web modernas, responsivas e escaláveis, integrando frontend contemporâneo, APIs RESTful e persistência segura em bases de dados relacionais e NoSQL.',
    conteudos: [
      'Unidade 1: Fundamentos da Web Moderna (HTML5 Semântico, CSS3 Flexbox/Grid, Arquitetura Client-Server)',
      'Unidade 2: JavaScript Moderno (ES6+), DOM, Assincronismo (Promises, Async/Await) e Consumo de APIs',
      'Unidade 3: Frameworks Frontend contemporâneos (React.js, Componentização, State Management)',
      'Unidade 4: Back-end com Node.js, Express e Arquitetura MVC',
      'Unidade 5: Bases de Dados, Segurança Web (CORS, JWT, OWASP Top 10) e Boas Práticas de Deployment'
    ],
    competencias: [
      'Projetar interfaces web responsivas e acessíveis com elevados padrões de UX/UI.',
      'Desenvolver APIs RESTful seguras com autenticação JWT e validação de dados.',
      'Construir aplicações Single Page Applications (SPA) dinâmicas.',
      'Implementar práticas de controlo de versão e integração contínua (Git/GitHub).'
    ],
    metodologias: 'Aulas teórico-expositivas dialogadas, sessões práticas em laboratório virtual com exercícios aplicados, desenvolvimento de mini-projetos semanais e projeto final em equipa.',
    avaliacao: '• 2 Testes de Avaliação Teórico-Prática (40%)\n• 4 Trabalhos de Laboratório e Guias Práticos (30%)\n• 1 Projeto Final Integrador (30%)',
    bibliografia: '1. Duckett, Jon. HTML and CSS: Design and Build Websites. Wiley, 2014.\n2. Haverbeke, Marijn. Eloquent JavaScript: A Modern Introduction to Programming. No Starch Press, 2018.\n3. Banks, Alex & Porcello, Eve. Learning React: Modern Patterns for Developing React Apps. O’Reilly, 2020.\n4. Documentação Oficial MDN Web Docs (Mozilla).'
  },
  planoCurricular: {
    curso: 'Licenciatura em Tecnologias de Informação',
    modulo: 'Programação Web',
    competencias: 'Capacidade de modelação e desenvolvimento full-stack de sistemas web empresariais e institucionais.',
    resultados: 'O estudante desenvolve autonomia para criar desde a interface até ao servidor e base de dados, garantindo performance e segurança.',
    unidades: '5 Unidades Temáticas estruturadas em 16 semanas letivas.',
    cargaHorariaTeorica: '32 Horas Letivas',
    cargaHorariaPratica: '32 Horas de Laboratório e Prática',
    sistemaAvaliacao: 'Avaliação Contínua com média mínima de aprovação de 10 valores conforme Regulamento Pedagógico do ISPOTEC.',
    preRequisitos: 'Introdução à Programação e Algoritmos; Bases de Dados I.'
  },
  manuais: [
    {
      id: 'man-1',
      titulo: 'Manual Oficial de Programação Web — ISPOTEC 2026',
      descricao: 'Compêndio integral com conceitos teóricos, padrões de código e exercícios práticos.',
      autor: 'Corpo Docente de Engenharia e TI — ISPOTEC',
      data: '2026-02-15',
      versao: 'v3.2',
      ficheiro_nome: 'Manual_Programacao_Web_ISPOTEC_2026.pdf',
      ficheiro_url: 'https://developer.mozilla.org/pt-BR/docs/Learn',
      estado: 'Publicado',
      tipo: 'PDF Oficial'
    },
    {
      id: 'man-2',
      titulo: 'Guia de Boas Práticas de Arquitetura de Software Web',
      descricao: 'Padrões de design, separação de responsabilidades e segurança em aplicações web.',
      autor: 'Departamento de Tecnologias ISPOTEC',
      data: '2026-03-01',
      versao: 'v1.0',
      ficheiro_nome: 'Guia_Arquitetura_Web_ISPOTEC.pdf',
      ficheiro_url: 'https://owasp.org/www-project-top-ten/',
      estado: 'Publicado',
      tipo: 'Norma Técnica'
    }
  ],
  guiasEstudo: [
    {
      id: 'guia-1',
      titulo: 'Guia de Estudo 01: Componentização e Hooks no React',
      descricao: 'Roteiro de aprendizagem guiada cobrindo useState, useEffect e manipulação de estado.',
      orientacoes: 'Leia os capítulos 3 e 4 do manual antes de resolver os 5 exercícios práticos em anexo.',
      exercicios: '1. Criar componente Contador com reset\n2. Consumir API de utilizadores via fetch/axios\n3. Implementar formulário controlado com validação',
      leituras: 'Artigos recomendados sobre Virtual DOM na documentação do React.',
      data: '2026-02-20',
      estado: 'Publicado'
    },
    {
      id: 'guia-2',
      titulo: 'Guia de Estudo 02: Segurança e Autenticação JWT em Node.js',
      descricao: 'Orientações detalhadas sobre assinatura de tokens, middleware de autorização e proteção contra XSS/CSRF.',
      orientacoes: 'Executar os exemplos práticos no ambiente de laboratório digital.',
      exercicios: '1. Implementar hash de senhas com bcrypt\n2. Criar rota protegida com verificação de bearer token',
      leituras: 'RFC 7519 — JSON Web Token (JWT)',
      data: '2026-03-05',
      estado: 'Publicado'
    }
  ],
  planoSocial: {
    titulo: 'Plano Social e de Acompanhamento Académico do Grupo',
    descricao: 'Estratégias de integração, mentoria entre pares, inclusão digital e acompanhamento de estudantes em regime híbrido ou com dificuldades técnicas.',
    objectivos: [
      'Promover a coesão do grupo e colaboração entre estudantes presenciais e online.',
      'Garantir suporte técnico e tutoria para estudantes com conectividade limitada.',
      'Fomentar grupos de trabalho colaborativo e partilha de notas de aula.',
      'Organizar sessões quinzenais de monitoria e esclarecimento de dúvidas sociais e académicas.'
    ],
    actividades: [
      'Sessão de Integração e Acolhimento da Turma (Semana 1)',
      'Criação de Grupos de Estudo Solidário e Partilha de Apontamentos (Semana 2)',
      'Café Virtual com o Docente: Feedback de Meio de Semestre (Semana 8)',
      'Workshop de Preparação para o Projeto Integrador (Semana 12)'
    ],
    orientacoes: 'Todos os estudantes são encorajados a participar nas sessões de acompanhamento e a sinalizar ao delegado da turma ou docente qualquer necessidade de reforço.',
    calendario: 'Quinzenalmente às Quintas-feiras, 17:30 - 18:30 (Online via Google Meet)',
    documentos: 'Regulamento de Apoio Social e Acompanhamento Discente ISPOTEC 2026',
    links: 'https://meet.google.com/ispotec-plano-social',
    estado: 'Publicado'
  },
  linksVirtuais: [
    {
      id: 'link-1',
      nome: 'Sala de Aulas Virtuais — Google Meet',
      descricao: 'Link oficial para transmissão e acompanhamento em direto das aulas teóricas e práticas.',
      url: 'https://meet.google.com/abc-defg-hij',
      tipo: 'Google Meet',
      data: '2026-02-10',
      estado: 'Publicado'
    },
    {
      id: 'link-2',
      nome: 'Ambiente de Laboratório Virtual ISPOTEC',
      descricao: 'Plataforma para execução de código e simulações na cloud.',
      url: 'https://github.com/Debian10010/ispotec-online-2026',
      tipo: 'Plataforma Académica',
      data: '2026-02-12',
      estado: 'Publicado'
    },
    {
      id: 'link-3',
      nome: 'Canal de Gravações e Tutoriais em Vídeo',
      descricao: 'Repositório de gravações das aulas anteriores e videoaulas de apoio.',
      url: 'https://youtube.com',
      tipo: 'YouTube',
      data: '2026-02-15',
      estado: 'Publicado'
    }
  ],
  microcredenciais: [
    {
      id: 'micro-1',
      nome: 'Badge Especialista em Desenvolvimento Frontend Moderno',
      descricao: 'Certificação de proficiência na construção de interfaces com React, gerenciamento de estado e boas práticas de acessibilidade web.',
      competencias: 'React.js, Componentização, Responsive Web Design, Clean Code',
      cargaHoraria: '20 Horas',
      criterios: 'Conclusão dos 4 laboratórios práticos com nota igual ou superior a 14 valores.',
      link: 'https://skillsbuild.org',
      badgeIcon: '🎖️',
      estado: 'Publicado',
      data: '2026-03-01'
    },
    {
      id: 'micro-2',
      nome: 'Badge Segurança em Aplicações Web e APIs REST',
      descricao: 'Certificação em práticas de segurança, validação de requisições, CORS e proteção contra vulnerabilidades comuns.',
      competencias: 'Segurança Web, OWASP Top 10, JWT, Criptografia',
      cargaHoraria: '15 Horas',
      criterios: 'Entrega com sucesso do módulo prático de autenticação segura.',
      link: 'https://skillsbuild.org',
      badgeIcon: '🛡️',
      estado: 'Publicado',
      data: '2026-03-10'
    }
  ],
  laboratorioDigital: {
    nome: 'Laboratório Virtual de Aplicações Web e Simulação de Servidores',
    descricao: 'Ambiente prático interativo para experimentação de código frontend e backend, simulação de requisições HTTP, gestão de base de dados e teste de segurança sem necessidade de instalação local complexa.',
    objectivo: 'Permitir que o estudante aplique os conceitos lecionados nas aulas teóricas em cenários práticos reais, executando projetos em sandbox segura com acompanhamento do docente.',
    guiaLaboratorio: {
      titulo: 'GUIA DE REALIZAÇÃO PRÁTICA DO LABORATÓRIO (Passo a Passo)',
      passos: [
        '1. Aceda ao repositório ou ambiente cloud indicado no link do laboratório.',
        '2. Configure as variáveis de ambiente necessárias conforme o template .env.example.',
        '3. Execute os testes unitários preliminares para validar a integridade do ambiente.',
        '4. Desenvolva as rotas e componentes solicitados no roteiro da semana.',
        '5. Teste os endpoints utilizando o Swagger / Postman ou cliente HTTP integrado.',
        '6. Submeta o relatório de execução com capturas de ecrã e link do código na plataforma.'
      ]
    },
    instrucoes: 'Os relatórios práticos devem ser entregues até às 23:59 do domingo subsequente à aula prática.',
    recursos: 'Navegador atualizado (Chrome/Firefox/Edge), VS Code Online ou Desktop, Node.js v18+, Git.',
    linkAmbiente: 'https://codesandbox.io',
    ficheiros: [
      { nome: 'Starter_Kit_Laboratorio_Web_2026.zip', url: '#' },
      { nome: 'Roteiro_Pratico_Laboratorio_01.pdf', url: '#' }
    ],
    atividadesPraticas: [
      'Lab 01: Construção de Layout Responsivo com CSS Grid e Flexbox',
      'Lab 02: Criação de API RESTful com autenticação e validação',
      'Lab 03: Integração Frontend React com Backend Node.js'
    ],
    estado: 'Publicado'
  },
  aulas: [
    {
      id: 'aula-1',
      titulo: 'Aula 01 — Introdução à Arquitetura Web Híbrida e Padrões Modernos',
      tipo: 'Teórica',
      data: '2026-02-18',
      descricao: 'Visão global da evolução da web, protocolos HTTP/HTTPS, ciclo de vida da requisição e arquitetura MVC.',
      conteudo: 'Conceitos fundamentais da arquitetura cliente-servidor; Separação entre Frontend e Backend; Protocolos de comunicação.',
      materiais: 'Slides_Aula_01_Arquitetura_Web.pdf',
      videoUrl: 'https://youtube.com',
      orientacoes: 'Rever as notas de aula e preparar o ambiente de desenvolvimento para a aula prática.',
      estado: 'Publicado'
    },
    {
      id: 'aula-2',
      titulo: 'Aula 02 — Prática Laboratorial: Estruturação Semântica e Design Flexível',
      tipo: 'Prática',
      data: '2026-02-25',
      descricao: 'Desenvolvimento guiado de uma página institucional responsiva com foco em acessibilidade e semântica HTML5.',
      conteudo: 'Construção prática de grid system; Utilização de variáveis CSS; Media queries avançadas.',
      materiais: 'Exercicio_Pratico_Aula_02.zip',
      videoUrl: 'https://meet.google.com',
      orientacoes: 'Completar os desafios 1 a 3 propostos no Guia do Laboratório Digital.',
      estado: 'Publicado'
    },
    {
      id: 'aula-3',
      titulo: 'Aula 03 — JavaScript Assíncrono, Fetch API e Gestão de Estados',
      tipo: 'Teórica',
      data: '2026-03-04',
      descricao: 'Aprofundamento em Promises, Event Loop, async/await e consumo seguro de endpoints REST.',
      conteudo: 'Assincronismo no JavaScript; Tratamento de exceções com try/catch; Boas práticas na requisição de dados.',
      materiais: 'Slides_Aula_03_JS_Async.pdf',
      videoUrl: 'https://youtube.com',
      orientacoes: 'Estudar o Guia de Estudo 01 antes da próxima sessão de laboratório.',
      estado: 'Publicado'
    },
    {
      id: 'aula-4',
      titulo: 'Aula 04 — Prática Laboratorial: Construção de Dashboard SPA em React',
      tipo: 'Prática',
      data: '2026-03-11',
      descricao: 'Criação de componentes dinâmicos, passagem de props, hooks de estado e renderização condicional.',
      conteudo: 'Componentização modular; Hooks (useState, useEffect); Listas e chaves únicas; Formulários controlados.',
      materiais: 'Codigo_Fonte_Aula_04.zip',
      videoUrl: 'https://meet.google.com',
      orientacoes: 'Submeter o código na secção de atividades do Laboratório Digital.',
      estado: 'Publicado'
    }
  ]
};

export const homeSchoolService = {
  // Retorna todas as salas/grupos do Home School a partir do backend com fallback
  async getSalas(user = null) {
    let backendSalas = [];
    try {
      const res = await api.get('/homeschool/salas');
      if (res && res.dados && Array.isArray(res.dados) && res.dados.length > 0) {
        backendSalas = res.dados;
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(backendSalas));
        return backendSalas;
      }
    } catch (e) {
      console.warn('[homeSchoolService.getSalas backend fallback]', e.message);
    }

    // Salas padrão para os Cursos Técnicos Médios do IFOPTEC
    const salasDefaultIfoptec = [
      {
        id: 'sala-ifop-med-geral-2026',
        nome: 'Semiologia Médica & Propedêutica Clínica — Turma 1',
        curso: 'Técnico de Medicina Geral',
        modulo: 'Semiologia e Propedêutica Médica',
        disciplina: 'Semiologia e Propedêutica Médica',
        docente: 'Dr. Alberto Machava',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-TMG-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Ambiente virtual para discussão de casos clínicos, anamnese, propedêutica médica e condutas clínicas integradas em saúde.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-1'],
        total_membros: 32,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Semiologia e Propedêutica Médica',
          cargaHoraria: '80 Horas (40h Teóricas + 40h Práticas Hospitalares)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Capacitar os técnicos médios na realização de anamnese rigorosa, exame físico sistemático, reconhecimento de sinais patognomónicos e orientação de exames complementares.',
          conteudos: [
            'Unidade 1: Princípios de Anamnese, Relação Técnico-Paciente e Deontologia Médica',
            'Unidade 2: Exame Físico Geral (Sinais Vitais, Estado Nutricional, Fácies e Postura)',
            'Unidade 3: Propedêutica do Aparelho Respiratório e Cardiovascular',
            'Unidade 4: Propedêutica do Abdómen, Aparelho Digestivo e Geniturinário',
            'Unidade 5: Semiologia Neurológica Básica, Musculoesquelética e Raciocínio Clínico'
          ],
          competencias: [
            'Conduzir anamnese completa e orientada para a queixa principal.',
            'Executar com destreza inspeção, palpação, percussão e auscultação.',
            'Formular hipóteses diagnósticas e plano de cuidados para centros de saúde.'
          ],
          metodologias: 'Aulas teóricas dialogadas, simulações de casos clínicos no AVA, resolução de vinhetas clínicas e estágio prático tutelado.',
          avaliacao: '• 2 Testes Escritos de Semiologia (40%)\n• 4 Avaliações de Competências Clínicas Práticas (OSCE) (30%)\n• 1 Estudo de Caso Clínico Integrador (30%)',
          bibliografia: '1. Porto, Celmo Celeno. Semiologia Médica. Guanabara Koogan.\n2. Bickley, Lynn S. Bates — Propedêutica Médica.\n3. Protocolos Nacionais Clínicos do Ministério da Saúde de Moçambique (MISAU).'
        },
        manuais: [
          {
            id: 'man-tmg-1',
            titulo: 'Manual de Semiologia Clínica do Técnico Médio — IFOPTEC 2026',
            descricao: 'Roteiro prático para exame físico por aparelhos e sistemas orgânicos.',
            autor: 'Departamento de Ciências da Saúde — IFOPTEC',
            data: '2026-02-15',
            versao: 'v2.1',
            ficheiro_nome: 'Manual_Semiologia_IFOPTEC_2026.pdf',
            ficheiro_url: '#',
            estado: 'Publicado',
            tipo: 'PDF Oficial'
          }
        ]
      },
      {
        id: 'sala-ifop-enf-geral-2026',
        nome: 'Fundamentos de Enfermagem & Cuidados Clínicos',
        curso: 'Técnico de Enfermagem Geral',
        modulo: 'Fundamentos de Enfermagem',
        disciplina: 'Fundamentos de Enfermagem',
        docente: 'Enf.ª Ana Paula Tembe',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-TEG-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Sala virtual para procedimentos de enfermagem, biossegurança, administração medicamentosa e cuidados integrais ao doente internado.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-2'],
        total_membros: 30,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Fundamentos de Enfermagem',
          cargaHoraria: '75 Horas (35h Teóricas + 40h Práticas em Sala de Demonstração)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Desenvolver competências técnicas e éticas para a prestação de cuidados de enfermagem básicos e especializados nos serviços de internamento e urgência.',
          conteudos: [
            'Unidade 1: Conceitos Fundamentais de Enfermagem, Humanização e Princípios Éticos',
            'Unidade 2: Biossegurança, Controlo de Infeções Hospitalares e Lavagem das Mãos',
            'Unidade 3: Vias de Administração de Medicamentos e Cálculo de Dosagens',
            'Unidade 4: Tratamento de Feridas, Técnicas Assépticas de Pensos e Drenagens',
            'Unidade 5: Cuidados Pré e Pós-Operatórios e Registos Clínicos de Enfermagem'
          ],
          competencias: [
            'Executar técnicas assépticas e administração segura de medicação.',
            'Monitorizar parâmetros vitais e reconhecer sinais de agravamento clínico.',
            'Prestar assistência qualificada a doentes em regime de internamento.'
          ],
          metodologias: 'Aulas teóricas expositivas dialogadas, oficinas práticas de simulação em manequins e estágios clínicos.',
          avaliacao: '• 2 Testes Teóricos de Fundamentos (40%)\n• 4 Demonstrações Práticas de Procedimentos (30%)\n• 1 Avaliação de Desempenho Clínico no Laboratório (30%)',
          bibliografia: '1. Potter & Perry. Fundamentos de Enfermagem. Elsevier.\n2. Brunner & Suddarth. Tratado de Enfermagem Médico-Cirúrgica.\n3. Manual de Boas Práticas de Enfermagem — IFOPTEC.'
        },
        manuais: [
          {
            id: 'man-teg-1',
            titulo: 'Guia de Procedimentos Práticos de Enfermagem — IFOPTEC 2026',
            descricao: 'Técnicas assépticas, punção venosa, algaliação, sondagem nasogástrica e pensos estéreis.',
            autor: 'Coordenação de Enfermagem — IFOPTEC',
            data: '2026-02-15',
            versao: 'v3.0',
            ficheiro_nome: 'Guia_Procedimentos_Enfermagem_IFOPTEC.pdf',
            ficheiro_url: '#',
            estado: 'Publicado',
            tipo: 'PDF Oficial'
          }
        ]
      },
      {
        id: 'sala-ifop-smi-2026',
        nome: 'Obstetrícia, Parto & Vigilância Pré-Natal',
        curso: 'Enfermagem de Saúde Materno e Infantil',
        modulo: 'Obstetrícia e Vigilância Pré-Natal',
        disciplina: 'Obstetrícia e Vigilância Pré-Natal',
        docente: 'Dra. Esperança Mondlane',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-SMI-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Acompanhamento integral da gravidez, vigilância do bem-estar fetal, partograma, assistência humanizada ao parto e cuidados imediatos ao recém-nascido.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-3'],
        total_membros: 28,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Obstetrícia e Vigilância Pré-Natal',
          cargaHoraria: '80 Horas (40h Teóricas + 40h Práticas em Maternidade)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Capacitar as técnicas médias de SMI para vigilância pré-natal de qualidade, identificação precoce de riscos obstétricos e condução segura do parto normal.',
          conteudos: [
            'Unidade 1: Fisiologia da Reprodução, Fecundação e Desenvolvimento Fetal',
            'Unidade 2: Consulta Pré-Natal Focada e Rastreio de Fatores de Risco',
            'Unidade 3: Trabalho de Parto, Mecanismos do Parto e Utilização do Partograma',
            'Unidade 4: Assistência Imediata ao Recém-Nascido e Reanimação Neonatal Básica',
            'Unidade 5: Cuidados no Puerpério, Amamentação Exclusiva e Planeamento Familiar'
          ],
          competencias: [
            'Realizar consultas pré-natais completas com interpretação de exames laboratoriais.',
            'Preencher e interpretar o partograma para prevenção de trabalho de parto obstruído.',
            'Garantir assistência humanizada ao binómio mãe-filho e promoção do aleitamento materno.'
          ],
          metodologias: 'Aulas teóricas, estudos de casos de morbimortalidade materna, práticas em simulador de parto e estágios em maternidade.',
          avaliacao: '• 2 Testes Teóricos de Obstetrícia (40%)\n• 3 Avaliações Práticas de Partograma e Manejo de Parto (30%)\n• 1 Relatório de Estágio de Bloco de Parto (30%)',
          bibliografia: '1. Manual de Cuidados Obstétricos Essenciais — MISAU / OMS.\n2. Rezende, Jorge de. Obstetrícia Fundamental.\n3. Protocolo de Prevenção da Transmissão Vertical (PTV) — Moçambique.'
        }
      },
      {
        id: 'sala-ifop-farmacia-2026',
        nome: 'Farmacotécnica, Farmacologia & Dispensação',
        curso: 'Técnico de Farmácia',
        modulo: 'Farmacotécnica e Formas Farmacêuticas',
        disciplina: 'Farmacotécnica e Formas Farmacêuticas',
        docente: 'Dr. Farm. João Chissano',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-TF-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Sala virtual para cálculo posológico, conservação de fármacos, cadeia de frio, manipulação e atendimento ao utente em farmácia.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-4'],
        total_membros: 26,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Farmacotécnica e Formas Farmacêuticas',
          cargaHoraria: '70 Horas (35h Teóricas + 35h Práticas em Laboratório)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Formar técnicos aptos a preparar formulações medicamentosas simples, gerir stocks e dispensar medicamentos com aconselhamento farmacoterapêutico correto.',
          conteudos: [
            'Unidade 1: Classificação das Formas Farmacêuticas (Sólidas, Líquidas e Semissólidas)',
            'Unidade 2: Operações Farmacêuticas Básicas e Boas Práticas de Manipulação',
            'Unidade 3: Cadeia de Frio, Armazenamento e Gestão de Prazos de Validade',
            'Unidade 4: Interpretação de Receituário e Interações Medicamentosas Mais Frequentes',
            'Unidade 5: Legislação Farmacêutica Nacional e Deontologia Profissional'
          ],
          competencias: [
            'Preparar formulações farmacêuticas oficiais seguindo normas de biossegurança.',
            'Dispensar fármacos garantindo a compreensão posológica por parte do paciente.',
            'Gerir inventários e requisições de medicamentos essenciais pelo SIGLUS/MEDEX.'
          ],
          metodologias: 'Aulas expositivas dialogadas, resolução de problemas de cálculo de doses, práticas em bancada e gestão de farmácia simulada.',
          avaliacao: '• 2 Testes Teóricos de Farmacotécnica (40%)\n• 4 Relatórios de Prática Laboratorial (30%)\n• 1 Simulação de Dispensação e Gestão de Stocks (30%)',
          bibliografia: '1. Formulário Nacional de Medicamentos de Moçambique.\n2. Allen, Loyd V. Ansel: Formas Farmacêuticas e Sistemas de Liberação de Fármacos.\n3. Manual de Gestão Logística de Medicamentos — MISAU.'
        }
      },
      {
        id: 'sala-ifop-gestao-hosp-2026',
        nome: 'Sistemas de Informação em Saúde (SIS) & Gestão Hospitalar',
        curso: 'Gestão e Administração Hospitalar',
        modulo: 'Sistemas de Informação em Saúde (SIS)',
        disciplina: 'Sistemas de Informação em Saúde (SIS)',
        docente: 'Msc. Carlos Mucavele',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-GAH-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Administração hospitalar: gestão de admissões, arquivo clínico, faturamento médico, registos do SISMA e logística de insumos.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-5'],
        total_membros: 22,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Sistemas de Informação em Saúde (SIS)',
          cargaHoraria: '64 Horas (32h Teóricas + 32h Práticas em Software)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Capacitar os técnicos na utilização de ferramentas digitais de gestão em saúde, registo estatístico de dados clínicos e coordenação de serviços de apoio hospitalar.',
          conteudos: [
            'Unidade 1: Organização e Estrutura Funcional dos Hospitais e Centros de Saúde',
            'Unidade 2: Módulos do SISMA (Sistema de Informação em Saúde para Monitoria e Avaliação)',
            'Unidade 3: Gestão de Arquivos Clínicos, Confidencialidade e Processo do Paciente',
            'Unidade 4: Faturação de Serviços Médicos, Seguros e Cobrança Hospitalar',
            'Unidade 5: Cadeia de Aprovisionamento, Logística Hospitalar e Manutenção de Equipamentos'
          ],
          competencias: [
            'Operar sistemas de registo e estatística hospitalar com acurácia.',
            'Otimizar fluxos de atendimento de consultas, urgências e internamentos.',
            'Elaborar relatórios gerenciais e indicadores de desempenho hospitalar.'
          ],
          metodologias: 'Estudo de casos administrativos, simulação de fluxos hospitalares em computador e elaboração de planos de melhoria da qualidade.',
          avaliacao: '• 2 Testes Teóricos de Gestão Hospitalar (40%)\n• 4 Trabalhos Práticos de Análise de Indicadores de Saúde (30%)\n• 1 Plano de Gestão de Unidade Hospitalar (30%)',
          bibliografia: '1. Manual de Procedimentos Administrativos Hospitalares — MISAU.\n2. Guia de Utilização do SISMA Moçambique.\n3. Vecina Neto, Gonzalo. Gestão em Saúde. Manole.'
        }
      },
      {
        id: 'sala-ifop-saude-prev-2026',
        nome: 'Saúde Comunitária, Vigilância & Epidemiologia de Campo',
        curso: 'Técnico de Saúde Preventiva - Agente Polivalente de Saúde',
        modulo: 'Vigilância Epidemiológica',
        disciplina: 'Vigilância Epidemiológica',
        docente: 'Dr. Mateus Nhaca',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'IFOP-TSP-2026',
        instituicao: 'ifoptec',
        nivel: 'Técnico Médio',
        descricao: 'Ações de saúde preventiva no terreno: controlo vetorial, campanhas de imunização, água potável, saneamento e educação comunitária.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-ifop-6'],
        total_membros: 25,
        ...defaultSalaConteudo,
        planoAnalitico: {
          unidadeCurricular: 'Vigilância Epidemiológica e Saúde Preventiva',
          cargaHoraria: '70 Horas (35h Teóricas + 35h Ações Comunitárias)',
          cronograma: 'Fevereiro a Junho de 2026',
          objectivos: 'Preparar agentes capacitados para investigar surtos, promover comportamentos saudáveis na comunidade e implementar medidas de saneamento básico do meio.',
          conteudos: [
            'Unidade 1: Conceitos de Epidemiologia Descritiva e Indicadores Básicos de Saúde',
            'Unidade 2: Notificação Obrigatória de Doenças e Investigação de Casos',
            'Unidade 3: Doenças Transmissíveis Prioritárias (Malária, Cólera, Tuberculose, HIV/SIDA)',
            'Unidade 4: Qualidade da Água, Gestão de Resíduos e Saneamento Comunitário',
            'Unidade 5: Estratégias de Informação, Educação e Comunicação (IEC) em Saúde'
          ],
          competencias: [
            'Identificar precocemente sinais de surtos epidémicos e emitir alertas sanitários.',
            'Mobilizar líderes locais e famílias para adoção de práticas de prevenção.',
            'Supervisionar ações de saneamento do meio e desinfeção de poços e fontes de água.'
          ],
          metodologias: 'Aulas teóricas interativas, planeamento de intervenções sanitárias comunitárias, dramatização de sessões de educação em saúde e visitas ao terreno.',
          avaliacao: '• 2 Testes Teóricos de Epidemiologia (40%)\n• 3 Planos de Intervenção Preventiva Comunitária (30%)\n• 1 Relatório de Investigação de Surto Simulado (30%)',
          bibliografia: '1. Manual do Agente Polivalente de Saúde (APS) — MISAU Moçambique.\n2. Rouquayrol, Maria Zélia. Epidemiologia & Saúde. MedBook.\n3. Guias de Vigilância Epidemiológica de Doenças Notificáveis — OMS.'
        }
      }
    ];

    // Carregar dados locais customizados caso existam
    let storedGroups = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
      if (raw) storedGroups = JSON.parse(raw);
    } catch (_) {}

    if (storedGroups && storedGroups.length > 0) {
      // Garantir que as salas padrão do IFOPTEC estão presentes mesmo se o utilizador já tiver dados locais
      const existingIds = new Set(storedGroups.map(s => s.id || s._id));
      const missingIfoptecSalas = salasDefaultIfoptec.filter(s => !existingIds.has(s.id));
      if (missingIfoptecSalas.length > 0) {
        storedGroups = [...storedGroups, ...missingIfoptecSalas];
        try {
          localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(storedGroups));
        } catch (_) {}
      }
      return storedGroups;
    }

    // Carregar salas padrão caso primeira utilização
    const salasDefault = [
      ...salasDefaultIfoptec,
      {
        id: 'sala-ti-pw-2026a',
        nome: 'Programação Web — Grupo A',
        curso: 'Licenciatura em Tecnologias de Informação',
        modulo: 'Programação Web',
        disciplina: 'Programação Web',
        docente: 'Prof. Dr. António Silva',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'TI-PW-2026A',
        descricao: 'Ambiente de aprendizagem híbrida para desenvolvimento de aplicações web modernas, frontend e backend.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-1', 'user-2', 'docente-1'],
        total_membros: 28,
        ...defaultSalaConteudo
      },
      {
        id: 'sala-ti-redes-2026',
        nome: 'Redes de Computadores & Cibersegurança — Turma 1',
        curso: 'Licenciatura em Tecnologias de Informação',
        modulo: 'Redes de Computadores',
        disciplina: 'Redes de Computadores',
        docente: 'Prof. Eng. Manuel Cossa',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'TI-RC-2026B',
        descricao: 'Sala virtual para simulações de redes, configuração de protocolos e práticas de segurança digital.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-1'],
        total_membros: 24,
        ...defaultSalaConteudo
      },
      {
        id: 'sala-enf-anat-2026',
        nome: 'Anatomia e Fisiologia Humana — Grupo Saúde',
        curso: 'Licenciatura em Enfermagem Geral',
        modulo: 'Anatomia e Fisiologia Humana',
        disciplina: 'Anatomia e Fisiologia Humana',
        docente: 'Dra. Maria Helena Mabunda',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'ENF-AF-2026',
        descricao: 'Sala de aula virtual com atlas 3D de anatomia, casos clínicos simulados e roteiros de enfermagem.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: ['user-2'],
        total_membros: 35,
        ...defaultSalaConteudo
      },
      {
        id: 'sala-gest-mark-2026',
        nome: 'Marketing Estratégico & Gestão Digital',
        curso: 'Licenciatura em Gestão de Empresas',
        modulo: 'Marketing Estratégico',
        disciplina: 'Marketing Estratégico',
        docente: 'Prof. Msc. Carlos Mondlane',
        ano: '2026',
        semestre: '1º Semestre',
        codigo: 'GES-ME-2026',
        descricao: 'Ambiente híbrido para análise de mercados, estudos de caso empresariais e planos de marketing.',
        estado: 'Ativo',
        dataInicio: '2026-02-15',
        dataTermino: '2026-06-30',
        membros: [],
        total_membros: 19,
        ...defaultSalaConteudo
      }
    ];
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(salasDefault));
    return salasDefault;
  },

  // Retorna uma sala específica pelo ID
  async getSalaById(id) {
    try {
      const res = await api.get(`/homeschool/salas/${id}`);
      if (res && res.dados) {
        return res.dados;
      }
    } catch (_) {}

    const salas = await this.getSalas();
    return salas.find(s => (s.id || s._id) === id) || salas[0] || null;
  },

  // Salva ou atualiza uma sala/grupo
  async saveSala(salaData) {
    try {
      if (salaData.id && !salaData.id.startsWith('sala-')) {
        const res = await api.put(`/homeschool/salas/${salaData.id}`, salaData);
        if (res && res.dados) return res.dados;
      } else {
        const res = await api.post('/homeschool/salas', salaData);
        if (res && res.dados) return res.dados;
      }
    } catch (e) {
      console.warn('[homeSchoolService.saveSala backend fallback]', e.message);
    }

    const salas = await this.getSalas();
    const id = salaData.id || salaData._id || `sala-${Date.now()}`;
    const index = salas.findIndex(s => (s.id || s._id) === id);

    const fullSala = {
      ...salaData,
      id,
      estado: salaData.estado || 'Ativo',
      membros: salaData.membros || [],
      total_membros: salaData.total_membros || (salaData.membros ? salaData.membros.length : 1)
    };

    if (index >= 0) {
      salas[index] = { ...salas[index], ...fullSala };
    } else {
      salas.unshift(fullSala);
    }

    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(salas));
    return fullSala;
  },

  // Eliminar uma sala
  async deleteSala(id) {
    try {
      await api.delete(`/homeschool/salas/${id}`);
    } catch (_) {}

    const salas = await this.getSalas();
    const filtered = salas.filter(s => (s.id || s._id) !== id);
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(filtered));
    return true;
  },

  // Conteúdo completo da Sala Virtual
  getSalaConteudo(salaId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${salaId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (_) {}
    return JSON.parse(JSON.stringify(defaultSalaConteudo));
  },

  saveSalaConteudo(salaId, conteudo) {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${salaId}`, JSON.stringify(conteudo));
      // Try async background update to backend
      api.put(`/homeschool/salas/${salaId}`, conteudo).catch(() => {});
      return true;
    } catch (e) {
      console.error('Erro ao guardar conteúdo da sala:', e);
      return false;
    }
  }
};

export const homeschoolService = homeSchoolService;
export default homeSchoolService;

