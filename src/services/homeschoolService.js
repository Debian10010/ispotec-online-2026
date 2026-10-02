import { groupService } from './groupService';
import { api } from './api';

const STORAGE_KEY_PREFIX = 'ispotec_homeschool_sala_';
const STORAGE_KEY_GROUPS = 'ispotec_homeschool_groups_data';

// Cursos institucionais padrão ISPOTEC
export const CURSOS_ISPOTEC = [
  'Licenciatura em Tecnologias de Informação',
  'Licenciatura em Engenharia Informática',
  'Licenciatura em Gestão de Empresas',
  'Licenciatura em Contabilidade e Auditoria',
  'Licenciatura em Enfermagem Geral',
  'Licenciatura em Farmácia',
  'Licenciatura em Direito'
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

    // Carregar dados locais customizados caso existam
    let storedGroups = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
      if (raw) storedGroups = JSON.parse(raw);
    } catch (_) {}

    if (storedGroups && storedGroups.length > 0) {
      return storedGroups;
    }

    // Carregar salas padrão caso primeira utilização
    const salasDefault = [
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

