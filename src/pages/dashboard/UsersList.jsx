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
      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h1 className="page-title">Gestão de Utilizadores</h1>
        <p className="page-description">Consulta e filtragem de utilizadores registados na plataforma ISPOTEC</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <label htmlFor="tipo-filter" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--isp-slate-600)', marginBottom: '0.35rem', display: 'block' }}>
              Filtrar por Perfil
            </label>
            <select 
              id="tipo-filter"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="isp-select"
            >
              <option value="">Todos os perfis</option>
              <option value="estudante">Estudante</option>
              <option value="docente">Docente</option>
              <option value="especialista">Especialista (Admin)</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <span>🔍</span>
              <span>Filtrar</span>
            </button>
          </div>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Curso / Especialidade</th>
              <th>Estado</th>
              <th>Data de Registo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--isp-slate-500)' }}>
                  A carregar utilizadores...
                </td>
              </tr>
            ) : utilizadores.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state" style={{ border: 'none', padding: '2.5rem 1rem' }}>
                    <span className="empty-state-icon">👥</span>
                    <h3 className="empty-state-title">Nenhum utilizador encontrado</h3>
                    <p className="empty-state-desc">Não foram encontrados registos correspondentes aos filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              utilizadores.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--isp-slate-900)' }}>{u.nome}</td>
                  <td style={{ color: 'var(--isp-slate-600)' }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-info user-badge-${u.tipo}`}>
                      {u.tipo ? u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1) : '-'}
                    </span>
                  </td>
                  <td>{u.curso || '—'}</td>
                  <td>
                    <span className={`badge ${u.status === 'aprovado' ? 'badge-success' : 'badge-warning'}`}>
                      {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : '-'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--isp-slate-500)' }}>{formatDate(u.data_registo)}</td>
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
