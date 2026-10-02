import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { homeSchoolService } from '../../services/homeSchoolService';

export default function HomeSchoolSalaVirtual() {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const actualId = groupId || queryId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && (user.tipo === 'docente');
  const canManage = isAdmin || isDocente;

  const [sala, setSala] = useState(null);
  const [conteudo, setConteudo] = useState(null);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ msg: '', tipo: '' });

  // Modals state for adding/editing content
  const [modalType, setModalType] = useState(null); // 'manual', 'guia', 'link', 'micro', 'aula', 'editPlanoAnalitico', 'editPlanoCurricular', 'editPlanoSocial', 'editLab'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadSalaData();
  }, [actualId]);

  async function loadSalaData() {
    setLoading(true);
    try {
      const s = await homeSchoolService.getSalaById(actualId);
      if (s) {
        setSala(s);
        const c = homeSchoolService.getSalaConteudo(s.id || s._id);
        setConteudo(c);
      }
    } catch (e) {
      console.error('Erro ao carregar dados da sala virtual:', e);
    } finally {
      setLoading(false);
    }
  }

  const showFeedback = (msg, tipo = 'sucesso') => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback({ msg: '', tipo: '' }), 4000);
  };

  const handleSaveConteudo = (updatedConteudo, successMessage = 'Alterações guardadas com sucesso!') => {
    setConteudo(updatedConteudo);
    homeSchoolService.saveSalaConteudo(sala.id || sala._id, updatedConteudo);
    showFeedback(successMessage, 'sucesso');
    setModalType(null);
  };

  // Add Item Handlers
  const handleAddManual = (e) => {
    e.preventDefault();
    const newManual = {
      id: `man-${Date.now()}`,
      titulo: formData.titulo || 'Novo Manual',
      descricao: formData.descricao || '',
      autor: formData.autor || user?.nome || 'Docente ISPOTEC',
      data: formData.data || new Date().toISOString().substring(0, 10),
      versao: formData.versao || 'v1.0',
      ficheiro_nome: formData.ficheiro_nome || 'Documento_Disciplina.pdf',
      ficheiro_url: formData.ficheiro_url || '#',
      estado: formData.estado || 'Publicado',
      tipo: formData.tipo || 'PDF'
    };
    const updated = { ...conteudo, manuais: [newManual, ...(conteudo.manuais || [])] };
    handleSaveConteudo(updated, 'Manual adicionado com sucesso!');
  };

  const handleAddGuia = (e) => {
    e.preventDefault();
    const newGuia = {
      id: `guia-${Date.now()}`,
      titulo: formData.titulo || 'Novo Guia de Estudo',
      descricao: formData.descricao || '',
      orientacoes: formData.orientacoes || '',
      exercicios: formData.exercicios || '',
      leituras: formData.leituras || '',
      data: formData.data || new Date().toISOString().substring(0, 10),
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, guiasEstudo: [newGuia, ...(conteudo.guiasEstudo || [])] };
    handleSaveConteudo(updated, 'Guia de estudo adicionado com sucesso!');
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    const newLink = {
      id: `link-${Date.now()}`,
      nome: formData.nome || 'Novo Link Virtual',
      descricao: formData.descricao || '',
      url: formData.url || 'https://meet.google.com',
      tipo: formData.tipo || 'Google Meet',
      data: formData.data || new Date().toISOString().substring(0, 10),
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, linksVirtuais: [newLink, ...(conteudo.linksVirtuais || [])] };
    handleSaveConteudo(updated, 'Link virtual adicionado com sucesso!');
  };

  const handleAddMicro = (e) => {
    e.preventDefault();
    const newMicro = {
      id: `micro-${Date.now()}`,
      nome: formData.nome || 'Nova Microcredencial',
      descricao: formData.descricao || '',
      competencias: formData.competencias || '',
      cargaHoraria: formData.cargaHoraria || '10 Horas',
      criterios: formData.criterios || '',
      link: formData.link || 'https://skillsbuild.org',
      badgeIcon: formData.badgeIcon || '🎖️',
      estado: formData.estado || 'Publicado',
      data: formData.data || new Date().toISOString().substring(0, 10)
    };
    const updated = { ...conteudo, microcredenciais: [newMicro, ...(conteudo.microcredenciais || [])] };
    handleSaveConteudo(updated, 'Microcredencial associada com sucesso!');
  };

  const handleAddAula = (e) => {
    e.preventDefault();
    const newAula = {
      id: `aula-${Date.now()}`,
      titulo: formData.titulo || 'Nova Aula',
      tipo: formData.tipo || 'Teórica',
      data: formData.data || new Date().toISOString().substring(0, 10),
      descricao: formData.descricao || '',
      conteudo: formData.conteudo || '',
      materiais: formData.materiais || '',
      videoUrl: formData.videoUrl || '',
      orientacoes: formData.orientacoes || '',
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, aulas: [newAula, ...(conteudo.aulas || [])] };
    handleSaveConteudo(updated, `Aula ${newAula.tipo.toLowerCase()} registada com sucesso!`);
  };

  const handleDeleteItem = (listName, itemId) => {
    if (!window.confirm('Tem certeza de que deseja remover este item?')) return;
    const updatedList = (conteudo[listName] || []).filter(item => item.id !== itemId);
    const updated = { ...conteudo, [listName]: updatedList };
    handleSaveConteudo(updated, 'Item removido com sucesso!');
  };

  const filterByState = (items = []) => {
    if (canManage) return items;
    // Estudantes só visualizam conteúdos publicados ou atualizados
    return items.filter(item => item.estado !== 'Rascunho' && item.estado !== 'Arquivado');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#64748b' }}>A carregar a Sala de Aula Virtual do ISPOTEC Home School...</p>
      </div>
    );
  }

  if (!sala || !conteudo) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
        <h3>Sala Virtual Não Encontrada</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>O grupo ou sala de aula virtual solicitado não está disponível.</p>
        <Link to="/homeschool" className="btn btn-primary">
          ← Voltar ao Home School
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sala-virtual-wrap {
          max-width: 1200px;
          margin: 1.5rem auto 3rem;
          padding: 0 1rem;
        }

        /* Breadcrumb */
        .sala-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .sala-breadcrumbs a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .sala-breadcrumbs a:hover {
          text-decoration: underline;
        }

        /* Sala Hero Header */
        .sala-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem 2.25rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .sala-hero::after {
          content: '🏫';
          position: absolute;
          right: 20px;
          bottom: -15px;
          font-size: 8rem;
          opacity: 0.08;
          pointer-events: none;
        }

        .sala-meta-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }

        .sala-tag {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .sala-tag-active {
          background: rgba(16, 185, 129, 0.25);
          border-color: #10b981;
          color: #6ee7b7;
        }

        .sala-hero h1 {
          font-size: 1.85rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          line-height: 1.25;
        }

        .sala-subtitle {
          font-size: 1.05rem;
          color: #cbd5e1;
          margin-bottom: 0.75rem;
          font-weight: 500;
        }

        .sala-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          max-width: 850px;
          line-height: 1.55;
        }

        .sala-docente-box {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #e2e8f0;
        }

        /* Layout Grid */
        .sala-layout-grid {
          display: grid;
          grid-template-columns: 270px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* Sidebar Navigation */
        .sala-sidebar {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          padding: 0.75rem;
          position: sticky;
          top: 1rem;
        }

        .sala-sidebar-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #94a3b8;
          padding: 0.5rem 0.75rem;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .sala-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 100%;
          text-align: left;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 0.2rem;
        }

        .sala-nav-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .sala-nav-btn.active {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1d4ed8;
          border-left: 3px solid #2563eb;
        }

        .sala-nav-badge {
          margin-left: auto;
          background: #e2e8f0;
          color: #475569;
          font-size: 0.7rem;
          padding: 0.1rem 0.45rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .sala-nav-btn.active .sala-nav-badge {
          background: #bfdbfe;
          color: #1e40af;
        }

        /* Content Area */
        .sala-content-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          padding: 1.75rem;
          min-height: 520px;
        }

        .content-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .content-header-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-action-add {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.15s;
        }
        .btn-action-add:hover {
          background: #1d4ed8;
        }

        /* Items cards */
        .item-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .item-box:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 8px -2px rgba(0,0,0,0.06);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.35rem;
        }

        .item-meta {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .item-desc {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
          margin: 0.5rem 0;
        }

        .badge-estado {
          font-size: 0.7rem;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-publicado { background: #d1fae5; color: #065f46; }
        .badge-rascunho { background: #fef3c7; color: #92400e; }
        .badge-actualizado { background: #dbeafe; color: #1e40af; }
        .badge-arquivado { background: #f1f5f9; color: #64748b; }

        /* Aulas Separation */
        .aulas-type-banner {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 0.6rem 1rem;
          margin: 1.5rem 0 1rem;
          border-radius: 0 6px 6px 0;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .aulas-type-pratica {
          border-left-color: #10b981;
        }

        /* Laboratório Digital Spec */
        .lab-box-highlight {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #86efac;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lab-guide-box {
          background: #ffffff;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-top: 1rem;
        }

        /* Plan tables */
        .plan-section-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .plan-section-block h4 {
          margin: 0 0 0.5rem;
          color: #1e3a8a;
          font-size: 0.98rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .plan-section-block p, .plan-section-block ul {
          margin: 0;
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.6;
        }

        /* Modal Styles */
        .modal-backdrop-hs {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          backdrop-filter: blur(3px);
        }

        .modal-card-hs {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }

        .form-group-hs {
          margin-bottom: 1rem;
        }
        .form-group-hs label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .form-input-hs {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          box-sizing: border-box;
        }
        .form-input-hs:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .modal-btns-hs {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .sala-layout-grid {
            grid-template-columns: 1fr;
          }
          .sala-sidebar {
            position: relative;
            top: 0;
          }
          .sala-sidebar nav {
            display: flex;
            overflow-x: auto;
            gap: 0.35rem;
            padding-bottom: 0.5rem;
          }
          .sala-nav-btn {
            white-space: nowrap;
            width: auto;
            flex-shrink: 0;
          }
        }
      `}</style>

      <div className="sala-virtual-wrap">
        {/* Breadcrumb */}
        <div className="sala-breadcrumbs">
          <Link to="/homeschool">🏠 Home School</Link>
          <span>›</span>
          <span>{sala.curso}</span>
          <span>›</span>
          <span>{sala.modulo}</span>
          <span>›</span>
          <strong>{sala.nome}</strong>
        </div>

        {/* Feedback Alert */}
        {feedback.msg && (
          <div style={{
            background: feedback.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2',
            color: feedback.tipo === 'sucesso' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.tipo === 'sucesso' ? '#a7f3d0' : '#fecaca'}`,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{feedback.tipo === 'sucesso' ? '✓' : '⚠️'}</span>
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="sala-hero">
          <div className="sala-meta-tags">
            <span className="sala-tag">📚 {sala.curso}</span>
            <span className="sala-tag">📘 {sala.modulo}</span>
            <span className="sala-tag">📅 {sala.ano} • {sala.semestre}</span>
            <span className="sala-tag">🏷️ {sala.codigo}</span>
            <span className="sala-tag sala-tag-active">● {sala.estado || 'Ativo'}</span>
          </div>
          <h1>{sala.nome}</h1>
          <div className="sala-subtitle">Sala de Aula Virtual &amp; Aprendizagem Híbrida ISPOTEC</div>
          <p className="sala-desc">{sala.descricao}</p>
          <div className="sala-docente-box">
            <span>👨‍🏫 <strong>Docente Responsável:</strong> {sala.docente}</span>
            <span>•</span>
            <span>👥 <strong>Turma:</strong> {sala.total_membros || 25} Estudantes</span>
          </div>
        </div>

        {/* Layout with Sidebar Navigation and Tab Content */}
        <div className="sala-layout-grid">
          {/* Navigation Menu */}
          <aside className="sala-sidebar">
            <h4 className="sala-sidebar-title">Menu da Sala Virtual</h4>
            <nav>
              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
                onClick={() => setActiveTab('visao-geral')}
              >
                <span>📌</span> Visão Geral
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'plano-analitico' ? 'active' : ''}`}
                onClick={() => setActiveTab('plano-analitico')}
              >
                <span>📋</span> Plano Analítico
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'plano-curricular' ? 'active' : ''}`}
                onClick={() => setActiveTab('plano-curricular')}
              >
                <span>📜</span> Plano Curricular
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'aulas' ? 'active' : ''}`}
                onClick={() => setActiveTab('aulas')}
              >
                <span>🏛️</span> Aulas Teóricas / Práticas
                <span className="sala-nav-badge">{filterByState(conteudo.aulas).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'manuais' ? 'active' : ''}`}
                onClick={() => setActiveTab('manuais')}
              >
                <span>📚</span> Manuais
                <span className="sala-nav-badge">{filterByState(conteudo.manuais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'guias-estudo' ? 'active' : ''}`}
                onClick={() => setActiveTab('guias-estudo')}
              >
                <span>📖</span> Guias de Estudo
                <span className="sala-nav-badge">{filterByState(conteudo.guiasEstudo).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'plano-social' ? 'active' : ''}`}
                onClick={() => setActiveTab('plano-social')}
              >
                <span>🤝</span> Plano Social
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'links-virtuais' ? 'active' : ''}`}
                onClick={() => setActiveTab('links-virtuais')}
              >
                <span>🔗</span> Links Virtuais
                <span className="sala-nav-badge">{filterByState(conteudo.linksVirtuais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'microcredenciais' ? 'active' : ''}`}
                onClick={() => setActiveTab('microcredenciais')}
              >
                <span>🎖️</span> Microcredenciais
                <span className="sala-nav-badge">{filterByState(conteudo.microcredenciais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'laboratorio-digital' ? 'active' : ''}`}
                onClick={() => setActiveTab('laboratorio-digital')}
              >
                <span>🔬</span> Laboratório Digital
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="sala-content-card">
            {/* 1. VISÃO GERAL */}
            {activeTab === 'visao-geral' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📌</span> Visão Geral da Sala Virtual
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1d4ed8' }}>{filterByState(conteudo.aulas).length}</div>
                    <div style={{ color: '#1e40af', fontSize: '0.85rem', fontWeight: '600' }}>Aulas Disponíveis</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#047857' }}>{filterByState(conteudo.manuais).length}</div>
                    <div style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: '600' }}>Manuais e Textos</div>
                  </div>
                  <div style={{ background: '#faf5ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#7e22ce' }}>{filterByState(conteudo.guiasEstudo).length}</div>
                    <div style={{ color: '#6b21a8', fontSize: '0.85rem', fontWeight: '600' }}>Guias e Roteiros</div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b45309' }}>{filterByState(conteudo.linksVirtuais).length}</div>
                    <div style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: '600' }}>Sessões Virtuais</div>
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>📢 Orientações para o Acompanhamento Híbrido</h4>
                  <p>
                    Bem-vindo ao espaço oficial de aprendizagem híbrida do <strong>ISPOTEC ONLINE</strong>. Neste ambiente poderá consultar o plano analítico, aceder às transmissões no Google Meet/Zoom, descarregar manuais oficiais, consultar os roteiros de estudo semanais e executar as práticas do Laboratório Digital.
                  </p>
                </div>

                <div className="plan-section-block">
                  <h4>⚡ Acesso Rápido às Próximas Atividades</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>Consulte o <strong>Plano Analítico</strong> para o cronograma detalhado de matérias.</li>
                    <li>Aceda às <strong>Aulas Teóricas e Práticas</strong> para rever sumários e materiais em anexo.</li>
                    <li>Explore o <strong>Laboratório Digital</strong> para realizar o guia prático passo a passo.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. PLANO ANALÍTICO */}
            {activeTab === 'plano-analitico' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📋</span> Plano Analítico da Disciplina
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoAnalitico || {});
                        setModalType('editPlanoAnalitico');
                      }}
                    >
                      ✏️ Editar Plano Analítico
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>📘 Unidade Curricular &amp; Carga Horária</h4>
                  <p><strong>Disciplina:</strong> {conteudo.planoAnalitico?.unidadeCurricular || sala.modulo}</p>
                  <p><strong>Carga Horária:</strong> {conteudo.planoAnalitico?.cargaHoraria}</p>
                  <p><strong>Cronograma Letivo:</strong> {conteudo.planoAnalitico?.cronograma}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Objectivos da Aprendizagem</h4>
                  <p>{conteudo.planoAnalitico?.objectivos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📚 Conteúdos Programáticos e Distribuição das Matérias</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoAnalitico?.conteudos) ? (
                      conteudo.planoAnalitico.conteudos.map((c, i) => <li key={i}>{c}</li>)
                    ) : (
                      <li>{conteudo.planoAnalitico?.conteudos}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>💡 Competências a Desenvolver</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoAnalitico?.competencias) ? (
                      conteudo.planoAnalitico.competencias.map((c, i) => <li key={i}>{c}</li>)
                    ) : (
                      <li>{conteudo.planoAnalitico?.competencias}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>📝 Metodologias de Ensino</h4>
                  <p>{conteudo.planoAnalitico?.metodologias}</p>
                </div>

                <div className="plan-section-block">
                  <h4>⚖️ Sistema de Avaliação</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{conteudo.planoAnalitico?.avaliacao}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📖 Bibliografia Recomendada</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{conteudo.planoAnalitico?.bibliografia}</p>
                </div>
              </div>
            )}

            {/* 3. PLANO CURRICULAR */}
            {activeTab === 'plano-curricular' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📜</span> Plano Curricular Institucional
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoCurricular || {});
                        setModalType('editPlanoCurricular');
                      }}
                    >
                      ✏️ Editar Plano Curricular
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>🏛️ Enquadramento no Curso</h4>
                  <p><strong>Curso:</strong> {conteudo.planoCurricular?.curso || sala.curso}</p>
                  <p><strong>Módulo / Disciplina:</strong> {conteudo.planoCurricular?.modulo || sala.modulo}</p>
                  <p><strong>Pré-Requisitos:</strong> {conteudo.planoCurricular?.preRequisitos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Competências e Resultados de Aprendizagem</h4>
                  <p><strong>Competências:</strong> {conteudo.planoCurricular?.competencias}</p>
                  <p><strong>Resultados Esperados:</strong> {conteudo.planoCurricular?.resultados}</p>
                </div>

                <div className="plan-section-block">
                  <h4>⏱️ Carga Horária e Componentes Curriculares</h4>
                  <p><strong>Componente Teórica:</strong> {conteudo.planoCurricular?.cargaHorariaTeorica}</p>
                  <p><strong>Componente Prática:</strong> {conteudo.planoCurricular?.cargaHorariaPratica}</p>
                  <p><strong>Unidades:</strong> {conteudo.planoCurricular?.unidades}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📋 Normas de Avaliação Curricular</h4>
                  <p>{conteudo.planoCurricular?.sistemaAvaliacao}</p>
                </div>
              </div>
            )}

            {/* 4. AULAS TEÓRICAS E PRÁTICAS */}
            {activeTab === 'aulas' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🏛️</span> Aulas Teóricas e Práticas
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ tipo: 'Teórica', estado: 'Publicado' });
                        setModalType('aula');
                      }}
                    >
                      + Registar Nova Aula
                    </button>
                  )}
                </div>

                {/* Aulas Teóricas */}
                <div className="aulas-type-banner">
                  <span>📖</span> AULAS TEÓRICAS
                </div>
                {filterByState(conteudo.aulas || []).filter(a => a.tipo === 'Teórica').length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma aula teórica registada.</p>
                ) : (
                  filterByState(conteudo.aulas || []).filter(a => a.tipo === 'Teórica').map(aula => (
                    <div className="item-box" key={aula.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{aula.titulo}</h3>
                          <div className="item-meta">
                            <span>📅 {aula.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${aula.estado.toLowerCase()}`}>{aula.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('aulas', aula.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{aula.descricao}</p>
                      {aula.conteudo && (
                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                          <strong>Sumário da Matéria:</strong> {aula.conteudo}
                        </div>
                      )}
                      {aula.orientacoes && (
                        <div style={{ fontSize: '0.85rem', color: '#1e40af', margin: '0.4rem 0' }}>
                          💡 <em>Orientações: {aula.orientacoes}</em>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {aula.materiais && (
                          <a href="#" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                            📄 Descarregar Material ({aula.materiais})
                          </a>
                        )}
                        {aula.videoUrl && (
                          <a href={aula.videoUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                            ▶ Assistir Gravação / Sessão
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Aulas Práticas */}
                <div className="aulas-type-banner aulas-type-pratica" style={{ marginTop: '2rem' }}>
                  <span>🔬</span> AULAS PRÁTICAS E LABORATORIAIS
                </div>
                {filterByState(conteudo.aulas || []).filter(a => a.tipo === 'Prática').length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma aula prática registada.</p>
                ) : (
                  filterByState(conteudo.aulas || []).filter(a => a.tipo === 'Prática').map(aula => (
                    <div className="item-box" key={aula.id} style={{ borderLeft: '4px solid #10b981' }}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{aula.titulo}</h3>
                          <div className="item-meta">
                            <span>📅 {aula.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${aula.estado.toLowerCase()}`}>{aula.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('aulas', aula.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{aula.descricao}</p>
                      {aula.conteudo && (
                        <div style={{ background: '#f0fdf4', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                          <strong>Roteiro Prático:</strong> {aula.conteudo}
                        </div>
                      )}
                      {aula.orientacoes && (
                        <div style={{ fontSize: '0.85rem', color: '#065f46', margin: '0.4rem 0' }}>
                          🎯 <em>Desafio de Laboratório: {aula.orientacoes}</em>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {aula.materiais && (
                          <a href="#" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                            📦 Descarregar Ficheiros Práticos ({aula.materiais})
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. MANUAIS */}
            {activeTab === 'manuais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📚</span> Manuais e Textos de Apoio
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ versao: 'v1.0', estado: 'Publicado', tipo: 'PDF' });
                        setModalType('manual');
                      }}
                    >
                      + Disponibilizar Manual
                    </button>
                  )}
                </div>

                {filterByState(conteudo.manuais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum manual disponibilizado ainda.</p>
                ) : (
                  filterByState(conteudo.manuais || []).map(manual => (
                    <div className="item-box" key={manual.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{manual.titulo}</h3>
                          <div className="item-meta">
                            <span>✍️ {manual.autor}</span>
                            <span>•</span>
                            <span>🏷️ Versão: {manual.versao}</span>
                            <span>•</span>
                            <span>📅 {manual.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${manual.estado.toLowerCase()}`}>{manual.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('manuais', manual.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{manual.descricao}</p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={manual.ficheiro_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          📥 Descarregar / Visualizar Manual ({manual.ficheiro_nome})
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. GUIAS DE ESTUDO */}
            {activeTab === 'guias-estudo' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📖</span> Guias de Estudo e Roteiros de Aprendizagem
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ estado: 'Publicado' });
                        setModalType('guia');
                      }}
                    >
                      + Criar Guia de Estudo
                    </button>
                  )}
                </div>

                {filterByState(conteudo.guiasEstudo || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum guia de estudo disponível no momento.</p>
                ) : (
                  filterByState(conteudo.guiasEstudo || []).map(guia => (
                    <div className="item-box" key={guia.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{guia.titulo}</h3>
                          <div className="item-meta">
                            <span>📅 Publicado em: {guia.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${guia.estado.toLowerCase()}`}>{guia.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('guiasEstudo', guia.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{guia.descricao}</p>
                      {guia.orientacoes && (
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0', fontSize: '0.88rem' }}>
                          <strong>🧭 Orientações do Docente:</strong>
                          <p style={{ margin: '0.25rem 0 0' }}>{guia.orientacoes}</p>
                        </div>
                      )}
                      {guia.exercicios && (
                        <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0', fontSize: '0.88rem' }}>
                          <strong>✍️ Exercícios e Atividades de Preparação:</strong>
                          <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-line' }}>{guia.exercicios}</p>
                        </div>
                      )}
                      {guia.leituras && (
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.4rem' }}>
                          📚 <strong>Leituras Recomendadas:</strong> {guia.leituras}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 7. PLANO SOCIAL */}
            {activeTab === 'plano-social' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🤝</span> Plano Social e de Acompanhamento Académico
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoSocial || {});
                        setModalType('editPlanoSocial');
                      }}
                    >
                      ✏️ Editar Plano Social
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>🌱 Descrição do Plano Social</h4>
                  <p>{conteudo.planoSocial?.descricao}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Objetivos de Integração e Acompanhamento</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoSocial?.objectivos) ? (
                      conteudo.planoSocial.objectivos.map((o, i) => <li key={i}>{o}</li>)
                    ) : (
                      <li>{conteudo.planoSocial?.objectivos}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>📅 Atividades e Calendário Social</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoSocial?.actividades) ? (
                      conteudo.planoSocial.actividades.map((a, i) => <li key={i}>{a}</li>)
                    ) : (
                      <li>{conteudo.planoSocial?.actividades}</li>
                    )}
                  </ul>
                  <p style={{ marginTop: '0.75rem' }}>
                    <strong>Horário / Calendário:</strong> {conteudo.planoSocial?.calendario}
                  </p>
                </div>

                <div className="plan-section-block">
                  <h4>🔗 Orientações &amp; Canais de Apoio</h4>
                  <p>{conteudo.planoSocial?.orientacoes}</p>
                  {conteudo.planoSocial?.links && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <a href={conteudo.planoSocial.links} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                        🌐 Canal de Acompanhamento Social ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. LINKS VIRTUAIS */}
            {activeTab === 'links-virtuais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🔗</span> Links Virtuais das Aulas
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ tipo: 'Google Meet', estado: 'Publicado' });
                        setModalType('link');
                      }}
                    >
                      + Cadastrar Link Virtual
                    </button>
                  )}
                </div>

                {filterByState(conteudo.linksVirtuais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum link virtual registado.</p>
                ) : (
                  filterByState(conteudo.linksVirtuais || []).map(item => (
                    <div className="item-box" key={item.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{item.nome}</h3>
                          <div className="item-meta">
                            <span>💻 Plataforma: <strong>{item.tipo}</strong></span>
                            <span>•</span>
                            <span>📅 {item.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${item.estado.toLowerCase()}`}>{item.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('linksVirtuais', item.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{item.descricao}</p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          🌐 Aceder à Sessão Virtual ({item.tipo}) ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 9. MICROCREDENCIAIS */}
            {activeTab === 'microcredenciais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🎖️</span> Microcredenciais da Disciplina
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ badgeIcon: '🎖️', estado: 'Publicado' });
                        setModalType('micro');
                      }}
                    >
                      + Associar Microcredencial
                    </button>
                  )}
                </div>

                {filterByState(conteudo.microcredenciais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma microcredencial associada no momento.</p>
                ) : (
                  filterByState(conteudo.microcredenciais || []).map(micro => (
                    <div className="item-box" key={micro.id} style={{ borderLeft: '4px solid #f59e0b' }}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">
                            <span>{micro.badgeIcon || '🎖️'}</span> {micro.nome}
                          </h3>
                          <div className="item-meta">
                            <span>⏱️ Carga: {micro.cargaHoraria}</span>
                            <span>•</span>
                            <span>📅 {micro.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${micro.estado.toLowerCase()}`}>{micro.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('microcredenciais', micro.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{micro.descricao}</p>
                      <div style={{ background: '#fffbeb', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                        <strong>Competências Adquiridas:</strong> {micro.competencias}
                      </div>
                      {micro.criterios && (
                        <div style={{ fontSize: '0.82rem', color: '#92400e', marginBottom: '0.5rem' }}>
                          📜 <strong>Critérios de Conclusão:</strong> {micro.criterios}
                        </div>
                      )}
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={micro.link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                        >
                          🌐 Consultar Plataforma de Certificação ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 10. LABORATÓRIO DIGITAL */}
            {activeTab === 'laboratorio-digital' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🔬</span> Laboratório Digital da Disciplina
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.laboratorioDigital || {});
                        setModalType('editLab');
                      }}
                    >
                      ✏️ Configurar Laboratório Digital
                    </button>
                  )}
                </div>

                <div className="lab-box-highlight">
                  <h3 style={{ margin: '0 0 0.5rem', color: '#065f46', fontSize: '1.2rem' }}>
                    {conteudo.laboratorioDigital?.nome}
                  </h3>
                  <p style={{ color: '#047857', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                    <strong>DESCRIÇÃO DO LABORATÓRIO:</strong> {conteudo.laboratorioDigital?.descricao}
                  </p>
                  <p style={{ color: '#065f46', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    🎯 <strong>Objectivo Prático:</strong> {conteudo.laboratorioDigital?.objectivo}
                  </p>

                  {/* GUIA DO LABORATÓRIO */}
                  <div className="lab-guide-box">
                    <h4 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '0.98rem' }}>
                      📋 {conteudo.laboratorioDigital?.guiaLaboratorio?.titulo || 'GUIA DO LABORATÓRIO'}
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {Array.isArray(conteudo.laboratorioDigital?.guiaLaboratorio?.passos) ? (
                        conteudo.laboratorioDigital.guiaLaboratorio.passos.map((passo, i) => (
                          <li key={i}>{passo}</li>
                        ))
                      ) : (
                        <li>Siga as instruções semanais indicadas pelo docente.</li>
                      )}
                    </ul>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {conteudo.laboratorioDigital?.linkAmbiente && (
                      <a
                        href={conteudo.laboratorioDigital.linkAmbiente}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        🚀 Aceder ao Ambiente de Prática Virtual ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>🛠️ Recursos e Requisitos Necessários</h4>
                  <p>{conteudo.laboratorioDigital?.recursos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📝 Atividades Práticas Obrigatórias</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.laboratorioDigital?.atividadesPraticas) ? (
                      conteudo.laboratorioDigital.atividadesPraticas.map((a, i) => <li key={i}>{a}</li>)
                    ) : (
                      <li>Consulte o cronograma da disciplina.</li>
                    )}
                  </ul>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    ⏰ <em>{conteudo.laboratorioDigital?.instrucoes}</em>
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL GERAL PARA CRIAÇÃO/EDIÇÃO */}
      {modalType && (
        <div className="modal-backdrop-hs" onClick={() => setModalType(null)}>
          <div className="modal-card-hs" onClick={e => e.stopPropagation()}>
            {/* Modal Manual */}
            {modalType === 'manual' && (
              <form onSubmit={handleAddManual}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📚 Disponibilizar Novo Manual</h3>
                <div className="form-group-hs">
                  <label>Título do Manual *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Autor / Departamento *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.autor || ''}
                    onChange={e => setFormData({ ...formData, autor: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Versão</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.versao || 'v1.0'}
                    onChange={e => setFormData({ ...formData, versao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Nome do Ficheiro / Link *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.ficheiro_nome || ''}
                    onChange={e => setFormData({ ...formData, ficheiro_nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Estado do Conteúdo</label>
                  <select
                    className="form-input-hs"
                    value={formData.estado || 'Publicado'}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Actualizado">Actualizado</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Manual</button>
                </div>
              </form>
            )}

            {/* Modal Guia de Estudo */}
            {modalType === 'guia' && (
              <form onSubmit={handleAddGuia}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📖 Criar Novo Guia de Estudo</h3>
                <div className="form-group-hs">
                  <label>Título do Guia *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição / Objetivos do Roteiro</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Orientações Pedagógicas</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.orientacoes || ''}
                    onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Exercícios e Atividades Práticas</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.exercicios || ''}
                    onChange={e => setFormData({ ...formData, exercicios: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Estado do Conteúdo</label>
                  <select
                    className="form-input-hs"
                    value={formData.estado || 'Publicado'}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                  </select>
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Guia</button>
                </div>
              </form>
            )}

            {/* Modal Link Virtual */}
            {modalType === 'link' && (
              <form onSubmit={handleAddLink}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🔗 Cadastrar Link Virtual</h3>
                <div className="form-group-hs">
                  <label>Nome do Link *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Tipo de Plataforma</label>
                  <select
                    className="form-input-hs"
                    value={formData.tipo || 'Google Meet'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Moodle">Moodle</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Simulador">Simulador</option>
                    <option value="Plataforma Académica">Plataforma Académica</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group-hs">
                  <label>URL / Endereço Web *</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    required
                    value={formData.url || ''}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Link</button>
                </div>
              </form>
            )}

            {/* Modal Microcredencial */}
            {modalType === 'micro' && (
              <form onSubmit={handleAddMicro}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🎖️ Associar Microcredencial</h3>
                <div className="form-group-hs">
                  <label>Nome da Microcredencial *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHoraria || '10 Horas'}
                    onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Competências Adquiridas *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.competencias || ''}
                    onChange={e => setFormData({ ...formData, competencias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Critérios de Obtenção</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.criterios || ''}
                    onChange={e => setFormData({ ...formData, criterios: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link da Plataforma de Certificação</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    value={formData.link || ''}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Microcredencial</button>
                </div>
              </form>
            )}

            {/* Modal Aula */}
            {modalType === 'aula' && (
              <form onSubmit={handleAddAula}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🏛️ Registar Aula Teórica / Prática</h3>
                <div className="form-group-hs">
                  <label>Tipo de Aula *</label>
                  <select
                    className="form-input-hs"
                    value={formData.tipo || 'Teórica'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Teórica">Aula Teórica</option>
                    <option value="Prática">Aula Prática / Laboratório</option>
                  </select>
                </div>
                <div className="form-group-hs">
                  <label>Título da Aula *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Data da Sessão</label>
                  <input
                    type="date"
                    className="form-input-hs"
                    value={formData.data || ''}
                    onChange={e => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Sumário / Conteúdo Lecionado</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.conteudo || ''}
                    onChange={e => setFormData({ ...formData, conteudo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link da Gravação ou Transmissão</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    placeholder="https://youtube.com ou meet.google.com"
                    value={formData.videoUrl || ''}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Aula</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Analítico */}
            {modalType === 'editPlanoAnalitico' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoAnalitico: formData };
                handleSaveConteudo(updated, 'Plano Analítico atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📋 Editar Plano Analítico</h3>
                <div className="form-group-hs">
                  <label>Unidade Curricular</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.unidadeCurricular || ''}
                    onChange={e => setFormData({ ...formData, unidadeCurricular: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHoraria || ''}
                    onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Objetivos de Aprendizagem</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.objectivos || ''}
                    onChange={e => setFormData({ ...formData, objectivos: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Metodologias</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.metodologias || ''}
                    onChange={e => setFormData({ ...formData, metodologias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Sistema de Avaliação</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.avaliacao || ''}
                    onChange={e => setFormData({ ...formData, avaliacao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Bibliografia</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.bibliografia || ''}
                    onChange={e => setFormData({ ...formData, bibliografia: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Curricular */}
            {modalType === 'editPlanoCurricular' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoCurricular: formData };
                handleSaveConteudo(updated, 'Plano Curricular atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📜 Editar Plano Curricular</h3>
                <div className="form-group-hs">
                  <label>Competências Principais</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.competencias || ''}
                    onChange={e => setFormData({ ...formData, competencias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Resultados de Aprendizagem</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.resultados || ''}
                    onChange={e => setFormData({ ...formData, resultados: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária Teórica</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHorariaTeorica || ''}
                    onChange={e => setFormData({ ...formData, cargaHorariaTeorica: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária Prática</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHorariaPratica || ''}
                    onChange={e => setFormData({ ...formData, cargaHorariaPratica: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Social */}
            {modalType === 'editPlanoSocial' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoSocial: formData };
                handleSaveConteudo(updated, 'Plano Social atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🤝 Editar Plano Social</h3>
                <div className="form-group-hs">
                  <label>Descrição do Plano Social</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Orientações e Acompanhamento</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.orientacoes || ''}
                    onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Calendário / Horários das Sessões</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.calendario || ''}
                    onChange={e => setFormData({ ...formData, calendario: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link do Canal de Acompanhamento</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    value={formData.links || ''}
                    onChange={e => setFormData({ ...formData, links: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Laboratório Digital */}
            {modalType === 'editLab' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, laboratorioDigital: formData };
                handleSaveConteudo(updated, 'Laboratório Digital atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🔬 Configurar Laboratório Digital</h3>
                <div className="form-group-hs">
                  <label>Nome do Laboratório *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição do Laboratório *</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    required
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Objectivo Prático</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.objectivo || ''}
                    onChange={e => setFormData({ ...formData, objectivo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link para o Ambiente de Prática Virtual</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    placeholder="https://..."
                    value={formData.linkAmbiente || ''}
                    onChange={e => setFormData({ ...formData, linkAmbiente: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Recursos Necessários</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.recursos || ''}
                    onChange={e => setFormData({ ...formData, recursos: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Laboratório</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
