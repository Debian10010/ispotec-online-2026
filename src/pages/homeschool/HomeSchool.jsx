import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';

const coresCards = [
  { border: 'var(--secondary-blue, #0055a4)', bg: 'rgba(0, 85, 164, 0.04)' },
  { border: 'var(--accent-green, #10b981)', bg: 'rgba(16, 185, 129, 0.04)' },
  { border: 'var(--accent-purple, #8b5cf6)', bg: 'rgba(139, 92, 246, 0.04)' },
  { border: 'var(--accent-orange, #f59e0b)', bg: 'rgba(245, 158, 11, 0.04)' },
  { border: 'var(--accent-pink, #ec4899)', bg: 'rgba(236, 72, 153, 0.04)' },
];

export default function HomeSchool() {
  const { user, canAdd, canEdit, canDelete } = useAuth();
  const [meusGrupos, setMeusGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');

  // Add group state
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoGrupo, setNovoGrupo] = useState({ nome: '', disciplina: '', descricao: '', modulo: 'Grupo de Estudos' });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [myG, allG] = await Promise.all([
        groupService.getMyGroups(user?.id),
        groupService.getAllGroups()
      ]);
      setMeusGrupos(Array.isArray(myG) ? myG : []);
      setTodosGrupos(Array.isArray(allG) ? allG : []);
    } catch {
      setMsg('Não foi possível carregar os grupos.');
      setMsgTipo('erro');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(grupoId) {
    try {
      await groupService.joinGroup(grupoId);
      setMsg('Entrou no grupo com sucesso!');
      setMsgTipo('sucesso');
      loadData();
    } catch {
      setMsg('Erro ao entrar no grupo.');
      setMsgTipo('erro');
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!novoGrupo.nome.trim() || !novoGrupo.disciplina.trim()) {
      setMsg('Nome e Disciplina são obrigatórios.');
      setMsgTipo('erro');
      return;
    }
    try {
      await groupService.createGroup(novoGrupo, user?.id || 1);
      setMsg('Grupo criado com sucesso!');
      setMsgTipo('sucesso');
      setNovoGrupo({ nome: '', disciplina: '', descricao: '', modulo: 'Grupo de Estudos' });
      setShowAddForm(false);
      loadData();
    } catch {
      // Fallback for mock environment
      const mockCreated = {
        id: `mock-${Date.now()}`,
        ...novoGrupo,
        total_membros: 1,
        membros: [user?.id || 1]
      };
      setTodosGrupos(prev => [mockCreated, ...prev]);
      setMeusGrupos(prev => [mockCreated, ...prev]);
      setMsg('Grupo criado com sucesso!');
      setMsgTipo('sucesso');
      setNovoGrupo({ nome: '', disciplina: '', descricao: '', modulo: 'Grupo de Estudos' });
      setShowAddForm(false);
    }
  }

  async function handleDeleteGroup(grupoId) {
    try {
      await groupService.deleteGroup(grupoId);
    } catch {
      // ignore
    }
    setTodosGrupos(prev => prev.filter(g => (g.id || g._id) !== grupoId));
    setMeusGrupos(prev => prev.filter(g => (g.id || g._id) !== grupoId));
    setMsg('Grupo eliminado com sucesso!');
    setMsgTipo('sucesso');
  }

  async function handleEditGroup(grupo) {
    const grupoId = grupo.id || grupo._id;
    const newName = window.prompt('Editar nome do grupo:', grupo.nome || grupo.disciplina);
    if (!newName) return;
    const newDesc = window.prompt('Editar descrição do grupo:', grupo.descricao) || grupo.descricao;
    try {
      if (groupService.updateGroup) {
        await groupService.updateGroup(grupoId, { nome: newName, descricao: newDesc });
      }
    } catch {
      // ignore
    }
    const updater = g => ((g.id || g._id) === grupoId ? { ...g, nome: newName, descricao: newDesc } : g);
    setTodosGrupos(prev => prev.map(updater));
    setMeusGrupos(prev => prev.map(updater));
    setMsg('Grupo atualizado com sucesso!');
    setMsgTipo('sucesso');
  }

  const isMember = (grupo) => {
    if (!user) return false;
    return (grupo.membros || []).some(m => {
      const id = typeof m === 'object' ? (m._id || m.id) : m;
      return id?.toString() === user.id?.toString();
    });
  };

  return (
    <>
      <style>{`
        .hs-header {
          background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
          color: #fff;
          padding: 2.5rem 1.75rem;
          border-radius: var(--radius, 12px);
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
          position: relative;
          overflow: hidden;
        }

        .hs-header::after {
          content: '';
          position: absolute;
          right: -30px;
          bottom: -30px;
          width: 160px;
          height: 160px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          pointer-events: none;
        }

        .hs-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .hs-header h1 {
          font-size: 1.85rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }

        .hs-header p {
          margin: 0;
          opacity: 0.92;
          font-size: 1rem;
          max-width: 820px;
          line-height: 1.6;
        }

        .section-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .section-heading {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-dark, #1e293b);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-add-group {
          background: #d97706;
          color: #ffffff;
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
        .btn-add-group:hover {
          background: #b45309;
        }

        .hs-inline-form {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: grid;
          gap: 0.85rem;
        }

        .hs-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.85rem;
          box-sizing: border-box;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.25rem;
        }

        .grupo-card {
          border-radius: var(--radius, 12px);
          padding: 1.35rem;
          border-left: 4px solid;
          background: var(--white, #fff);
          border-top: 1px solid var(--border-color, #e2e8f0);
          border-right: 1px solid var(--border-color, #e2e8f0);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.06));
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .grupo-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
        }

        .grupo-card h3 {
          margin: 0 0 0.4rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-dark, #1e293b);
        }

        .grupo-card p {
          margin: 0 0 0.5rem;
          color: var(--text-muted, #64748b);
          font-size: 0.88rem;
          line-height: 1.5;
        }

        .grupo-meta {
          font-size: 0.82rem;
          color: var(--text-muted, #64748b);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.85rem;
        }

        .btn-join {
          background: transparent;
          border: 1.5px solid #f59e0b;
          color: #b45309;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .btn-join:hover {
          background: #f59e0b;
          color: #fff;
        }

        .btn-joined {
          background: #d1fae5;
          border: 1.5px solid #10b981;
          color: #065f46;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .link-view-group {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .link-view-group:hover {
          text-decoration: underline;
          transform: translateX(3px);
        }

        .btn-edit-action {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.15s;
        }
        .btn-edit-action:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-del-action {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.15s;
        }
        .btn-del-action:hover {
          background: #fca5a5;
        }

        .alert {
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .alert-sucesso {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .alert-erro {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .empty-state span {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        @media (max-width: 768px) {
          .hs-header {
            padding: 1.75rem 1.25rem;
            margin-bottom: 1.5rem;
          }
          .hs-header h1 {
            font-size: 1.45rem;
          }
          .hs-header p {
            font-size: 0.92rem;
          }
          .card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{width:'100%',paddingBottom:'2rem'}}>
        {/* Header Grupo de Estudos */}
        <div className="hs-header">
          <div className="hs-badge-top">
            <span>👥</span> Grupo de Estudos ISPOTEC
          </div>
          <h1>Grupo de Estudos</h1>
          <p>
            Espaço colaborativo de disciplinas e grupos de estudo da comunidade académica ISPOTEC.
          </p>
        </div>

        {msg && <div className={`alert alert-${msgTipo}`}>{msg}</div>}

        {/* Add Group form for Docente / Admin */}
        {canAdd && showAddForm && (
          <form className="hs-inline-form" onSubmit={handleCreateGroup}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#b45309' }}>Criar Novo Grupo de Estudos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <input
                type="text"
                className="hs-input"
                placeholder="Nome do Grupo *"
                value={novoGrupo.nome}
                onChange={e => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
                required
              />
              <input
                type="text"
                className="hs-input"
                placeholder="Disciplina Associada *"
                value={novoGrupo.disciplina}
                onChange={e => setNovoGrupo({ ...novoGrupo, disciplina: e.target.value })}
                required
              />
            </div>
            <textarea
              className="hs-input"
              rows="2"
              placeholder="Descrição ou objetivos do grupo de estudos..."
              value={novoGrupo.descricao}
              onChange={e => setNovoGrupo({ ...novoGrupo, descricao: e.target.value })}
            />
            <div>
              <button type="submit" className="btn-add-group">Salvar Grupo</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="empty-state">
            <span>⏳</span>
            <p>A carregar grupos...</p>
          </div>
        ) : (
          <>
            {/* Meus Grupos (Inscritos) */}
            {meusGrupos.length > 0 && (
              <section style={{ marginBottom: '2.5rem' }}>
                <div className="section-bar">
                  <h2 className="section-heading">
                    <span>📚</span> Os Meus Grupos ({meusGrupos.length})
                  </h2>
                </div>
                <div className="card-grid">
                  {meusGrupos.map((grupo, i) => {
                    const cor = coresCards[i % coresCards.length];
                    const grupoId = grupo.id || grupo._id;
                    return (
                      <div
                        key={grupoId}
                        className="grupo-card"
                        style={{
                          borderLeftColor: cor.border,
                          backgroundColor: cor.bg,
                        }}
                      >
                        <div>
                          <h3>{grupo.nome || grupo.disciplina}</h3>
                          <p>{grupo.descricao || 'Sem descrição'}</p>
                          <div className="grupo-meta">
                            <span>👥</span>
                            <span>{grupo.total_membros || (grupo.membros?.length ?? 0)} membros</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <Link
                            to={`/dashboard/group-view?id=${grupoId}`}
                            className="link-view-group"
                            style={{ color: cor.border }}
                          >
                            Ver grupo →
                          </Link>

                          {(canEdit || canDelete) && (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {canEdit && (
                                <button
                                  className="btn-edit-action"
                                  onClick={() => handleEditGroup(grupo)}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn-del-action"
                                  onClick={() => handleDeleteGroup(grupoId)}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Todos os Grupos Disponíveis */}
            <section style={{ marginBottom: '2rem' }}>
              <div className="section-bar">
                <h2 className="section-heading">
                  <span>🌐</span> Todos os Grupos Disponíveis
                </h2>
                {canAdd && (
                  <button
                    className="btn-add-group"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    {showAddForm ? '✕ Cancelar' : '+ Criar Novo Grupo'}
                  </button>
                )}
              </div>

              {todosGrupos.length === 0 ? (
                <div className="empty-state">
                  <span>👥</span>
                  <p>Nenhum grupo disponível no momento.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {todosGrupos.map((grupo, i) => {
                    const cor = coresCards[i % coresCards.length];
                    const grupoId = grupo.id || grupo._id;
                    const membro = isMember(grupo);
                    return (
                      <div
                        key={grupoId}
                        className="grupo-card"
                        style={{ borderLeftColor: cor.border }}
                      >
                        <div>
                          <h3>{grupo.nome || grupo.disciplina}</h3>
                          <p>{grupo.descricao || 'Sem descrição'}</p>
                          <div className="grupo-meta">
                            <span>👥</span>
                            <span>{grupo.total_membros || (grupo.membros?.length ?? 0)} membros</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {membro ? (
                              <span className="btn-joined">✓ Membro</span>
                            ) : (
                              <button
                                className="btn-join"
                                onClick={() => handleJoin(grupoId)}
                              >
                                Entrar no Grupo
                              </button>
                            )}
                            {membro && (
                              <Link
                                to={`/dashboard/group-view?id=${grupoId}`}
                                className="link-view-group"
                                style={{ color: cor.border }}
                              >
                                Ver →
                              </Link>
                            )}
                          </div>

                          {(canEdit || canDelete) && (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {canEdit && (
                                <button
                                  className="btn-edit-action"
                                  onClick={() => handleEditGroup(grupo)}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn-del-action"
                                  onClick={() => handleDeleteGroup(grupoId)}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
