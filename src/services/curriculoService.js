/**
 * curriculoService.js
 * Estruturas curriculares (Curso -> Ano -> Semestre -> Módulos)
 * e Informações Gerais dos Cursos (9 secções oficiais) para o AVA.
 */

// Informações gerais padrão para qualquer curso
export function getInformacoesGeraisPadrao(cursoNome) {
  const isSaude = cursoNome.toLowerCase().includes('saúde') ||
    cursoNome.toLowerCase().includes('enfermagem') ||
    cursoNome.toLowerCase().includes('medicina') ||
    cursoNome.toLowerCase().includes('farmácia') ||
    cursoNome.toLowerCase().includes('psicologia') ||
    cursoNome.toLowerCase().includes('hospitalar');

  const isTI = cursoNome.toLowerCase().includes('tecnologia') ||
    cursoNome.toLowerCase().includes('informática') ||
    cursoNome.toLowerCase().includes('engenharia');

  return {
    manualCurso: {
      titulo: `Manual do Curso — ${cursoNome} (Edição Oficial 2026)`,
      descricao: `Compêndio pedagógico e regulamentar do ${cursoNome}. Contém o perfil de competências do graduado, normas de avaliação contínua, regime de transição de ano, saídas profissionais e deveres do estudante.`,
      codigoDocumento: `MAN-ISPOTEC-${cursoNome.substring(0, 3).toUpperCase()}-2026`,
      dataPublicacao: 'Fevereiro de 2026',
      versao: '3.1 / Aprovado pelo Conselho Científico-Pedagógico',
      ficheiroNome: `Manual_${cursoNome.replace(/\s+/g, '_')}_2026.pdf`,
      topicos: [
        '1. Missão, Visão e Filosofia Educativa do ISPOTEC / IFOPTEC',
        '2. Objetivos Gerais e Específicos do Ciclo de Estudos',
        '3. Perfil de Entrada e Requisitos Curriculares',
        '4. Perfil de Saída e Competências Profissionais Reguladas',
        '5. Matriz Curricular Detalhada por Anos e Semestres',
        '6. Regime de Assiduidade, Avaliação e Exames de Recorrência',
        '7. Regulamento de Estágios Práticos e Saídas Profissionais',
        '8. Código de Ética, Integridade Académica e Conduta Discente'
      ]
    },
    matrizCompetencias: {
      titulo: `Matriz de Competências & Perfil de Saída Profissional`,
      subtitulo: `Definição de competências cognitivas (saber), técnicas (saber fazer) e relacionais (saber ser)`,
      competenciasGerais: [
        'Capacidade de comunicação técnica oral e escrita em contexto profissional e institucional.',
        'Pensamento crítico, resolução sistemática de problemas e tomada de decisões fundamentadas.',
        'Trabalho colaborativo e liderança em equipas multidisciplinares.',
        'Aplicação rigorosa de normas de ética, deontologia e responsabilidade social em Moçambique.',
        'Domínio de ferramentas digitais e ambientes virtuais de trabalho colaborativo.'
      ],
      competenciasEspecificas: isSaude ? [
        'Realização de anamnese, triagem e exame físico com respeito pelo utente e normas de biossegurança.',
        'Identificação de sinais clínicos de gravidade e aplicação de protocolos terapêuticos oficiais do MISAU.',
        'Administração segura de terapêuticas medicamentosas e vigilância de efeitos adversos.',
        'Acompanhamento pré-natal, infantil e promoção da saúde reprodutiva e vacinação (PAI).',
        'Intervenção preventiva em saúde comunitária, saneamento básico e controlo de endemias locais.'
      ] : isTI ? [
        'Conceção, desenvolvimento e manutenção de sistemas de informação e aplicações web/móveis empresariais.',
        'Administração, configuração e segurança de redes de computadores e servidores cloud.',
        'Modelação de bases de dados relacionais e não-relacionais com integridade e alta disponibilidade.',
        'Implementação de práticas de cibersegurança, criptografia e proteção de dados confidenciais.',
        'Gestão ágil de projetos tecnológicos (Scrum/Kanban) e integração contínua (CI/CD).'
      ] : [
        'Planeamento estratégico, análise orçamental e gestão financeira de organizações públicas e privadas.',
        'Gestão de recursos humanos, liderança de talentos e legislação laboral moçambicana.',
        'Desenvolvimento de estudos de mercado, planos de marketing e modelos de negócios inovadores.',
        'Auditoria interna, controlo de gestão e cumprimento fiscal.',
        'Gestão de operações, cadeias de abastecimento e logística integrada.'
      ],
      resultadosEsperados: [
        'Desempenho autónomo e eficaz nas funções do posto de trabalho.',
        'Capacidade de adaptação a inovações metodológicas e tecnológicas.',
        'Aptidão comprovada em avaliações de competências práticas e estágios supervisionados.'
      ]
    },
    horario: {
      titulo: `Horário Trimestral e Semestral — Ano Lectivo 2026`,
      turnos: [
        { nome: 'Turno Diurno / Manhã', horario: '08:00 – 12:30 (Segunda a Sexta)' },
        { nome: 'Turno Tarde', horario: '13:00 – 17:15 (Segunda a Sexta)' },
        { nome: 'Turno Pós-Laboral / Noite', horario: '17:30 – 21:00 (Segunda a Sexta)' },
        { nome: 'Sessões Práticas & Laboratoriais', horario: 'Sábados das 08:00 às 13:00' }
      ],
      observacoes: 'As aulas teóricas decorrem presencialmente e com apoio síncrono no Ambiente Virtual (AVA). Os laboratórios práticos e oficinas técnicas têm presença obrigatória mínima de 80% conforme o regulamento pedagógico.'
    },
    termosEstagio: {
      titulo: `Termos de Referência de Estágio Curricular Supervisionado (Semestral)`,
      duracao: isSaude ? '480 Horas de Estágio Clínico Supervisionado' : '360 Horas de Estágio Pré-Profissional',
      creditos: '12 ECTS',
      entidadesParceiras: isSaude ? [
        'Hospital Geral José Macamo',
        'Hospital Provincial da Matola',
        'Centros de Saúde Urbanos e Rurais da Província de Maputo',
        'Hospital Distrital de Marracuene'
      ] : isTI ? [
        'Empresas de Telecomunicações e Operadoras Móveis',
        'Instituições Financeiras e Bancárias',
        'Agências Governamentais de Tecnologias de Informação',
        'Startups Tecnológicas e Centros de Software'
      ] : [
        'Bancos Comerciais e Instituições de Microfinanças',
        'Empresas Comerciais e Industriais de Maputo e Matola',
        'Gabinete de Auditoria e Consultoria Fiscal',
        'Ministérios e Direções Provinciais da Função Pública'
      ],
      objetivosEstagio: [
        'Aplicação direta das competências técnico-científicas adquiridas em contexto profissional real.',
        'Integração na dinâmica organizacional e rotinas do posto de trabalho.',
        'Elaboração e defesa pública do Relatório Individual de Estágio Curricular perante o júri.'
      ]
    },
    inscricaoEstagioExames: {
      titulo: `Inscrição para Estágio, Avaliações, Exames e Mini-Pautas Oficiais`,
      prazos: [
        { processo: 'Inscrição para Estágio Supervisionado', periodo: '15 a 30 de Março de 2026', estado: 'Aberto' },
        { processo: 'Inscrição para 1.ª Chamada de Exames Normais', periodo: '01 a 15 de Maio de 2026', estado: 'Agendado' },
        { processo: 'Inscrição para Exames de Recorrência', periodo: '01 a 10 de Junho de 2026', estado: 'Brevemente' }
      ],
      miniPautas: [
        { modulo: 'Avaliação Contínua 1', dataPublicacao: '10 de Março de 2026', estado: 'Disponível na Secretaria Virtual' },
        { modulo: 'Avaliação Contínua 2', dataPublicacao: '20 de Abril de 2026', estado: 'Aguardando Lançamento' },
        { modulo: 'Classificação de Frequência Final', dataPublicacao: '25 de Maio de 2026', estado: 'Aguardando' }
      ]
    },
    exameCompetencias: {
      titulo: `Exame de Competências Práticas e Qualificação`,
      descricao: `Prova global integradora com avaliação presencial prática e teórica para validação dos resultados de aprendizagem do ciclo curricular.`,
      formato: isSaude ? 'Exame Clínico Objetivo Estruturado (OSCE) em 6 Estações Práticas com Pacientes Simulados' : 'Prova Teórico-Prática com Resolução de Caso de Estudo Aplicado em Laboratório',
      pesoNotaFinal: '30% da classificação curricular ou condição de elegibilidade ao Estágio Final',
      criteriosAvaliacao: [
        'Raciocínio metodológico e clareza na formulação da solução.',
        'Destreza técnica e execução correta dos procedimentos padronizados.',
        'Comunicação interpessoal, postura profissional e deontologia.',
        'Gestão eficiente do tempo e dos recursos disponíveis.'
      ]
    },
    relatorioCompetencias: {
      titulo: `Relatório de Avaliação de Competências do Curso`,
      indiceGeral: '88.6% de alcance positivo dos objetivos de aprendizagem',
      indicadores: [
        { competencia: 'Domínio dos Fundamentos Teórico-Conceituais', nivel: 'Avançado (89%)', estado: 'Superado' },
        { competencia: 'Execução Prática em Laboratório / Gabinete', nivel: 'Proficiente (86%)', estado: 'Conforme' },
        { competencia: 'Resolução de Problemas e Estudos de Caso', nivel: 'Proficiente (85%)', estado: 'Conforme' },
        { competencia: 'Comunicação Técnica e Relatórios Científicos', nivel: 'Proficiente (88%)', estado: 'Conforme' }
      ],
      conclusao: 'A turma demonstra sólida apreensão dos conhecimentos previstos no plano curricular, com recomendação de reforço nas sessões práticas laboratoriais tutoradas.'
    },
    avaliacaoDocentes: {
      titulo: `Avaliação do Corpo Docente pelos Estudantes (Trimestral/Semestral)`,
      descricao: `Inquérito confidencial obrigatório no qual o estudante avalia a prática pedagógica, assiduidade, cumprimento do plano analítico e disponibilidade de tutoria dos docentes do curso.`,
      dimensoes: [
        '1. Domínio da Matéria e Clareza Expositiva',
        '2. Pontualidade e Cumprimento das Horas Letivas',
        '3. Disponibilização Atempada de Materiais e Guias no AVA',
        '4. Clareza e Transparência nos Critérios de Avaliação',
        '5. Apoio, Tutoria e Acompanhamento das Dúvidas dos Estudantes'
      ],
      periodoAvaliacao: 'Semana 12 de cada semestre letivo (Totalmente Anónimo)'
    },
    avaliacaoSemestral: {
      titulo: `Avaliação Semestral do Curso — Estatística Académica e Pedagógica`,
      indicadores: [
        { metrica: 'Taxa de Aprovação Global', valor: '86.4%', evolucao: '+3.2% vs semestre anterior' },
        { metrica: 'Índice Médio de Frequência às Aulas', valor: '92.1%', evolucao: 'Estável' },
        { metrica: 'Cumprimento Médio do Plano Analítico', valor: '96.8%', evolucao: '+1.5%' },
        { metrica: 'Participação no Ambiente Virtual (AVA)', valor: '94.5%', evolucao: '+8.0%' }
      ],
      distribuicaoNotas: {
        excelente: '18% (16 - 20 valores)',
        bom: '54% (14 - 15 valores)',
        suficiente: '19% (10 - 13 valores)',
        recurso: '9% (< 10 valores)'
      }
    }
  };
}

// Estruturas Curriculares Detalhadas por Curso
export const CURRICULOS_POR_CURSO = {
  'Licenciatura em Tecnologias de Informação': {
    duracaoAnos: 4,
    nivel: 'Licenciatura (Ensino Superior)',
    grau: 'Licenciado(a) em Tecnologias de Informação',
    cargaHorariaTotal: '2.400 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ti-1-1-alg', nome: 'Introdução aos Algoritmos e Programação', codigo: 'TI-101', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível', salaId: 'sala-ti-pw-2026a' },
              { id: 'ti-1-1-arq', nome: 'Arquitetura de Computadores e Sistemas Digitais', codigo: 'TI-102', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível', salaId: 'sala-ti-redes-2026' },
              { id: 'ti-1-1-mat', nome: 'Matemática Discreta e Álgebra Linear', codigo: 'TI-103', docente: 'Prof. Msc. João Langa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-1-1-com', nome: 'Comunicação Empresarial e Técnicas de Expressão', codigo: 'TI-104', docente: 'Dra. Isabel Sitoe', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ti-1-2-web', nome: 'Programação Web Moderna (Frontend & Backend)', codigo: 'TI-105', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível', salaId: 'sala-ti-pw-2026a' },
              { id: 'ti-1-2-est', nome: 'Estruturas de Dados e Análise de Complexidade', codigo: 'TI-106', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-1-2-so',  nome: 'Sistemas Operativos e Virtualização', codigo: 'TI-107', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ti-1-2-est2', nome: 'Estatística Aplicada e Modelação Quantitativa', codigo: 'TI-108', docente: 'Prof. Msc. João Langa', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ti-2-1-bd', nome: 'Bases de Dados Relacionais e SQL Avançado', codigo: 'TI-201', docente: 'Dra. Marta Tembe', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-2-1-red', nome: 'Redes de Computadores e Protocolos de Comunicação', codigo: 'TI-202', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível', salaId: 'sala-ti-redes-2026' },
              { id: 'ti-2-1-poo', nome: 'Programação Orientada a Objetos com Java e C#', codigo: 'TI-203', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-2-1-uml', nome: 'Análise, Modelação e Especificação de Sistemas', codigo: 'TI-204', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ti-2-2-eng', nome: 'Engenharia de Software e Metodologias Ágeis', codigo: 'TI-205', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-2-2-nosql', nome: 'Bases de Dados NoSQL, Documentos e Big Data', codigo: 'TI-206', docente: 'Dra. Marta Tembe', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ti-2-2-ciber', nome: 'Cibersegurança e Proteção de Dados', codigo: 'TI-207', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível', salaId: 'sala-ti-redes-2026' },
              { id: 'ti-2-2-mov', nome: 'Desenvolvimento de Aplicações Móveis (React Native)', codigo: 'TI-208', docente: 'Prof. Msc. Rui Nhantumbo', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ti-3-1-cloud', nome: 'Cloud Computing e Infraestruturas Distribuídas', codigo: 'TI-301', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-3-1-ia', nome: 'Inteligência Artificial e Sistemas Especialistas', codigo: 'TI-302', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-3-1-gov', nome: 'Governação de TI e Gestão de Serviços (ITIL/COBIT)', codigo: 'TI-303', docente: 'Dra. Sandra Mondlane', cargaHoraria: '50h', estado: 'Disponível' },
              { id: 'ti-3-1-inv', nome: 'Metodologia de Investigação Científica Aplicada', codigo: 'TI-304', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ti-3-2-devops', nome: 'DevOps, Automação e Entrega Contínua (CI/CD)', codigo: 'TI-305', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ti-3-2-ml', nome: 'Machine Learning e Ciência de Dados Aplicada', codigo: 'TI-306', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ti-3-2-proj', nome: 'Gestão de Projetos Tecnológicos e Liderança', codigo: 'TI-307', docente: 'Dra. Sandra Mondlane', cargaHoraria: '50h', estado: 'Disponível' },
              { id: 'ti-3-2-estag', nome: 'Estágio Curricular Supervisionado I', codigo: 'TI-308', docente: 'Comissão de Estágios', cargaHoraria: '120h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 4,
        titulo: '4.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ti-4-1-aud', nome: 'Auditoria de Sistemas e Segurança da Informação', codigo: 'TI-401', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ti-4-1-iot', nome: 'Internet das Coisas (IoT) e Sistemas Embebidos', codigo: 'TI-402', docente: 'Prof. Dr. António Silva', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ti-4-1-emp', nome: 'Empreendedorismo Tecnológico e Modelos de Negócio', codigo: 'TI-403', docente: 'Msc. Carlos Mondlane', cargaHoraria: '50h', estado: 'Disponível' },
              { id: 'ti-4-1-sem', nome: 'Seminário de Trabalho de Fim de Curso (TFC)', codigo: 'TI-404', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ti-4-2-tfc', nome: 'Trabalho de Fim de Curso (TFC / Monografia)', codigo: 'TI-405', docente: 'Orientador Académico', cargaHoraria: '200h', estado: 'Disponível' },
              { id: 'ti-4-2-estag2', nome: 'Estágio Profissional Integrador II', codigo: 'TI-406', docente: 'Gabinete de Saídas Profissionais', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Licenciatura em Engenharia Informática': {
    duracaoAnos: 4,
    nivel: 'Licenciatura (Ensino Superior)',
    grau: 'Engenheiro(a) Informático(a)',
    cargaHorariaTotal: '2.500 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ei-1-1-calc', nome: 'Cálculo Diferencial e Integral I', codigo: 'EI-101', docente: 'Prof. Dr. Silva Langa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-1-1-prog', nome: 'Programação de Computadores I (C/C++)', codigo: 'EI-102', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-1-1-fis',  nome: 'Física Geral e Eletromagnetismo', codigo: 'EI-103', docente: 'Prof. Msc. Pedro Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-1-1-met',  nome: 'Metodologia do Trabalho Científico', codigo: 'EI-104', docente: 'Dra. Isabel Sitoe', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ei-1-2-calc2', nome: 'Cálculo Diferencial e Integral II', codigo: 'EI-105', docente: 'Prof. Dr. Silva Langa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-1-2-prog2', nome: 'Algoritmos e Estruturas de Dados Avançadas', codigo: 'EI-106', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-1-2-circ',  nome: 'Circuitos Digitais e Eletrónica', codigo: 'EI-107', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-1-2-est',   nome: 'Probabilidade e Estatística para Engenharia', codigo: 'EI-108', docente: 'Prof. Msc. João Langa', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ei-2-1-arq', nome: 'Arquitetura Avançada de Computadores e Assembly', codigo: 'EI-201', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-2-1-so',  nome: 'Sistemas Operativos e Concorrência', codigo: 'EI-202', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-2-1-bd',  nome: 'Sistemas de Gestão de Bases de Dados', codigo: 'EI-203', docente: 'Dra. Marta Tembe', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-2-1-red', nome: 'Redes de Comunicação de Alta Velocidade', codigo: 'EI-204', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ei-2-2-eng',  nome: 'Engenharia de Software e Arquiteturas de Sistemas', codigo: 'EI-205', docente: 'Prof. Dr. António Silva', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-2-2-dist', nome: 'Sistemas Distribuídos e Computação Paralela', codigo: 'EI-206', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-2-2-web',  nome: 'Engenharia Web e APIs Empresariais', codigo: 'EI-207', docente: 'Prof. Dr. António Silva', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-2-2-comp', nome: 'Teoria da Computação e Linguagens Formais', codigo: 'EI-208', docente: 'Prof. Msc. João Langa', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ei-3-1-ia', nome: 'Inteligência Artificial e Agentes Inteligentes', codigo: 'EI-301', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-3-1-seg', nome: 'Segurança Informática e Criptografia', codigo: 'EI-302', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-3-1-emb', nome: 'Sistemas Embebidos e Robótica', codigo: 'EI-303', docente: 'Prof. Eng. Pedro Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-3-1-proj', nome: 'Gestão de Projetos de Engenharia de Software', codigo: 'EI-304', docente: 'Dra. Sandra Mondlane', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ei-3-2-compil', nome: 'Compiladores e Interpretadores', codigo: 'EI-305', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-3-2-cg', nome: 'Computação Gráfica e Realidade Virtual', codigo: 'EI-306', docente: 'Prof. Msc. Rui Nhantumbo', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-3-2-cloud', nome: 'Cloud Computing e DevOps para Engenharia', codigo: 'EI-307', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-3-2-estag', nome: 'Estágio Curricular Supervisionado em Engenharia', codigo: 'EI-308', docente: 'Comissão de Estágios', cargaHoraria: '140h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 4,
        titulo: '4.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ei-4-1-ml', nome: 'Machine Learning e Visão Computacional', codigo: 'EI-401', docente: 'Prof. Dr. Tomás Macuácua', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ei-4-1-aud', nome: 'Auditoria de Sistemas Críticos e Conformidade', codigo: 'EI-402', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ei-4-1-sem', nome: 'Seminário de Projeto de Engenharia (TFC)', codigo: 'EI-403', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ei-4-2-tfc', nome: 'Trabalho de Fim de Curso de Engenharia (TFC)', codigo: 'EI-404', docente: 'Orientador de Engenharia', cargaHoraria: '240h', estado: 'Disponível' },
              { id: 'ei-4-2-estag2', nome: 'Estágio Profissional em Ambiente Industrial', codigo: 'EI-405', docente: 'Gabinete de Estágios', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Licenciatura em Gestão de Empresas': {
    duracaoAnos: 4,
    nivel: 'Licenciatura (Ensino Superior)',
    grau: 'Licenciado(a) em Gestão de Empresas',
    cargaHorariaTotal: '2.400 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ges-1-1-intro', nome: 'Introdução à Gestão e Teoria das Organizações', codigo: 'GES-101', docente: 'Prof. Msc. Carlos Mondlane', cargaHoraria: '60h', estado: 'Disponível', salaId: 'sala-gest-mark-2026' },
              { id: 'ges-1-1-cont', nome: 'Contabilidade Financeira Geral I', codigo: 'GES-102', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-1-1-micro', nome: 'Microeconomia Aplicada às Empresas', codigo: 'GES-103', docente: 'Dra. Elsa Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-1-1-mat', nome: 'Matemática Financeira e Aplicada à Gestão', codigo: 'GES-104', docente: 'Prof. Msc. João Langa', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ges-1-2-comp', nome: 'Comportamento Organizacional e Liderança', codigo: 'GES-105', docente: 'Dra. Sandra Mondlane', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-1-2-cont2', nome: 'Contabilidade Financeira Geral II', codigo: 'GES-106', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-1-2-macro', nome: 'Macroeconomia e Políticas Macroeconómicas', codigo: 'GES-107', docente: 'Dra. Elsa Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-1-2-dir', nome: 'Direito Comercial e das Sociedades em Moçambique', codigo: 'GES-108', docente: 'Dr. Lucas Mabote', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ges-2-1-mark', nome: 'Marketing Estratégico e Gestão de Marcas', codigo: 'GES-201', docente: 'Prof. Msc. Carlos Mondlane', cargaHoraria: '64h', estado: 'Disponível', salaId: 'sala-gest-mark-2026' },
              { id: 'ges-2-1-gestfin', nome: 'Gestão Financeira I (Análise Financeira)', codigo: 'GES-202', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-2-1-custos', nome: 'Contabilidade de Gestão e Custos Industriais', codigo: 'GES-203', docente: 'Dra. Elsa Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-2-1-estat', nome: 'Estatística e Análise de Dados para Negócios', codigo: 'GES-204', docente: 'Prof. Msc. João Langa', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ges-2-2-gestfin2', nome: 'Gestão Financeira II (Decisões de Investimento)', codigo: 'GES-205', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-2-2-oper', nome: 'Gestão de Operações e Cadeia de Abastecimento', codigo: 'GES-206', docente: 'Msc. Carlos Mondlane', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-2-2-rh', nome: 'Gestão Estratégica de Recursos Humanos', codigo: 'GES-207', docente: 'Dra. Sandra Mondlane', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-2-2-fisc', nome: 'Fiscalidade Moçambicana (IRPC, IRPS, IVA)', codigo: 'GES-208', docente: 'Dr. Lucas Mabote', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ges-3-1-estrat', nome: 'Estratégia Empresarial e Competitividade', codigo: 'GES-301', docente: 'Prof. Msc. Carlos Mondlane', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-3-1-aud', nome: 'Auditoria e Controlo de Gestão', codigo: 'GES-302', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-3-1-emp', nome: 'Empreendedorismo e Planos de Negócios', codigo: 'GES-303', docente: 'Dra. Sandra Mondlane', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-3-1-inv', nome: 'Metodologia de Investigação em Ciências Empresariais', codigo: 'GES-304', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ges-3-2-proj', nome: 'Avaliação e Gestão de Projetos de Investimento', codigo: 'GES-305', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'ges-3-2-inter', nome: 'Comércio Internacional e Negócios Globais', codigo: 'GES-306', docente: 'Dra. Elsa Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-3-2-sist', nome: 'Sistemas de Informação de Gestão (ERP/SAP)', codigo: 'GES-307', docente: 'Prof. Eng. Manuel Cossa', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-3-2-estag', nome: 'Estágio Curricular Supervisionado em Gestão', codigo: 'EI-308', docente: 'Comissão de Estágios', cargaHoraria: '120h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 4,
        titulo: '4.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'ges-4-1-gov', nome: 'Governação Corporativa e Ética nos Negócios', codigo: 'GES-401', docente: 'Dr. Lucas Mabote', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-4-1-inov', nome: 'Inovação e Transformação Digital de Empresas', codigo: 'GES-402', docente: 'Prof. Msc. Carlos Mondlane', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'ges-4-1-sem', nome: 'Seminário de Monografia / TFC', codigo: 'GES-403', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'ges-4-2-tfc', nome: 'Trabalho de Fim de Curso (TFC / Monografia)', codigo: 'GES-404', docente: 'Orientador Académico', cargaHoraria: '200h', estado: 'Disponível' },
              { id: 'ges-4-2-estag2', nome: 'Estágio Profissional Integrador', codigo: 'GES-405', docente: 'Gabinete de Estágios', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Licenciatura em Enfermagem Geral': {
    duracaoAnos: 4,
    nivel: 'Licenciatura (Ensino Superior)',
    grau: 'Licenciado(a) em Enfermagem Geral',
    cargaHorariaTotal: '2.800 Horas (inclui 900h estágio clínico)',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'enf-1-1-anat', nome: 'Anatomia e Fisiologia Humana I', codigo: 'ENF-101', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-enf-anat-2026' },
              { id: 'enf-1-1-bio', nome: 'Biologia Celular e Bioquímica em Saúde', codigo: 'ENF-102', docente: 'Dr. Mateus Nhaca', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'enf-1-1-fund', nome: 'Fundamentos de Enfermagem I (Bases Teóricas)', codigo: 'ENF-103', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'enf-1-1-etica', nome: 'Ética, Deontologia e Legislação em Enfermagem', codigo: 'ENF-104', docente: 'Dr. Lucas Mabote', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'enf-1-2-anat2', nome: 'Anatomia e Fisiologia Humana II', codigo: 'ENF-105', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-enf-anat-2026' },
              { id: 'enf-1-2-fund2', nome: 'Fundamentos de Enfermagem II (Oficinas Práticas)', codigo: 'ENF-106', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-1-2-micro', nome: 'Microbiologia, Parasitologia e Biossegurança', codigo: 'ENF-107', docente: 'Dr. Mateus Nhaca', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'enf-1-2-comun', nome: 'Saúde Comunitária e Cuidados Primários de Saúde', codigo: 'ENF-108', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'enf-2-1-semiol', nome: 'Semiologia e Propedêutica Clínica em Enfermagem', codigo: 'ENF-201', docente: 'Dr. Alberto Machava', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-2-1-farmac', nome: 'Farmacologia Aplicada à Enfermagem', codigo: 'ENF-202', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'enf-2-1-patol', nome: 'Patologia Médica Geral', codigo: 'ENF-203', docente: 'Dr. Alberto Machava', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'enf-2-1-nutri', nome: 'Nutrição Clínica e Dietética em Saúde', codigo: 'ENF-204', docente: 'Dra. Esperança Mondlane', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'enf-2-2-medcir1', nome: 'Enfermagem Médico-Cirúrgica I', codigo: 'ENF-205', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-2-2-farmac2', nome: 'Administração Medicamentosa e Terapias Intravenosas', codigo: 'ENF-206', docente: 'Dr. Farm. João Chissano', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'enf-2-2-epidem', nome: 'Epidemiologia e Vigilância em Saúde Pública', codigo: 'ENF-207', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'enf-2-2-estag1', nome: 'Estágio Clínico Supervisionado I (Centros de Saúde)', codigo: 'ENF-208', docente: 'Supervisores de Estágio', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'enf-3-1-medcir2', nome: 'Enfermagem Médico-Cirúrgica II e Cuidados Intensivos', codigo: 'ENF-301', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-3-1-smi', nome: 'Saúde Materno-Infantil e Obstetrícia em Enfermagem', codigo: 'ENF-302', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-3-1-urg', nome: 'Emergências Médicas e Suporte Avançado de Vida', codigo: 'ENF-303', docente: 'Dr. Alberto Machava', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'enf-3-1-metod', nome: 'Metodologia de Investigação Científica em Enfermagem', codigo: 'ENF-304', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'enf-3-2-pediat', nome: 'Enfermagem Pediátrica e Neonatologia', codigo: 'ENF-305', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'enf-3-2-saument', nome: 'Enfermagem de Saúde Mental e Psiquiatria', codigo: 'ENF-306', docente: 'Dr. Lucas Mabote', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'enf-3-2-gestserv', nome: 'Gestão de Serviços e Liderança em Enfermagem', codigo: 'ENF-307', docente: 'Msc. Carlos Mucavele', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'enf-3-2-estag2', nome: 'Estágio Clínico Supervisionado II (Hospitais Gerais)', codigo: 'ENF-308', docente: 'Supervisores Hospitalares', cargaHoraria: '200h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 4,
        titulo: '4.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'enf-4-1-paliat', nome: 'Cuidados Paliativos e Dor Crónica', codigo: 'ENF-401', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'enf-4-1-sauocup', nome: 'Saúde Ocupacional e do Trabalho', codigo: 'ENF-402', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'enf-4-1-sem', nome: 'Seminário de Monografia / TFC em Enfermagem', codigo: 'ENF-403', docente: 'Prof. Dr. Paulo Guambe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'enf-4-2-tfc', nome: 'Trabalho de Fim de Curso (TFC / Monografia)', codigo: 'ENF-404', docente: 'Orientador Académico', cargaHoraria: '200h', estado: 'Disponível' },
              { id: 'enf-4-2-estagfinal', nome: 'Estágio Integrado Final e Exame de Aptidão Profissional', codigo: 'ENF-405', docente: 'Gabinete de Estágios', cargaHoraria: '300h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  // Cursos Técnicos Médios IFOPTEC (3 Anos)
  'Técnico de Medicina Geral': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnico Médio de Medicina Geral',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tmg-1-1-anat', nome: 'Anatomia e Fisiologia Humana I', codigo: 'TMG-101', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tmg-1-1-bioq', nome: 'Biologia Celular e Bioquímica Básica', codigo: 'TMG-102', docente: 'Dr. Mateus Nhaca', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'tmg-1-1-comun', nome: 'Saúde Comunitária e Atenção Primária', codigo: 'TMG-103', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'tmg-1-1-etica', nome: 'Deontologia Profissional e Relação Técnico-Utente', codigo: 'TMG-104', docente: 'Dr. Alberto Machava', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tmg-1-2-anat2', nome: 'Anatomia e Fisiologia Humana II', codigo: 'TMG-105', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tmg-1-2-micro', nome: 'Microbiologia, Parasitologia e Doenças Endémicas', codigo: 'TMG-106', docente: 'Dr. Mateus Nhaca', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tmg-1-2-sinais', nome: 'Procedimentos de Primeiros Socorros e Triagem', codigo: 'TMG-107', docente: 'Dr. Alberto Machava', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tmg-2-1-semiol', nome: 'Semiologia e Propedêutica Médica', codigo: 'IFOP-TMG-2026', docente: 'Dr. Alberto Machava', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-ifop-med-geral-2026' },
              { id: 'tmg-2-1-farmac', nome: 'Farmacologia Clínica e Terapêutica Aplicada', codigo: 'TMG-202', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tmg-2-1-patmed', nome: 'Patologia Médica dos Principais Sistemas', codigo: 'TMG-203', docente: 'Dr. Alberto Machava', cargaHoraria: '70h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tmg-2-2-patcir', nome: 'Patologia Cirúrgica e Pequena Cirurgia em Centro de Saúde', codigo: 'TMG-204', docente: 'Dr. Alberto Machava', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tmg-2-2-urg', nome: 'Urgências Clínicas e Suporte Básico de Vida', codigo: 'TMG-205', docente: 'Dr. Alberto Machava', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tmg-2-2-estag1', nome: 'Estágio Clínico em Consulta Geral e Internamento I', codigo: 'TMG-206', docente: 'Supervisores Clínicos', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tmg-3-1-smi', nome: 'Saúde Materno-Infantil e Puericultura', codigo: 'TMG-301', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tmg-3-1-infec', nome: 'Doenças Infecciosas, Malária, HIV/SIDA e Tuberculose', codigo: 'TMG-302', docente: 'Dr. Mateus Nhaca', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tmg-3-1-gest', nome: 'Gestão de Centros e Postos de Saúde (SISMA)', codigo: 'TMG-303', docente: 'Msc. Carlos Mucavele', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tmg-3-2-estagfinal', nome: 'Estágio Hospitalar Integrado de Fim de Curso', codigo: 'TMG-304', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '320h', estado: 'Disponível' },
              { id: 'tmg-3-2-exame', nome: 'Exame de Aptidão Profissional em Medicina Geral', codigo: 'TMG-305', docente: 'Júri Oficial MISAU / IFOPTEC', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Técnico de Enfermagem Geral': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnico Médio de Enfermagem Geral',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'teg-1-1-fund', nome: 'Fundamentos de Enfermagem & Técnicas de Tratamento', codigo: 'IFOP-TEG-2026', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-ifop-enf-geral-2026' },
              { id: 'teg-1-1-anat', nome: 'Anatomia e Fisiologia Humana Básica', codigo: 'TEG-102', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'teg-1-1-etica', nome: 'Ética, Deontologia e Relações Humanas', codigo: 'TEG-103', docente: 'Dr. Lucas Mabote', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'teg-1-2-bio', nome: 'Higiene Hospitalar, Esterilização e Biossegurança', codigo: 'TEG-104', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'teg-1-2-sinais', nome: 'Avaliação de Sinais Vitais e Exames Complementares', codigo: 'TEG-105', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'teg-1-2-comun', nome: 'Saúde Comunitária e Prevenção de Doenças', codigo: 'TEG-106', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'teg-2-1-farm', nome: 'Farmacologia em Enfermagem e Administração Medicamentosa', codigo: 'TEG-201', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'teg-2-1-medcir', nome: 'Enfermagem Médico-Cirúrgica I', codigo: 'TEG-202', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'teg-2-1-feridas', nome: 'Tratamento de Feridas, Queimaduras e Curativos', codigo: 'TEG-203', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'teg-2-2-medcir2', nome: 'Enfermagem Médico-Cirúrgica II e Bloco Operatório', codigo: 'TEG-204', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'teg-2-2-estag1', nome: 'Estágio Hospitalar Supervisionado I (Enfermarias)', codigo: 'TEG-205', docente: 'Supervisores de Estágio', cargaHoraria: '180h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'teg-3-1-smi', nome: 'Cuidados de Enfermagem Materno-Infantil e Neonatal', codigo: 'TEG-301', docente: 'Dra. Esperança Mondlane', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'teg-3-1-urg', nome: 'Urgências e Cuidados Críticos em Saúde', codigo: 'TEG-302', docente: 'Dr. Alberto Machava', cargaHoraria: '70h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'teg-3-2-estagfinal', nome: 'Estágio Hospitalar Final e Prova Prática de Aptidão', codigo: 'TEG-303', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '300h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Enfermagem de Saúde Materno e Infantil': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnica Média de Saúde Materno e Infantil',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'smi-1-1-anat', nome: 'Anatomia e Fisiologia do Aparelho Reprodutor', codigo: 'SMI-101', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'smi-1-1-reprod', nome: 'Saúde Sexual e Reprodutiva e Planeamento Familiar', codigo: 'SMI-102', docente: 'Dra. Esperança Mondlane', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'smi-1-1-fund', nome: 'Fundamentos de Enfermagem em Saúde da Mulher', codigo: 'SMI-103', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'smi-1-2-prenatal', nome: 'Obstetrícia e Vigilância Pré-Natal Focada', codigo: 'IFOP-SMI-2026', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-ifop-smi-2026' },
              { id: 'smi-1-2-embrio', nome: 'Embriologia e Desenvolvimento Fetal', codigo: 'SMI-105', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'smi-1-2-nutri', nome: 'Nutrição Materno-Infantil e PAI (Vacinação)', codigo: 'SMI-106', docente: 'Dra. Esperança Mondlane', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'smi-2-1-parto', nome: 'Trabalho de Parto, Partograma e Parto Humanizado', codigo: 'SMI-201', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-ifop-smi-2026' },
              { id: 'smi-2-1-neo', nome: 'Cuidados Imediatos ao Recém-Nascido e Reanimação', codigo: 'SMI-202', docente: 'Dra. Esperança Mondlane', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'smi-2-1-puerp', nome: 'Vigilância do Puerpério e Aleitamento Materno', codigo: 'SMI-203', docente: 'Enf.ª Ana Paula Tembe', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'smi-2-2-patolobs', nome: 'Patologia Obstétrica e Complicações do Parto', codigo: 'SMI-204', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'smi-2-2-estagmatern', nome: 'Estágio Prático em Bloco de Partos e Maternidade', codigo: 'SMI-205', docente: 'Supervisores de Maternidade', cargaHoraria: '180h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'smi-3-1-pediat', nome: 'Pediatria e Consulta de Criança Sadia (CCS)', codigo: 'SMI-301', docente: 'Dra. Esperança Mondlane', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'smi-3-1-ptv', nome: 'Prevenção da Transmissão Vertical (PTV) e Cuidados de HIV', codigo: 'SMI-302', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'smi-3-2-estagfinal', nome: 'Estágio Integrado de SMI e Prova Final de Qualificação', codigo: 'SMI-303', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '320h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Técnico de Farmácia': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnico Médio de Farmácia',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tf-1-1-quim', nome: 'Química Geral e Orgânica Farmacêutica', codigo: 'TF-101', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tf-1-1-anat', nome: 'Anatomia e Fisiologia Humana Básica', codigo: 'TF-102', docente: 'Dra. Maria Helena Mabunda', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'tf-1-1-etica', nome: 'Deontologia e Legislação Farmacêutica Nacional', codigo: 'TF-103', docente: 'Dr. Farm. João Chissano', cargaHoraria: '45h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tf-1-2-farmacotec', nome: 'Farmacotécnica e Formas Farmacêuticas I', codigo: 'IFOP-TF-2026', docente: 'Dr. Farm. João Chissano', cargaHoraria: '80h', estado: 'Disponível', salaId: 'sala-ifop-farmacia-2026' },
              { id: 'tf-1-2-micro', nome: 'Microbiologia e Controlo de Qualidade de Fármacos', codigo: 'TF-105', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'tf-1-2-calc', nome: 'Cálculos e Dosagens Farmacêuticas', codigo: 'TF-106', docente: 'Dr. Farm. João Chissano', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tf-2-1-farmacol', nome: 'Farmacologia Geral e Especial I', codigo: 'TF-201', docente: 'Dr. Farm. João Chissano', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tf-2-1-dispens', nome: 'Dispensação Medicamentosa e Atendimento ao Utente', codigo: 'TF-202', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tf-2-1-logist', nome: 'Gestão e Logística de Medicamentos (SIGLUS/MEDEX)', codigo: 'TF-203', docente: 'Msc. Carlos Mucavele', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tf-2-2-farmacol2', nome: 'Farmacologia Especial II e Toxicologia', codigo: 'TF-204', docente: 'Dr. Farm. João Chissano', cargaHoraria: '80h', estado: 'Disponível' },
              { id: 'tf-2-2-estag1', nome: 'Estágio em Farmácia Comunitária e Privada', codigo: 'TF-205', docente: 'Supervisores de Estágio', cargaHoraria: '160h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tf-3-1-farmhosp', nome: 'Farmácia Hospitalar e Cadeia de Frio', codigo: 'TF-301', docente: 'Dr. Farm. João Chissano', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tf-3-1-farmvig', nome: 'Farmacovigilância e Reações Adversas a Medicamentos', codigo: 'TF-302', docente: 'Dr. Farm. João Chissano', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tf-3-2-estaghosp', nome: 'Estágio em Depósitos e Farmácia Hospitalar', codigo: 'TF-303', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '300h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Gestão e Administração Hospitalar': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnico Médio de Gestão Hospitalar',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'gah-1-1-intro', nome: 'Princípios de Administração e Gestão Hospitalar', codigo: 'GAH-101', docente: 'Msc. Carlos Mucavele', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'gah-1-1-sis', nome: 'Sistemas de Informação em Saúde (SISMA / DHIS2)', codigo: 'IFOP-GAH-2026', docente: 'Msc. Carlos Mucavele', cargaHoraria: '70h', estado: 'Disponível', salaId: 'sala-ifop-gestao-hosp-2026' },
              { id: 'gah-1-1-cont', nome: 'Contabilidade e Finanças para Unidades de Saúde', codigo: 'GAH-103', docente: 'Dr. Fernando Bila', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'gah-1-2-fatur', nome: 'Faturação em Saúde, Seguros e Cobrança Hospitalar', codigo: 'GAH-104', docente: 'Dr. Fernando Bila', cargaHoraria: '64h', estado: 'Disponível' },
              { id: 'gah-1-2-arq', nome: 'Gestão de Arquivo Clínico e Processo Individual do Utente', codigo: 'GAH-105', docente: 'Msc. Carlos Mucavele', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'gah-1-2-legis', nome: 'Legislação e Ética Hospitalar Moçambicana', codigo: 'GAH-106', docente: 'Dr. Lucas Mabote', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'gah-2-1-logist', nome: 'Logística, Gestão de Stocks e Aprovisionamento Hospitalar', codigo: 'GAH-201', docente: 'Msc. Carlos Mucavele', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'gah-2-1-rh', nome: 'Gestão de Recursos Humanos e Escalas de Plantão', codigo: 'GAH-202', docente: 'Dra. Sandra Mondlane', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'gah-2-2-qualid', nome: 'Auditoria e Gestão da Qualidade dos Serviços Hospitalares', codigo: 'GAH-203', docente: 'Msc. Carlos Mucavele', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'gah-2-2-estag1', nome: 'Estágio Supervisionado em Secretaria e Administração Clínica', codigo: 'GAH-204', docente: 'Supervisores Hospitalares', cargaHoraria: '180h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'gah-3-1-estat', nome: 'Estatística Hospitalar e Relatórios Gerenciais', codigo: 'GAH-301', docente: 'Msc. Carlos Mucavele', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'gah-3-1-infra', nome: 'Manutenção Hospitalar e Gestão de Resíduos Médicos', codigo: 'GAH-302', docente: 'Dr. Mateus Nhaca', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'gah-3-2-estagfinal', nome: 'Estágio Integrado de Direção e Gestão Hospitalar', codigo: 'GAH-303', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '300h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  },

  'Técnico de Saúde Preventiva - Agente Polivalente de Saúde': {
    duracaoAnos: 3,
    nivel: 'Técnico Médio Profissionalizante',
    grau: 'Técnico Médio de Saúde Preventiva (APS)',
    cargaHorariaTotal: '2.100 Horas',
    anos: [
      {
        ano: 1,
        titulo: '1.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tsp-1-1-vig', nome: 'Vigilância Epidemiológica e Saúde Comunitária', codigo: 'IFOP-TSP-2026', docente: 'Dr. Mateus Nhaca', cargaHoraria: '70h', estado: 'Disponível', salaId: 'sala-ifop-saude-prev-2026' },
              { id: 'tsp-1-1-san', nome: 'Higiene e Saneamento do Meio', codigo: 'TSP-102', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'tsp-1-1-comun', nome: 'Educação Comunitária e Comunicação em Saúde', codigo: 'TSP-103', docente: 'Dra. Esperança Mondlane', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tsp-1-2-endem', nome: 'Doenças Endémicas e Controlo de Vetores', codigo: 'TSP-104', docente: 'Dr. Mateus Nhaca', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tsp-1-2-agua', nome: 'Qualidade da Água, Desinfeção e Saneamento Básico', codigo: 'TSP-105', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 2,
        titulo: '2.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tsp-2-1-vac', nome: 'Programa Alargado de Vacinação (PAI) e Imunizações', codigo: 'TSP-201', docente: 'Dra. Esperança Mondlane', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tsp-2-1-nutri', nome: 'Nutrição Comunitária e Segurança Alimentar', codigo: 'TSP-202', docente: 'Dra. Esperança Mondlane', cargaHoraria: '60h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tsp-2-2-surto', nome: 'Investigação e Resposta a Surtos Epidémicos (Cólera/Malária)', codigo: 'TSP-203', docente: 'Dr. Mateus Nhaca', cargaHoraria: '70h', estado: 'Disponível' },
              { id: 'tsp-2-2-estag1', nome: 'Estágio Supervisionado em Brigadas de Saúde Comunitária', codigo: 'TSP-204', docente: 'Supervisores de Saúde Pública', cargaHoraria: '180h', estado: 'Disponível' }
            ]
          }
        ]
      },
      {
        ano: 3,
        titulo: '3.º Ano',
        semestres: [
          {
            semestre: 1,
            titulo: '1.º Semestre',
            modulos: [
              { id: 'tsp-3-1-sauocup', nome: 'Saúde Ambiental e Riscos Ocupacionais em Comunidades', codigo: 'TSP-301', docente: 'Dr. Mateus Nhaca', cargaHoraria: '60h', estado: 'Disponível' },
              { id: 'tsp-3-1-gest', nome: 'Gestão de Programas Sanitários Distritais', codigo: 'TSP-302', docente: 'Msc. Carlos Mucavele', cargaHoraria: '50h', estado: 'Disponível' }
            ]
          },
          {
            semestre: 2,
            titulo: '2.º Semestre',
            modulos: [
              { id: 'tsp-3-2-estagfinal', nome: 'Estágio Comunitário Final e Avaliação Prática de Aptidão', codigo: 'TSP-303', docente: 'Gabinete de Estágios IFOPTEC', cargaHoraria: '300h', estado: 'Disponível' }
            ]
          }
        ]
      }
    ]
  }
};

// Obter estrutura curricular de um curso específico com fallback dinâmico
export function getEstruturaCurricular(cursoNome) {
  if (CURRICULOS_POR_CURSO[cursoNome]) {
    return CURRICULOS_POR_CURSO[cursoNome];
  }

  // Fallback estruturado inteligente para outros cursos
  const isTecnico = cursoNome.toLowerCase().includes('técnico') || cursoNome.toLowerCase().includes('curta');
  const duracaoAnos = isTecnico ? 3 : 4;

  const anos = [];
  for (let a = 1; a <= duracaoAnos; a++) {
    anos.push({
      ano: a,
      titulo: `${a}.º Ano`,
      semestres: [
        {
          semestre: 1,
          titulo: '1.º Semestre',
          modulos: [
            { id: `mod-${a}-1-1`, nome: `Módulo Curricular I — ${a}.º Ano`, codigo: `DISC-${a}01`, docente: 'Corpo Docente Responsável', cargaHoraria: '64h', estado: 'Disponível' },
            { id: `mod-${a}-1-2`, nome: `Módulo Curricular II — ${a}.º Ano`, codigo: `DISC-${a}02`, docente: 'Corpo Docente Responsável', cargaHoraria: '60h', estado: 'Disponível' },
            { id: `mod-${a}-1-3`, nome: `Módulo Teórico-Prático III`, codigo: `DISC-${a}03`, docente: 'Corpo Docente Responsável', cargaHoraria: '50h', estado: 'Disponível' }
          ]
        },
        {
          semestre: 2,
          titulo: '2.º Semestre',
          modulos: [
            { id: `mod-${a}-2-1`, nome: `Módulo Curricular IV — ${a}.º Ano`, codigo: `DISC-${a}04`, docente: 'Corpo Docente Responsável', cargaHoraria: '64h', estado: 'Disponível' },
            { id: `mod-${a}-2-2`, nome: `Módulo Curricular V — ${a}.º Ano`, codigo: `DISC-${a}05`, docente: 'Corpo Docente Responsável', cargaHoraria: '60h', estado: 'Disponível' },
            { id: `mod-${a}-2-3`, nome: `Sessões Práticas & Laboratório Integrado`, codigo: `DISC-${a}06`, docente: 'Corpo Docente Responsável', cargaHoraria: '50h', estado: 'Disponível' }
          ]
        }
      ]
    });
  }

  return {
    duracaoAnos,
    nivel: isTecnico ? 'Técnico Médio' : 'Licenciatura',
    grau: `Qualificação em ${cursoNome}`,
    cargaHorariaTotal: `${duracaoAnos * 600} Horas`,
    anos
  };
}

export default {
  CURRICULOS_POR_CURSO,
  getEstruturaCurricular,
  getInformacoesGeraisPadrao
};
