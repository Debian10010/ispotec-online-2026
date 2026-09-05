import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import { postService } from '../../services/postService';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    usersAprovados: 0,
    usersPendentes: 0,
    totalGrupos: 0,
    totalPosts: 0
  });

  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');

  useEffect(() => {
    async function loadStats() {
      if (isAdmin) {
        const userCounts = await userService.getCounts();
        const groups = await groupService.getAllGroups();
        const totalPosts = await postService.getTotalPostsCount();
        setStats({
          usersAprovados: userCounts.aprovados,
          usersPendentes: userCounts.pendentes,
          totalGrupos: groups.length,
          totalPosts: totalPosts
        });
      }
    }
    loadStats();
  }, [isAdmin]);

  return (
    <>
      <style>{`
        .welcome-section {
            text-align: center;
            padding: 2rem 1rem;
            margin-bottom: 1.5rem;
        }

        .welcome-logo {
            max-height: 80px;
            margin-bottom: 1rem;
        }

        .welcome-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
            color: var(--text-muted);
            font-size: 1rem;
        }

        .user-badge {
            display: inline-block;
            padding: 0.35rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .user-badge-estudante {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
        }

        .user-badge-docente {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
        }

        .user-badge-especialista, .user-badge-admin {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #92400e;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1.25rem;
            padding-left: 0.5rem;
            border-left: 4px solid var(--secondary-blue);
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
            margin-bottom: 2.5rem;
        }

        .stat-card {
            background: var(--white);
            border-radius: var(--radius);
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: var(--shadow);
            border-left: 4px solid;
            transition: all 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .stat-blue { border-left-color: var(--secondary-blue); }
        .stat-orange { border-left-color: var(--accent-orange); }
        .stat-green { border-left-color: var(--accent-green); }
        .stat-purple { border-left-color: var(--accent-purple); }

        .stat-icon {
            font-size: 2rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--light-gray);
            border-radius: var(--radius-sm);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1;
        }

        .stat-label {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }

        /* Action Grid */
        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .action-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: var(--white);
            border-radius: var(--radius);
            text-decoration: none;
            color: var(--text-dark);
            box-shadow: var(--shadow);
            transition: all 0.2s;
            border: 2px solid transparent;
        }

        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .action-blue:hover { border-color: var(--secondary-blue); }
        .action-green:hover { border-color: var(--accent-green); }
        .action-orange:hover { border-color: var(--accent-orange); }
        .action-purple:hover { border-color: var(--accent-purple); }
        .action-pink:hover { border-color: var(--accent-pink); }
        .action-cyan:hover { border-color: #06b6d4; }
        .action-indigo:hover { border-color: #6366f1; }

        .action-icon {
            font-size: 1.75rem;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            flex-shrink: 0;
        }

        .action-blue .action-icon { background: #dbeafe; }
        .action-green .action-icon { background: #d1fae5; }
        .action-orange .action-icon { background: #fef3c7; }
        .action-purple .action-icon { background: #ede9fe; }
        .action-pink .action-icon { background: #fce7f3; }
        .action-cyan .action-icon { background: #cffafe; }
        .action-indigo .action-icon { background: #e0e7ff; }

        .action-content {
            flex: 1;
            min-width: 0;
        }

        .action-title {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .action-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .action-arrow {
            font-size: 1.25rem;
            color: var(--text-muted);
            transition: transform 0.2s;
        }

        .action-card:hover .action-arrow {
            transform: translateX(4px);
        }

        @media (max-width: 768px) {
            .welcome-section {
                padding: 1.5rem 0.5rem;
            }

            .welcome-logo {
                max-height: 60px;
            }

            .welcome-title {
                font-size: 1.4rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .stat-card {
                padding: 1rem;
            }

            .stat-icon {
                font-size: 1.5rem;
                width: 40px;
                height: 40px;
            }

            .stat-number {
                font-size: 1.5rem;
            }

            .action-grid {
                grid-template-columns: 1fr;
            }

            .action-card {
                padding: 1rem;
            }

            .section-title {
                font-size: 1.1rem;
            }
        }

        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <div className="container">
        {/* Logo e Boas-vindas */}
        <div className="welcome-section">
          <img src="/assets/img/logo-ispotec.png" alt="ISPOTEC Online" className="welcome-logo" />
          <h1 className="welcome-title">Olá, {user?.nome || 'Utilizador'}!</h1>
          <p className="welcome-subtitle">
            <span className={`user-badge user-badge-${user?.tipo || 'estudante'}`}>
              {user?.tipo ? user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1) : 'Estudante'}
            </span>
          </p>
        </div>

        {isAdmin ? (
          /* Painel Admin */
          <>
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.usersAprovados}</div>
                  <div className="stat-label">Utilizadores Aprovados</div>
                </div>
              </div>

              <div className="stat-card stat-orange">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.usersPendentes}</div>
                  <div className="stat-label">Pendentes de Aprovação</div>
                </div>
              </div>

              <div className="stat-card stat-green">
                <div className="stat-icon">📚</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalGrupos}</div>
                  <div className="stat-label">Grupos/Disciplinas</div>
                </div>
              </div>

              <div className="stat-card stat-purple">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalPosts}</div>
                  <div className="stat-label">Publicações</div>
                </div>
              </div>
            </div>

            <h2 className="section-title">Gestão do Sistema</h2>
            <div className="action-grid">
              <Link to="/dashboard/users-pending" className="action-card action-orange">
                <div className="action-icon">⏳</div>
                <div className="action-content">
                  <div className="action-title">Utilizadores Pendentes</div>
                  <div className="action-desc">Aprovar ou rejeitar novos registos</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/dashboard/users-list" className="action-card action-blue">
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <div className="action-title">Todos os Utilizadores</div>
                  <div className="action-desc">Ver e gerir utilizadores</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/dashboard/groups-manage" className="action-card action-green">
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <div className="action-title">Disciplinas/Grupos</div>
                  <div className="action-desc">Criar e gerir grupos</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/chatbot" className="action-card action-purple">
                <div className="action-icon">🤖</div>
                <div className="action-content">
                  <div className="action-title">Chatbot Académico</div>
                  <div className="action-desc">Testar o assistente virtual</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            </div>
          </>
        ) : (
          /* Painel do Utilizador Normal */
          <>
            <h2 className="section-title">Acesso Rápido</h2>
            <div className="action-grid">
              <Link to="/dashboard/my-groups" className="action-card action-blue">
                <div className="action-icon">📚</div>
                <div className="action-content">
                  <div className="action-title">Meus Grupos</div>
                  <div className="action-desc">Ver disciplinas e grupos</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/users" className="action-card action-purple">
                <div className="action-icon">🔍</div>
                <div className="action-content">
                  <div className="action-title">Encontrar Utilizadores</div>
                  <div className="action-desc">Pesquisar colegas e docentes</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/profile" className="action-card action-cyan">
                <div className="action-icon">👤</div>
                <div className="action-content">
                  <div className="action-title">Meu Perfil</div>
                  <div className="action-desc">Ver e editar perfil</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/dashboard/feed" className="action-card action-green">
                <div className="action-icon">📰</div>
                <div className="action-content">
                  <div className="action-title">Feed Geral</div>
                  <div className="action-desc">Ver publicações recentes</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/dashboard/chat-global" className="action-card action-pink">
                <div className="action-icon">💬</div>
                <div className="action-content">
                  <div className="action-title">Forum Global</div>
                  <div className="action-desc">Conversar com todos</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>

              <Link to="/chatbot" className="action-card action-indigo">
                <div className="action-icon">🤖</div>
                <div className="action-content">
                  <div className="action-title">Chatbot Académico</div>
                  <div className="action-desc">Tirar dúvidas com IA</div>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
