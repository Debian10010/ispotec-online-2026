import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';

export default function GroupsManage() {
  const { user } = useAuth();
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
      <h1 style={{ marginTop: '2rem', marginBottom: '2rem' }}>Gestão de Disciplinas e Grupos</h1>

      {mensagem && <div className="alert alert-success">{mensagem}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}

      {/* Formulário de Criação */}
      <div style={{
        background: 'var(--white)',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>Criar Nova Disciplina/Grupo</h3>

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

      {/* Lista de Grupos */}
      <div style={{
        background: 'var(--white)',
        borderRadius: '8px',
        overflowX: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Disciplina</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Descrição</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Membros</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Posts</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Ações</th>
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
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <Link 
                      to={`/dashboard/group-view?id=${g.id}`} 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}
                    >
                      Ver
                    </Link>
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => handleDelete(g.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard" className="btn btn-primary">Voltar ao Dashboard</Link>
      </div>
    </div>
  );
}
