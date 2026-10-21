import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInstitution } from '../../context/InstitutionContext';
import {
  CURSOS_IFOPTEC_CATALOGO,
  REQUISITOS_MATRICULA_IFOPTEC,
  POLOS_IFOPTEC
} from '../../services/homeschoolService';

export default function IfoptecHome() {
  const { user, isAuthenticated } = useAuth();
  const { switchInstitution } = useInstitution();
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [modalCurso, setModalCurso] = useState(null);
  const [inscricaoSuccess, setInscricaoSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    polo: 'Matola-Rio',
    curso: '',
    nivelHabilitacoes: '10a_classe',
    observacoes: ''
  });

  const cursosFiltrados = CURSOS_IFOPTEC_CATALOGO.filter(curso => {
    if (selectedCategoria === 'todos') return true;
    return curso.categoria === selectedCategoria;
  });

  const handleOpenInscricao = (curso) => {
    setModalCurso(curso);
    setFormData(prev => ({
      ...prev,
      curso: curso ? curso.nome : ''
    }));
    setInscricaoSuccess(false);
  };

  const handleCloseModal = () => {
    setModalCurso(null);
    setInscricaoSuccess(false);
  };

  const handleSubmitInscricao = (e) => {
    e.preventDefault();
    // Simular registo de pré-inscrição online
    setInscricaoSuccess(true);
    setTimeout(() => {
      // Manter feedback e fechar após 2.5s
      setTimeout(() => {
        setModalCurso(null);
        setInscricaoSuccess(false);
      }, 2500);
    }, 500);
  };

  return (
    <div className="ifoptec-home-wrapper">
      <style>{`
        .ifoptec-hero {
          background: linear-gradient(135deg, #02529c 0%, #002f5e 50%, #0b63b6 100%);
          color: white;
          padding: 3.5rem 1rem 4rem;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .ifoptec-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -15%;
          width: 50%;
          height: 180%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .ifoptec-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -10%;
          width: 45%;
          height: 160%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .ifoptec-hero-content {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .ifoptec-hero-logo {
          width: 120px;
          height: 120px;
          margin-bottom: 1.25rem;
          filter: drop-shadow(0 6px 20px rgba(0,0,0,0.35));
          animation: floatIfoptec 3s ease-in-out infinite;
          background: white;
          border-radius: 50%;
          padding: 4px;
        }
        @keyframes floatIfoptec {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .ifoptec-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 0.4rem 1.1rem;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          backdrop-filter: blur(8px);
        }
        .ifoptec-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }
        .ifoptec-subtitle {
          font-size: 1.2rem;
          font-weight: 500;
          color: #bae6fd;
          margin-bottom: 0.5rem;
        }
        .ifoptec-motto {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fef08a;
          margin-bottom: 1.75rem;
          letter-spacing: 0.3px;
        }
        .ifoptec-hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.75rem;
        }
        .btn-ifoptec-primary {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: white;
          padding: 0.85rem 1.8rem;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
        }
        .btn-ifoptec-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.6);
          color: white;
        }
        .btn-ifoptec-secondary {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          padding: 0.85rem 1.8rem;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: all 0.25s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-ifoptec-secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
          color: white;
        }
        .institution-switch-banner {
          background: rgba(0, 0, 0, 0.25);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          font-size: 0.85rem;
        }
        .institution-switch-link {
          color: #fef08a;
          text-decoration: underline;
          font-weight: 700;
          cursor: pointer;
        }

        /* Value highlights bar */
        .ifoptec-highlights-bar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .ifoptec-highlights-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          text-align: center;
        }
        .highlight-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }
        .highlight-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #eff6ff;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .highlight-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .highlight-desc {
          font-size: 0.78rem;
          color: #64748b;
          margin: 2px 0 0;
        }

        /* Section styles */
        .ifoptec-section {
          padding: 3.5rem 1rem;
        }
        .section-header-center {
          text-align: center;
          max-width: 750px;
          margin: 0 auto 2.5rem;
        }
        .section-pill-tag {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0284c7;
          background: #e0f2fe;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 0.6rem;
        }
        .section-main-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem;
        }
        .section-main-subtitle {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Course filters */
        .course-filter-nav {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 0.65rem 1.4rem;
          border-radius: 25px;
          border: 1px solid #cbd5e1;
          background: white;
          color: #475569;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .filter-btn.active {
          background: #02529c;
          color: white;
          border-color: #02529c;
          box-shadow: 0 4px 10px rgba(2, 82, 156, 0.25);
        }

        /* Courses grid */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .course-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          border-color: #bfdbfe;
        }
        .course-card-head {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          position: relative;
        }
        .course-card-badge-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .course-badge-type {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          letter-spacing: 0.4px;
        }
        .badge-curta {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-medio {
          background: #dbeafe;
          color: #1e40af;
        }
        .course-badge-duracao {
          font-size: 0.75rem;
          font-weight: 700;
          color: #059669;
          background: #d1fae5;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
        }
        .course-card-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem;
          line-height: 1.3;
        }
        .course-card-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }
        .course-card-body {
          padding: 1.25rem 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .course-pricing-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .pricing-item-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .pricing-item-val {
          font-size: 0.92rem;
          font-weight: 800;
          color: #02529c;
        }
        .course-disciplines-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .course-disciplines-list li {
          font-size: 0.82rem;
          color: #334155;
          padding: 0.3rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px dashed #f1f5f9;
        }
        .course-disciplines-list li:last-child {
          border-bottom: none;
        }
        .course-disciplines-list li::before {
          content: '✓';
          color: #059669;
          font-weight: bold;
        }
        .course-card-footer {
          padding: 1rem 1.5rem 1.25rem;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
        }
        .btn-inscrever-card {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          background: #02529c;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .btn-inscrever-card:hover {
          background: #003366;
        }

        /* Requirements and Polos Section */
        .info-split-section {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 3.5rem 1rem;
        }
        .info-split-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .info-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .info-box-title {
          font-size: 1.25rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .req-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
        }
        .req-list li {
          padding: 0.6rem 0;
          font-size: 0.88rem;
          color: #334155;
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .req-list li:last-child {
          border-bottom: none;
        }
        .req-check {
          color: #059669;
          font-weight: 800;
          margin-top: 1px;
        }
        .polo-card-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          margin-bottom: 1rem;
        }
        .polo-card-item:last-child {
          margin-bottom: 0;
        }
        .polo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .polo-name {
          font-weight: 700;
          font-size: 0.98rem;
          color: #02529c;
        }
        .polo-address {
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 0.4rem;
        }
        .polo-phones {
          font-size: 0.82rem;
          color: #059669;
          font-weight: 600;
        }

        /* Modules reuse grid */
        .modules-reuse-section {
          padding: 3.5rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .module-link-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
        }
        .module-link-card:hover {
          transform: translateY(-3px);
          border-color: #02529c;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);
        }
        .module-link-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 0.85rem;
        }
        .module-link-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem;
        }
        .module-link-desc {
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1rem;
          flex: 1;
        }
        .module-link-action {
          font-size: 0.82rem;
          font-weight: 700;
          color: #02529c;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .modal-card {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          animation: modalAppear 0.2s ease-out;
        }
        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #02529c, #003366);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .ifoptec-title { font-size: 1.85rem; }
          .ifoptec-subtitle { font-size: 1rem; }
          .ifoptec-hero-logo { width: 90px; height: 90px; }
          .info-split-grid { grid-template-columns: 1fr; }
          .courses-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="ifoptec-hero">
        <div className="ifoptec-hero-content">
          <img
            src="/assets/img/logo-ifoptec.png"
            alt="IFOPTEC"
            className="ifoptec-hero-logo"
          />

          <div>
            <span className="ifoptec-pill-badge">
              🏥 Instituto de Formação Politécnica e de Tecnologias
            </span>
          </div>

          <h1 className="ifoptec-title">IFOPTEC Online</h1>
          <p className="ifoptec-subtitle">
            Formar • Inovar • Transformar — O seu futuro começa aqui!
          </p>
          <div className="ifoptec-motto">
            ⭐ Qualificação Hoje, Mais Oportunidades Amanhã!
          </div>

          <div className="ifoptec-hero-actions">
            <button
              type="button"
              onClick={() => handleOpenInscricao(null)}
              className="btn-ifoptec-primary"
            >
              📝 Fazer Inscrição Online
            </button>
            <a href="#cursos-section" className="btn-ifoptec-secondary">
              🎓 Ver Cursos Oferecidos
            </a>
            {!isAuthenticated ? (
              <Link to="/auth/login" className="btn-ifoptec-secondary">
                🔑 Entrar na Plataforma
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-ifoptec-secondary">
                📊 Ir para Painel Principal
              </Link>
            )}
          </div>

          <div className="institution-switch-banner">
            <span>Esta plataforma integra o <strong>ISPOTEC</strong> e o <strong>IFOPTEC</strong>.</span>
            <span
              onClick={() => switchInstitution('ispotec')}
              className="institution-switch-link"
              title="Aceder ao portal do Ensino Superior ISPOTEC"
            >
              Aceder ao ISPOTEC Superior →
            </span>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <div className="ifoptec-highlights-bar">
        <div className="ifoptec-highlights-grid">
          <div className="highlight-item">
            <div className="highlight-icon">⏱️</div>
            <div>
              <div className="highlight-title">Curta Duração &amp; Médio</div>
              <div className="highlight-desc">Cursos intensivos de 6 meses e médios de 3 anos</div>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">🩺</div>
            <div>
              <div className="highlight-title">Especialização em Saúde</div>
              <div className="highlight-desc">Medicina, Enfermagem, Farmácia, Socorrismo</div>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">📍</div>
            <div>
              <div className="highlight-title">Dois Polos Práticos</div>
              <div className="highlight-desc">Matola-Rio (Rua Mozal) &amp; Marracuene (Facim)</div>
            </div>
          </div>
          <div className="highlight-item">
            <div className="highlight-icon">💻</div>
            <div>
              <div className="highlight-title">Inscrição 100% Online</div>
              <div className="highlight-desc">Garanta a sua vaga sem sair de casa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursos Oferecidos Section */}
      <section className="ifoptec-section" id="cursos-section">
        <div className="section-header-center">
          <span className="section-pill-tag">Formação Profissional</span>
          <h2 className="section-main-title">Cursos Oferecidos no IFOPTEC</h2>
          <p className="section-main-subtitle">
            Cursos com elevado rigor pedagógico, práticas laboratoriais e estágio hospitalar integrado.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="course-filter-nav">
          <button
            type="button"
            className={`filter-btn ${selectedCategoria === 'todos' ? 'active' : ''}`}
            onClick={() => setSelectedCategoria('todos')}
          >
            Todos os Cursos ({CURSOS_IFOPTEC_CATALOGO.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${selectedCategoria === 'curta_duracao' ? 'active' : ''}`}
            onClick={() => setSelectedCategoria('curta_duracao')}
          >
            ⏱️ Curta Duração (6 Meses)
          </button>
          <button
            type="button"
            className={`filter-btn ${selectedCategoria === 'tecnico_medio' ? 'active' : ''}`}
            onClick={() => setSelectedCategoria('tecnico_medio')}
          >
            🎓 Técnico Médio (3 Anos)
          </button>
        </div>

        {/* Courses Grid */}
        <div className="courses-grid">
          {cursosFiltrados.map((curso) => (
            <div key={curso.id} className="course-card">
              <div className="course-card-head">
                <div className="course-card-badge-top">
                  <span className={`course-badge-type ${curso.categoria === 'curta_duracao' ? 'badge-curta' : 'badge-medio'}`}>
                    {curso.tipo}
                  </span>
                  <span className="course-badge-duracao">
                    ⏳ {curso.duracao}
                  </span>
                </div>
                <h3 className="course-card-title">
                  <span style={{ marginRight: '0.4rem' }}>{curso.icone}</span>
                  {curso.nome}
                </h3>
                <p className="course-card-desc">{curso.descricao}</p>
              </div>

              <div className="course-card-body">
                <div className="course-pricing-box">
                  <div>
                    <div className="pricing-item-label">Propina Mensal</div>
                    <div className="pricing-item-val">{curso.mensalidade}</div>
                  </div>
                  <div>
                    <div className="pricing-item-label">Matrícula / Inscrição</div>
                    <div className="pricing-item-val" style={{ color: '#059669' }}>
                      {curso.matricula}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Disciplinas Centrais:
                  </div>
                  <ul className="course-disciplines-list">
                    {curso.disciplinas.slice(0, 4).map((disc, idx) => (
                      <li key={idx}>{disc}</li>
                    ))}
                    {curso.disciplinas.length > 4 && (
                      <li style={{ color: '#0284c7', fontStyle: 'italic' }}>
                        + {curso.disciplinas.length - 4} disciplinas no plano curricular
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="course-card-footer">
                <button
                  type="button"
                  className="btn-inscrever-card"
                  onClick={() => handleOpenInscricao(curso)}
                >
                  📝 Inscrever-se Neste Curso
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements & Polos Section */}
      <section className="info-split-section">
        <div className="info-split-grid">
          {/* Requirements Box */}
          <div className="info-box">
            <h3 className="info-box-title">
              <span>📋</span> Requisitos de Admissão &amp; Matrícula
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Para ingressar nos cursos de Técnico Médio ou Curta Duração do IFOPTEC, é necessário submeter:
            </p>
            <ul className="req-list">
              {REQUISITOS_MATRICULA_IFOPTEC.map((req, idx) => (
                <li key={idx}>
                  <span className="req-check">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#065f46',
              fontSize: '0.82rem',
              lineHeight: 1.45
            }}>
              <strong>Dica:</strong> Pode fazer o upload digital de todos os documentos no momento da inscrição sem se deslocar presencialmente à secretaria.
            </div>
          </div>

          {/* Polos / Campuses Box */}
          <div className="info-box">
            <h3 className="info-box-title">
              <span>📍</span> Polos Oficiais IFOPTEC
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Infraestruturas pedagógicas equipadas com salas práticas e gabinetes de enfermagem:
            </p>

            {POLOS_IFOPTEC.map((polo, idx) => (
              <div key={idx} className="polo-card-item">
                <div className="polo-header">
                  <span className="polo-name">{polo.nome}</span>
                  <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                    Aulas Presenciais e Práticas
                  </span>
                </div>
                <div className="polo-address">🏢 Endereço: {polo.endereco}</div>
                <div className="polo-phones">
                  📞 Contactos: {polo.telefones.join(' / ')}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <a
                href="https://api.whatsapp.com/send/?phone=258840726974&text=Ola%20IFOPTEC,%20gostaria%20de%20saber%20mais%20sobre%20as%20matriculas"
                target="_blank"
                rel="noreferrer"
                className="btn-ifoptec-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                💬 Falar com a Secretaria no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Reused in IFOPTEC Section */}
      <section className="modules-reuse-section">
        <div className="section-header-center">
          <span className="section-pill-tag">Plataforma Digital Integrada</span>
          <h2 className="section-main-title">Módulos Académicos do IFOPTEC Online</h2>
          <p className="section-main-subtitle">
            Todos os recursos do sistema adaptados à realidade do ensino médio e técnico.
          </p>
        </div>

        <div className="modules-grid">
          <Link to="/ensino" className="module-link-card">
            <div className="module-link-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
              📚
            </div>
            <h4 className="module-link-title">Ensino &amp; Planos Analíticos</h4>
            <p className="module-link-desc">
              Programas das disciplinas, matrizes de aulas práticas, planos analíticos e acompanhamento do cumprimento curricular do ensino médio.
            </p>
            <div className="module-link-action">
              <span>Aceder ao Ensino</span>
              <span>→</span>
            </div>
          </Link>

          <Link to="/homeschool" className="module-link-card">
            <div className="module-link-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
              🏫
            </div>
            <h4 className="module-link-title">Ambiente Virtual (AVA)</h4>
            <p className="module-link-desc">
              Salas de aula digitais por turma, partilha de apontamentos, sumários docentes, tarefas avaliativas e tutoria técnica.
            </p>
            <div className="module-link-action">
              <span>Aceder ao AVA</span>
              <span>→</span>
            </div>
          </Link>

          <Link to="/chatbot" className="module-link-card">
            <div className="module-link-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              🤖
            </div>
            <h4 className="module-link-title">Assistente Pedagógico IA</h4>
            <p className="module-link-desc">
              Tire dúvidas 24/7 sobre matérias de saúde, dosagens de farmacologia, anatomia, técnicas de socorrismo e apoio aos estudos.
            </p>
            <div className="module-link-action">
              <span>Abrir Assistente</span>
              <span>→</span>
            </div>
          </Link>

          <Link to="/dashboard/feed" className="module-link-card">
            <div className="module-link-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
              📢
            </div>
            <h4 className="module-link-title">Comunicação &amp; Chat</h4>
            <p className="module-link-desc">
              Chat em tempo real por disciplina e turma, fórum comunitário e comunicados pedagógicos da direção do IFOPTEC.
            </p>
            <div className="module-link-action">
              <span>Ver Mensagens</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Inscrição Modal */}
      {modalCurso !== undefined && modalCurso !== null && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                📝 Pré-Inscrição Online IFOPTEC
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {inscricaoSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46', margin: '0 0 0.5rem' }}>
                    Candidatura Submetida com Sucesso!
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Obrigado, <strong>{formData.nome || 'Candidato'}</strong>. A secretaria do IFOPTEC entrará em contacto através do número <strong>{formData.telefone}</strong> para confirmação da vaga no curso <strong>{formData.curso}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitInscricao}>
                  {modalCurso && (
                    <div style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#1e40af' }}>Curso Selecionado: {modalCurso.nome}</div>
                      <div style={{ color: '#475569', marginTop: '2px' }}>
                        Duração: {modalCurso.duracao} | Matrícula: {modalCurso.matricula} | Propina: {modalCurso.mensalidade}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="Ex: João Baptista Mondlane"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Contacto Telefónico *
                        </label>
                        <input
                          type="tel"
                          required
                          className="form-control"
                          placeholder="84 / 87 / 86..."
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="seuemail@exemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Polo Preferencial *
                        </label>
                        <select
                          className="form-control"
                          value={formData.polo}
                          onChange={(e) => setFormData({ ...formData, polo: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="Matola-Rio">Polo Matola-Rio (Rua Mozal)</option>
                          <option value="Marracuene">Polo Marracuene (Rua Facim)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Habilitações *
                        </label>
                        <select
                          className="form-control"
                          value={formData.nivelHabilitacoes}
                          onChange={(e) => setFormData({ ...formData, nivelHabilitacoes: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="10a_classe">10ª Classe Concluída</option>
                          <option value="12a_classe">12ª Classe Concluída</option>
                          <option value="equivalente">Equivalência</option>
                        </select>
                      </div>
                    </div>

                    {!modalCurso && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                          Curso Pretendido *
                        </label>
                        <select
                          required
                          className="form-control"
                          value={formData.curso}
                          onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                          style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                          <option value="">Selecione o Curso...</option>
                          {CURSOS_IFOPTEC_CATALOGO.map((c) => (
                            <option key={c.id} value={c.nome}>
                              {c.nome} ({c.tipo})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        className="btn-ifoptec-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                      >
                        ✓ Submeter Inscrição Online
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
