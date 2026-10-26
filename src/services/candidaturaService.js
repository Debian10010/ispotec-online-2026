import { api } from './api';

export const ESTADOS_CANDIDATURA = [
  'Submetida',
  'Em análise',
  'A aguardar documentos',
  'A aguardar validação de pagamento',
  'Aprovada',
  'Rejeitada',
  'Rascunho'
];

export const ESTADOS_PAGAMENTO = [
  'Pendente de verificação',
  'Validado',
  'Rejeitado'
];

export const NIVEIS_INGRESSO = [
  '12.ª Classe',
  'Ensino Técnico',
  'Técnico Médio',
  'Licenciatura',
  'Outro'
];

export const PROVINCIAS_MOCAMBIQUE = [
  'Maputo Província',
  'Maputo Cidade',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Cabo Delgado',
  'Niassa'
];

export const OFERTA_FORMATIVA_ISPOTEC_2027 = [
  // 1. Mestrado
  {
    id: 'mestrado-saude-publica',
    grau: 'Mestrado',
    nome: 'Mestrado em Saúde Pública',
    duracao: '2 anos, com estágios',
    propinaMensal: 10000,
    matricula: 5000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Semi-presencial', 'Distância (Online)'],
    requisitos: 'Licenciatura em Ciências da Saúde, Ciências Biológicas ou áreas afins',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🔬'
  },

  // 2. Licenciaturas (4 anos, 4.000 MT matrícula)
  {
    id: 'lic-enfermagem-geral',
    grau: 'Licenciatura',
    nome: 'Enfermagem Geral',
    duracao: '4 anos, com estágios',
    propinaMensal: 6500,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial'],
    requisitos: '12.ª Classe, Ensino Técnico ou Técnico Médio',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '💉'
  },
  {
    id: 'lic-psicologia-clinica',
    grau: 'Licenciatura',
    nome: 'Psicologia Clínica e Saúde no Trabalho',
    duracao: '4 anos, com estágios',
    propinaMensal: 6000,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial'],
    requisitos: '12.ª Classe, Ensino Técnico ou Técnico Médio',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🧠'
  },
  {
    id: 'lic-saude-publica',
    grau: 'Licenciatura',
    nome: 'Saúde Pública (Saúde Integrativa)',
    duracao: '4 anos, com estágios',
    propinaMensal: 6000,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial'],
    requisitos: '12.ª Classe, Ensino Técnico ou Técnico Médio',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🩺'
  },
  {
    id: 'lic-direito',
    grau: 'Licenciatura',
    nome: 'Direito',
    duracao: '4 anos, com estágios',
    propinaMensal: 5000,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Semi-presencial', 'Distância (Online)'],
    requisitos: '12.ª Classe ou equivalente',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '⚖️'
  },
  {
    id: 'lic-gestao-rh',
    grau: 'Licenciatura',
    nome: 'Administração e Gestão de Recursos Humanos',
    duracao: '4 anos, com estágios',
    propinaMensal: 5000,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial', 'Distância (Online)'],
    requisitos: '12.ª Classe, Ensino Técnico ou equivalente',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '📊'
  },
  {
    id: 'lic-contabilidade-financas',
    grau: 'Licenciatura',
    nome: 'Contabilidade e Finanças',
    duracao: '4 anos, com estágios',
    propinaMensal: 5000,
    matricula: 4000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial', 'Distância (Online)'],
    requisitos: '12.ª Classe, Ensino Técnico ou equivalente',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '💰'
  },

  // 3. Pós-Graduações (8 meses, 7.000 MT propina, 5.000 MT matrícula)
  // Ciências da Saúde e Clínicas
  {
    id: 'pos-enf-medica',
    grau: 'Pós-graduação',
    area: 'Ciências da Saúde e Clínicas',
    nome: 'Pós-Graduação em Enfermagem Médica e Práticas Clínicas',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura ou Bacharelato em Enfermagem ou Ciências da Saúde',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🏥'
  },
  {
    id: 'pos-saude-integrativa-terapia',
    grau: 'Pós-graduação',
    area: 'Ciências da Saúde e Clínicas',
    nome: 'Pós-Graduação em Saúde Integrativa e Terapia Biopsicossocial',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Saúde, Psicologia ou áreas afins',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🌿'
  },
  {
    id: 'pos-enf-obstetrica',
    grau: 'Pós-graduação',
    area: 'Ciências da Saúde e Clínicas',
    nome: 'Pós-Graduação em Enfermagem Obstétrica e Pediátrica',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Enfermagem',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '👶'
  },
  {
    id: 'pos-doencas-tropicais',
    grau: 'Pós-graduação',
    area: 'Ciências da Saúde e Clínicas',
    nome: 'Pós-Graduação em Ciências da Saúde e Doenças Tropicais',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Ciências Médicas, Biológicas ou afins',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🌍'
  },
  {
    id: 'pos-doencas-cronicas',
    grau: 'Pós-graduação',
    area: 'Ciências da Saúde e Clínicas',
    nome: 'Pós-Graduação em Saúde Integrativa e Doenças Crónicas',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Saúde ou áreas afins',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🩺'
  },

  // Administração e Ciências Jurídicas
  {
    id: 'pos-direito-trabalho',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Direito do Trabalho e Processo Laboral',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Direito, Gestão ou Recursos Humanos',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '📜'
  },
  {
    id: 'pos-direito-civil',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Direito Civil e Processual Civil',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Direito',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '⚖️'
  },
  {
    id: 'pos-direito-penal',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Direito Penal e Processual Penal',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Direito ou Ciências Criminais',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🏛️'
  },
  {
    id: 'pos-direito-fiscal',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Direito Administrativo e Fiscal',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Direito, Economia ou Gestão',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '📑'
  },
  {
    id: 'pos-mediacao-arbitragem',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Mediação e Arbitragem',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Direito ou Ciências Sociais',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '🤝'
  },
  {
    id: 'pos-inteligencia-estrategica',
    grau: 'Pós-graduação',
    area: 'Administração e Ciências Jurídicas',
    nome: 'Pós-Graduação em Administração e Inteligência Estratégica',
    duracao: '8 meses',
    propinaMensal: 7000,
    matricula: 5000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)'],
    requisitos: 'Licenciatura em Gestão, Administração ou afins',
    nivelMinimo: 'Licenciatura',
    ativo: true,
    icone: '💡'
  },

  // 4. Especializações (5.000 MT propina, 3.000 MT matrícula)
  {
    id: 'esp-pedagogia-ead',
    grau: 'Especialização',
    nome: 'Especialização em Pedagogia, Didática e Ensino a Distância',
    duracao: '6 meses',
    propinaMensal: 5000,
    matricula: 3000,
    regimes: ['Pós-laboral', 'Laboral'],
    modalidades: ['Distância (Online)', 'Semi-presencial'],
    requisitos: 'Docentes e profissionais do ensino ou formação técnica',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '📘'
  },
  {
    id: 'esp-planificacao-supervisao',
    grau: 'Especialização',
    nome: 'Especialização em Planificação e Supervisão Pedagógica',
    duracao: '6 meses',
    propinaMensal: 5000,
    matricula: 3000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)', 'Semi-presencial'],
    requisitos: 'Licenciatura ou Formação em Educação / Gestão Escolar',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '📐'
  },
  {
    id: 'esp-psicoterapia-ocupacional',
    grau: 'Especialização',
    nome: 'Especialização em Psicoterapia e Saúde Ocupacional',
    duracao: '6 meses',
    propinaMensal: 5000,
    matricula: 3000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)', 'Semi-presencial'],
    requisitos: 'Profissionais de Saúde, Psicologia e Segurança no Trabalho',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🧘'
  },
  {
    id: 'esp-enf-diabetica',
    grau: 'Especialização',
    nome: 'Especialização em Enfermagem Diabética e Nutricional',
    duracao: '6 meses',
    propinaMensal: 5000,
    matricula: 3000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)', 'Semi-presencial'],
    requisitos: 'Profissionais de Enfermagem e Nutrição',
    nivelMinimo: 'Técnico Médio',
    ativo: true,
    icone: '🥗'
  },
  {
    id: 'esp-enf-domiciliaria',
    grau: 'Especialização',
    nome: 'Especialização em Enfermagem de Cuidados Domiciliários e Reabilitação',
    duracao: '6 meses',
    propinaMensal: 5000,
    matricula: 3000,
    regimes: ['Pós-laboral'],
    modalidades: ['Distância (Online)', 'Semi-presencial'],
    requisitos: 'Profissionais de Enfermagem, Fisioterapia ou Cuidadores',
    nivelMinimo: 'Técnico Médio',
    ativo: true,
    icone: '🏡'
  },

  // 5. Curta Duração (2 meses, 3.500 MT propina, 2.000 MT matrícula)
  {
    id: 'curta-pedagogia-gestao',
    grau: 'Curta Duração',
    nome: 'Pedagogia e Gestão Académica',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Distância (Online)'],
    requisitos: 'Aberto a interessados com 10.ª ou 12.ª classe',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '⏱️'
  },
  {
    id: 'curta-emergencias-socorros',
    grau: 'Curta Duração',
    nome: 'Emergências Médicas e Primeiros Socorros',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial'],
    requisitos: 'Interessados em socorrismo, empresas e motoristas',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🚨'
  },
  {
    id: 'curta-enf-domiciliaria-reab',
    grau: 'Curta Duração',
    nome: 'Enfermagem Domiciliária e Reabilitação',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial'],
    requisitos: 'Auxiliares de saúde, cuidadores e técnicos',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🛌'
  },
  {
    id: 'curta-empreendedorismo-negocios',
    grau: 'Curta Duração',
    nome: 'Empreendedorismo e Gestão de Negócios',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial', 'Distância (Online)'],
    requisitos: 'Empreendedores e gestores de pequenas e médias empresas',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '🚀'
  },
  {
    id: 'curta-gestao-comercial-marketing',
    grau: 'Curta Duração',
    nome: 'Gestão Comercial e Marketing',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial', 'Distância (Online)'],
    requisitos: 'Profissionais de vendas e atendimento ao público',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '📈'
  },
  {
    id: 'curta-lideranca-rh',
    grau: 'Curta Duração',
    nome: 'Liderança e Gestão de Recursos Humanos',
    duracao: '2 meses',
    propinaMensal: 3500,
    matricula: 2000,
    regimes: ['Laboral', 'Pós-laboral'],
    modalidades: ['Presencial', 'Semi-presencial', 'Distância (Online)'],
    requisitos: 'Líderes de equipa, supervisores e quadros médios',
    nivelMinimo: '12.ª Classe',
    ativo: true,
    icone: '👥'
  }
];

const STORAGE_KEY = 'ispotec_candidaturas_2027';

// Inicializar candidaturas de teste realistas se a base de dados estiver vazia
function getStoredCandidaturas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // Dados iniciais de demonstração para o administrador poder rever de imediato
  const dadosExemplo = [
    {
      id: 'cnd_001',
      numeroCandidatura: 'ISP-2027-104928',
      anoCandidatura: '2027',
      dataSubmissao: '2026-10-22T09:30:00.000Z',
      estado: 'Submetida',
      estadoPagamento: 'Validado',
      dadosPessoais: {
        nome: 'Amélia Celeste Machava',
        dataNascimento: '1998-05-14',
        bi: '110293847501B',
        morada: 'Bairro da Matola C, Rua 12, Casa 45',
        provincia: 'Maputo Província',
        distrito: 'Matola',
        localidadeBairro: 'Matola C',
        telefonePrincipal: '841234567',
        telefoneAdicional1: '871234567',
        telefoneAdicional2: '',
        nomeEncarregado: 'Alberto Machava',
        contactoEncarregado: '829876543',
        localTrabalho: 'Centro de Saúde da Machava'
      },
      dadosAcademicos: {
        nivelIngresso: 'Licenciatura',
        instituicaoAnterior: 'Universidade Eduardo Mondlane',
        anoConclusao: '2023',
        cursoId: 'mestrado-saude-publica',
        cursoNome: 'Mestrado em Saúde Pública',
        grau: 'Mestrado',
        regime: 'Pós-laboral',
        modalidade: 'Semi-presencial',
        propinaMensal: 10000,
        matricula: 5000
      },
      documentos: {
        fotoUrl: '',
        fotoNome: 'foto_amelia.jpg',
        biNome: 'bi_amelia_machava.pdf',
        biUrl: '',
        certificadoNome: 'certificado_licenciatura_biologia.pdf',
        certificadoUrl: '',
        comprovativoPagamentoNome: 'comprovativo_bci_5000mt.pdf',
        comprovativoPagamentoUrl: '',
        outrosNome: 'curriculo_vitae.pdf',
        outrosUrl: ''
      },
      historico: [
        {
          data: '2026-10-22T09:30:00.000Z',
          autor: 'Candidato (Online)',
          acao: 'Submissão da pré-inscrição',
          observacao: 'Candidatura submetida com comprovativo de 5.000 MT via BCI.'
        },
        {
          data: '2026-10-22T14:15:00.000Z',
          autor: 'Secretaria Académica',
          acao: 'Validação de Pagamento',
          observacao: 'Depósito bancário conferido e validado com sucesso.'
        }
      ],
      observacoesAdmin: 'Candidata com excelente histórico na área de Biologia e Saúde.'
    },
    {
      id: 'cnd_002',
      numeroCandidatura: 'ISP-2027-209841',
      anoCandidatura: '2027',
      dataSubmissao: '2026-10-23T11:45:00.000Z',
      estado: 'Em análise',
      estadoPagamento: 'Pendente de verificação',
      dadosPessoais: {
        nome: 'Delfim Manuel Sitoe',
        dataNascimento: '2004-09-20',
        bi: '100492817362C',
        morada: 'Rua das acácias, Paragem Antena',
        provincia: 'Maputo Província',
        distrito: 'Boane',
        localidadeBairro: 'Matola-Rio',
        telefonePrincipal: '878787999',
        telefoneAdicional1: '',
        telefoneAdicional2: '',
        nomeEncarregado: 'Maria Teresa Sitoe',
        contactoEncarregado: '849998877',
        localTrabalho: ''
      },
      dadosAcademicos: {
        nivelIngresso: '12.ª Classe',
        instituicaoAnterior: 'Escola Secundária da Matola',
        anoConclusao: '2025',
        cursoId: 'lic-enfermagem-geral',
        cursoNome: 'Enfermagem Geral',
        grau: 'Licenciatura',
        regime: 'Laboral',
        modalidade: 'Presencial',
        propinaMensal: 6500,
        matricula: 4000
      },
      documentos: {
        fotoUrl: '',
        fotoNome: 'delfim_perfil.png',
        biNome: 'bi_delfim_sitoe.jpg',
        biUrl: '',
        certificadoNome: 'certificado_12a_autenticado.pdf',
        certificadoUrl: '',
        comprovativoPagamentoNome: 'm-pesa_4000mt.pdf',
        comprovativoPagamentoUrl: '',
        outrosNome: '',
        outrosUrl: ''
      },
      historico: [
        {
          data: '2026-10-23T11:45:00.000Z',
          autor: 'Candidato (Online)',
          acao: 'Submissão da pré-inscrição',
          observacao: 'Pagamento submetido via M-Pesa. Aguarda conciliação.'
        }
      ],
      observacoesAdmin: 'Verificar se o certificado da 12ª tem a média necessária de Biologia e Química.'
    },
    {
      id: 'cnd_003',
      numeroCandidatura: 'ISP-2027-310485',
      anoCandidatura: '2027',
      dataSubmissao: '2026-10-24T16:20:00.000Z',
      estado: 'Aprovada',
      estadoPagamento: 'Validado',
      dadosPessoais: {
        nome: 'Zita Fernando Cossa',
        dataNascimento: '1995-12-03',
        bi: '090182746194A',
        morada: 'Av. Eduardo Mondlane, Prédio 14, 2.º Andar',
        provincia: 'Maputo Cidade',
        distrito: 'KaMpfumo',
        localidadeBairro: 'Polana Cimento',
        telefonePrincipal: '823456789',
        telefoneAdicional1: '843456789',
        telefoneAdicional2: '',
        nomeEncarregado: 'Fernando Cossa',
        contactoEncarregado: '822223344',
        localTrabalho: 'Advocacia & Consultoria Lda'
      },
      dadosAcademicos: {
        nivelIngresso: 'Licenciatura',
        instituicaoAnterior: 'Faculdade de Direito',
        anoConclusao: '2020',
        cursoId: 'pos-direito-trabalho',
        cursoNome: 'Pós-Graduação em Direito do Trabalho e Processo Laboral',
        grau: 'Pós-graduação',
        regime: 'Pós-laboral',
        modalidade: 'Distância (Online)',
        propinaMensal: 7000,
        matricula: 5000
      },
      documentos: {
        fotoUrl: '',
        fotoNome: 'zita_cossa.jpg',
        biNome: 'bi_zita_cossa.pdf',
        biUrl: '',
        certificadoNome: 'certificado_licenciatura_direito.pdf',
        certificadoUrl: '',
        comprovativoPagamentoNome: 'recibo_transferencia_bim_5000.pdf',
        comprovativoPagamentoUrl: '',
        outrosNome: 'carteira_ordem_advogados.pdf',
        outrosUrl: ''
      },
      historico: [
        {
          data: '2026-10-24T16:20:00.000Z',
          autor: 'Candidato (Online)',
          acao: 'Submissão da pré-inscrição',
          observacao: 'Candidatura para turma virtual de Pós-Graduação.'
        },
        {
          data: '2026-10-25T10:00:00.000Z',
          autor: 'Direcção Pedagógica',
          acao: 'Validação de Pagamento e Aprovação',
          observacao: 'Candidatura deferida e aprovada para o ano de 2027.'
        }
      ],
      observacoesAdmin: 'Processo completo e homologado.'
    }
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosExemplo));
  } catch (_) {}
  return dadosExemplo;
}

function saveStoredCandidaturas(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}
}

export const candidaturaService = {
  // Retorna catálogo de cursos disponíveis para pré-inscrição
  getCursosDisponiveis() {
    return OFERTA_FORMATIVA_ISPOTEC_2027.filter(c => c.ativo !== false);
  },

  getCursoById(cursoId) {
    return OFERTA_FORMATIVA_ISPOTEC_2027.find(c => c.id === cursoId) || null;
  },

  // Gerar número de candidatura único amigável: ISP-2027-XXXXXX
  gerarNumeroCandidatura() {
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    return `ISP-2027-${randomSeq}`;
  },

  // Submeter nova candidatura
  async submeterCandidatura(dados) {
    try {
      // Tentar via backend se disponível
      const res = await api.post('/candidaturas', dados);
      if (res && res.sucesso && res.dados) {
        return res.dados;
      }
    } catch (_) {
      // Fallback local garantido
    }

    const candidaturas = getStoredCandidaturas();
    const numeroCandidatura = dados.numeroCandidatura || this.gerarNumeroCandidatura();
    const novaCandidatura = {
      id: `cnd_${Date.now()}`,
      numeroCandidatura,
      anoCandidatura: '2027',
      dataSubmissao: new Date().toISOString(),
      estado: 'Submetida',
      estadoPagamento: 'Pendente de verificação',
      dadosPessoais: { ...dados.dadosPessoais },
      dadosAcademicos: { ...dados.dadosAcademicos },
      documentos: { ...dados.documentos },
      historico: [
        {
          data: new Date().toISOString(),
          autor: 'Candidato (Portal Online)',
          acao: 'Submissão da pré-inscrição',
          observacao: 'Candidatura submetida com sucesso aguardando análise documental e financeira.'
        }
      ],
      observacoesAdmin: ''
    };

    candidaturas.unshift(novaCandidatura);
    saveStoredCandidaturas(candidaturas);
    return novaCandidatura;
  },

  // Obter todas as candidaturas com filtros
  async getCandidaturas(filtros = {}) {
    try {
      const res = await api.get('/candidaturas', { params: filtros });
      if (res && res.dados) {
        return res.dados;
      }
    } catch (_) {}

    let lista = getStoredCandidaturas();

    if (filtros.cursoId) {
      lista = lista.filter(c => c.dadosAcademicos.cursoId === filtros.cursoId);
    }
    if (filtros.grau) {
      lista = lista.filter(c => c.dadosAcademicos.grau === filtros.grau);
    }
    if (filtros.estado) {
      lista = lista.filter(c => c.estado === filtros.estado);
    }
    if (filtros.estadoPagamento) {
      lista = lista.filter(c => c.estadoPagamento === filtros.estadoPagamento);
    }
    if (filtros.modalidade) {
      lista = lista.filter(c => c.dadosAcademicos.modalidade === filtros.modalidade);
    }
    if (filtros.regime) {
      lista = lista.filter(c => c.dadosAcademicos.regime === filtros.regime);
    }
    if (filtros.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(c =>
        (c.dadosPessoais?.nome || '').toLowerCase().includes(t) ||
        (c.numeroCandidatura || '').toLowerCase().includes(t) ||
        (c.dadosPessoais?.bi || '').toLowerCase().includes(t) ||
        (c.dadosPessoais?.telefonePrincipal || '').includes(t)
      );
    }

    return lista;
  },

  // Obter por ID
  async getCandidaturaById(id) {
    try {
      const res = await api.get(`/candidaturas/${id}`);
      if (res && res.dados) return res.dados;
    } catch (_) {}

    const lista = getStoredCandidaturas();
    return lista.find(c => c.id === id || c.numeroCandidatura === id) || null;
  },

  // Consulta pública por número ou BI
  async consultarPorNumeroOuBI(identificador) {
    if (!identificador) return null;
    const limpo = identificador.trim().toLowerCase();

    try {
      const res = await api.get(`/candidaturas/consulta/${encodeURIComponent(limpo)}`);
      if (res && res.dados) return res.dados;
    } catch (_) {}

    const lista = getStoredCandidaturas();
    return (
      lista.find(
        c =>
          (c.numeroCandidatura || '').toLowerCase() === limpo ||
          (c.dadosPessoais?.bi || '').toLowerCase() === limpo ||
          (c.dadosPessoais?.telefonePrincipal || '') === limpo
      ) || null
    );
  },

  // Atualizar estado da candidatura (Aprovar, Rejeitar, etc.)
  async atualizarEstadoCandidatura(id, novoEstado, observacao = '', adminNome = 'Administrador') {
    const lista = getStoredCandidaturas();
    const index = lista.findIndex(c => c.id === id || c.numeroCandidatura === id);
    if (index === -1) throw new Error('Candidatura não encontrada');

    const item = { ...lista[index] };
    const estadoAnterior = item.estado;
    item.estado = novoEstado;

    if (observacao) {
      item.observacoesAdmin = observacao;
    }

    item.historico = item.historico || [];
    item.historico.push({
      data: new Date().toISOString(),
      autor: adminNome,
      acao: `Alteração de Estado: de "${estadoAnterior}" para "${novoEstado}"`,
      observacao: observacao || `Estado atualizado para ${novoEstado}.`
    });

    lista[index] = item;
    saveStoredCandidaturas(lista);

    try {
      await api.patch(`/candidaturas/${id}/estado`, {
        estado: novoEstado,
        observacao,
        adminNome
      });
    } catch (_) {}

    return item;
  },

  // Validar ou rejeitar comprovativo de pagamento
  async atualizarEstadoPagamento(id, novoEstadoPagamento, observacao = '', adminNome = 'Administrador') {
    const lista = getStoredCandidaturas();
    const index = lista.findIndex(c => c.id === id || c.numeroCandidatura === id);
    if (index === -1) throw new Error('Candidatura não encontrada');

    const item = { ...lista[index] };
    const estadoAnterior = item.estadoPagamento;
    item.estadoPagamento = novoEstadoPagamento;

    item.historico = item.historico || [];
    item.historico.push({
      data: new Date().toISOString(),
      autor: adminNome,
      acao: `Validação de Pagamento: de "${estadoAnterior}" para "${novoEstadoPagamento}"`,
      observacao: observacao || `Pagamento atualizado para ${novoEstadoPagamento}.`
    });

    // Se o pagamento for validado e a candidatura estiver aguardando validação de pagamento, atualizar
    if (novoEstadoPagamento === 'Validado' && item.estado === 'A aguardar validação de pagamento') {
      item.estado = 'Em análise';
    }

    lista[index] = item;
    saveStoredCandidaturas(lista);

    try {
      await api.patch(`/candidaturas/${id}/pagamento`, {
        estadoPagamento: novoEstadoPagamento,
        observacao,
        adminNome
      });
    } catch (_) {}

    return item;
  },

  // Estatísticas do painel
  async getEstatisticas() {
    const lista = getStoredCandidaturas();
    return {
      total: lista.length,
      submetidas: lista.filter(c => c.estado === 'Submetida').length,
      emAnalise: lista.filter(c => c.estado === 'Em análise').length,
      aguardandoDocs: lista.filter(c => c.estado === 'A aguardar documentos').length,
      aguardandoPagamento: lista.filter(c => c.estadoPagamento === 'Pendente de verificação').length,
      pagamentoValidado: lista.filter(c => c.estadoPagamento === 'Validado').length,
      aprovadas: lista.filter(c => c.estado === 'Aprovada').length,
      rejeitadas: lista.filter(c => c.estado === 'Rejeitada').length
    };
  }
};
