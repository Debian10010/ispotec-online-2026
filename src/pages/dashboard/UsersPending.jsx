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
      <h1 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Utilizadores Pendentes de Aprovação</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Total: <strong>{pendentes.length}</strong> utilizadores
      </p>

      {mensagem && (
        <div className="alert alert-success">{mensagem}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>A carregar...</div>
      ) : pendentes.length === 0 ? (
        <div className="alert alert-info">Não há utilizadores pendentes de aprovação.</div>
      ) : (
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
                <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{p.nome}</td>
                  <td style={{ padding: '1rem' }}>{p.email}</td>
                  <td style={{ padding: '1rem' }}><strong>{p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : '-'}</strong></td>
                  <td style={{ padding: '1rem' }}>{p.curso || '-'}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', marginRight: '0.5rem' }}
                      onClick={() => handleAction(p.id, 'aprovado')}
                    >
                      Aprovar
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => handleAction(p.id, 'bloqueado')}
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard" className="btn btn-primary">Voltar ao Dashboard</Link>
      </div>
    </div>
  );
}
