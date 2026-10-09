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
      <style>{`
        .pending-header-bar {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pending-desktop-table {
          display: block;
        }

        .pending-mobile-cards {
          display: none;
          flex-direction: column;
          gap: 1rem;
        }

        .pending-mobile-card {
          background: #ffffff;
          border-radius: var(--isp-radius-lg);
          border: 1px solid var(--isp-slate-200);
          box-shadow: var(--isp-shadow-sm);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .pending-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .pending-card-name {
          font-weight: 700;
          color: var(--isp-slate-900);
          font-size: 1.05rem;
        }

        .pending-card-email {
          color: var(--isp-slate-600);
          font-size: 0.85rem;
          word-break: break-all;
        }

        .pending-card-course {
          font-size: 0.85rem;
          color: var(--isp-slate-700);
          background: var(--isp-slate-50);
          padding: 0.5rem 0.75rem;
          border-radius: var(--isp-radius-sm);
          border: 1px solid var(--isp-slate-200);
        }

        .pending-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-top: 0.25rem;
        }

        .pending-card-actions button {
          padding: 0.6rem 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          border-radius: var(--isp-radius-md);
        }

        @media (max-width: 768px) {
          .pending-desktop-table {
            display: none !important;
          }

          .pending-mobile-cards {
            display: flex !important;
          }

          .pending-header-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="pending-header-bar">
        <div>
          <h1 className="page-title">Aprovação de Utilizadores</h1>
          <p className="page-description">Validação de novos registos na plataforma • Total pendente: <strong>{pendentes.length}</strong></p>
        </div>
      </div>

      {mensagem && (
        <div className="alert alert-success" role="alert" style={{ margin: '1.25rem 0' }}>
          <span>✓</span>
          <span>{mensagem}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--isp-slate-500)', marginTop: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
          A carregar pedidos de adesão...
        </div>
      ) : pendentes.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '1.25rem' }}>
          <span className="empty-state-icon">✅</span>
          <h3 className="empty-state-title">Nenhum registo pendente</h3>
          <p className="empty-state-desc">Todos os pedidos de registo foram processados e autorizados pela administração.</p>
          <Link to="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ marginTop: '1.25rem' }}>
          {/* Desktop Table View */}
          <div className="table-responsive pending-desktop-table" style={{ background: '#fff', borderRadius: 'var(--isp-radius-lg)', boxShadow: 'var(--isp-shadow-sm)', overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0 }}>
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
                {pendentes.map((p) => (
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

          {/* Mobile Cards View */}
          <div className="pending-mobile-cards">
            {pendentes.map((p) => (
              <div className="pending-mobile-card" key={`mobile-p-${p.id}`}>
                <div className="pending-card-top">
                  <div>
                    <div className="pending-card-name">{p.nome}</div>
                    <div className="pending-card-email">{p.email}</div>
                  </div>
                  <span className={`badge badge-warning user-badge-${p.tipo}`}>
                    {p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : '-'}
                  </span>
                </div>

                <div className="pending-card-course">
                  <strong>Curso / Área:</strong> {p.curso || 'Não especificado'}
                </div>

                <div className="pending-card-actions">
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleAction(p.id, 'aprovado')}
                  >
                    <span>✓</span>
                    <span>Aprovar</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleAction(p.id, 'bloqueado')}
                  >
                    <span>✕</span>
                    <span>Rejeitar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
