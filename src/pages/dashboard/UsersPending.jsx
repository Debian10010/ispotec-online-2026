import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';

export default function UsersPending() {
  const [pendentes, setPendentes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPendentes = async () => {
    setLoading(true);
    const data = await userService.getPendingUsers();
    setPendentes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPendentes();
  }, []);

  const handleAction = async (userId, acao) => {
    if (acao === 'bloqueado') {
      if (!window.confirm('Tem certeza que deseja rejeitar este registo?')) return;
    }
    const success = await userService.updateStatus(userId, acao);
    if (success) {
      setMensagem(`Utilizador ${acao === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      loadPendentes();
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ marginTop: '2rem' }}>
        <h1 className="page-title">Aprovação de Utilizadores</h1>
        <p className="page-description">Validação de novos registos na plataforma • Total pendente: <strong>{pendentes.length}</strong></p>
      </div>

      {mensagem && (
        <div className="alert alert-success" role="alert">
          <span>✓</span>
          <span>{mensagem}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--isp-slate-500)' }}>
          A carregar pedidos de adesão...
        </div>
      ) : pendentes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">✅</span>
          <h3 className="empty-state-title">Nenhum registo pendente</h3>
          <p className="empty-state-desc">Todos os pedidos de registo foram processados e autorizados pela administração.</p>
          <Link to="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>Email</th>
                <th>Perfil Solicitado</th>
                <th>Curso / Especialidade</th>
                <th style={{ textAlign: 'right' }}>Ações de Decisão</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--isp-slate-900)' }}>{p.nome}</td>
                  <td style={{ color: 'var(--isp-slate-600)' }}>{p.email}</td>
                  <td>
                    <span className={`badge badge-warning user-badge-${p.tipo}`}>
                      {p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : '-'}
                    </span>
                  </td>
                  <td>{p.curso || '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-success" 
                      style={{ marginRight: '0.5rem' }}
                      onClick={() => handleAction(p.id, 'aprovado')}
                    >
                      <span>✓</span>
                      <span>Aprovar</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleAction(p.id, 'bloqueado')}
                    >
                      <span>✕</span>
                      <span>Rejeitar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span>←</span>
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
