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
      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h1 className="page-title">Gestão de Disciplinas e Grupos</h1>
        <p className="page-description">Organização curricular e acompanhamento das turmas académicas</p>
      </div>

      {mensagem && (
        <div className="alert alert-success" role="alert">
          <span>✓</span>
          <span>{mensagem}</span>
        </div>
      )}
      {erro && (
        <div className="alert alert-error" role="alert">
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
                <label htmlFor="disciplina">Disciplina:</label>
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

            <div className="form-group">
              <label htmlFor="descricao">Descrição:</label>
              <textarea 
                id="descricao" 
                name="descricao" 
                rows="3"
                value={formData.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modulo">Módulo:</label>
              <input 
                type="text" 
                id="modulo" 
                name="modulo" 
                value={formData.modulo}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-success" style={{ padding: '0.8rem 2rem' }}>
              Criar Grupo
            </button>
          </form>
        </div>
      )}

      {/* Lista de Grupos */}
      <div className="table-responsive">
        <table className="table">
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
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
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
                      borderRadius: '20px'
                    }}>
                      {g.total_membros}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: 'var(--accent-green)',
                      color: 'var(--white)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px'
                    }}>
                      {g.total_posts}
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

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span>←</span>
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
