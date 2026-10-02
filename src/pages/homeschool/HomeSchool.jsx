import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { homeSchoolService, CURSOS_ISPOTEC, MODULOS_POR_CURSO } from '../../services/homeschoolService';

export default function HomeSchool() {
  const { user } = useAuth();
  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && (user.tipo === 'docente');
  const canManage = isAdmin || isDocente;

  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurso, setSelectedCurso] = useState('Todos');
  const [selectedSemestre, setSelectedSemestre] = useState('Todos');
  const [selectedEstado, setSelectedEstado] = useState('Todos');

  // Modal creation/edition
  const [showModal, setShowModal] = useState(false);
  const [editingSala, setEditingSala] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    curso: CURSOS_ISPOTEC[0],
    modulo: '',
    disciplina: '',
    docente: user?.nome || 'Docente ISPOTEC',
    ano: '2026',
    semestre: '1º Semestre',
    codigo: '',
    descricao: '',
    estado: 'Ativo',
    dataInicio: '2026-02-15',
    dataTermino: '2026-06-30'
  });

  const [feedback, setFeedback] = useState({ msg: '', tipo: '' });

  useEffect(() => {
    loadSalas();
  }, []);

  async function loadSalas() {
    setLoading(true);
    try {
      const data = await homeSchoolService.getSalas(user);
      setSalas(data);
    } catch (e) {
      console.error('Erro ao carregar salas do Home School:', e);
    } finally {
      setLoading(false);
    }
  }

  const showFeedback = (msg, tipo = 'sucesso') => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback({ msg: '', tipo: '' }), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingSala(null);
    setFormData({
      nome: '',
      curso: CURSOS_ISPOTEC[0],
      modulo: MODULOS_POR_CURSO[CURSOS_ISPOTEC[0]]?.[0] || 'Programação Web',
      disciplina: MODULOS_POR_CURSO[CURSOS_ISPOTEC[0]]?.[0] || 'Programação Web',
      docente: user?.nome || 'Docente ISPOTEC',
      ano: '2026',
      semestre: '1º Semestre',
      codigo: `HS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`,
      descricao: '',
      estado: 'Ativo',
      dataInicio: '2026-02-15',
      dataTermino: '2026-06-30'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (sala) => {
    setEditingSala(sala);
    setFormData({
      id: sala.id || sala._id,
      nome: sala.nome || '',
      curso: sala.curso || CURSOS_ISPOTEC[0],
      modulo: sala.modulo || sala.disciplina || '',
      disciplina: sala.disciplina || sala.modulo || '',
      docente: sala.docente || '',
      ano: sala.ano || '2026',
      semestre: sala.semestre || '1º Semestre',
      codigo: sala.codigo || '',
      descricao: sala.descricao || '',
      estado: sala.estado || 'Ativo',
      dataInicio: sala.dataInicio || '2026-02-15',
      dataTermino: sala.dataTermino || '2026-06-30'
    });
    setShowModal(true);
  };

  const handleSaveSala = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.modulo.trim()) {
      showFeedback('Nome da sala e Módulo/Disciplina são obrigatórios.', 'erro');
      return;
    }

    try {
      await homeSchoolService.saveSala({
        ...formData,
        disciplina: formData.modulo
      });
      showFeedback(editingSala ? 'Sala virtual atualizada com sucesso!' : 'Nova sala virtual criada com sucesso!', 'sucesso');
      setShowModal(false);
      loadSalas();
    } catch (err) {
      showFeedback('Erro ao guardar a sala virtual.', 'erro');
    }
  };

  const handleDeleteSala = async (salaId) => {
    if (!window.confirm('Tem certeza de que deseja eliminar esta sala de aula virtual?')) return;
    try {
      await homeSchoolService.deleteSala(salaId);
      showFeedback('Sala virtual eliminada com sucesso!', 'sucesso');
      loadSalas();
    } catch {
      showFeedback('Erro ao eliminar a sala.', 'erro');
    }
  };

  // Filter logic
  const filteredSalas = salas.filter((s) => {
    const matchesSearch =
      !searchTerm.trim() ||
      (s.nome && s.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.modulo && s.modulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.curso && s.curso.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.docente && s.docente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.codigo && s.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCurso = selectedCurso === 'Todos' || s.curso === selectedCurso;
    const matchesSemestre = selectedSemestre === 'Todos' || s.semestre === selectedSemestre;
    const matchesEstado = selectedEstado === 'Todos' || s.estado === selectedEstado;

    return matchesSearch && matchesCurso && matchesSemestre && matchesEstado;
  });

  // Calculate stats
  const totalSalas = salas.length;
  const totalCursos = new Set(salas.map(s => s.curso)).size;
  const totalAtivas = salas.filter(s => s.estado === 'Ativo').length;
  const totalEstudantes = salas.reduce((acc, curr) => acc + (curr.total_membros || 20), 0);

  return (
    <>
      <style>{`
        .hs-page-container {
          max-width: 1200px;
          margin: 1.5rem auto 3.5rem;
          padding: 0 1rem;
        }

        /* Banner Hero Principal */
        .hs-hero-banner {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #0284c7 100%);
          color: white;
          border-radius: 16px;
          padding: 2.25rem 2.5rem;
          box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.25);
          position: relative;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .hs-hero-banner::after {
          content: '🎓';
          position: absolute;
          right: 25px;
          bottom: -20px;
          font-size: 9rem;
          opacity: 0.1;
          pointer-events: none;
        }

        .hs-badge-hero {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.3rem 0.85rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
        }

        .hs-hero-banner h1 {
          font-size: 2.1rem;
          font-weight: 800;
          margin: 0 0 0.6rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .hs-hero-banner p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          max-width: 860px;
          line-height: 1.6;
        }

        /* Stats Grid */
        .hs-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .hs-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hs-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.06);
        }

        .hs-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
        }

        .hs-stat-val {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .hs-stat-label {
          font-size: 0.84rem;
          color: #64748b;
          margin-top: 0.2rem;
          font-weight: 500;
        }

        /* Filter Controls */
        .hs-filter-bar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
        }

        .hs-filters-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          flex: 1;
        }

        .hs-search-box {
          position: relative;
          min-width: 240px;
          flex: 1;
        }

        .hs-search-input {
          width: 100%;
          padding: 0.6rem 0.85rem 0.6rem 2.2rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          box-sizing: border-box;
        }

        .hs-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .hs-select {
          padding: 0.6rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          background: white;
          color: #334155;
        }

        .btn-create-sala {
          background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 10px rgba(67, 56, 202, 0.25);
          white-space: nowrap;
        }

        .btn-create-sala:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(67, 56, 202, 0.35);
        }

        /* Sala Cards Grid */
        .hs-salas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .hs-sala-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          border-top: 4px solid #4338ca;
        }

        .hs-sala-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
          border-top-color: #3730a3;
        }

        .hs-sala-meta-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .hs-sala-curso-tag {
          background: #e0e7ff;
          color: #3730a3;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.75rem;
          max-width: 220px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hs-sala-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.35rem;
          line-height: 1.3;
        }

        .hs-sala-modulo {
          font-size: 0.92rem;
          color: #2563eb;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .hs-sala-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hs-sala-details {
          background: #f8fafc;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 0.82rem;
          color: #475569;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          margin-bottom: 1.25rem;
        }

        .hs-sala-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
        }

        .btn-enter-sala {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          text-decoration: none;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.15s, transform 0.15s;
        }

        .btn-enter-sala:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          transform: translateX(2px);
          color: white;
        }

        .btn-card-small {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.15s;
        }
        .btn-card-small:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-card-del {
          color: #991b1b;
          border-color: #fca5a5;
          background: #fef2f2;
        }
        .btn-card-del:hover {
          background: #fee2e2;
        }

        /* Empty State */
        .hs-empty-box {
          text-align: center;
          padding: 4rem 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          color: #64748b;
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .hs-hero-banner {
            padding: 1.5rem 1.25rem;
          }
          .hs-hero-banner h1 {
            font-size: 1.6rem;
          }
          .hs-salas-grid {
            grid-template-columns: 1fr;
          }
          .hs-filters-group {
            width: 100%;
          }
          .hs-search-box {
            width: 100%;
          }
        }
      `}</style>

      <div className="hs-page-container">
        {/* Hero Banner */}
        <div className="hs-hero-banner">
          <div className="hs-badge-hero">
            <span>🏫</span> ISPOTEC HOME SCHOOL
          </div>
          <h1>Ambiente de Aprendizagem Híbrida</h1>
          <p>
            Sala de aula virtual institucional do ISPOTEC. Acompanhe as aulas teóricas e práticas, consulte o plano analítico e curricular, aceda aos manuais, roteiros de estudo, links virtuais, microcredenciais e execute as atividades do laboratório digital.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback.msg && (
          <div style={{
            background: feedback.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2',
            color: feedback.tipo === 'sucesso' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.tipo === 'sucesso' ? '#a7f3d0' : '#fecaca'}`,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{feedback.tipo === 'sucesso' ? '✓' : '⚠️'}</span>
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Real Stats Grid */}
        <div className="hs-stats-grid">
          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>🏫</div>
            <div>
              <div className="hs-stat-val">{totalSalas}</div>
              <div className="hs-stat-label">Salas / Grupos Criados</div>
            </div>
          </div>

          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>📚</div>
            <div>
              <div className="hs-stat-val">{totalCursos}</div>
              <div className="hs-stat-label">Cursos Abrangidos</div>
            </div>
          </div>

          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: '#d1fae5', color: '#047857' }}>🟢</div>
            <div>
              <div className="hs-stat-val">{totalAtivas}</div>
              <div className="hs-stat-label">Salas Ativas (2026)</div>
            </div>
          </div>

          <div className="hs-stat-card">
            <div className="hs-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>👥</div>
            <div>
              <div className="hs-stat-val">{totalEstudantes}</div>
              <div className="hs-stat-label">Estudantes em Regime Híbrido</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="hs-filter-bar">
          <div className="hs-filters-group">
            <div className="hs-search-box">
              <span className="hs-search-icon">🔍</span>
              <input
                type="text"
                className="hs-search-input"
                placeholder="Pesquisar por sala, módulo, docente ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="hs-select"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
            >
              <option value="Todos">Todos os Cursos</option>
              {CURSOS_ISPOTEC.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="hs-select"
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
            >
              <option value="Todos">Todos os Semestres</option>
              <option value="1º Semestre">1º Semestre</option>
              <option value="2º Semestre">2º Semestre</option>
              <option value="Anual">Anual</option>
            </select>

            <select
              className="hs-select"
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="Todos">Todos os Estados</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          {canManage && (
            <button
              type="button"
              className="btn-create-sala"
              onClick={handleOpenCreateModal}
            >
              + Criar Sala / Grupo
            </button>
          )}
        </div>

        {/* List of Virtual Classrooms */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏳</div>
            <p>A carregar as salas virtuais do ISPOTEC Home School...</p>
          </div>
        ) : (
          <div className="hs-salas-grid">
            {filteredSalas.length === 0 ? (
              <div className="hs-empty-box">
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏫</div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>Nenhuma sala virtual encontrada</h3>
                <p>Tente ajustar os filtros de pesquisa ou crie uma nova sala para este módulo.</p>
                {canManage && (
                  <button
                    type="button"
                    className="btn-create-sala"
                    style={{ marginTop: '1rem' }}
                    onClick={handleOpenCreateModal}
                  >
                    + Criar Primeira Sala
                  </button>
                )}
              </div>
            ) : (
              filteredSalas.map((sala) => {
                const salaId = sala.id || sala._id;
                return (
                  <div className="hs-sala-card" key={salaId}>
                    <div>
                      <div className="hs-sala-meta-top">
                        <span className="hs-sala-curso-tag" title={sala.curso}>{sala.curso}</span>
                        <span>🏷️ {sala.codigo || 'HS-2026'}</span>
                      </div>

                      <h3 className="hs-sala-title">{sala.nome}</h3>
                      <div className="hs-sala-modulo">
                        <span>📘</span> {sala.modulo || sala.disciplina}
                      </div>

                      <p className="hs-sala-desc">{sala.descricao}</p>

                      <div className="hs-sala-details">
                        <div>👨‍🏫 <strong>Docente:</strong> {sala.docente || 'Docente Responsável'}</div>
                        <div>📅 <strong>Semestre:</strong> {sala.semestre} • {sala.ano}</div>
                        <div>👥 <strong>Estudantes:</strong> {sala.total_membros || 25} inscritos</div>
                      </div>
                    </div>

                    <div className="hs-sala-actions">
                      <Link
                        to={`/homeschool/sala/${salaId}`}
                        className="btn-enter-sala"
                      >
                        🏫 Entrar na Sala Virtual →
                      </Link>

                      {canManage && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn-card-small"
                            onClick={() => handleOpenEditModal(sala)}
                            title="Editar Sala"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn-card-small btn-card-del"
                            onClick={() => handleDeleteSala(salaId)}
                            title="Eliminar Sala"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Sala Virtual */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1.25rem', color: '#0f172a', fontSize: '1.25rem' }}>
              {editingSala ? '✏️ Editar Sala / Grupo Virtual' : '🏫 Criar Nova Sala / Grupo no Home School'}
            </h3>

            <form onSubmit={handleSaveSala}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Curso Académico *
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
                    value={formData.curso}
                    onChange={(e) => {
                      const novoCurso = e.target.value;
                      const modulosDisponiveis = MODULOS_POR_CURSO[novoCurso] || [];
                      setFormData({
                        ...formData,
                        curso: novoCurso,
                        modulo: modulosDisponiveis[0] || formData.modulo
                      });
                    }}
                  >
                    {CURSOS_ISPOTEC.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Módulo / Disciplina *
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    required
                    placeholder="Ex: Programação Web"
                    value={formData.modulo}
                    onChange={(e) => setFormData({ ...formData, modulo: e.target.value, disciplina: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                  Nome da Sala / Grupo *
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  required
                  placeholder="Ex: Programação Web — Grupo A — 2026"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Docente Responsável *
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    required
                    value={formData.docente}
                    onChange={(e) => setFormData({ ...formData, docente: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Código do Grupo
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Semestre
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  >
                    <option value="1º Semestre">1º Semestre</option>
                    <option value="2º Semestre">2º Semestre</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                  Descrição da Sala Virtual
                </label>
                <textarea
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  rows="3"
                  placeholder="Descreva os objetivos da sala de aula híbrida, horários e orientações gerais..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Estado
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Data de Início
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Data de Término
                  </label>
                  <input
                    type="date"
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    value={formData.dataTermino}
                    onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  style={{ padding: '0.6rem 1.25rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: '600' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-create-sala"
                >
                  {editingSala ? 'Guardar Alterações' : 'Criar Sala Virtual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
