import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';
import { postService } from '../../services/postService';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    usersAprovados: 0,
    usersPendentes: 0,
    totalGrupos: 0,
    totalPosts: 0
  });
  const [myGroupsCount, setMyGroupsCount] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [totalPosts, groups, recentFeed] = await Promise.all([
          postService.getTotalPostsCount(),
          groupService.getAllGroups(),
          postService.getGlobalFeed(4, 0)
        ]);

        let userCounts = { aprovados: 0, pendentes: 0 };
        if (isAdmin) {
          userCounts = await userService.getCounts();
        }

        let myGroups = [];
        try {
          myGroups = await groupService.getMyGroups();
        } catch {
          myGroups = [];
        }

        setStats({
          usersAprovados: userCounts.aprovados || 0,
          usersPendentes: userCounts.pendentes || 0,
          totalGrupos: groups.length || 0,
          totalPosts: totalPosts || 0
        });
        setMyGroupsCount(myGroups.length || 0);
        setRecentPosts(recentFeed || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAdmin]);

  const roleType = user?.tipo || 'estudante';
  const roleLabel = roleType.charAt(0).toUpperCase() + roleType.slice(1);
  const todayFormatted = new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="dashboard-container">
      {/* ========================================================
          1. PAGE TITLE & INSTITUTIONAL HEADER BANNER
          ======================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, var(--isp-navy-950) 0%, var(--isp-navy-800) 100%)',
        color: 'var(--isp-white)',
        borderRadius: 'var(--isp-radius-lg)',
        padding: '2rem 2.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--isp-shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--isp-slate-400)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Portal Académico ISPOTEC
            </span>
            <span style={{ color: 'var(--isp-slate-600)' }}>•</span>
            <span className={`isp-role-badge isp-role-${roleType}`}>
              {roleLabel}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            margin: '0 0 0.35rem 0',
            color: 'var(--isp-white)'
          }}>
            Olá, {user?.nome || 'Utilizador'}!
          </h1>
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            color: 'var(--isp-slate-300)',
            maxWidth: '650px',
            lineHeight: '1.5'
          }}>
            Acesso integrado aos 4 módulos académicos (Ensino, Extensão, Investigação e Grupo de Estudos),
            ferramentas de comunicação e serviços institucionais.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--isp-slate-400)',
            textTransform: 'capitalize'
          }}>
            📅 {todayFormatted}
          </div>
          <Link
            to="/dashboard/chat-global"
            className="btn btn-primary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.88rem',
              borderRadius: 'var(--isp-radius-md)'
            }}
          >
            💬 Abrir Chat Geral
          </Link>
        </div>
      </div>

      {/* ========================================================
          PENDING ACTIONS (WHERE APPLICABLE - ADMIN ONLY)
          ======================================================== */}
      {isAdmin && stats.usersPendentes > 0 && (
        <div style={{
          background: 'var(--isp-amber-50)',
          border: '1px solid var(--isp-amber-100)',
          borderRadius: 'var(--isp-radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <strong style={{ color: 'var(--isp-amber-600)', display: 'block', fontSize: '0.95rem' }}>
                Utilizadores Aguardando Validação
              </strong>
              <span style={{ color: 'var(--isp-slate-700)', fontSize: '0.88rem' }}>
                Existem <strong>{stats.usersPendentes}</strong> registos pendentes de aprovação no sistema.
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/users-pending"
            className="btn btn-warning"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            Rever Pendentes →
          </Link>
        </div>
      )}

      {/* ========================================================
          2. KPI CARDS (USING ONLY EXISTING REAL DATA)
          ======================================================== */}
      <div className="kpi-grid">
        {isAdmin ? (
          <>
            <div className="kpi-card kpi-card-blue">
              <div className="kpi-icon-box">👥</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : stats.usersAprovados}</div>
                <div className="kpi-label">Utilizadores Aprovados</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-orange">
              <div className="kpi-icon-box">⏳</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : stats.usersPendentes}</div>
                <div className="kpi-label">Pendentes de Validação</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-green">
              <div className="kpi-icon-box">📚</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : stats.totalGrupos}</div>
                <div className="kpi-label">Grupos &amp; Disciplinas</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-purple">
              <div className="kpi-icon-box">📝</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : stats.totalPosts}</div>
                <div className="kpi-label">Publicações Académicas</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="kpi-card kpi-card-blue">
              <div className="kpi-icon-box">🎓</div>
              <div className="kpi-data">
                <div className="kpi-value">4</div>
                <div className="kpi-label">Módulos Centrais</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-green">
              <div className="kpi-icon-box">📚</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : myGroupsCount}</div>
                <div className="kpi-label">Minhas Disciplinas</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-purple">
              <div className="kpi-icon-box">📝</div>
              <div className="kpi-data">
                <div className="kpi-value">{loading ? '...' : stats.totalPosts}</div>
                <div className="kpi-label">Publicações na Comunidade</div>
              </div>
            </div>

            <div className="kpi-card kpi-card-orange">
              <div className="kpi-icon-box">🤖</div>
              <div className="kpi-data">
                <div className="kpi-value">IA</div>
                <div className="kpi-label">Assistente Académico 24/7</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================
          3. 4 MAIN ACADEMIC MODULES
          ======================================================== */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.28rem',
              fontWeight: '700',
              color: 'var(--isp-slate-900)',
              margin: '0 0 0.25rem 0'
            }}>
              Módulos Académicos
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--isp-slate-500)' }}>
              Pilares formativos e científicos do Instituto Superior Politécnico e de Tecnologias
            </p>
          </div>
        </div>

        <div className="enterprise-module-grid">
          {/* Ensino */}
          <Link to="/ensino" className="enterprise-module-card">
            <div className="module-card-top">
              <div className="module-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                🎓
              </div>
              <span className="module-card-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                8 Secções
              </span>
            </div>
            <h3 className="module-card-title">Ensino</h3>
            <p className="module-card-desc">
              Projetos Educativos, Projetos Curriculares, Bibliotecas Digitais, Laboratórios, Estatística Académica e Pedagógica, Calendário e Eventos Científicos.
            </p>
            <div className="module-card-footer">
              <span>Aceder ao Módulo</span>
              <span>→</span>
            </div>
          </Link>

          {/* Extensão */}
          <Link to="/extensao" className="enterprise-module-card">
            <div className="module-card-top">
              <div className="module-card-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                🤝
              </div>
              <span className="module-card-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                6 Centros de Práticas
              </span>
            </div>
            <h3 className="module-card-title">Extensão</h3>
            <p className="module-card-desc">
              Centros de Práticas Médicas, Empresariais, Resolução de Conflitos, Tecnológicas, Psicológicas e de Saúde Pública com os respetivos Projetos e Parceiros.
            </p>
            <div className="module-card-footer">
              <span>Aceder ao Módulo</span>
              <span>→</span>
            </div>
          </Link>

          {/* Investigação */}
          <Link to="/investigacao" className="enterprise-module-card">
            <div className="module-card-top">
              <div className="module-card-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                🔬
              </div>
              <span className="module-card-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                6 Laboratórios
              </span>
            </div>
            <h3 className="module-card-title">Investigação</h3>
            <p className="module-card-desc">
              Laboratórios de Farmacologia, Exames Médicos, Microbiologia e Anatomia Patológica, Saúde Digital, Tecnologia e Inteligência Artificial e Medicina Dentária.
            </p>
            <div className="module-card-footer">
              <span>Aceder ao Módulo</span>
              <span>→</span>
            </div>
          </Link>

          {/* Grupo de Estudos */}
          <Link to="/grupo-de-estudos" className="enterprise-module-card">
            <div className="module-card-top">
              <div className="module-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                👥
              </div>
              <span className="module-card-badge" style={{ background: '#fffbeb', color: '#d97706' }}>
                Comunidade
              </span>
            </div>
            <h3 className="module-card-title">Grupo de Estudos</h3>
            <p className="module-card-desc">
              Ambiente de estudo colaborativo, partilha de apontamentos, discussões académicas e entreajuda contínua entre estudantes e docentes.
            </p>
            <div className="module-card-footer">
              <span>Aceder ao Módulo</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================
          4. RECENT ACTIVITIES / REAL CONTENT & QUICK SHORTCUTS
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Atividades Recentes */}
        <div style={{
          background: 'var(--isp-white)',
          border: '1px solid var(--isp-slate-200)',
          borderRadius: 'var(--isp-radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--isp-shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--isp-slate-100)'
          }}>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: 'var(--isp-slate-900)',
              margin: 0
            }}>
              📰 Publicações Recentes
            </h3>
            <Link
              to="/dashboard/feed"
              style={{
                fontSize: '0.84rem',
                fontWeight: '600',
                color: 'var(--isp-blue-600)',
                textDecoration: 'none'
              }}
            >
              Ver Todas →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--isp-slate-400)' }}>
              A carregar publicações...
            </div>
          ) : recentPosts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--isp-slate-400)' }}>
              Ainda não existem publicações disponíveis.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: '0.85rem',
                    background: 'var(--isp-slate-50)',
                    borderRadius: 'var(--isp-radius-md)',
                    border: '1px solid var(--isp-slate-200)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem'
                  }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--isp-slate-900)' }}>
                      {post.titulo}
                    </strong>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#e0e7ff',
                      color: '#4338ca'
                    }}>
                      {post.tipo || 'Post'}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.84rem',
                    color: 'var(--isp-slate-600)',
                    margin: '0 0 0.4rem 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {post.conteudo}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--isp-slate-400)' }}>
                    Por {post.nome || 'Autor'} {post.data_criacao && `• ${new Date(post.data_criacao).toLocaleDateString('pt-PT')}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ferramentas e Comunicação Rápida */}
        <div style={{
          background: 'var(--isp-white)',
          border: '1px solid var(--isp-slate-200)',
          borderRadius: 'var(--isp-radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--isp-shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--isp-slate-100)'
          }}>
            <h3 style={{
              fontSize: '1.05rem',
              fontWeight: '700',
              color: 'var(--isp-slate-900)',
              margin: 0
            }}>
              ⚡ Atalhos &amp; Comunicação
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/dashboard/chat-global"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem',
                background: 'var(--isp-blue-50)',
                border: '1px solid var(--isp-blue-100)',
                borderRadius: 'var(--isp-radius-md)',
                textDecoration: 'none',
                color: 'var(--isp-slate-900)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--isp-blue-700)' }}>
                  Chat Geral ISPOTEC
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--isp-slate-600)' }}>
                  Canal de comunicação instantânea para toda a comunidade académica
                </div>
              </div>
              <span style={{ color: 'var(--isp-blue-600)', fontWeight: 'bold' }}>→</span>
            </Link>

            <Link
              to="/chatbot"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem',
                background: 'var(--isp-purple-50)',
                border: '1px solid var(--isp-purple-100)',
                borderRadius: 'var(--isp-radius-md)',
                textDecoration: 'none',
                color: 'var(--isp-slate-900)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--isp-purple-600)' }}>
                  Chatbot Académico
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--isp-slate-600)' }}>
                  Consulte dúvidas de investigação, normas APA e planos de estudo
                </div>
              </div>
              <span style={{ color: 'var(--isp-purple-600)', fontWeight: 'bold' }}>→</span>
            </Link>

            <Link
              to="/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem',
                background: 'var(--isp-slate-50)',
                border: '1px solid var(--isp-slate-200)',
                borderRadius: 'var(--isp-radius-md)',
                textDecoration: 'none',
                color: 'var(--isp-slate-900)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🔍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--isp-slate-800)' }}>
                  Directório de Colegas &amp; Docentes
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--isp-slate-600)' }}>
                  Pesquise contactos institucionais e colegas de curso
                </div>
              </div>
              <span style={{ color: 'var(--isp-slate-400)', fontWeight: 'bold' }}>→</span>
            </Link>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem',
                background: 'var(--isp-slate-50)',
                border: '1px solid var(--isp-slate-200)',
                borderRadius: 'var(--isp-radius-md)',
                textDecoration: 'none',
                color: 'var(--isp-slate-900)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--isp-slate-800)' }}>
                  O Meu Perfil &amp; Portfólio
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--isp-slate-600)' }}>
                  Edite dados pessoais, competências e certificados
                </div>
              </div>
              <span style={{ color: 'var(--isp-slate-400)', fontWeight: 'bold' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
