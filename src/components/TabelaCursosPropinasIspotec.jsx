import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const DADOS_ISPOTEC_2027 = {
  mestrado: {
    titulo: 'Mestrado em Saúde Pública',
    duracao: '2 anos, com estágios',
    regime: 'Laboral e Pós-laboral',
    modalidade: 'Semi-Presencial e Online',
    requisito: 'Licenciatura em Ciências de Saúde, Biológicas ou áreas afins',
    inscricaoMatricula: '10.000 Mt',
    propinaMensal: '10.000 Mt + IVA',
    icone: '🔬'
  },
  licenciaturas: {
    titulo: 'Licenciaturas (4 anos, com estágios)',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    inscricaoMatricula: '4.000 Mt',
    duracao: '4 anos com estágios curriculares integrados',
    cursos: [
      { nome: 'Psicologia Clínica e Saúde no Trabalho', propina: '6.000 Mt', area: 'Saúde & Trabalho', icone: '🧠' },
      { nome: 'Enfermagem Geral', propina: '6.500 Mt', area: 'Ciências de Saúde', icone: '💉' },
      { nome: 'Saúde Pública', propina: '6.000 Mt', area: 'Ciências de Saúde', icone: '🩺' },
      { nome: 'Direito (Semi-Presencial e Online)', propina: '5.000 Mt', area: 'Ciências Jurídicas', icone: '⚖️' },
      { nome: 'Administração e Gestão de Recursos Humanos', propina: '5.000 Mt', area: 'Gestão & Negócios', icone: '📊' },
      { nome: 'Contabilidade e Finanças', propina: '5.000 Mt', area: 'Finanças & Auditoria', icone: '💰' }
    ]
  },
  posGraduacoes: {
    propinaMensal: '5.000 Mt/mês',
    inscricaoMatricula: '5.000 Mt',
    titulo: 'Pós-Graduações (8 meses, Online, Pós-laboral)',
    duracao: '8 meses',
    modalidade: 'Online',
    regime: 'Pós-laboral',
    grupos: [
      {
        subtitulo: 'a) Ciências de Saúde e Clínicas',
        icone: '🏥',
        cursos: [
          'Enfermagem Médica e Práticas Clínicas',
          'Enfermagem Clínica e da Comunidade',
          'Enfermagem Obstétrica e Pediátrica',
          'Ciências de Saúde e Doenças Tropicais',
          'Saúde Integrativa e Doenças Crónicas'
        ]
      },
      {
        subtitulo: 'b) Administração e Ciências Jurídicas',
        icone: '📜',
        cursos: [
          'Direito de Trabalho e Processo Laboral',
          'Direito Civil e Processual Civil',
          'Direito Penal e Processual Penal',
          'Direito Administrativo e Fiscal',
          'Mediação e Arbitragem',
          'Administração e Inteligência Estratégica'
        ]
      }
    ]
  },
  especializacoes: {
    propinaMensal: '4.500 Mt/mês',
    inscricaoMatricula: '4.000 Mt',
    titulo: 'Cursos de Especialização',
    icone: '⭐',
    cursos: [
      'Pedagogia, Didática e Ensino a Distância',
      'Planificação, Coordenação e Supervisão Pedagógica',
      'Psicoterapia e Saúde Ocupacional',
      'Enfermagem Diabética e Nutricional',
      'Enfermagem de Cuidados Domiciliários e Reabilitação'
    ]
  },
  curtaDuracao: {
    titulo: 'Cursos de Curta Duração',
    icone: '⏱️',
    cursos: [
      'Pedagogia e Gestão Académica no Ensino em Saúde',
      'Emergências Médicas e Primeiros Socorros',
      'Enfermagem Domiciliária e Técnicas de Reabilitação',
      'Empreendedorismo e Gestão de Projectos',
      'Gestão de Negócios e Marketing Estratégico',
      'Liderança e Gestão de Recursos Humanos'
    ]
  },
  ceap: {
    titulo: 'CEAP – Centro de Estudos Avançados e Pós-graduação (Inscrições Abertas)',
    modalidade: 'Virtual (Online)',
    duracao: '7 meses + 1 mês (Monografia)',
    regime: 'Pós-laboral',
    contacto: '878787442',
    icone: '🏛️',
    cursos: [
      'Enfermagem Clínica e da Comunidade',
      'Enfermagem Médica e Pediátrica',
      'Direito de Trabalho e Processo Laboral',
      'Direito Civil e Processual Civil',
      'Direito Penal e Processual Penal',
      'Mediação e Arbitragem',
      'Administração e Inteligência Estratégica',
      'Pedagogia, Didática e Ensino Virtual'
    ]
  },
  contactos: {
    telefones: ['878787442', '877906666', '873045610'],
    email: 'Ispotec.politecnica@gmail.com',
    endereco: 'Rua da Mozal, 5354, Paragem Antena, Matola-Rio, Maputo'
  }
};

export default function TabelaCursosPropinasIspotec() {
  const [tabAtiva, setTabAtiva] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');

  const { mestrado, licenciaturas, posGraduacoes, especializacoes, curtaDuracao, ceap, contactos } = DADOS_ISPOTEC_2027;

  return (
    <section className="ispotec-cursos-propinas-section" style={{
      background: 'white',
      border: '1px solid var(--isp-slate-200)',
      borderRadius: 'var(--isp-radius-lg)',
      padding: '1.75rem',
      boxShadow: 'var(--isp-shadow-sm)',
      marginBottom: '2.5rem'
    }}>
      <style>{`
        .icp-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--isp-slate-100);
        }
        .icp-badge-ano {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #0284c7, #0055a4);
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .icp-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--isp-slate-900);
          margin: 0.5rem 0 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .icp-subtitle {
          font-size: 0.9rem;
          color: var(--isp-slate-500);
          margin: 0;
          line-height: 1.5;
        }
        .icp-tabs-bar {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          scrollbar-width: thin;
        }
        .icp-tab-btn {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid var(--isp-slate-200);
          background: var(--isp-slate-50);
          color: var(--isp-slate-700);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .icp-tab-btn:hover {
          background: var(--isp-blue-50);
          color: var(--isp-blue-700);
          border-color: var(--isp-blue-200);
        }
        .icp-tab-btn.active {
          background: #0055a4;
          color: white;
          border-color: #0055a4;
          box-shadow: 0 2px 6px rgba(0, 85, 164, 0.25);
        }
        .icp-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: 1.25rem;
        }
        .icp-card {
          border: 1px solid var(--isp-slate-200);
          border-radius: var(--isp-radius-md);
          padding: 1.25rem;
          background: var(--isp-slate-50);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .icp-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--isp-shadow-md);
          background: white;
        }
        .icp-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: var(--isp-radius-md);
          border: 1px solid var(--isp-slate-200);
          margin-top: 0.75rem;
          background: white;
        }
        .icp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .icp-table th {
          background: #f1f5f9;
          padding: 0.75rem 1rem;
          font-weight: 700;
          color: var(--isp-slate-700);
          border-bottom: 2px solid var(--isp-slate-200);
        }
        .icp-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--isp-slate-100);
          color: var(--isp-slate-800);
        }
        .icp-table tr:last-child td {
          border-bottom: none;
        }
        .icp-propina-tag {
          font-weight: 800;
          color: #0055a4;
          font-size: 0.95rem;
          background: #eff6ff;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          display: inline-block;
        }
        .icp-list-items {
          list-style: none;
          padding: 0;
          margin: 0.75rem 0 0;
          display: grid;
          gap: 0.45rem;
        }
        .icp-list-items li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--isp-slate-700);
          background: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid var(--isp-slate-200);
        }
        .icp-contact-bar {
          margin-top: 1.5rem;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid var(--isp-slate-200);
          border-radius: var(--isp-radius-md);
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
      `}</style>

      {/* Header with Title and Year Badge */}
      <div className="icp-header">
        <div>
          <span className="icp-badge-ano">
            📅 Inscrições para 2027 Abertas
          </span>
          <h2 className="icp-title">
            <span>🏛️</span> ISPOTEC — Instituto Superior Politécnico
          </h2>
          <p className="icp-subtitle">
            Tabela oficial de cursos, requisitos, modalidades e propinas mensais (Mestrados, Licenciaturas, Pós-Graduações e Especializações).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <a
            href="https://api.whatsapp.com/send/?phone=258878787442&text=Ola%20ISPOTEC,%20gostaria%20de%20informacoes%20sobre%20as%20inscricoes%20de%202027"
            target="_blank"
            rel="noreferrer"
            className="btn btn-success"
            style={{ padding: '0.55rem 1rem', fontSize: '0.84rem', fontWeight: 700 }}
          >
            💬 Inscrever-se via WhatsApp
          </a>
          <Link
            to="/pre-inscricao"
            className="btn btn-primary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.84rem', fontWeight: 700 }}
          >
            📝 Pré-Inscrição 2027
          </Link>
          <Link
            to="/consultar-candidatura"
            className="btn btn-outline-secondary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.84rem', fontWeight: 600 }}
          >
            🔍 Consultar Candidatura
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="icp-tabs-bar" role="tablist">
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'todos' ? 'active' : ''}`}
          onClick={() => setTabAtiva('todos')}
        >
          🔍 Visão Geral Completa
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'mestrado' ? 'active' : ''}`}
          onClick={() => setTabAtiva('mestrado')}
        >
          🎓 Mestrado (Saúde Pública)
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'licenciaturas' ? 'active' : ''}`}
          onClick={() => setTabAtiva('licenciaturas')}
        >
          📚 Licenciaturas (4 Anos)
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'pos_graduacoes' ? 'active' : ''}`}
          onClick={() => setTabAtiva('pos_graduacoes')}
        >
          🩺 Pós-Graduações (8 Meses)
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'ceap' ? 'active' : ''}`}
          onClick={() => setTabAtiva('ceap')}
        >
          🏛️ CEAP (Pós-Graduação Virtual)
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'especializacoes' ? 'active' : ''}`}
          onClick={() => setTabAtiva('especializacoes')}
        >
          ⭐ Especializações
        </button>
        <button
          type="button"
          className={`icp-tab-btn ${tabAtiva === 'curta_duracao' ? 'active' : ''}`}
          onClick={() => setTabAtiva('curta_duracao')}
        >
          ⏱️ Curta Duração
        </button>
      </div>

      {/* 1. MESTRADO EM SAÚDE PÚBLICA */}
      {(tabAtiva === 'todos' || tabAtiva === 'mestrado') && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--isp-radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{mestrado.icone}</span> {mestrado.titulo}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {mestrado.duracao}
              </span>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {mestrado.modalidade}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Requisito de Entrada</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{mestrado.requisito}</div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Regime de Aulas</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{mestrado.regime}</div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Inscrição &amp; Matrícula</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{mestrado.inscricaoMatricula}</div>
            </div>

            <div style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Propina Mensal</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0055a4', marginTop: '2px' }}>{mestrado.propinaMensal}</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LICENCIATURAS (4 ANOS) */}
      {(tabAtiva === 'todos' || tabAtiva === 'licenciaturas') && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--isp-slate-900)' }}>
              🎓 {licenciaturas.titulo}
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--isp-slate-600)' }}>
              Requisito: <strong>{licenciaturas.requisito}</strong> • Matrícula: <strong style={{ color: '#059669' }}>{licenciaturas.inscricaoMatricula}</strong>
            </div>
          </div>

          <div className="icp-table-wrap">
            <table className="icp-table">
              <thead>
                <tr>
                  <th>Curso de Licenciatura</th>
                  <th>Área Científica</th>
                  <th>Duração &amp; Estágio</th>
                  <th>Propina Mensal</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {licenciaturas.cursos.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <span>{c.icone}</span>
                        <span>{c.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                        {c.area}
                      </span>
                    </td>
                    <td>4 anos (com estágios)</td>
                    <td>
                      <span className="icp-propina-tag">{c.propina}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to="/pre-inscricao"
                        className="btn btn-outline-primary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Candidatar-se
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PÓS-GRADUAÇÕES (8 MESES, ONLINE, PÓS-LABORAL) */}
      {(tabAtiva === 'todos' || tabAtiva === 'pos_graduacoes') && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--isp-slate-900)' }}>
              🩺 {posGraduacoes.titulo}
            </h3>
            <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0284c7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
              Modalidade Online • Regime Pós-laboral
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1.25rem' }}>
            {posGraduacoes.grupos.map((grupo, gIdx) => (
              <div key={gIdx} className="icp-card">
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>{grupo.icone}</span>
                  <span>{grupo.subtitulo}</span>
                </div>
                <ul className="icp-list-items">
                  {grupo.cursos.map((item, iIdx) => (
                    <li key={iIdx}>
                      <span style={{ color: '#0055a4', fontWeight: 'bold' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CEAP – CENTRO DE ESTUDOS AVANÇADOS E PÓS-GRADUAÇÃO */}
      {(tabAtiva === 'todos' || tabAtiva === 'ceap') && (
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)',
          border: '1px solid #f3e8ff',
          borderRadius: 'var(--isp-radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', background: '#7c3aed', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                Unidade Especializada CEAP
              </span>
              <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#581c87' }}>
                {ceap.titulo}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                {ceap.modalidade}
              </span>
              <span style={{ background: '#fae8ff', color: '#a21caf', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                {ceap.duracao}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#6b21a8', margin: '0 0 1rem', lineHeight: '1.45' }}>
            Pós-Graduações modulares de alta performance para quadros de Saúde, Direito e Administração:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.6rem' }}>
            {ceap.cursos.map((c, i) => (
              <div key={i} style={{ background: 'white', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid #e9d5ff', fontSize: '0.84rem', fontWeight: 600, color: '#3b0764', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#7c3aed' }}>🎓</span>
                <span>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <a
              href={`tel:+258${ceap.contacto}`}
              className="btn btn-outline-primary"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem', borderColor: '#7c3aed', color: '#7c3aed' }}
            >
              📞 Linha Direta CEAP: {ceap.contacto}
            </a>
          </div>
        </div>
      )}

      {/* 5. ESPECIALIZAÇÃO & CURTA DURAÇÃO */}
      {(tabAtiva === 'todos' || tabAtiva === 'especializacoes' || tabAtiva === 'curta_duracao') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {(tabAtiva === 'todos' || tabAtiva === 'especializacoes') && (
            <div className="icp-card">
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--isp-slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{especializacoes.icone}</span> {especializacoes.titulo}
              </h3>
              <ul className="icp-list-items">
                {especializacoes.cursos.map((item, idx) => (
                  <li key={idx}>
                    <span style={{ color: '#0284c7', fontWeight: 'bold' }}>⭐</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(tabAtiva === 'todos' || tabAtiva === 'curta_duracao') && (
            <div className="icp-card">
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--isp-slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{curtaDuracao.icone}</span> {curtaDuracao.titulo}
              </h3>
              <ul className="icp-list-items">
                {curtaDuracao.cursos.map((item, idx) => (
                  <li key={idx}>
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>⏱️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO OFICIAL DE DADOS BANCÁRIOS - EDITAL 2027 */}
      <div style={{
        background: '#f8fafc',
        border: '2px solid #003366',
        borderRadius: 'var(--isp-radius-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(0, 51, 102, 0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏦</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#003366' }}>
                Contas Bancárias Oficiais para Pagamento de Propinas &amp; Taxas — BCI / ISPOTEC
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Instituto Superior Politécnico e de Tecnologias • Sujeito a IVA de 5%
              </span>
            </div>
          </div>
          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            Ano Lectivo 2027
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* CONTA LICENCIATURA */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#003366', marginBottom: '4px' }}>
              🎓 Para Cursos de Licenciatura
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
              Banco: <strong>BCI</strong> • Titular: <strong>ISPOTEC</strong>
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>N.º da Conta: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                22076375610001
              </code>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NIB: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                0008 0000 20763756101 13
              </code>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
              Inscrição &amp; Matrícula: 4.000 MT para todos os cursos
            </div>
          </div>

          {/* CONTA MESTRADO, PÓS-GRADUAÇÃO E ESPECIALIZAÇÃO */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#003366', marginBottom: '4px' }}>
              🔬 Para Mestrado, Pós-graduação e Especialização
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
              Banco: <strong>BCI</strong> • Titular: <strong>ISPOTEC</strong>
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>N.º da Conta: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                22076375610002
              </code>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: '#475569', fontWeight: 600 }}>NIB: </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                0008 0000 20763756102 10
              </code>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
              Mestrado: 10.000 MT | Pós-Grad.: 5.000 MT | Espec.: 4.000 MT
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.74rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
          <span>Diretor Geral: Prof. Dr. Jacob Massuanganhe (Pós-Doutor em Direito)</span>
          <span>Email: ispotec.politecnica@gmail.com • Web: www.ispotec.ac.mz</span>
        </div>
      </div>

      {/* Bottom Bar: Official Contacts */}
      <div className="icp-contact-bar">
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--isp-slate-700)', textTransform: 'uppercase' }}>
            📍 Campus &amp; Secretaria Académica ISPOTEC
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--isp-slate-600)', marginTop: '2px' }}>
            {contactos.endereco}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#0055a4', fontWeight: 600, marginTop: '2px' }}>
            📞 Telefones: {contactos.telefones.join(' | ')} • ✉️ {contactos.email}
          </div>
        </div>

        <div>
          <Link
            to="/pre-inscricao"
            className="btn btn-primary"
            style={{ fontSize: '0.86rem', padding: '0.5rem 1.25rem', fontWeight: 700 }}
          >
            Fazer Pré-Inscrição para 2027 →
          </Link>
        </div>
      </div>
    </section>
  );
}
