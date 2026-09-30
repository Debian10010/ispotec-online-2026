import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const initialCentrosPraticas = [
  {
    id: 'medicas',
    nome: 'Centro de Práticas Médicas',
    sigla: 'CPM',
    curso: 'Medicina Geral e Cirurgia',
    area: 'Ciências Médicas e Clínicas',
    icone: '🩺',
    cor: '#0284c7',
    corBg: '#e0f2fe',
    descricao: 'Centro vocacionado ao treino clínico avançado, simulação cirúrgica, semiologia e atendimento primário com supervisão docente.',
    coordenador: 'Dr. Salvador Manhiça (Especialista em Medicina Interna)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Edifício Clínico ISPOTEC – Bloco B, Piso 1',
    projetos: [
      {
        id: 'pm-1',
        titulo: 'Clínica Móvel Comunitária na Matola',
        descricao: 'Atendimento médico gratuito e rastreio de hipertensão e diabetes em bairros periféricos da Matola.',
        impacto: 'Mais de 1.400 munícipes atendidos em 2024/2025.',
        estado: 'Em Curso',
        dataInicio: 'Março 2024'
      },
      {
        id: 'pm-2',
        titulo: 'Simulação e Emergências Médicas',
        descricao: 'Treino prático de estudantes em suporte básico e avançado de vida através de manequins de alta fidelidade.',
        impacto: '280 estudantes certificados em BLS/ACLS.',
        estado: 'Ativo Permanente',
        dataInicio: 'Fevereiro 2023'
      },
      {
        id: 'pm-3',
        titulo: 'Campanha de Diagnóstico Precoce de Doenças Crónicas',
        descricao: 'Triagem e acompanhamento comunitário com encaminhamento para os centros de saúde da província.',
        impacto: 'Redução no tempo de diagnóstico primário na comunidade.',
        estado: 'Em Curso',
        dataInicio: 'Agosto 2024'
      }
    ],
    parceiros: [
      {
        id: 'parc-m1',
        nome: 'Hospital Geral José Macamo',
        tipo: 'Hospitalar / Saúde Pública',
        contribuicao: 'Estágios clínicos tutelados e cooperação assistencial.',
        logoIcon: '🏥'
      },
      {
        id: 'parc-m2',
        nome: 'Direcção Provincial de Saúde de Maputo',
        tipo: 'Entidade Pública Governamental',
        contribuicao: 'Protocolo de intervenção comunitária e validação sanitária.',
        logoIcon: '🏛️'
      },
      {
        id: 'parc-m3',
        nome: 'Cruz Vermelha de Moçambique',
        tipo: 'ONG Humanitária',
        contribuicao: 'Logística de apoio em acções de emergência e triagem social.',
        logoIcon: '🚑'
      }
    ]
  },
  {
    id: 'empresariais',
    nome: 'Centro de Práticas Empresariais',
    sigla: 'CPE',
    curso: 'Gestão de Empresas e Contabilidade',
    area: 'Ciências Económicas e Empresariais',
    icone: '💼',
    cor: '#059669',
    corBg: '#d1fae5',
    descricao: 'Incubadora e aceleradora de ideias de negócio, consultoria júnior para micro e pequenas empresas locais e simulação de mercados corporativos.',
    coordenador: 'Prof.ª Dra. Amina Patel (Gestão Estratégica)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Edifício Inovação – Piso 2',
    projetos: [
      {
        id: 'pe-1',
        titulo: 'Clínica de Finanças para Microempresários (MEIs)',
        descricao: 'Consultoria gratuita para pequenos comerciantes da Matola sobre fluxo de caixa, gestão fiscal e bancarização.',
        impacto: '85 negócios formalizados e orientados.',
        estado: 'Em Curso',
        dataInicio: 'Janeiro 2024'
      },
      {
        id: 'pe-2',
        titulo: 'ISPOTEC Startup Lab',
        descricao: 'Incubação de projetos inovadores de estudantes com mentoria de empresários seniores de Moçambique.',
        impacto: '12 startups incubadas com modelos viáveis.',
        estado: 'Ativo Permanente',
        dataInicio: 'Maio 2023'
      },
      {
        id: 'pe-3',
        titulo: 'Observatório de Competitividade Local',
        descricao: 'Estudos semestrais sobre comportamento do consumidor e tendências comerciais no corredor industrial de Maputo/Matola.',
        impacto: 'Publicação de 3 relatórios anuais de mercado.',
        estado: 'Em Curso',
        dataInicio: 'Outubro 2024'
      }
    ],
    parceiros: [
      {
        id: 'parc-e1',
        nome: 'CTA - Confederação das Associações Económicas',
        tipo: 'Associação Empresarial',
        contribuicao: 'Conexão com empresas associadas e facilitação de mentorias.',
        logoIcon: '🏢'
      },
      {
        id: 'parc-e2',
        nome: 'Balança Comercial e Consultores Moçambique',
        tipo: 'Empresa Privada',
        contribuicao: 'Estágios profissionais e licenças de software de contabilidade.',
        logoIcon: '📈'
      },
      {
        id: 'parc-e3',
        nome: 'Associação de Pequenos Comerciantes da Matola',
        tipo: 'Comunitária / Setorial',
        contribuicao: 'Ponto focal de beneficiários de consultorias do CPE.',
        logoIcon: '🤝'
      }
    ]
  },
  {
    id: 'conflitos',
    nome: 'Centro de Resolução de Conflitos',
    sigla: 'CRC',
    curso: 'Direito e Relações Internacionais',
    area: 'Ciências Jurídicas e Sociais',
    icone: '⚖️',
    cor: '#b45309',
    corBg: '#fef3c7',
    descricao: 'Serviço de mediação, arbitragem, conciliação e assistência jurídica à comunidade universitária e cidadãos de baixa renda.',
    coordenador: 'Mestre Pascoal Mabjaia (Jurista e Mediador Certificado)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Gabinete Jurídico ISPOTEC – Bloco Central, Sala 14',
    projetos: [
      {
        id: 'rc-1',
        titulo: 'Gabinete Comunitário de Mediação de Litígios Civis e Familiares',
        descricao: 'Mediação extrajudicial rápida de conflitos de herança, posse de terra urbana e pensão alimentar com valor executivo.',
        impacto: 'Mais de 230 processos mediados com acordo satisfatório.',
        estado: 'Ativo Permanente',
        dataInicio: 'Julho 2023'
      },
      {
        id: 'rc-2',
        titulo: 'Educação em Cidadania e Direitos Fundamentais',
        descricao: 'Palestras formativas em escolas do ensino secundário sobre direitos humanos, deveres cívicos e combate à violência doméstica.',
        impacto: 'Mais de 2.000 jovens alcançados.',
        estado: 'Em Curso',
        dataInicio: 'Fevereiro 2024'
      },
      {
        id: 'rc-3',
        titulo: 'Clínica Jurídica Pro Bono',
        descricao: 'Apoio na elaboração de minutas e assessoria a munícipes em situação de vulnerabilidade económica.',
        impacto: 'Atendimento jurídico continuado.',
        estado: 'Em Curso',
        dataInicio: 'Novembro 2023'
      }
    ],
    parceiros: [
      {
        id: 'parc-c1',
        nome: 'Ordem dos Advogados de Moçambique (OAM)',
        tipo: 'Ordem Profissional',
        contribuicao: 'Homologação e apoio técnico a estagiários e estudantes de direito.',
        logoIcon: '📜'
      },
      {
        id: 'parc-c2',
        nome: 'Tribunal Judicial do Distrito da Matola',
        tipo: 'Poder Judiciário',
        contribuicao: 'Acompanhamento processual didático e visitas técnicas.',
        logoIcon: '🏛️'
      },
      {
        id: 'parc-c3',
        nome: 'Liga Moçambicana dos Direitos Humanos',
        tipo: 'Sociedade Civil',
        contribuicao: 'Projetos conjuntos de advocacia de direitos e apoio a vítimas.',
        logoIcon: '🛡️'
      }
    ]
  },
  {
    id: 'tecnologicas',
    nome: 'Centro de Práticas Tecnológicas',
    sigla: 'CPT',
    curso: 'Engenharia Informática e Tecnologias de Informação',
    area: 'Engenharia e Tecnologias Digitais',
    icone: '💻',
    cor: '#4f46e5',
    corBg: '#ede9fe',
    descricao: 'Desenvolvimento prático de software, manutenção computacional, automação industrial, redes e suporte tecnológico a entidades comunitárias.',
    coordenador: 'Eng.º Tomás Cungara (Especialista em Redes e Sistemas Distribuídos)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Hub de Engenharia – Edifício Tecnológico, Sala 3',
    projetos: [
      {
        id: 'pt-1',
        titulo: 'Fábrica de Software Comunitário',
        descricao: 'Criação de aplicativos web e móveis para organizações sem fins lucrativos e cooperativas locais.',
        impacto: '5 plataformas ativas para escolas e cooperativas.',
        estado: 'Em Curso',
        dataInicio: 'Abril 2023'
      },
      {
        id: 'pt-2',
        titulo: 'Hospital de Computadores e Inclusão Digital',
        descricao: 'Recuperação e doação de computadores avariados para laboratórios de escolas públicas e formação básica em informática.',
        impacto: 'Mais de 160 computadores recondicionados e entregues.',
        estado: 'Ativo Permanente',
        dataInicio: 'Janeiro 2024'
      },
      {
        id: 'pt-3',
        titulo: 'Oficina de Robótica e IoT para Jovens',
        descricao: 'Capacitação prática em automação residencial e circuitos inteligentes com Arduino e ESP32.',
        impacto: '90 participantes formados com protótipos funcionais.',
        estado: 'Em Curso',
        dataInicio: 'Setembro 2024'
      }
    ],
    parceiros: [
      {
        id: 'parc-t1',
        nome: 'Cisco Networking Academy',
        tipo: 'Multinacional Tecnológica',
        contribuicao: 'Certificações gratuitas e equipamentos de roteamento/comutação.',
        logoIcon: '🌐'
      },
      {
        id: 'parc-t2',
        nome: 'Associação Moçambicana de Empresas de Software (AMES)',
        tipo: 'Sector Empresarial TIC',
        contribuicao: 'Vagas de estágio, desafios de código e contratações directas.',
        logoIcon: '🖥️'
      },
      {
        id: 'parc-t3',
        nome: 'Instituto Nacional das Comunicações de Moçambique (INCM)',
        tipo: 'Órgão Regulador Estatal',
        contribuicao: 'Apoio em normas de telecomunicações e eventos de inovação.',
        logoIcon: '📡'
      }
    ]
  },
  {
    id: 'psicologicas',
    nome: 'Centro de Práticas Psicológicas',
    sigla: 'CPP',
    curso: 'Psicologia Clínica e Organizacional',
    area: 'Ciências Humanas e Saúde Mental',
    icone: '🧠',
    cor: '#db2777',
    corBg: '#fce7f3',
    descricao: 'Atendimento psicológico de apoio, orientação vocacional e desenvolvimento emocional de estudantes, professores e comunidade.',
    coordenador: 'Dra. Luísa Chongo (Psicóloga Clínica e Terapeuta Sistémica)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Clínica-Escola de Psicologia ISPOTEC – Bloco D',
    projetos: [
      {
        id: 'pp-1',
        titulo: 'Plantão Psicológico e Escuta Activa ISPOTEC',
        descricao: 'Sessões de primeira escuta e acolhimento emocional imediato para estudantes universitários sob estresse académico.',
        impacto: 'Mais de 450 atendimentos realizados anualmente.',
        estado: 'Ativo Permanente',
        dataInicio: 'Março 2023'
      },
      {
        id: 'pp-2',
        titulo: 'Orientação Vocacional e Carreira no Ensino Secundário',
        descricao: 'Aplicação de baterias psicométricas e oficinas de orientação profissional para alunos concluintes da 12ª classe.',
        impacto: '1.200 alunos orientados na escolha de carreira.',
        estado: 'Em Curso',
        dataInicio: 'Maio 2024'
      },
      {
        id: 'pp-3',
        titulo: 'Círculos de Diálogo para Saúde Mental no Trabalho',
        descricao: 'Intervenções psicoeducativas em empresas e instituições públicas para prevenir burnout e promover bem-estar colectivo.',
        impacto: '18 instituições capacitadas.',
        estado: 'Em Curso',
        dataInicio: 'Julho 2024'
      }
    ],
    parceiros: [
      {
        id: 'parc-p1',
        nome: 'Associação Moçambicana de Psicologia (Psicocidadão)',
        tipo: 'Associação Científico-Profissional',
        contribuicao: 'Supervisão de ética profissional e jornadas temáticas.',
        logoIcon: '👥'
      },
      {
        id: 'parc-p2',
        nome: 'Centro Psiquiátrico de Infulene',
        tipo: 'Unidade Hospitalar de Referência',
        contribuicao: 'Estágios de observação clínica e protocolos de encaminhamento.',
        logoIcon: '🏥'
      },
      {
        id: 'parc-p3',
        nome: 'Gabinete de Atendimento à Família e Menor da Polícia',
        tipo: 'Protecção Social Institucional',
        contribuicao: 'Articulação em casos de apoio a vítimas e acolhimento psicoemocional.',
        logoIcon: '🤝'
      }
    ]
  },
  {
    id: 'saude-publica',
    nome: 'Centro de Práticas de Saúde Pública',
    sigla: 'CPSP',
    curso: 'Saúde Pública, Enfermagem e Farmácia',
    area: 'Saúde Comunitária e Epidemiologia',
    icone: '🌍',
    cor: '#0d9488',
    corBg: '#ccfbf1',
    descricao: 'Vigilância epidemiológica comunitária, acções de saneamento, educação sanitária preventiva e promoção da saúde nas comunidades locais.',
    coordenador: 'Dr. Belmiro Moiane (Epidemiologista e Sanitarista)',
    contacto: '878787442 | 877906666 | 873045610',
    localizacao: 'Pavilhão de Saúde Comunitária – Bloco E',
    projetos: [
      {
        id: 'sp-1',
        titulo: 'Vigilância Comunitária e Prevenção de Doenças Hídricas',
        descricao: 'Monotorização da qualidade da água potável, desinfecção de poços e distribuição de soluções de cloração em bairros propensos à cólera.',
        impacto: 'Cobertura em 8 bairros vulneráveis com diminuição de casos.',
        estado: 'Ativo Permanente',
        dataInicio: 'Janeiro 2024'
      },
      {
        id: 'sp-2',
        titulo: 'Campanha de Vacinação e Rastreio Nutricional Infantil',
        descricao: 'Apoio logístico e operacional às brigadas de vacinação e avaliação antropométrica de crianças menores de 5 anos.',
        impacto: '3.500 crianças rastreadas e integradas em programas alimentares.',
        estado: 'Em Curso',
        dataInicio: 'Fevereiro 2024'
      },
      {
        id: 'sp-3',
        titulo: 'ISPOTEC Saúde na Escola: Higiene e Saúde Reprodutiva',
        descricao: 'Workshops educativos interactivos nas escolas sobre prevenção de malária, HIV/SIDA e gravidez precoce.',
        impacto: 'Mais de 4.800 adolescentes envolvidos activamente.',
        estado: 'Em Curso',
        dataInicio: 'Abril 2023'
      }
    ],
    parceiros: [
      {
        id: 'parc-sp1',
        nome: 'Instituto Nacional de Saúde (INS)',
        tipo: 'Investigação Governamental',
        contribuicao: 'Cooperação técnica em vigilância de surtos e capacitações laboratoriais.',
        logoIcon: '🔬'
      },
      {
        id: 'parc-sp2',
        nome: 'Conselho Municipal da Cidade da Matola - Vereação da Saúde',
        tipo: 'Administração Pública Local',
        contribuicao: 'Autorizações de campo, mapeamento de focos e actuação comunitária integrada.',
        logoIcon: '🏛️'
      },
      {
        nome: 'Organização Mundial da Saúde (Escritório de Moçambique)',
        tipo: 'Agência Internacional Multilateral',
        contribuicao: 'Guias técnicos de capacitação comunitária e directrizes globais.',
        logoIcon: '🌐'
      }
    ]
  }
];

export default function Extensao() {
  const { canAdd, canEdit, canDelete } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'centros';
  const selectedCenterId = searchParams.get('center') || 'all';

  const [centros, setCentros] = useState(initialCentrosPraticas);
  const [showAddProjectFor, setShowAddProjectFor] = useState(null);
  const [showAddPartnerFor, setShowAddPartnerFor] = useState(null);

  const [novoProjeto, setNovoProjeto] = useState({ titulo: '', descricao: '', impacto: '', estado: 'Em Curso', dataInicio: '2025' });
  const [novoParceiro, setNovoParceiro] = useState({ nome: '', tipo: '', contribuicao: '', logoIcon: '🤝' });

  const setTab = (tab, center = selectedCenterId) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (center && center !== 'all') {
      params.set('center', center);
    }
    setSearchParams(params);
  };

  const setCenterFilter = (centerId) => {
    const params = new URLSearchParams(searchParams);
    if (centerId === 'all') {
      params.delete('center');
    } else {
      params.set('center', centerId);
    }
    setSearchParams(params);
  };

  const handleAddProject = (centroId, e) => {
    e.preventDefault();
    if (!novoProjeto.titulo) return;
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          projetos: [...c.projetos, { ...novoProjeto, id: `proj-${Date.now()}` }]
        };
      }
      return c;
    }));
    setNovoProjeto({ titulo: '', descricao: '', impacto: '', estado: 'Em Curso', dataInicio: '2025' });
    setShowAddProjectFor(null);
  };

  const handleDeleteProject = (centroId, projId) => {
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          projetos: c.projetos.filter(p => p.id !== projId)
        };
      }
      return c;
    }));
  };

  const handleEditProject = (centroId, proj) => {
    const newTitle = window.prompt('Editar título do projeto:', proj.titulo);
    if (!newTitle) return;
    const newDesc = window.prompt('Editar descrição:', proj.descricao) || proj.descricao;
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          projetos: c.projetos.map(p => p.id === proj.id ? { ...p, titulo: newTitle, descricao: newDesc } : p)
        };
      }
      return c;
    }));
  };

  const handleAddPartner = (centroId, e) => {
    e.preventDefault();
    if (!novoParceiro.nome) return;
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          parceiros: [...c.parceiros, { ...novoParceiro, id: `parc-${Date.now()}` }]
        };
      }
      return c;
    }));
    setNovoParceiro({ nome: '', tipo: '', contribuicao: '', logoIcon: '🤝' });
    setShowAddPartnerFor(null);
  };

  const handleDeletePartner = (centroId, partnerName) => {
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          parceiros: c.parceiros.filter(p => p.nome !== partnerName && p.id !== partnerName)
        };
      }
      return c;
    }));
  };

  const handleEditPartner = (centroId, partner) => {
    const newName = window.prompt('Editar nome do parceiro:', partner.nome);
    if (!newName) return;
    const newContrib = window.prompt('Editar contribuição do parceiro:', partner.contribuicao) || partner.contribuicao;
    setCentros(centros.map(c => {
      if (c.id === centroId) {
        return {
          ...c,
          parceiros: c.parceiros.map(p => (p.id === partner.id || p.nome === partner.nome) ? { ...p, nome: newName, contribuicao: newContrib } : p)
        };
      }
      return c;
    }));
  };

  const filteredCentros = selectedCenterId === 'all'
    ? centros
    : centros.filter(c => c.id === selectedCenterId);

  return (
    <>
      <style>{`
        .ext-container {
          padding-top: 1.5rem;
          padding-bottom: 3rem;
        }
        .ext-hero {
          background: linear-gradient(135deg, #059669 0%, #064e3b 100%);
          color: #fff;
          padding: 2.5rem 1.75rem;
          border-radius: 14px;
          margin-bottom: 2rem;
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.25);
          position: relative;
          overflow: hidden;
        }
        .ext-hero::after {
          content: '';
          position: absolute;
          right: -40px;
          bottom: -40px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 50%;
          pointer-events: none;
        }
        .ext-badge-top {
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
        .ext-hero h1 {
          font-size: 1.95rem;
          font-weight: 800;
          margin: 0 0 0.6rem;
          line-height: 1.25;
        }
        .ext-hero p {
          margin: 0;
          opacity: 0.93;
          font-size: 0.98rem;
          max-width: 860px;
          line-height: 1.6;
        }

        /* Flow diagram */
        .ext-flow-card {
          background: #ffffff;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04);
        }
        .flow-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .flow-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .flow-step-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.65rem 1.1rem;
          border-radius: 10px;
          flex: 1;
          min-width: 170px;
        }
        .flow-step-box.active {
          background: #ecfdf5;
          border-color: #a7f3d0;
        }
        .flow-step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #059669;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .flow-step-text strong {
          display: block;
          font-size: 0.88rem;
          color: #0f172a;
        }
        .flow-step-text small {
          font-size: 0.76rem;
          color: #64748b;
        }
        .flow-arrow {
          color: #94a3b8;
          font-size: 1.2rem;
          font-weight: 700;
        }

        /* Navigation Tabs */
        .ext-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .ext-tab-btn {
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #64748b;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ext-tab-btn:hover {
          color: #059669;
        }
        .ext-tab-btn.active {
          color: #059669;
          border-bottom-color: #059669;
          font-weight: 700;
        }

        /* Filter bar for Centers */
        .ext-filter-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          margin-right: 0.5rem;
        }
        .filter-btn {
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn:hover {
          border-color: #059669;
          color: #059669;
        }
        .filter-btn.active {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        /* Centro Cards */
        .centros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .centro-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.6rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          border-top: 4px solid var(--accent, #059669);
        }
        .centro-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -3px rgba(0,0,0,0.1);
        }
        .centro-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .centro-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
          flex-shrink: 0;
        }
        .centro-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.25rem;
          line-height: 1.3;
        }
        .centro-course-tag {
          display: inline-block;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          background: #f1f5f9;
          color: #334155;
        }
        .centro-desc {
          font-size: 0.89rem;
          color: #475569;
          line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .centro-meta {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 0.85rem;
          margin-bottom: 1.25rem;
          font-size: 0.81rem;
          color: #334155;
          display: grid;
          gap: 0.35rem;
        }
        .centro-counts {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .count-pill {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
          text-align: center;
        }
        .count-pill strong {
          display: block;
          font-size: 1.25rem;
          color: #059669;
          font-weight: 800;
        }
        .count-pill span {
          font-size: 0.74rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }
        .centro-card-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn-action-ext {
          flex: 1;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-action-ext:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        /* Action buttons for Docente / Admin */
        .btn-add-action-green {
          background: #059669; color: #fff; border: none; border-radius: 8px;
          padding: 0.45rem 0.95rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .btn-add-action-green:hover { background: #047857; }
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

        .ext-inline-form {
          background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 10px;
          padding: 1.25rem; margin-bottom: 1.25rem; display: grid; gap: 0.85rem;
        }
        .ext-input {
          width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1;
          border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
        }

        /* Projects Section */
        .project-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .project-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .project-block-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .project-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
        }
        .project-card:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }
        .project-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.45rem;
        }
        .project-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 0.85rem;
        }
        .project-impact {
          background: #ecfdf5;
          border: 1px solid #d1fae5;
          color: #065f46;
          border-radius: 6px;
          padding: 0.45rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 0.6rem;
        }

        /* Partners Section */
        .partners-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .partner-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .partner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.06);
        }
        .partner-logo-box {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .partner-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem;
        }
        .partner-type {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #047857;
          background: #ecfdf5;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          margin-bottom: 0.45rem;
        }
        .partner-contrib {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 0.5rem;
        }

        @media (max-width: 768px) {
          .ext-hero { padding: 1.75rem 1.25rem; }
          .ext-hero h1 { font-size: 1.5rem; }
          .centros-grid { grid-template-columns: 1fr; }
          .flow-arrow { display: none; }
          .flow-steps { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="container ext-container">
        {/* Header Extensão */}
        <div className="ext-hero">
          <div className="ext-badge-top">
            <span>🤝</span> Módulo Independente de Extensão Universitária
          </div>
          <h1>Centros de Práticas e Extensão ISPOTEC</h1>
          <p>
            O Módulo de Extensão Universitária conecta o saber académico do ISPOTEC às necessidades concretas da comunidade e do tecido empresarial moçambicano através de 6 Centros de Práticas vocacionados, projetos sociais e parcerias estratégicas.
          </p>
        </div>

        {/* Structural Flow Diagram */}
        <div className="ext-flow-card">
          <div className="flow-title">
            <span>🔗</span> Estrutura e Relação Académica da Extensão
          </div>
          <div className="flow-steps">
            <div className="flow-step-box active">
              <div className="flow-step-num">1</div>
              <div className="flow-step-text">
                <strong>Curso / Área</strong>
                <small>Formação teórica e competências</small>
              </div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step-box active">
              <div className="flow-step-num">2</div>
              <div className="flow-step-text">
                <strong>Centro de Práticas</strong>
                <small>Ambiente de aplicação e serviço</small>
              </div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step-box active">
              <div className="flow-step-num">3</div>
              <div className="flow-step-text">
                <strong>Projetos</strong>
                <small>Ação direta e impacto comunitário</small>
              </div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step-box active">
              <div className="flow-step-num">4</div>
              <div className="flow-step-text">
                <strong>Parceiros</strong>
                <small>Apoio institucional e tutoria</small>
              </div>
            </div>
          </div>
        </div>

        {/* Module Sub-Navigation */}
        <div className="ext-tabs">
          <button
            className={`ext-tab-btn ${currentTab === 'centros' ? 'active' : ''}`}
            onClick={() => setTab('centros')}
          >
            <span>🏛️</span> Centros de Práticas ({centros.length})
          </button>
          <button
            className={`ext-tab-btn ${currentTab === 'projetos' ? 'active' : ''}`}
            onClick={() => setTab('projetos')}
          >
            <span>📋</span> Projetos dos Centros de Práticas
          </button>
          <button
            className={`ext-tab-btn ${currentTab === 'parceiros' ? 'active' : ''}`}
            onClick={() => setTab('parceiros')}
          >
            <span>🤝</span> Parceiros dos Centros de Práticas
          </button>
        </div>

        {/* Filter bar by Centro */}
        <div className="ext-filter-bar">
          <span className="filter-label">Filtrar Centro:</span>
          <button
            className={`filter-btn ${selectedCenterId === 'all' ? 'active' : ''}`}
            onClick={() => setCenterFilter('all')}
          >
            Todos os Centros (6)
          </button>
          {centros.map(c => (
            <button
              key={c.id}
              className={`filter-btn ${selectedCenterId === c.id ? 'active' : ''}`}
              onClick={() => setCenterFilter(c.id)}
            >
              {c.icone} {c.sigla}
            </button>
          ))}
        </div>

        {/* TAB 1: CENTROS DE PRÁTICAS */}
        {currentTab === 'centros' && (
          <div className="centros-grid">
            {filteredCentros.map(c => (
              <div
                key={c.id}
                className="centro-card"
                style={{ '--accent': c.cor }}
              >
                <div>
                  <div className="centro-header">
                    <div
                      className="centro-icon"
                      style={{ background: c.corBg, color: c.cor }}
                    >
                      {c.icone}
                    </div>
                    <div>
                      <h2 className="centro-name">{c.nome}</h2>
                      <span className="centro-course-tag">
                        🎓 Curso: {c.curso}
                      </span>
                    </div>
                  </div>

                  <p className="centro-desc">{c.descricao}</p>

                  <div className="centro-meta">
                    <div><strong>Área Académica:</strong> {c.area}</div>
                    <div><strong>Coordenador:</strong> {c.coordenador}</div>
                    <div><strong>Localização:</strong> {c.localizacao}</div>
                    <div><strong>Contactos:</strong> {c.contacto}</div>
                  </div>

                  <div className="centro-counts">
                    <div className="count-pill">
                      <strong>{c.projetos.length}</strong>
                      <span>Projetos Ativos</span>
                    </div>
                    <div className="count-pill">
                      <strong>{c.parceiros.length}</strong>
                      <span>Parceiros Oficiais</span>
                    </div>
                  </div>
                </div>

                <div className="centro-card-actions">
                  <button
                    className="btn-action-ext"
                    onClick={() => setTab('projetos', c.id)}
                  >
                    Ver Projetos ({c.projetos.length}) →
                  </button>
                  <button
                    className="btn-action-ext"
                    onClick={() => setTab('parceiros', c.id)}
                  >
                    Ver Parceiros ({c.parceiros.length}) →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PROJETOS DOS CENTROS DE PRÁTICAS */}
        {currentTab === 'projetos' && (
          <div>
            {filteredCentros.map(c => (
              <div key={c.id} className="project-block">
                <div className="project-block-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>{c.icone}</span>
                    <div>
                      <h2 className="project-block-title">
                        Projetos do {c.nome}
                      </h2>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Associado ao curso de <strong>{c.curso}</strong>
                      </span>
                    </div>
                  </div>

                  {canAdd && (
                    <button
                      className="btn-add-action-green"
                      onClick={() => setShowAddProjectFor(showAddProjectFor === c.id ? null : c.id)}
                    >
                      {showAddProjectFor === c.id ? '✕ Cancelar' : '+ Adicionar Projeto'}
                    </button>
                  )}
                </div>

                {canAdd && showAddProjectFor === c.id && (
                  <form className="ext-inline-form" onSubmit={(e) => handleAddProject(c.id, e)}>
                    <h4 style={{ margin: 0, color: '#047857' }}>Novo Projeto para {c.nome}</h4>
                    <input
                      type="text"
                      className="ext-input"
                      placeholder="Título do Projeto *"
                      value={novoProjeto.titulo}
                      onChange={e => setNovoProjeto({ ...novoProjeto, titulo: e.target.value })}
                      required
                    />
                    <textarea
                      className="ext-input"
                      rows="2"
                      placeholder="Descrição do projeto..."
                      value={novoProjeto.descricao}
                      onChange={e => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                    />
                    <input
                      type="text"
                      className="ext-input"
                      placeholder="Impacto comunitário esperado"
                      value={novoProjeto.impacto}
                      onChange={e => setNovoProjeto({ ...novoProjeto, impacto: e.target.value })}
                    />
                    <div>
                      <button type="submit" className="btn-add-action-green">Salvar Projeto</button>
                    </div>
                  </form>
                )}

                <div className="projects-grid">
                  {c.projetos.map(proj => (
                    <div key={proj.id} className="project-card">
                      <div>
                        <h3 className="project-title">{proj.titulo}</h3>
                        <p className="project-desc">{proj.descricao}</p>
                        <div className="project-impact">
                          🌟 <strong>Impacto:</strong> {proj.impacto}
                        </div>
                      </div>
                      <div className="project-footer">
                        <span style={{ color: '#059669', fontWeight: 600 }}>● {proj.estado}</span>
                        {(canEdit || canDelete) ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {canEdit && (
                              <button
                                className="btn-edit-action"
                                onClick={() => handleEditProject(c.id, proj)}
                              >
                                ✏️ Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-del-action"
                                onClick={() => handleDeleteProject(c.id, proj.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        ) : (
                          <span>Início: {proj.dataInicio}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PARCEIROS DOS CENTROS DE PRÁTICAS */}
        {currentTab === 'parceiros' && (
          <div>
            {filteredCentros.map(c => (
              <div key={c.id} className="partners-block">
                <div className="project-block-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>{c.icone}</span>
                    <div>
                      <h2 className="project-block-title">
                        Parceiros do {c.nome}
                      </h2>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Rede de cooperação e suporte prático para estudantes de <strong>{c.curso}</strong>
                      </span>
                    </div>
                  </div>

                  {canAdd && (
                    <button
                      className="btn-add-action-green"
                      onClick={() => setShowAddPartnerFor(showAddPartnerFor === c.id ? null : c.id)}
                    >
                      {showAddPartnerFor === c.id ? '✕ Cancelar' : '+ Adicionar Parceiro'}
                    </button>
                  )}
                </div>

                {canAdd && showAddPartnerFor === c.id && (
                  <form className="ext-inline-form" onSubmit={(e) => handleAddPartner(c.id, e)}>
                    <h4 style={{ margin: 0, color: '#047857' }}>Novo Parceiro para {c.nome}</h4>
                    <input
                      type="text"
                      className="ext-input"
                      placeholder="Nome da Entidade / Parceiro *"
                      value={novoParceiro.nome}
                      onChange={e => setNovoParceiro({ ...novoParceiro, nome: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="ext-input"
                      placeholder="Tipo (ex: Empresa Privada, Hospital, ONG)"
                      value={novoParceiro.tipo}
                      onChange={e => setNovoParceiro({ ...novoParceiro, tipo: e.target.value })}
                    />
                    <textarea
                      className="ext-input"
                      rows="2"
                      placeholder="Contribuição / Protocolo com o centro..."
                      value={novoParceiro.contribuicao}
                      onChange={e => setNovoParceiro({ ...novoParceiro, contribuicao: e.target.value })}
                    />
                    <div>
                      <button type="submit" className="btn-add-action-green">Salvar Parceiro</button>
                    </div>
                  </form>
                )}

                <div className="partners-grid">
                  {c.parceiros.map((parceiro, i) => (
                    <div key={parceiro.id || i} className="partner-card">
                      <div className="partner-logo-box">{parceiro.logoIcon || '🤝'}</div>
                      <div style={{ flex: 1 }}>
                        <h3 className="partner-name">{parceiro.nome}</h3>
                        <span className="partner-type">{parceiro.tipo}</span>
                        <p className="partner-contrib">{parceiro.contribuicao}</p>

                        {(canEdit || canDelete) && (
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                            {canEdit && (
                              <button
                                className="btn-edit-action"
                                onClick={() => handleEditPartner(c.id, parceiro)}
                              >
                                ✏️ Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-del-action"
                                onClick={() => handleDeletePartner(c.id, parceiro.id || parceiro.nome)}
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
            ))}
          </div>
        )}
      </div>
    </>
  );
}
