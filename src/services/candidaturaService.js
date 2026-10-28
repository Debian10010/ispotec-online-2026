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

export const DADOS_BANCARIOS_ISPOTEC = {
  instituicao: 'INSTITUTO SUPERIOR POLITÉCNICO E DE TECNOLOGIAS',
  sigla: 'ISPOTEC',
  edital: 'EDITAL 2027',
  banco: 'BCI (Banco Comercial e de Investimentos)',
  titular: 'ISPOTEC',
  iva: 'Sujeito a IVA de 5%',
  licenciatura: {
    conta: '22076375610001',
    nib: '0008 0000 20763756101 13',
    descricao: 'Para Cursos de Licenciatura',
    matricula: 4000
  },
  posGraduacaoEMestrado: {
    conta: '22076375610002',
    nib: '0008 0000 20763756102 10',
    descricao: 'Para Mestrado, Pós-graduação e Especialização',
    taxas: {
      mestrado: { matricula: 10000, propina: 10000 },
      posGraduacao: { matricula: 5000, propina: 5000 },
      especializacao: { matricula: 4000, propina: 4500 }
    }
  },
  contactos: {
    endereco: 'Rua da Mozal, 5354 | Matola-Rio | Maputo',
    telefones: ['878787442', '879 6666', '873045610'],
    email: 'ispotec.politecnica@gmail.com',
    site: 'www.ispotec.ac.mz',
    diretorGeral: 'Prof. Dr. Jacob Massuanganhe (Pós-Doutor em Direito)'
  }
};

export function obterDadosBancarios(grau = '') {
  const g = (grau || '').toLowerCase();
  if (g.includes('licenciatura')) {
    return {
      banco: 'BCI / ISPOTEC',
      tipo: 'Licenciatura',
      conta: '22076375610001',
      nib: '0008 0000 20763756101 13',
      iva: 'Sujeito a IVA de 5%',
      titular: 'ISPOTEC'
    };
  }
  return {
    banco: 'BCI / ISPOTEC',
    tipo: 'Mestrado, Pós-graduação e Especialização',
    conta: '22076375610002',
    nib: '0008 0000 20763756102 10',
    iva: 'Sujeito a IVA de 5%',
    titular: 'ISPOTEC'
  };
}

export const OFERTA_FORMATIVA_ISPOTEC_2027 = [
  // 1. Mestrado
  {
    id: 'mestrado-saude-publica',
    grau: 'Mestrado',
    nome: 'Mestrado em Saúde Pública',
    duracao: '2 anos, com estágios',
    propinaMensal: 10000,
    matricula: 10000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 5000,
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
    propinaMensal: 4500,
    matricula: 4000,
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
    propinaMensal: 4500,
    matricula: 4000,
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
    propinaMensal: 4500,
    matricula: 4000,
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
    propinaMensal: 4500,
    matricula: 4000,
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
    propinaMensal: 4500,
    matricula: 4000,
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
        propinaMensal: 5000,
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
  },

  // Atualizar dados completos da candidatura (edição pelo Administrador)
  async atualizarDadosCompletos(id, novosDados, adminNome = 'Administrador') {
    const lista = getStoredCandidaturas();
    const index = lista.findIndex(c => c.id === id || c.numeroCandidatura === id);
    if (index === -1) throw new Error('Candidatura não encontrada');

    const item = { ...lista[index] };

    // Atualizar dados pessoais
    if (novosDados.dadosPessoais) {
      item.dadosPessoais = {
        ...item.dadosPessoais,
        ...novosDados.dadosPessoais
      };
    }

    // Atualizar dados académicos
    if (novosDados.dadosAcademicos) {
      item.dadosAcademicos = {
        ...item.dadosAcademicos,
        ...novosDados.dadosAcademicos
      };
    }

    // Atualizar estados e observações se fornecidos
    if (novosDados.estado && novosDados.estado !== item.estado) {
      item.estado = novosDados.estado;
    }
    if (novosDados.estadoPagamento && novosDados.estadoPagamento !== item.estadoPagamento) {
      item.estadoPagamento = novosDados.estadoPagamento;
    }
    if (novosDados.observacoesAdmin !== undefined) {
      item.observacoesAdmin = novosDados.observacoesAdmin;
    }

    // Se o pagamento for validado ou aprovado, assegurar recibo oficial
    if (item.estadoPagamento === 'Validado' || item.estado === 'Aprovada') {
      if (!item.recibo) {
        item.recibo = {
          numeroRecibo: `REC-${item.numeroCandidatura}`,
          dataEmissao: new Date().toISOString(),
          valorPago: item.dadosAcademicos?.matricula || 4000,
          emitidoPor: adminNome,
          autenticado: true,
          codigoAutenticacao: `ISP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
      }
    }

    item.atualizadoEm = new Date().toISOString();
    item.historico = item.historico || [];
    item.historico.push({
      data: new Date().toISOString(),
      autor: adminNome,
      acao: 'Edição de Dados pelo Administrador',
      observacao: 'Informações do processo editadas e salvas com sucesso.'
    });

    lista[index] = item;
    saveStoredCandidaturas(lista);

    try {
      await api.put(`/candidaturas/${id}`, item);
    } catch (_) {}

    return item;
  },

  // Confirmar pré-inscrição e gerar recibo oficial
  async confirmarPreInscricao(id, observacao = '', adminNome = 'Administrador') {
    const lista = getStoredCandidaturas();
    const index = lista.findIndex(c => c.id === id || c.numeroCandidatura === id);
    if (index === -1) throw new Error('Candidatura não encontrada');

    const item = { ...lista[index] };
    item.estado = 'Aprovada';
    item.estadoPagamento = 'Validado';
    if (observacao) {
      item.observacoesAdmin = observacao;
    }

    item.recibo = {
      numeroRecibo: `REC-${item.numeroCandidatura}`,
      dataEmissao: new Date().toISOString(),
      valorPago: item.dadosAcademicos?.matricula || 4000,
      emitidoPor: adminNome,
      autenticado: true,
      codigoAutenticacao: `ISP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    item.historico = item.historico || [];
    item.historico.push({
      data: new Date().toISOString(),
      autor: adminNome,
      acao: 'Confirmação Oficial de Pré-Inscrição & Emissão de Recibo',
      observacao: observacao || 'Pré-inscrição confirmada, pagamento validado e recibo oficial emitido.'
    });

    lista[index] = item;
    saveStoredCandidaturas(lista);

    try {
      await api.post(`/candidaturas/${id}/confirmar`, {
        recibo: item.recibo,
        observacao,
        adminNome
      });
    } catch (_) {}

    return item;
  },

  // Normalizar lista de documentos anexados pelo estudante
  obterDocumentosCandidatura(candidatura) {
    if (!candidatura) return [];
    const docs = [];
    const d = candidatura.documentos || {};

    // 1. Comprovativo de Pagamento
    const comp = d.comprovativoPagamento;
    docs.push({
      id: 'comprovativoPagamento',
      chave: 'comprovativoPagamento',
      titulo: 'Comprovativo de Pagamento (Taxa de Pré-Inscrição)',
      nomeFicheiro: comp?.nomeFicheiro || d.comprovativoPagamentoNome || `comprovativo_${candidatura.numeroCandidatura}.pdf`,
      url: comp?.url || d.comprovativoPagamentoUrl || null,
      tipo: comp?.tipo || 'application/pdf',
      dataUpload: comp?.dataUpload || candidatura.criadoEm || candidatura.dataSubmissao,
      estado: candidatura.estadoPagamento
    });

    // 2. Bilhete de Identidade (B.I.)
    const bi = d.bi;
    docs.push({
      id: 'bi',
      chave: 'bi',
      titulo: 'Cópia do Bilhete de Identidade (B.I.)',
      nomeFicheiro: bi?.nomeFicheiro || d.biNome || `bi_${candidatura.dadosPessoais?.bi || 'candidato'}.pdf`,
      url: bi?.url || d.biUrl || null,
      tipo: bi?.tipo || 'application/pdf',
      dataUpload: bi?.dataUpload || candidatura.criadoEm || candidatura.dataSubmissao
    });

    // 3. Certificado de Habilitações
    const cert = d.certificado;
    docs.push({
      id: 'certificado',
      chave: 'certificado',
      titulo: 'Certificado de Habilitações Literárias',
      nomeFicheiro: cert?.nomeFicheiro || d.certificadoNome || `certificado_${candidatura.numeroCandidatura}.pdf`,
      url: cert?.url || d.certificadoUrl || null,
      tipo: cert?.tipo || 'application/pdf',
      dataUpload: cert?.dataUpload || candidatura.criadoEm || candidatura.dataSubmissao
    });

    // 4. Fotografia Tipo Passe
    const foto = d.fotografia || candidatura.dadosPessoais?.fotoPreview;
    if (foto || d.fotoNome) {
      docs.push({
        id: 'fotografia',
        chave: 'fotografia',
        titulo: 'Fotografia Tipo Passe',
        nomeFicheiro: (typeof foto === 'object' && foto?.nomeFicheiro) || d.fotoNome || 'foto_passe.jpg',
        url: (typeof foto === 'string' ? foto : foto?.url) || d.fotoUrl || null,
        tipo: 'image/jpeg',
        dataUpload: candidatura.criadoEm || candidatura.dataSubmissao
      });
    }

    // 5. Outros documentos
    if (d.outros || d.outrosNome) {
      docs.push({
        id: 'outros',
        chave: 'outros',
        titulo: 'Documento Complementar / Curriculum Vitae',
        nomeFicheiro: d.outros?.nomeFicheiro || d.outrosNome || 'documento_adicional.pdf',
        url: d.outros?.url || d.outrosUrl || null,
        tipo: d.outros?.tipo || 'application/pdf',
        dataUpload: candidatura.criadoEm || candidatura.dataSubmissao
      });
    }

    return docs;
  },

  // Descarregar documento individual
  baixarDocumento(doc, candidatura) {
    if (!doc) return;
    const fileUrl = doc.url;
    const fileName = doc.nomeFicheiro || `${doc.id}_${candidatura?.numeroCandidatura || 'doc'}.pdf`;

    // Se tiver URL ou base64 válida
    if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('http'))) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback: Gera documento estruturado e descarregável
    const conteudo = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.titulo} - ISPOTEC</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
    .card { background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 30px; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
    .header h1 { color: #003366; font-size: 18px; margin: 0; text-transform: uppercase; }
    .header p { color: #64748b; margin: 5px 0 0; font-size: 12px; }
    .doc-title { font-size: 16px; font-weight: bold; color: #0284c7; margin: 15px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin: 20px 0; }
    .field { background: #f1f5f9; padding: 10px; border-radius: 6px; }
    .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
    .value { font-weight: 600; color: #0f172a; margin-top: 2px; }
    .badge { display: inline-block; padding: 4px 10px; background: #dcfce7; color: #166534; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Instituto Superior Politécnico e de Tecnologias (ISPOTEC)</h1>
      <p>Secretaria Académica • Matola-Rio, Maputo • Processamento Digital 2027</p>
    </div>
    <div class="doc-title">📄 ${doc.titulo}</div>
    <div class="grid">
      <div class="field"><div class="label">Ficheiro Original</div><div class="value">${fileName}</div></div>
      <div class="field"><div class="label">N.º Candidatura</div><div class="value">${candidatura?.numeroCandidatura || '—'}</div></div>
      <div class="field"><div class="label">Candidato</div><div class="value">${candidatura?.dadosPessoais?.nome || '—'}</div></div>
      <div class="field"><div class="label">B.I. / Passaporte</div><div class="value">${candidatura?.dadosPessoais?.bi || '—'}</div></div>
      <div class="field"><div class="label">Curso Pretendido</div><div class="value">${candidatura?.dadosAcademicos?.cursoNome || '—'}</div></div>
      <div class="field"><div class="label">Estado no Sistema</div><div class="value"><span class="badge">Documento Validado e Arquivado</span></div></div>
    </div>
    <div class="footer">
      Documento digital arquivado no Sistema ISPOTEC Online. Código de Rastreio: ${candidatura?.numeroCandidatura || 'ISP-2027'}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([conteudo], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  },

  // Descarregar todos os documentos anexados do estudante
  baixarTodosDocumentos(candidatura) {
    const docs = this.obterDocumentosCandidatura(candidatura);
    docs.forEach((doc, idx) => {
      setTimeout(() => {
        this.baixarDocumento(doc, candidatura);
      }, idx * 450);
    });
  },

  // Exportação em formato Excel (.xls compatível com Microsoft Excel, LibreOffice e Google Sheets)
  exportarExcel(lista, nomeArquivo = 'candidaturas_ispotec_2027.xls') {
    if (!lista || lista.length === 0) {
      alert('Não existem candidaturas para exportar com os filtros atuais.');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
          th { background-color: #003366; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 11pt; }
          td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 10pt; }
          .highlight { background-color: #e0f2fe; font-weight: bold; color: #003366; }
          .aprovada { background-color: #dcfce7; color: #166534; font-weight: bold; }
          .pendente { background-color: #fef3c7; color: #92400e; }
          .rejeitada { background-color: #fee2e2; color: #991b1b; }
        </style>
      </head>
      <body>
        <h2 style="color: #003366;">INSTITUTO SUPERIOR POLITÉCNICO E DE TECNOLOGIAS (ISPOTEC)</h2>
        <h3>Processos de Pré-Inscrição &amp; Candidaturas — Ano Académico 2027</h3>
        <p>Exportado em: ${new Date().toLocaleString('pt-MZ')} | Total de Candidatos: ${lista.length}</p>
        <table>
          <thead>
            <tr>
              <th>N.º Candidatura</th>
              <th>Data Submissão</th>
              <th>Nome Completo do Candidato</th>
              <th>B.I. / Passaporte</th>
              <th>Data Nascimento</th>
              <th>Província</th>
              <th>Distrito</th>
              <th>Bairro / Localidade</th>
              <th>Morada Completa</th>
              <th>Telefone Principal</th>
              <th>Telefones Adicionais</th>
              <th>Encarregado de Educação</th>
              <th>Contacto do Encarregado</th>
              <th>Local de Trabalho</th>
              <th>Grau Académico</th>
              <th>Curso Pretendido</th>
              <th>Regime</th>
              <th>Modalidade</th>
              <th>Nível de Ingresso</th>
              <th>Instituição de Proveniência</th>
              <th>Ano Conclusão</th>
              <th>Propina Mensal (MT)</th>
              <th>Taxa Matrícula (MT)</th>
              <th>Estado do Pagamento</th>
              <th>Estado da Candidatura</th>
              <th>N.º Recibo Oficial</th>
              <th>Observações / Despacho Administrativo</th>
            </tr>
          </thead>
          <tbody>
    `;

    lista.forEach(c => {
      const dp = c.dadosPessoais || {};
      const da = c.dadosAcademicos || {};
      const telAdic = [dp.telefoneAdicional1, dp.telefoneAdicional2].filter(Boolean).join(' / ');
      const classeEstado = c.estado === 'Aprovada' ? 'aprovada' : c.estado === 'Rejeitada' ? 'rejeitada' : 'pendente';
      const classePag = c.estadoPagamento === 'Validado' ? 'aprovada' : c.estadoPagamento === 'Rejeitado' ? 'rejeitada' : 'pendente';
      const numRecibo = c.recibo?.numeroRecibo || (c.estadoPagamento === 'Validado' || c.estado === 'Aprovada' ? 'REC-' + c.numeroCandidatura : '—');

      html += `
        <tr>
          <td class="highlight">${c.numeroCandidatura || ''}</td>
          <td>${c.criadoEm || c.dataSubmissao ? new Date(c.criadoEm || c.dataSubmissao).toLocaleDateString('pt-MZ') : ''}</td>
          <td><strong>${dp.nome || ''}</strong></td>
          <td>${dp.bi || ''}</td>
          <td>${dp.dataNascimento || ''}</td>
          <td>${dp.provincia || ''}</td>
          <td>${dp.distrito || ''}</td>
          <td>${dp.bairro || ''}</td>
          <td>${dp.morada || ''}</td>
          <td>${dp.telefonePrincipal || ''}</td>
          <td>${telAdic || 'Nenhum'}</td>
          <td>${dp.nomeEncarregado || ''}</td>
          <td>${dp.contactoEncarregado || ''}</td>
          <td>${dp.localTrabalho || 'Não informado'}</td>
          <td>${da.grau || ''}</td>
          <td><strong>${da.cursoNome || ''}</strong></td>
          <td>${da.regime || ''}</td>
          <td>${da.modalidade || ''}</td>
          <td>${da.nivelIngresso || ''}</td>
          <td>${da.instituicaoProveniencia || ''}</td>
          <td>${da.anoConclusao || ''}</td>
          <td>${da.propinaMensal ? Number(da.propinaMensal).toLocaleString('pt-MZ') + ' MT' : ''}</td>
          <td>${da.matricula ? Number(da.matricula).toLocaleString('pt-MZ') + ' MT' : ''}</td>
          <td class="${classePag}">${c.estadoPagamento || ''}</td>
          <td class="${classeEstado}">${c.estado || ''}</td>
          <td class="highlight">${numRecibo}</td>
          <td>${c.observacoesAdmin || ''}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Gerar mensagem formatada para partilha via WhatsApp
  gerarMensagemWhatsAppRecibo(candidatura) {
    if (!candidatura) return '';
    const nome = candidatura.dadosPessoais?.nome || 'Estudante';
    const num = candidatura.numeroCandidatura || '';
    const curso = candidatura.dadosAcademicos?.cursoNome || '';
    const grau = candidatura.dadosAcademicos?.grau || '';
    const regime = candidatura.dadosAcademicos?.regime || '';
    const modalidade = candidatura.dadosAcademicos?.modalidade || '';
    const valor = candidatura.dadosAcademicos?.matricula || 4000;
    const numRecibo = candidatura.recibo?.numeroRecibo || `REC-${num}`;
    const dataConf = candidatura.recibo?.dataEmissao
      ? new Date(candidatura.recibo.dataEmissao).toLocaleDateString('pt-MZ')
      : new Date().toLocaleDateString('pt-MZ');

    return (
      `*ISPOTEC ONLINE — CONFIRMAÇÃO DE PRÉ-INSCRIÇÃO & RECIBO 2027* 🎓\n\n` +
      `Prezado(a) *${nome}*,\n` +
      `A sua pré-inscrição para o Ano Académico de 2027 no *ISPOTEC (Matola-Rio)* foi *CONFIRMADA E APROVADA*!\n\n` +
      `📋 *N.º de Candidatura:* ${num}\n` +
      `📄 *Recibo Oficial N.º:* ${numRecibo}\n` +
      `🎓 *Curso:* ${curso}\n` +
      `🏛️ *Grau:* ${grau} | *Regime:* ${regime} | *Modalidade:* ${modalidade}\n` +
      `💰 *Taxa de Inscrição:* ${Number(valor).toLocaleString('pt-MZ')} MT — *PAGO E VALIDADO* ✅\n` +
      `🏦 *Banco BCI:* ${grau.includes('Licenciatura') ? 'Conta: 22076375610001 | NIB: 0008 0000 20763756101 13' : 'Conta: 22076375610002 | NIB: 0008 0000 20763756102 10'} (Sujeito a IVA de 5%)\n` +
      `📅 *Data de Emissão:* ${dataConf}\n\n` +
      `Consulte o seu processo e descarregue o seu Recibo Oficial em PDF através do portal oficial:\n` +
      `👉 https://ispotec-online.vercel.app/consultar-candidatura?codigo=${encodeURIComponent(num)}\n\n` +
      `_Instituto Superior Politécnico e de Tecnologias — Matola-Rio, Maputo_\n` +
      `_Contactos Oficiais: (+258) 878 787 442 / 877 906 666 / 873 045 610_`
    );
  },

  // Gerar link direto para envio via WhatsApp
  gerarLinkWhatsApp(candidatura, telefoneDestino = '') {
    const texto = this.gerarMensagemWhatsAppRecibo(candidatura);
    const tel = (telefoneDestino || candidatura?.dadosPessoais?.telefonePrincipal || '').replace(/\D/g, '');
    const numCompleto = tel.startsWith('258') ? tel : tel.length >= 9 ? `258${tel}` : '';
    const baseUrl = numCompleto ? `https://api.whatsapp.com/send?phone=${numCompleto}&text=` : `https://api.whatsapp.com/send?text=`;
    return `${baseUrl}${encodeURIComponent(texto)}`;
  }
};
