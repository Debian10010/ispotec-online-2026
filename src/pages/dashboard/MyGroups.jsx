import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';

const coresCards = [
  { border: 'var(--secondary-blue)', bg: 'rgba(0, 85, 164, 0.08)', icon: 'var(--secondary-blue)' },
  { border: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.08)', icon: 'var(--accent-green)' },
  { border: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.08)', icon: 'var(--accent-purple)' },
  { border: 'var(--accent-orange)', bg: 'rgba(245, 158, 11, 0.08)', icon: 'var(--accent-orange)' },
  { border: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.08)', icon: 'var(--accent-pink)' },
];

export default function MyGroups() {
  const { user } = useAuth();
  const [meusGrupos, setMeusGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const my = await groupService.getMyGroups(user.id);
    const all = await groupService.getAllGroups();
    setMeusGrupos(my);
    setTodosGrupos(all);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleEntrar = async (groupId) => {
    const success = await groupService.joinGroup(groupId, user.id);
    if (success) {
      setMensagem('Você entrou no grupo com sucesso!');
      setTipoMensagem('success');
      loadData();
    }
  };

  const handleSair = async (groupId) => {
    if (!window.confirm('Tem certeza que deseja sair deste grupo?')) return;
    const success = await groupService.leaveGroup(groupId, user.id);
    if (success) {
      setMensagem('Você saiu do grupo');
      setTipoMensagem('info');
      loadData();
    }
  };

  const gruposDisponiveis = todosGrupos.filter(
    g => !g.membros || !g.membros.includes(Number(user?.id))
  );

  return (
    <>
      <style>{`
        .groups-page {
            padding: 2rem 0 4rem;
        }
        
        .page-hero {
            background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
            color: var(--white);
            padding: 2.5rem 2rem;
            border-radius: var(--radius);
            margin-bottom: 2.5rem;
            position: relative;
            overflow: hidden;
        }
        
        .page-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
        }
        
        .page-hero::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: 10%;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 50%;
        }
        
        .page-hero h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            position: relative;
            z-index: 1;
        }
        
        .page-hero p {
            opacity: 0.9;
            font-size: 1.05rem;
            position: relative;
            z-index: 1;
        }
        
        .hero-icon {
            position: absolute;
            right: 2rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 5rem;
            opacity: 0.15;
        }
        
        .toast-message {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            border-radius: var(--radius-sm);
            margin-bottom: 2rem;
            animation: slideIn 0.3s ease;
        }
        
        .toast-message.success {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
            border: 1px solid var(--accent-green);
            color: #065f46;
        }
        
        .toast-message.info {
            background: linear-gradient(135deg, rgba(0, 85, 164, 0.1) 0%, rgba(0, 85, 164, 0.05) 100%);
            border: 1px solid var(--secondary-blue);
            color: var(--primary-blue);
        }
        
        .toast-icon {
            font-size: 1.25rem;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }
        
        .section-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .section-title h2 {
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--text-dark);
            margin: 0;
        }
        
        .section-title .icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }
        
        .section-title .icon.blue {
            background: rgba(0, 85, 164, 0.1);
            color: var(--secondary-blue);
        }
        
        .section-title .icon.green {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent-green);
        }
        
        .badge-count {
            background: var(--secondary-blue);
            color: var(--white);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .groups-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .group-card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
        }
        
        .group-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .card-accent {
            height: 4px;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .card-header-row {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .group-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .group-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.25rem;
            line-height: 1.3;
        }
        
        .group-info p {
            color: var(--text-muted);
            font-size: 0.9rem;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .card-stats {
            display: flex;
            gap: 1.5rem;
            padding: 1rem 0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            margin: 1rem 0;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stat-icon {
            font-size: 1rem;
            opacity: 0.7;
        }
        
        .stat-value {
            font-weight: 700;
            color: var(--text-dark);
        }
        
        .stat-label {
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        
        .card-actions {
            display: flex;
            gap: 0.75rem;
        }
        
        .card-actions .btn {
            flex: 1;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            background: var(--white);
            border-radius: var(--radius);
            border: 2px dashed var(--border-color);
            margin-bottom: 3rem;
        }
        
        .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.3;
        }
        
        .empty-state h3 {
            font-size: 1.25rem;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        
        .empty-state p {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }
        
        .back-section {
            display: flex;
            justify-content: center;
            padding-top: 1rem;
        }
        
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
            background: var(--white);
            border: 1px solid var(--border-color);
        }
        
        .back-link:hover {
            color: var(--secondary-blue);
            border-color: var(--secondary-blue);
            background: rgba(0, 85, 164, 0.05);
        }
        
        @media (max-width: 768px) {
            .groups-page {
                padding: 1.5rem 0 3rem;
            }
            
            .page-hero {
                padding: 1.75rem 1.5rem;
                margin-bottom: 2rem;
            }
            
            .page-hero h1 {
                font-size: 1.5rem;
            }
            
            .page-hero p {
                font-size: 0.95rem;
            }
            
            .hero-icon {
                display: none;
            }
            
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }
            
            .groups-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .card-body {
                padding: 1.25rem;
            }
            
            .card-actions {
                flex-direction: column;
            }
        }
      `}</style>

      <div className="container groups-page">
        {/* Page Hero */}
        <div className="page-hero">
          <h1>Disciplinas e Grupos</h1>
          <p>Participe em grupos de estudo e colabore com colegas e docentes</p>
          <span className="hero-icon">📚</span>
        </div>

        {/* Toast Message */}
        {mensagem && (
          <div className={`toast-message ${tipoMensagem}`}>
            <span className="toast-icon">{tipoMensagem === 'success' ? '✔' : 'ℹ'}</span>
            <span>{mensagem}</span>
          </div>
        )}

        {/* Meus Grupos Section */}
        <section>
          <div className="section-header">
            <div className="section-title">
              <div className="icon blue">👥</div>
              <h2>Meus Grupos</h2>
            </div>
            <span className="badge-count">
              {meusGrupos.length} grupo{meusGrupos.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>A carregar grupos...</div>
          ) : meusGrupos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Ainda não está em nenhum grupo</h3>
              <p>Explore os grupos disponíveis abaixo e junte-se a uma comunidade de aprendizagem</p>
              <a href="#grupos-disponiveis" className="btn btn-primary">Ver Grupos Disponíveis</a>
            </div>
          ) : (
            <div className="groups-grid">
              {meusGrupos.map((g, index) => {
                const cor = coresCards[index % coresCards.length];
                return (
                  <div className="group-card" key={g.id}>
                    <div className="card-accent" style={{ background: cor.border }} />
                    <div className="card-body">
                      <div className="card-header-row">
                        <div className="group-icon" style={{ background: cor.bg, color: cor.icon }}>
                          📚
                        </div>
                        <div className="group-info">
                          <h3>{g.nome}</h3>
                          <p>{g.descricao || 'Sem descrição disponível'}</p>
                        </div>
                      </div>

                      <div className="card-stats">
                        <div className="stat-item">
                          <span className="stat-icon">👤</span>
                          <span className="stat-value">{g.total_membros}</span>
                          <span className="stat-label">membros</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">💬</span>
                          <span className="stat-value">{g.total_posts}</span>
                          <span className="stat-label">posts</span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <Link to={`/dashboard/group-view?id=${g.id}`} className="btn btn-primary">
                          Ver Grupo
                        </Link>
                        <button 
                          type="button" 
                          className="btn btn-warning" 
                          onClick={() => handleSair(g.id)}
                        >
                          Sair
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Grupos Disponíveis Section */}
        <section id="grupos-disponiveis">
          <div className="section-header">
            <div className="section-title">
              <div className="icon green">🎯</div>
              <h2>Grupos Disponíveis</h2>
            </div>
          </div>

          {gruposDisponiveis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>Você já está em todos os grupos!</h3>
              <p>Parabéns! Continue participando ativamente nos seus grupos atuais</p>
            </div>
          ) : (
            <div className="groups-grid">
              {gruposDisponiveis.map((g, index) => {
                const cor = coresCards[(index + 2) % coresCards.length];
                return (
                  <div className="group-card" key={g.id}>
                    <div className="card-accent" style={{ background: cor.border }} />
                    <div className="card-body">
                      <div className="card-header-row">
                        <div className="group-icon" style={{ background: cor.bg, color: cor.icon }}>
                          📚
                        </div>
                        <div className="group-info">
                          <h3>{g.nome}</h3>
                          <p>{g.descricao || 'Sem descrição disponível'}</p>
                        </div>
                      </div>

                      <div className="card-stats">
                        <div className="stat-item">
                          <span className="stat-icon">👤</span>
                          <span className="stat-value">{g.total_membros}</span>
                          <span className="stat-label">membros</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">💬</span>
                          <span className="stat-value">{g.total_posts}</span>
                          <span className="stat-label">posts</span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button 
                          type="button" 
                          className="btn btn-success" 
                          style={{ width: '100%' }}
                          onClick={() => handleEntrar(g.id)}
                        >
                          ➕ Entrar no Grupo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Back Navigation */}
        <div className="back-section">
          <Link to="/dashboard" className="back-link">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
