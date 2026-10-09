import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';

export default function GroupsManage() {
  const { user, canAdd, canDelete } = useAuth();
  const [grupos, setGrupos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    disciplina: '',
    descricao: '',
    modulo: ''
  });

  const loadGroups = async () => {
    const data = await groupService.getAllGroups();
    setGrupos(data);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!formData.nome.trim() || !formData.disciplina.trim()) {
      setErro('Nome e Disciplina são obrigatórios');
      return;
    }

    try {
      await groupService.createGroup(formData, user?.id || 1);
      setMensagem('Grupo criado com sucesso!');
      setFormData({ nome: '', disciplina: '', descricao: '', modulo: '' });
      loadGroups();
    } catch {
      setErro('Erro ao criar grupo');
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Tem certeza que deseja eliminar este grupo?')) return;
    await groupService.deleteGroup(groupId);
    setMensagem('Grupo eliminado com sucesso!');
    loadGroups();
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <style>{`
        .groups-desktop-table {
          display: block;
        }

        .groups-mobile-cards {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .group-mobile-card {
          background: #ffffff;
          border-radius: var(--isp-radius-lg);
          border: 1px solid var(--isp-slate-200);
          box-shadow: var(--isp-shadow-sm);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .group-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .group-card-title {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--isp-slate-900);
        }

        .group-card-module {
          font-size: 0.8rem;
          color: var(--isp-slate-500);
          margin-top: 2px;
        }

        .group-card-desc {
          font-size: 0.85rem;
          color: var(--isp-slate-600);
          line-height: 1.4;
        }

        .group-card-stats {
          display: flex;
          gap: 1rem;
          background: var(--isp-slate-50);
          padding: 0.6rem 0.85rem;
          border-radius: var(--isp-radius-md);
          border: 1px solid var(--isp-slate-200);
          font-size: 0.82rem;
        }

        .group-card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .group-card-actions a,
        .group-card-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.6rem;
          font-size: 0.85rem;
          border-radius: var(--isp-radius-md);
        }

        @media (max-width: 768px) {
          .groups-desktop-table {
            display: none !important;
          }

          .groups-mobile-cards {
            display: flex !important;
          }
        }
      `}</style>

      <div className="page-header" style={{ marginTop: '1.5rem' }}>
        <h1 className="page-title">Gestão de Disciplinas e Grupos</h1>
        <p className="page-description">Organização curricular e acompanhamento das turmas académicas</p>
      </div>

      {mensagem && (
        <div className="alert alert-success" role="alert" style={{ margin: '1.25rem 0' }}>
          <span>✓</span>
          <span>{mensagem}</span>
        </div>
      )}
      {erro && (
        <div className="alert alert-error" role="alert" style={{ margin: '1.25rem 0' }}>
          <span>⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      {/* Formulário de Criação – apenas Docente e Admin */}
      {canAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--isp-navy-950)', marginBottom: '1.25rem' }}>
            Criar Nova Disciplina / Grupo
          </h3>

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="nome">Nome da Disciplina:</label>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome" 
                  value={formData.nome}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="disciplina">Disciplina / Código:</label>
                <input 
                  type="text" 
                  id="disciplina" 
                  name="disciplina" 
                  value={formData.disciplina}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label htmlFor="descricao">Descrição:</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows="3"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Breve descrição da disciplina ou grupo..."
              />
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label htmlFor="modulo">Módulo:</label>
              <input 
                type="text" 
                id="modulo" 
                name="modulo" 
                value={formData.modulo}
                onChange={handleChange}
                placeholder="Ex: Módulo 1 ou Semestre 1"
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ padding: '0.75rem 2rem', marginTop: '0.5rem' }}>
              Criar Grupo
            </button>
          </form>
        </div>
      )}

      {/* Lista de Grupos */}
      <div>
        {/* Desktop Table */}
        <div className="table-responsive groups-desktop-table" style={{ background: '#fff', borderRadius: 'var(--isp-radius-lg)', boxShadow: 'var(--isp-shadow-sm)', overflow: 'hidden' }}>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Descrição</th>
                <th style={{ textAlign: 'center' }}>Membros</th>
                <th style={{ textAlign: 'center' }}>Posts</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {grupos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#666' }}>
                    Nenhum grupo criado ainda
                  </td>
                </tr>
              ) : (
                grupos.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <strong>{g.nome}</strong><br />
                      <small style={{ color: '#666' }}>Módulo: {g.modulo || '-'}</small>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {g.descricao ? (g.descricao.length > 50 ? g.descricao.substring(0, 50) + '...' : g.descricao) : '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: 'var(--secondary-blue)',
                        color: 'var(--white)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {g.total_membros || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: 'var(--accent-green)',
                        color: 'var(--white)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {g.total_posts || 0}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link 
                        to={`/dashboard/group-view?id=${g.id}`} 
                        className="btn btn-sm btn-primary" 
                        style={{ marginRight: '0.5rem' }}
                      >
                        Aceder
                      </Link>
                      {canDelete && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(g.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="groups-mobile-cards">
          {grupos.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Nenhum grupo criado ainda
            </div>
          ) : (
            grupos.map(g => (
              <div className="group-mobile-card" key={`mobile-g-${g.id}`}>
                <div className="group-card-header">
                  <div>
                    <div className="group-card-title">{g.nome}</div>
                    <div className="group-card-module">Módulo: {g.modulo || '-'}</div>
                  </div>
                </div>

                {g.descricao && (
                  <div className="group-card-desc">{g.descricao}</div>
                )}

                <div className="group-card-stats">
                  <div>
                    <strong>Membros:</strong> {g.total_membros || 0}
                  </div>
                  <div>
                    <strong>Publicações:</strong> {g.total_posts || 0}
                  </div>
                </div>

                <div className="group-card-actions">
                  <Link 
                    to={`/dashboard/group-view?id=${g.id}`} 
                    className="btn btn-primary"
                  >
                    Aceder à Turma
                  </Link>
                  {canDelete && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(g.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span>←</span>
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
