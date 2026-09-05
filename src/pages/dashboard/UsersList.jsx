import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { userService } from '../../services/userService';

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroTipo = searchParams.get('tipo') || '';
  const filtroStatus = searchParams.get('status') || 'aprovado';

  const [tipo, setTipo] = useState(filtroTipo);
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = await userService.getAllUsers({
        tipo: filtroTipo,
        status: filtroStatus
      });
      setUtilizadores(data);
      setLoading(false);
    }
    loadUsers();
  }, [filtroTipo, filtroStatus]);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (tipo) params.tipo = tipo;
    if (filtroStatus) params.status = filtroStatus;
    setSearchParams(params);
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <h1 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Utilizadores Registados</h1>

      <div style={{
        background: 'var(--white)',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>Filtros</h3>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '5px', minWidth: '200px' }}
          >
            <option value="">Todos os tipos</option>
            <option value="estudante">Estudante</option>
            <option value="docente">Docente</option>
            <option value="especialista">Especialista</option>
          </select>
          <button type="submit" className="btn btn-primary">Filtrar</button>
        </form>
      </div>

      <div style={{
        background: 'var(--white)',
        borderRadius: '8px',
        overflowX: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Curso</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Data Registo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  A carregar utilizadores...
                </td>
              </tr>
            ) : utilizadores.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Nenhum utilizador encontrado
                </td>
              </tr>
            ) : (
              utilizadores.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{u.nome}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}><strong>{u.tipo ? u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1) : '-'}</strong></td>
                  <td style={{ padding: '1rem' }}>{u.curso || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      backgroundColor: u.status === 'aprovado' ? '#d4edda' : '#f8d7da',
                      color: u.status === 'aprovado' ? '#155724' : '#721c24'
                    }}>
                      {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : '-'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDate(u.data_registo)}</td>
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
