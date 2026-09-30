import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const initialLaboratoriosInvestigacao = [
  {
    id: 'farmacologia-analises',
    nome: 'Laboratório de Farmacologia e Análises Clínicas',
    sigla: 'LFAC',
    icone: '💊',
    cor: '#0284c7',
    corBg: '#e0f2fe',
    descricao: 'Unidade de investigação biomédica vocacionada para a caracterização fitoquímica de plantas medicinais moçambicanas, bioensaios farmacológicos, farmacocinética e desenvolvimento de métodos analíticos clínicos de alta sensibilidade.',
    coordenador: 'Prof. Dr. Mateus Chilaule (PhD em Farmacologia Aplicada)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.lfac@ispotec.ac.mz',
    localizacao: 'Complexo de Laboratórios Científicos – Piso 1, Sala L-102',
    areas: [
      'Fitoterapia e Validação Científica de Recursos Naturais',
      'Monitorização Terapêutica e Toxicologia Clínica',
      'Bioequivalência e Controlo de Qualidade Medicamentosa',
      'Marcadores Bioquímicos em Doenças Crónicas Tropicais'
    ],
    investigadores: [
      { id: 'inv-1', nome: 'Prof. Dr. Mateus Chilaule', cargo: 'Investigador Principal / Coordenador', titulacao: 'Doutor em Farmacologia' },
      { id: 'inv-2', nome: 'Dra. Elsa Tembe', cargo: 'Investigadora Sénior', titulacao: 'Mestre em Análises Clínicas' },
      { id: 'inv-3', nome: 'Msc. Alberto Chissano', cargo: 'Investigador Associado', titulacao: 'Mestre em Fitoquímica' },
      { id: 'inv-4', nome: 'Lic. Joana Matsinhe', cargo: 'Assistente de Investigação', titulacao: 'Licenciada em Farmácia' }
    ],
    projetos: [
      {
        id: 'proj-f1',
        titulo: 'Screening Fitoquímico e Antimicrobiano de Extratos de Plantas Nativas do Sul de Moçambique',
        financiamento: 'Fundo Nacional de Investigação (FNI)',
        periodo: '2024 - 2026',
        estado: 'Em Curso',
        resumo: 'Avaliação in vitro da atividade antibacteriana contra estirpes resistentes de Staphylococcus aureus e Escherichia coli.'
      },
      {
        id: 'proj-f2',
        titulo: 'Vigilância de Interações Medicamentosas em Terapia Antirretroviral e Fitoterápicos',
        financiamento: 'ISPOTEC Pesquisa Competitiva',
        periodo: '2023 - 2025',
        estado: 'Em Curso',
        resumo: 'Estudo observacional em pacientes em regime TARV que utilizam concomitantemente preparados tradicionais.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-f1',
        titulo: 'Phytochemical profile and antioxidant capacity of indigenous Mozambican flora: A prospective study',
        revista: 'African Journal of Biomedical Research, 2024',
        autores: 'Chilaule, M., Tembe, E., Chissano, A.',
        doi: 'doi:10.1016/j.ajbr.2024.03.012'
      },
      {
        id: 'pub-f2',
        titulo: 'Perfil lipídico e glicémico em populações periurbanas da Matola: Estudo descritivo laboratorial',
        revista: 'Revista Científica de Ciências da Saúde ISPOTEC, 2023',
        autores: 'Tembe, E. & Matsinhe, J.',
        doi: 'doi:10.5281/ispotec.rcs.2023.08'
      }
    ],
    atividades: [
      'Sessões quinzenais de Journal Club e revisão de literatura científica.',
      'Workshop anual de boas práticas laboratoriais em ensaios analíticos.',
      'Apoio experimental a monografias e dissertações de mestrado.',
      'Prestação de serviços analíticos especializados para controlo biológico.'
    ]
  },
  {
    id: 'exames-medicos',
    nome: 'Laboratório de Exames Médicos',
    sigla: 'LEM',
    icone: '🩺',
    cor: '#059669',
    corBg: '#d1fae5',
    descricao: 'Centro de investigação clínica centrado na validação e precisão de novos protocolos de diagnóstico por imagem, eletrofisiologia, espirometria e testes funcionais cardiorrespiratórios em contexto africano.',
    coordenador: 'Dr. Armando Mabunda (Especialista em Medicina Diagnóstica e Cardiologia)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.lem@ispotec.ac.mz',
    localizacao: 'Edifício de Especialidades Médicas – Bloco C, Piso Térreo',
    areas: [
      'Eletrocardiografia e Arritmologia Clínica Comunitária',
      'Ultrassonografia e Avaliação Hemodinâmica Não Invasiva',
      'Provas de Função Pulmonar e Exposição Ambiental a Poeiras Industriais',
      'Telemedicina e Tele-diagnóstico em Centros Rurais'
    ],
    investigadores: [
      { id: 'inv-em1', nome: 'Dr. Armando Mabunda', cargo: 'Coordenador Científico', titulacao: 'Especialista em Cardiologia' },
      { id: 'inv-em2', nome: 'Dra. Celeste Macamo', cargo: 'Investigadora em Imagiologia', titulacao: 'Mestre em Ciências Radiológicas' },
      { id: 'inv-em3', nome: 'Dr. Fernando Zandamela', cargo: 'Investigador em Pneumologia', titulacao: 'Médico Pneumologista' },
      { id: 'inv-em4', nome: 'Téc. Sup. Ricardo Sambo', cargo: 'Especialista Técnico de Equipamentos', titulacao: 'Eng. Biomédico' }
    ],
    projetos: [
      {
        id: 'proj-em1',
        titulo: 'Prevalência de Hipertrofia Ventricular Esquerda em População Adulta da Província de Maputo',
        financiamento: 'ISPOTEC Saúde Coletiva',
        periodo: '2024 - 2025',
        estado: 'Em Curso',
        resumo: 'Estudo epidemiológico eletrocardiográfico e ecocardiográfico associado à hipertensão arterial não controlada.'
      },
      {
        id: 'proj-em2',
        titulo: 'Impacto da Poluição por Particulados na Função Respiratória de Trabalhadores Fabris',
        financiamento: 'Parceria Industrial Matola',
        periodo: '2023 - 2025',
        estado: 'Fase de Conclusão',
        resumo: 'Avaliação espirométrica contínua em operadores da zona industrial da Matola com recomendações de saúde ocupacional.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-em1',
        titulo: 'Echocardiographic patterns in newly diagnosed hypertensive patients in Matola, Mozambique',
        revista: 'Journal of African Clinical Cardiology, 2024',
        autores: 'Mabunda, A., Macamo, C., Zandamela, F.',
        doi: 'doi:10.1080/jacc.2024.1102'
      },
      {
        id: 'pub-em2',
        titulo: 'Tele-espirometria descentralizada: viabilidade e custos em contexto moçambicano',
        revista: 'Anais de Medicina Tropical ISPOTEC, 2023',
        autores: 'Zandamela, F. & Sambo, R.',
        doi: 'doi:10.5281/amt.2023.019'
      }
    ],
    atividades: [
      'Calibração e validação de equipamento biomédico de monitorização.',
      'Treino avançado em interpretação ecocardiográfica para médicos internos.',
      'Campanhas trimestrais de rastreio cardiorrespiratório voluntário.',
      'Seminários de inovação diagnóstica não-invasiva.'
    ]
  },
  {
    id: 'microbiologia-anatomia',
    nome: 'Laboratório de Microbiologia e Anatomia Patológica',
    sigla: 'LMAP',
    icone: '🔬',
    cor: '#7c3aed',
    corBg: '#ede9fe',
    descricao: 'Infraestrutura de ponta focada na identificação fenotípica e molecular de agentes bacterianos, fúngicos e virais, patologia celular, histotecnologia e biópsias para detecção precoce de lesões oncológicas.',
    coordenador: 'Prof.ª Dra. Esperança Bila (Doutora em Patologia Molecular e Celular)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.lmap@ispotec.ac.mz',
    localizacao: 'Complexo de Laboratórios Científicos – Piso 2, Sala L-204',
    areas: [
      'Resistência aos Antimicrobianos (RAM) e Mecanismos Genéticos',
      'Diagnóstico Citopatológico e Rastreio do Cancro do Colo do Útero',
      'Histopatologia de Doenças Infecciosas Endémicas',
      'Microbiologia Ambiental e Segurança da Cadeia Alimentar'
    ],
    investigadores: [
      { id: 'inv-ma1', nome: 'Prof.ª Dra. Esperança Bila', cargo: 'Coordenadora e Investigadora Principal', titulacao: 'PhD em Patologia Molecular' },
      { id: 'inv-ma2', nome: 'Dr. Gildo Cossa', cargo: 'Investigador em Microbiologia Médica', titulacao: 'Mestre em Microbiologia' },
      { id: 'inv-ma3', nome: 'Dra. Beatriz Nhavoto', cargo: 'Especialista em Citologia Diagnóstica', titulacao: 'Mestre em Anatomia Patológica' },
      { id: 'inv-ma4', nome: 'Lic. Tomás Langa', cargo: 'Técnico de Histotecnologia', titulacao: 'Licenciado em Ciências Laboratoriais' }
    ],
    projetos: [
      {
        id: 'proj-ma1',
        titulo: 'Vigilância Genómica de Resistência a Carbapenemes em Isolados Hospitalares',
        financiamento: 'Rede Lusófona de Resistência Antimicrobiana',
        periodo: '2024 - 2027',
        estado: 'Em Curso',
        resumo: 'Detecção de genes blaKPC e blaNDM em bactérias gram-negativas isoladas de espécimes clínicos.'
      },
      {
        id: 'proj-ma2',
        titulo: 'Avaliação Citomorfológica de Lesões Intraepiteliais Escamosas Cervicais por Colorações Avançadas',
        financiamento: 'Fundo Global Saúde Materno-Infantil',
        periodo: '2023 - 2025',
        estado: 'Em Curso',
        resumo: 'Melhoria na acurácia do teste de Papanicolau em mulheres em idade fértil na Província de Maputo.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-ma1',
        titulo: 'Emergence of multi-drug resistant Klebsiella pneumoniae in pediatric hospital settings: Molecular epidemiology',
        revista: 'Microbial Drug Resistance Reports, 2024',
        autores: 'Bila, E., Cossa, G., Langa, T.',
        doi: 'doi:10.1089/mdr.2024.0041'
      },
      {
        id: 'pub-ma2',
        titulo: 'Padrões histopatológicos de linfadenopatias periféricas: Experiência diagnóstica ISPOTEC',
        revista: 'Boletim Científico Moçambicano de Patologia, 2023',
        autores: 'Nhavoto, B. & Bila, E.',
        doi: 'doi:10.5281/bcmp.2023.003'
      }
    ],
    atividades: [
      'Processamento histotécnico de biópsias para apoio ao ensino médico.',
      'Cultura e teste de sensibilidade aos antimicrobianos (TSA) automatizado.',
      'Sessões anátomo-clínicas interdisciplinares com docentes e estudantes.',
      'Workshops práticos de microscopia óptica e técnicas de coloração especial.'
    ]
  },
  {
    id: 'saude-digital',
    nome: 'Laboratório de Saúde Digital',
    sigla: 'LSD',
    icone: '📱',
    cor: '#0d9488',
    corBg: '#ccfbf1',
    descricao: 'Unidade de vanguarda que investiga o uso de prontuários eletrónicos inteligentes, telessaúde, sensores IoT vestíveis e sistemas móveis para vigilância comunitária em zonas de baixa conectividade.',
    coordenador: 'Prof. Eng. Cristiano Nhacale (MSc em Informática Médica e Bioinformática)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.lsd@ispotec.ac.mz',
    localizacao: 'Edifício Tecnológico – Piso 2, Sala T-201',
    areas: [
      'Telemedicina Assíncrona e Síncrona para Cuidados Primários',
      'Interoperabilidade de Prontuários Eletrónicos de Pacientes (EHR)',
      'mHealth (Mobile Health) em Acompanhamento de Doenças Crónicas',
      'Sistemas de Alerta Precoce para Surtos Epidémicos Baseados em SMS/USSD'
    ],
    investigadores: [
      { id: 'inv-sd1', nome: 'Prof. Eng. Cristiano Nhacale', cargo: 'Coordenador do Laboratório', titulacao: 'Mestre em Informática Médica' },
      { id: 'inv-sd2', nome: 'Eng.ª Neusa Sitoe', cargo: 'Investigadora em UX/UI em Saúde', titulacao: 'Mestre em Interação Homem-Máquina' },
      { id: 'inv-sd3', nome: 'Dr. Valdemar Chivite', cargo: 'Investigador Clínico e Consultor Médico', titulacao: 'Médico Sanitarista' },
      { id: 'inv-sd4', nome: 'Lic. Elton Mondlane', cargo: 'Desenvolvedor Full Stack de Saúde', titulacao: 'Licenciado em Informática' }
    ],
    projetos: [
      {
        id: 'proj-sd1',
        titulo: 'Plataforma m-Saúde Comunitária para Notificação de Casos Febris por Agentes Polivalentes',
        financiamento: 'Inovação Tecnológica ISPOTEC',
        periodo: '2024 - 2026',
        estado: 'Em Curso',
        resumo: 'Desenvolvimento de aplicativo móvel offline-first para registro georreferenciado de casos suspeitos de malária.'
      },
      {
        id: 'proj-sd2',
        titulo: 'Prontuário Eletrónico Didático para Centros de Saúde Universitários',
        financiamento: 'Programa Ensino Digital',
        periodo: '2023 - 2025',
        estado: 'Fase de Teste Piloto',
        resumo: 'Implementação de prontuário aberto padrão OpenMRS adaptado à realidade clínica e docente do ISPOTEC.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-sd1',
        titulo: 'Usability of offline-first mobile health apps for community health workers in southern Mozambique',
        revista: 'IEEE Healthcom Proceedings, 2024',
        autores: 'Nhacale, C., Sitoe, N., Mondlane, E.',
        doi: 'doi:10.1109/Healthcom.2024.10398'
      },
      {
        id: 'pub-sd2',
        titulo: 'Desafios de interoperabilidade em saúde digital nos Países de Língua Oficial Portuguesa',
        revista: 'Revista Ibero-Americana de Saúde Digital, 2023',
        autores: 'Nhacale, C. & Chivite, V.',
        doi: 'doi:10.5281/riasd.2023.41'
      }
    ],
    atividades: [
      'Hackathons de Saúde Digital e ideação de soluções biomédicas.',
      'Desenvolvimento de protótipos de interfaces acessíveis para agentes comunitários.',
      'Testes de usabilidade e segurança de dados de pacientes.',
      'Cursos de capacitação em literacia digital para profissionais de saúde.'
    ]
  },
  {
    id: 'tecnologia-ia',
    nome: 'Laboratório de Tecnologia e Inteligência Artificial',
    sigla: 'LTIA',
    icone: '🤖',
    cor: '#4f46e5',
    corBg: '#e0e7ff',
    descricao: 'Centro de excelência em ciência de dados, modelos de Machine Learning, visão computacional para análise imagiológica, processamento de linguagem natural (NLP) em línguas moçambicanas e automação.',
    coordenador: 'Prof. Dr. Samuel Matusse (Doutor em Inteligência Artificial e Robótica)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.ltia@ispotec.ac.mz',
    localizacao: 'Edifício Tecnológico – Piso 3, Hub de Computação Avançada',
    areas: [
      'Visão Computacional e Diagnóstico por Imagem Assistido por IA',
      'Processamento de Linguagem Natural (NLP) e Chatbots Académicos',
      'Modelos Preditivos de Evasão Escolar e Rendimento Estudantil',
      'Sistemas Embarcados, IoT e Redes Inteligentes (Smart Grids)'
    ],
    investigadores: [
      { id: 'inv-ia1', nome: 'Prof. Dr. Samuel Matusse', cargo: 'Diretor Científico do Laboratório', titulacao: 'PhD em Ciência da Computação / IA' },
      { id: 'inv-ia2', nome: 'Msc. Edgar Mabjaia', cargo: 'Investigador em Machine Learning', titulacao: 'Mestre em Inteligência Artificial' },
      { id: 'inv-ia3', nome: 'Eng.ª Paula Guambe', cargo: 'Investigadora em Visão Computacional', titulacao: 'Mestre em Engenharia Informática' },
      { id: 'inv-ia4', nome: 'Lic. Denilson Tamele', cargo: 'Investigador Assistente em NLP', titulacao: 'Licenciado em Engenharia Informática' }
    ],
    projetos: [
      {
        id: 'proj-ia1',
        titulo: 'Detecção Automatizada de Tuberculose Pulmonar em Radiografias de Tórax via Redes Neurais Convolucionais',
        financiamento: 'Conselho Nacional de Ciência e Tecnologia (CNCT)',
        periodo: '2024 - 2026',
        estado: 'Em Curso',
        resumo: 'Treinamento de modelos deep learning em dataset anonimizado com acurácia preliminar de 93.4%.'
      },
      {
        id: 'proj-ia2',
        titulo: 'Chatbot Educacional Cognitivo ISPOTEC para Suporte Tutelado aos Estudantes',
        financiamento: 'ISPOTEC Inovação Pedagógica',
        periodo: '2023 - 2025',
        estado: 'Ativo e em Evolução',
        resumo: 'Arquitetura RAG (Retrieval-Augmented Generation) com base de conhecimento institucional e curricular.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-ia1',
        titulo: 'Convolutional neural networks for assisted diagnosis of pulmonary pathologies in resource-constrained clinics',
        revista: 'Artificial Intelligence in Medicine Review, 2024',
        autores: 'Matusse, S., Guambe, P., Mabjaia, E.',
        doi: 'doi:10.1016/j.artmed.2024.102871'
      },
      {
        id: 'pub-ia2',
        titulo: 'Avaliação de modelos preditivos no acompanhamento do abandono no ensino superior em Moçambique',
        revista: 'Revista Lusófona de Tecnologia e Sociedade, 2023',
        autores: 'Mabjaia, E. & Tamele, D.',
        doi: 'doi:10.5281/rlts.2023.011'
      }
    ],
    atividades: [
      'Bancadas de teste com servidores GPU dedicados a processamento de IA.',
      'Bootcamps de programação em Python, PyTorch e TensorFlow para estudantes.',
      'Competições internas de Ciência de Dados e Kaggle Days.',
      'Assessoria técnica à gestão da universidade em governança de dados.'
    ]
  },
  {
    id: 'medicina-dentaria',
    nome: 'Laboratório de Medicina Dentária',
    sigla: 'LMD',
    icone: '🦷',
    cor: '#db2777',
    corBg: '#fce7f3',
    descricao: 'Espaço de investigação dedicado aos biomateriais odontológicos, microbiologia oral, implantologia, patologia das glândulas salivares, ortodontia preventiva e estudos epidemiológicos de cárie e doença periodontal.',
    coordenador: 'Prof.ª Dra. Telma Machava (Especialista em Odontologia Restauradora e Biomateriais)',
    contacto: '878787442 | 877906666 | 873045610',
    email: 'investigacao.lmd@ispotec.ac.mz',
    localizacao: 'Edifício Clínico ISPOTEC – Bloco B, Piso 2, Ala Odontológica',
    areas: [
      'Biomateriais Resinosos e Adesão Dentinária',
      'Microbioma Oral e Prevalência de Streptococcus mutans na Infância',
      'Epidemiologia da Cárie Dentária e Fluorose na Província de Maputo',
      'Ergonomia Odontológica e Tecnologias de Escaneamento Intraoral 3D'
    ],
    investigadores: [
      { id: 'inv-md1', nome: 'Prof.ª Dra. Telma Machava', cargo: 'Coordenadora e Investigadora Principal', titulacao: 'Doutora em Medicina Dentária' },
      { id: 'inv-md2', nome: 'Dr. Osvaldo Nhacole', cargo: 'Investigador em Cirurgia e Implantologia', titulacao: 'Mestre em Cirurgia Bucomaxilofacial' },
      { id: 'inv-md3', nome: 'Dra. Sandra Ubisse', cargo: 'Investigadora em Odontopediatria', titulacao: 'Especialista em Saúde Oral Comunitária' },
      { id: 'inv-md4', nome: 'Lic. Hélder Cuambe', cargo: 'Técnico de Prótese e Investigação Laboratorial', titulacao: 'Licenciado em Prótese Dentária' }
    ],
    projetos: [
      {
        id: 'proj-md1',
        titulo: 'Resistência de União de Novos Adesivos Universais a Dentes Tratados Endodonticamente',
        financiamento: 'Fundo Privado de Pesquisa em Biomateriais',
        periodo: '2024 - 2026',
        estado: 'Em Curso',
        resumo: 'Ensaios de microtração mecânica e análise microscópica da interface dente-resina sob diferentes protocolos.'
      },
      {
        id: 'proj-md2',
        titulo: 'Inquérito Epidemiológico de Saúde Oral e Fluorose em Escolares do Município da Matola',
        financiamento: 'Programa Sorriso Saudável ISPOTEC',
        periodo: '2023 - 2025',
        estado: 'Em Curso',
        resumo: 'Avaliação dos índices CPOD em 1.500 alunos do ensino fundamental e correlação com fontes de água de consumo.'
      }
    ],
    publicacoes: [
      {
        id: 'pub-md1',
        titulo: 'Microtensile bond strength of universal adhesives to degraded dentin: An in vitro comparative study',
        revista: 'International Dental Research Journal, 2024',
        autores: 'Machava, T., Nhacole, O., Cuambe, H.',
        doi: 'doi:10.1016/j.idrj.2024.04.102'
      },
      {
        id: 'pub-md2',
        titulo: 'Prevalência de fluorose dentária e teores de flúor em poços artesianos no sul de Moçambique',
        revista: 'Revista Moçambicana de Estomatologia, 2023',
        autores: 'Ubisse, S. & Machava, T.',
        doi: 'doi:10.5281/rme.2023.007'
      }
    ],
    atividades: [
      'Ensaios mecânicos de fadiga e resistência de materiais dentários restauradores.',
      'Sessões de discussão clínica de casos complexos de reabilitação protética.',
      'Jornada Académica de Medicina Dentária ISPOTEC.',
      'Avaliação citológica de lesões potencialmente malignas da mucosa oral.'
    ]
  }
];

export default function Investigacao() {
  const { canAdd, canEdit, canDelete } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLabId = searchParams.get('lab');
  const [activeTab, setActiveTab] = useState('visao-geral');

  const [laboratorios, setLaboratorios] = useState(initialLaboratoriosInvestigacao);
  const selectedLab = laboratorios.find(l => l.id === selectedLabId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [novoProj, setNovoProj] = useState({ titulo: '', financiamento: '', periodo: '2025 - 2027', estado: 'Em Curso', resumo: '' });
  const [novoInv, setNovoInv] = useState({ nome: '', cargo: '', titulacao: '' });
  const [novaPub, setNovaPub] = useState({ titulo: '', revista: '', autores: '', doi: '' });

  const selectLab = (labId) => {
    const params = new URLSearchParams();
    if (labId) {
      params.set('lab', labId);
    }
    setSearchParams(params);
    setActiveTab('visao-geral');
    setShowAddForm(false);
  };

  // Handlers for Add / Edit / Delete
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!novoProj.titulo) return;
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          projetos: [...lab.projetos, { ...novoProj, id: `proj-${Date.now()}` }]
        };
      }
      return lab;
    }));
    setNovoProj({ titulo: '', financiamento: '', periodo: '2025 - 2027', estado: 'Em Curso', resumo: '' });
    setShowAddForm(false);
  };

  const handleDeleteProject = (projId) => {
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          projetos: lab.projetos.filter(p => p.id !== projId)
        };
      }
      return lab;
    }));
  };

  const handleEditProject = (proj) => {
    const newT = window.prompt('Editar título do projeto:', proj.titulo);
    if (!newT) return;
    const newR = window.prompt('Editar resumo:', proj.resumo) || proj.resumo;
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          projetos: lab.projetos.map(p => p.id === proj.id ? { ...p, titulo: newT, resumo: newR } : p)
        };
      }
      return lab;
    }));
  };

  const handleAddResearcher = (e) => {
    e.preventDefault();
    if (!novoInv.nome) return;
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          investigadores: [...lab.investigadores, { ...novoInv, id: `inv-${Date.now()}` }]
        };
      }
      return lab;
    }));
    setNovoInv({ nome: '', cargo: '', titulacao: '' });
    setShowAddForm(false);
  };

  const handleDeleteResearcher = (invId) => {
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          investigadores: lab.investigadores.filter(inv => inv.id !== invId)
        };
      }
      return lab;
    }));
  };

  const handleAddPublication = (e) => {
    e.preventDefault();
    if (!novaPub.titulo) return;
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          publicacoes: [...lab.publicacoes, { ...novaPub, id: `pub-${Date.now()}` }]
        };
      }
      return lab;
    }));
    setNovaPub({ titulo: '', revista: '', autores: '', doi: '' });
    setShowAddForm(false);
  };

  const handleDeletePublication = (pubId) => {
    setLaboratorios(laboratorios.map(lab => {
      if (lab.id === selectedLab.id) {
        return {
          ...lab,
          publicacoes: lab.publicacoes.filter(pub => pub.id !== pubId)
        };
      }
      return lab;
    }));
  };

  return (
    <>
      <style>{`
        .inv-container {
          padding-top: 1.5rem;
          padding-bottom: 3rem;
        }
        .inv-hero {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e1b4b 100%);
          color: #fff;
          padding: 2.5rem 1.75rem;
          border-radius: 14px;
          margin-bottom: 2rem;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.25);
          position: relative;
          overflow: hidden;
        }
        .inv-hero::after {
          content: '';
          position: absolute;
          right: -40px;
          bottom: -40px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          pointer-events: none;
        }
        .inv-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .inv-hero h1 {
          font-size: 1.95rem;
          font-weight: 800;
          margin: 0 0 0.6rem;
          line-height: 1.25;
        }
        .inv-hero p {
          margin: 0;
          opacity: 0.93;
          font-size: 0.98rem;
          max-width: 860px;
          line-height: 1.6;
        }

        /* Stats overview */
        .inv-summary-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .inv-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.2rem;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04);
        }
        .inv-stat-num {
          font-size: 1.9rem;
          font-weight: 800;
          color: #1d4ed8;
          line-height: 1.1;
        }
        .inv-stat-lbl {
          font-size: 0.78rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 0.3rem;
        }

        /* Laboratórios Listing */
        .inv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .inv-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.6rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          border-top: 4px solid var(--lab-color, #1d4ed8);
          cursor: pointer;
        }
        .inv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -3px rgba(0,0,0,0.1);
        }
        .inv-card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .inv-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
          flex-shrink: 0;
        }
        .inv-card-name {
          font-size: 1.18rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem;
          line-height: 1.3;
        }
        .inv-card-sigla {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
          background: #f1f5f9;
          color: #334155;
        }
        .inv-card-desc {
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .inv-areas-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .area-tag {
          font-size: 0.74rem;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          color: #334155;
        }
        .inv-card-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .inv-btn-detail {
          padding: 0.6rem 1.1rem;
          border-radius: 8px;
          background: #1d4ed8;
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .inv-btn-detail:hover {
          background: #1e40af;
        }

        /* Detail Modal / Dedicated View */
        .detail-view {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          padding: 2rem;
          margin-bottom: 2.5rem;
        }
        .detail-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 0.45rem 0.95rem;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .detail-back-btn:hover {
          background: #e2e8f0;
        }
        .detail-header-block {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          margin-bottom: 1.75rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f1f5f9;
        }
        .detail-icon-large {
          width: 70px;
          height: 70px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.3rem;
          flex-shrink: 0;
        }
        .detail-title {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.4rem;
        }
        .detail-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          margin-bottom: 1.75rem;
          font-size: 0.86rem;
        }
        .detail-meta-item strong {
          display: block;
          color: #0f172a;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 0.2rem;
        }

        /* Detail Tabs */
        .detail-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 1.75rem;
          overflow-x: auto;
        }
        .detail-tab-btn {
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .detail-tab-btn:hover {
          color: #1d4ed8;
        }
        .detail-tab-btn.active {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
          font-weight: 700;
        }

        /* Role action buttons */
        .btn-add-action-blue {
          background: #1d4ed8; color: #fff; border: none; border-radius: 8px;
          padding: 0.45rem 0.95rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .btn-add-action-blue:hover { background: #1e40af; }
        .btn-edit-action {
          background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px;
          padding: 0.25rem 0.55rem; font-size: 0.76rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
        }
        .btn-edit-action:hover { background: #e2e8f0; color: #0f172a; }
        .btn-del-action {
          background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 6px;
          padding: 0.25rem 0.55rem; font-size: 0.76rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
        }
        .btn-del-action:hover { background: #fca5a5; }

        .inv-inline-form {
          background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
          padding: 1.25rem; margin-bottom: 1.5rem; display: grid; gap: 0.85rem;
        }
        .inv-input {
          width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1;
          border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
        }

        /* Detail Content Boxes */
        .detail-section-bar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;
        }
        .detail-section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .researcher-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.1rem;
        }
        .researcher-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .researcher-card strong {
          display: block;
          font-size: 0.95rem;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }
        .researcher-card .role {
          font-size: 0.8rem;
          color: #1d4ed8;
          font-weight: 600;
          display: block;
          margin-bottom: 0.2rem;
        }
        .researcher-card .titulacao {
          font-size: 0.78rem;
          color: #64748b;
        }

        .pub-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          margin-bottom: 1rem;
        }
        .pub-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }
        .pub-meta {
          font-size: 0.82rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .pub-doi {
          font-size: 0.76rem;
          color: #1d4ed8;
          font-family: monospace;
        }

        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          font-size: 0.88rem;
          color: #334155;
        }

        @media (max-width: 768px) {
          .inv-hero { padding: 1.75rem 1.25rem; }
          .inv-hero h1 { font-size: 1.5rem; }
          .inv-grid { grid-template-columns: 1fr; }
          .detail-header-block { flex-direction: column; }
        }
      `}</style>

      <div className="container inv-container">
        {/* Header Investigação */}
        <div className="inv-hero">
          <div className="inv-badge-top">
            <span>🔬</span> Módulo Independente de Investigação Científica
          </div>
          <h1>Laboratórios de Investigação Científica ISPOTEC</h1>
          <p>
            O Módulo de Investigação reúne os 6 laboratórios científicos dedicados à produção de conhecimento de fronteira, publicação de estudos biomédicos e tecnológicos, e desenvolvimento de soluções com rigor metodológico.
          </p>
        </div>

        {/* Stats Summary Bar */}
        <div className="inv-summary-bar">
          <div className="inv-stat-card">
            <div className="inv-stat-num">6</div>
            <div className="inv-stat-lbl">Laboratórios Especializados</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">24</div>
            <div className="inv-stat-lbl">Investigadores Doutores & Mestres</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">12</div>
            <div className="inv-stat-lbl">Projetos Científicos Ativos</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">18+</div>
            <div className="inv-stat-lbl">Artigos Publicados (2023–2025)</div>
          </div>
        </div>

        {/* SE UM LABORATÓRIO ESTIVER SELECIONADO: INTERFACE DETALHADA */}
        {selectedLab ? (
          <div className="detail-view">
            <button
              className="detail-back-btn"
              onClick={() => selectLab(null)}
            >
              ← Voltar à lista de todos os laboratórios
            </button>

            <div className="detail-header-block">
              <div
                className="detail-icon-large"
                style={{ background: selectedLab.corBg, color: selectedLab.cor }}
              >
                {selectedLab.icone}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="inv-card-sigla">{selectedLab.sigla}</span>
                  <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>ISPOTEC Investigação</span>
                </div>
                <h2 className="detail-title">{selectedLab.nome}</h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.94rem', lineHeight: 1.6 }}>
                  {selectedLab.descricao}
                </p>
              </div>
            </div>

            {/* Info and Contact Bar */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <strong>Coordenador Científico</strong>
                <span>{selectedLab.coordenador}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Localização</strong>
                <span>{selectedLab.localizacao}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Contactos Telefónicos</strong>
                <span>{selectedLab.contacto}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Email Institucional</strong>
                <span>{selectedLab.email}</span>
              </div>
            </div>

            {/* Sub-tabs for Laboratory info */}
            <div className="detail-tabs">
              <button
                className={`detail-tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
                onClick={() => { setActiveTab('visao-geral'); setShowAddForm(false); }}
              >
                🔍 Linhas de Investigação ({selectedLab.areas.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'projetos' ? 'active' : ''}`}
                onClick={() => { setActiveTab('projetos'); setShowAddForm(false); }}
              >
                📋 Projetos Científicos ({selectedLab.projetos.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'investigadores' ? 'active' : ''}`}
                onClick={() => { setActiveTab('investigadores'); setShowAddForm(false); }}
              >
                👥 Investigadores ({selectedLab.investigadores.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'publicacoes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('publicacoes'); setShowAddForm(false); }}
              >
                📚 Publicações ({selectedLab.publicacoes.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'atividades' ? 'active' : ''}`}
                onClick={() => { setActiveTab('atividades'); setShowAddForm(false); }}
              >
                ⚡ Atividades e Serviços
              </button>
            </div>

            {/* TAB CONTENT: ÁREAS / VISÃO GERAL */}
            {activeTab === 'visao-geral' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Linhas e Áreas de Investigação</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {selectedLab.areas.map((area, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🎯</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROJETOS */}
            {activeTab === 'projetos' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Projetos de Investigação em Curso</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Projeto Científico'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleAddProject}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>Novo Projeto Científico</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Título do Projeto *"
                      value={novoProj.titulo}
                      onChange={e => setNovoProj({ ...novoProj, titulo: e.target.value })}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Entidade Financiadora"
                        value={novoProj.financiamento}
                        onChange={e => setNovoProj({ ...novoProj, financiamento: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Período (ex: 2025 - 2027)"
                        value={novoProj.periodo}
                        onChange={e => setNovoProj({ ...novoProj, periodo: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="inv-input"
                      rows="2"
                      placeholder="Resumo do projeto..."
                      value={novoProj.resumo}
                      onChange={e => setNovoProj({ ...novoProj, resumo: e.target.value })}
                    />
                    <div>
                      <button type="submit" className="btn-add-action-blue">Salvar Projeto</button>
                    </div>
                  </form>
                )}

                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  {selectedLab.projetos.map((proj) => (
                    <div key={proj.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                          {proj.titulo}
                        </h4>
                        <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                          ● {proj.estado}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>
                        {proj.resumo}
                      </p>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                          <span>💰 <strong>Financiamento:</strong> {proj.financiamento}</span>
                          <span>📅 <strong>Período:</strong> {proj.periodo}</span>
                        </div>
                        {(canEdit || canDelete) && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {canEdit && (
                              <button
                                className="btn-edit-action"
                                onClick={() => handleEditProject(proj)}
                              >
                                ✏️ Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-del-action"
                                onClick={() => handleDeleteProject(proj.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: INVESTIGADORES */}
            {activeTab === 'investigadores' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Corpo de Investigadores</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Investigador'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleAddResearcher}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>Novo Investigador</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Nome Completo *"
                      value={novoInv.nome}
                      onChange={e => setNovoInv({ ...novoInv, nome: e.target.value })}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Cargo / Posição"
                        value={novoInv.cargo}
                        onChange={e => setNovoInv({ ...novoInv, cargo: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Titulação Académica (ex: Mestre em...)"
                        value={novoInv.titulacao}
                        onChange={e => setNovoInv({ ...novoInv, titulacao: e.target.value })}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn-add-action-blue">Salvar Investigador</button>
                    </div>
                  </form>
                )}

                <div className="researcher-grid">
                  {selectedLab.investigadores.map((inv) => (
                    <div key={inv.id || inv.nome} className="researcher-card">
                      <div>
                        <strong>{inv.nome}</strong>
                        <span className="role">{inv.cargo}</span>
                        <span className="titulacao">🎓 {inv.titulacao}</span>
                      </div>
                      {(canEdit || canDelete) && (
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                          {canEdit && (
                            <button
                              className="btn-edit-action"
                              onClick={() => {
                                const newCargo = window.prompt('Editar cargo do investigador:', inv.cargo);
                                if (newCargo) {
                                  setLaboratorios(laboratorios.map(lab => lab.id === selectedLab.id ? {
                                    ...lab,
                                    investigadores: lab.investigadores.map(item => item.id === inv.id ? { ...item, cargo: newCargo } : item)
                                  } : lab));
                                }
                              }}
                            >
                              ✏️ Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn-del-action"
                              onClick={() => handleDeleteResearcher(inv.id)}
                            >
                              🗑️ Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PUBLICAÇÕES */}
            {activeTab === 'publicacoes' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Artigos e Publicações Científicas Recentes</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => setShowAddForm(!showAddForm)}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Publicação'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleAddPublication}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>Nova Publicação Científica</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Título do Artigo / Publicação *"
                      value={novaPub.titulo}
                      onChange={e => setNovaPub({ ...novaPub, titulo: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Revista / Periódico (ex: Revista Científica ISPOTEC, 2024)"
                      value={novaPub.revista}
                      onChange={e => setNovaPub({ ...novaPub, revista: e.target.value })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Autores"
                        value={novaPub.autores}
                        onChange={e => setNovaPub({ ...novaPub, autores: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="DOI ou Link"
                        value={novaPub.doi}
                        onChange={e => setNovaPub({ ...novaPub, doi: e.target.value })}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn-add-action-blue">Salvar Publicação</button>
                    </div>
                  </form>
                )}

                <div>
                  {selectedLab.publicacoes.map((pub) => (
                    <div key={pub.id || pub.titulo} className="pub-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div className="pub-title">{pub.titulo}</div>
                          <div className="pub-meta">
                            <span>📖 <strong>Revista:</strong> {pub.revista}</span> &nbsp;|&nbsp; 
                            <span>👥 <strong>Autores:</strong> {pub.autores}</span>
                          </div>
                          <div className="pub-doi">{pub.doi}</div>
                        </div>
                        {(canEdit || canDelete) && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                            {canEdit && (
                              <button
                                className="btn-edit-action"
                                onClick={() => {
                                  const newT = window.prompt('Editar título da publicação:', pub.titulo);
                                  if (newT) {
                                    setLaboratorios(laboratorios.map(lab => lab.id === selectedLab.id ? {
                                      ...lab,
                                      publicacoes: lab.publicacoes.map(item => (item.id === pub.id || item.titulo === pub.titulo) ? { ...item, titulo: newT } : item)
                                    } : lab));
                                  }
                                }}
                              >
                                ✏️ Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-del-action"
                                onClick={() => handleDeletePublication(pub.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: ATIVIDADES */}
            {activeTab === 'atividades' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Atividades e Serviços Científicos</h3>
                </div>
                <ul className="activity-list">
                  {selectedLab.atividades.map((act, i) => (
                    <li key={i} className="activity-item">
                      <span>🔬 {act}</span>
                      {(canEdit || canDelete) && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                          {canEdit && (
                            <button
                              className="btn-edit-action"
                              onClick={() => {
                                const newAct = window.prompt('Editar atividade:', act);
                                if (newAct) {
                                  setLaboratorios(laboratorios.map(lab => lab.id === selectedLab.id ? {
                                    ...lab,
                                    atividades: lab.atividades.map((a, idx) => idx === i ? newAct : a)
                                  } : lab));
                                }
                              }}
                            >
                              ✏️ Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              className="btn-del-action"
                              onClick={() => {
                                setLaboratorios(laboratorios.map(lab => lab.id === selectedLab.id ? {
                                  ...lab,
                                  atividades: lab.atividades.filter((_, idx) => idx !== i)
                                } : lab));
                              }}
                            >
                              🗑️ Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* SE NÃO HOUVER SELEÇÃO: LISTA COMPLETA DOS 6 LABORATÓRIOS */
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏛️</span> Laboratórios Científicos ISPOTEC ({laboratorios.length})
            </h2>

            <div className="inv-grid">
              {laboratorios.map(lab => (
                <div
                  key={lab.id}
                  className="inv-card"
                  style={{ '--lab-color': lab.cor }}
                  onClick={() => selectLab(lab.id)}
                >
                  <div>
                    <div className="inv-card-header">
                      <div
                        className="inv-card-icon"
                        style={{ background: lab.corBg, color: lab.cor }}
                      >
                        {lab.icone}
                      </div>
                      <div>
                        <h3 className="inv-card-name">{lab.nome}</h3>
                        <span className="inv-card-sigla">{lab.sigla}</span>
                      </div>
                    </div>

                    <p className="inv-card-desc">{lab.descricao}</p>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>
                      👤 <strong>Coordenação:</strong> {lab.coordenador}
                    </div>

                    <div className="inv-areas-tags">
                      {lab.areas.slice(0, 3).map((area, i) => (
                        <span key={i} className="area-tag">{area}</span>
                      ))}
                      {lab.areas.length > 3 && (
                        <span className="area-tag" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                          +{lab.areas.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="inv-card-footer">
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {lab.projetos.length} projetos • {lab.publicacoes.length} publicações
                    </span>
                    <button
                      className="inv-btn-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectLab(lab.id);
                      }}
                    >
                      Ver Detalhes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
