import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenContacts
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/?logout=1');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/index.php';
    return location.pathname.startsWith(path);
  };

  const userInitial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';
  const roleName = user?.tipo ? user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1) : 'Estudante';

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      aria-label="Navegação Principal"
    >
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <Link to="/" className="sidebar-brand-link" onClick={handleNavClick}>
          <img
            src="/assets/img/logo-ispotec.png"
            alt="ISPOTEC"
            className="sidebar-brand-logo"
          />
          <div className="sidebar-brand-info">
            <span className="sidebar-brand-title">ISPOTEC</span>
            <span className="sidebar-brand-sub">Portal Académico</span>
          </div>
        </Link>

        {/* Desktop Collapse Button */}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* Nav Scroll Area */}
      <div className="sidebar-nav-scroll">
        {/* ================= HOME ================= */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Home</div>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`sidebar-nav-item ${isActive('/dashboard') && !isActive('/dashboard/feed') && !isActive('/dashboard/chat-global') && !isActive('/dashboard/users-list') && !isActive('/dashboard/users-pending') && !isActive('/dashboard/groups-manage') && !isActive('/dashboard/my-groups') ? 'active' : ''}`}
                onClick={handleNavClick}
                data-tooltip="Dashboard"
              >
                <span className="sidebar-item-icon">📊</span>
                <span className="sidebar-item-label">Dashboard</span>
              </Link>

              <Link
                to="/dashboard/feed"
                className={`sidebar-nav-item ${isActive('/dashboard/feed') ? 'active' : ''}`}
                onClick={handleNavClick}
                data-tooltip="Feed Académico"
              >
                <span className="sidebar-item-icon">📰</span>
                <span className="sidebar-item-label">Feed Académico</span>
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className={`sidebar-nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Início"
            >
              <span className="sidebar-item-icon">🏛️</span>
              <span className="sidebar-item-label">Início</span>
            </Link>
          )}
        </div>

        {/* ================= ACADEMIC (4 MAIN MODULES) - APENAS UTILIZADORES AUTENTICADOS ================= */}
        {isAuthenticated && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">Académico</div>

            <Link
              to="/ensino"
              className={`sidebar-nav-item ${isActive('/ensino') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Ensino"
            >
              <span className="sidebar-item-icon">🎓</span>
              <span className="sidebar-item-label">Ensino</span>
            </Link>

            <Link
              to="/extensao"
              className={`sidebar-nav-item ${isActive('/extensao') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Extensão"
            >
              <span className="sidebar-item-icon">🤝</span>
              <span className="sidebar-item-label">Extensão</span>
            </Link>

            <Link
              to="/investigacao"
              className={`sidebar-nav-item ${isActive('/investigacao') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Investigação"
            >
              <span className="sidebar-item-icon">🔬</span>
              <span className="sidebar-item-label">Investigação</span>
            </Link>

            <Link
              to="/grupo-de-estudos"
              className={`sidebar-nav-item ${isActive('/grupo-de-estudos') || isActive('/homeschool') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Grupo de Estudos"
            >
              <span className="sidebar-item-icon">👥</span>
              <span className="sidebar-item-label">Grupo de Estudos</span>
            </Link>
          </div>
        )}

        {/* ================= COMMUNICATION ================= */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Comunicação</div>

          {isAuthenticated && (
            <Link
              to="/dashboard/chat-global"
              className={`sidebar-nav-item ${isActive('/dashboard/chat-global') || isActive('/chat-geral') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="Chat Geral"
            >
              <span className="sidebar-item-icon">💬</span>
              <span className="sidebar-item-label">Chat Geral</span>
              <span className="sidebar-item-badge">Directo</span>
            </Link>
          )}

          <Link
            to="/chatbot"
            className={`sidebar-nav-item ${isActive('/chatbot') && !isActive('/chatbot/ias-estudo') ? 'active' : ''}`}
            onClick={handleNavClick}
            data-tooltip="Chatbot Académico"
          >
            <span className="sidebar-item-icon">🤖</span>
            <span className="sidebar-item-label">Chatbot Académico</span>
          </Link>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              if (onOpenContacts) onOpenContacts();
            }}
            data-tooltip="Contactos Oficiais"
          >
            <span className="sidebar-item-icon">📞</span>
            <span className="sidebar-item-label">Contactos</span>
          </button>
        </div>

        {/* ================= ADMINISTRATION / MANAGEMENT ================= */}
        {isAuthenticated && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              {isAdmin ? 'Administração' : 'Comunidade & Gestão'}
            </div>

            {isAdmin ? (
              <>
                <Link
                  to="/dashboard/users-list"
                  className={`sidebar-nav-item ${isActive('/dashboard/users-list') ? 'active' : ''}`}
                  onClick={handleNavClick}
                  data-tooltip="Todos os Utilizadores"
                >
                  <span className="sidebar-item-icon">👥</span>
                  <span className="sidebar-item-label">Utilizadores</span>
                </Link>

                <Link
                  to="/dashboard/users-pending"
                  className={`sidebar-nav-item ${isActive('/dashboard/users-pending') ? 'active' : ''}`}
                  onClick={handleNavClick}
                  data-tooltip="Utilizadores Pendentes"
                >
                  <span className="sidebar-item-icon">⏳</span>
                  <span className="sidebar-item-label">Pendentes</span>
                </Link>

                <Link
                  to="/dashboard/groups-manage"
                  className={`sidebar-nav-item ${isActive('/dashboard/groups-manage') ? 'active' : ''}`}
                  onClick={handleNavClick}
                  data-tooltip="Gestão de Grupos"
                >
                  <span className="sidebar-item-icon">📚</span>
                  <span className="sidebar-item-label">Disciplinas &amp; Grupos</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/users"
                  className={`sidebar-nav-item ${isActive('/users') ? 'active' : ''}`}
                  onClick={handleNavClick}
                  data-tooltip="Directório Académico"
                >
                  <span className="sidebar-item-icon">🔍</span>
                  <span className="sidebar-item-label">Directório Colegas</span>
                </Link>

                <Link
                  to="/dashboard/my-groups"
                  className={`sidebar-nav-item ${isActive('/dashboard/my-groups') ? 'active' : ''}`}
                  onClick={handleNavClick}
                  data-tooltip="As Minhas Disciplinas"
                >
                  <span className="sidebar-item-icon">📚</span>
                  <span className="sidebar-item-label">Minhas Disciplinas</span>
                </Link>
              </>
            )}

            <Link
              to="/profile"
              className={`sidebar-nav-item ${isActive('/profile') ? 'active' : ''}`}
              onClick={handleNavClick}
              data-tooltip="O Meu Perfil"
            >
              <span className="sidebar-item-icon">👤</span>
              <span className="sidebar-item-label">O Meu Perfil</span>
            </Link>
          </div>
        )}

        {/* ================= SYSTEM / SESSION ================= */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Sistema</div>

          {isAuthenticated ? (
            <button
              type="button"
              className="sidebar-nav-item"
              onClick={handleLogout}
              style={{ color: '#f87171' }}
              data-tooltip="Terminar Sessão"
            >
              <span className="sidebar-item-icon">🚪</span>
              <span className="sidebar-item-label">Terminar Sessão</span>
            </button>
          ) : (
            <>
              <Link
                to="/auth/login"
                className={`sidebar-nav-item ${isActive('/auth/login') ? 'active' : ''}`}
                onClick={handleNavClick}
                data-tooltip="Iniciar Sessão"
              >
                <span className="sidebar-item-icon">🔑</span>
                <span className="sidebar-item-label">Iniciar Sessão</span>
              </Link>
              <Link
                to="/auth/register"
                className={`sidebar-nav-item ${isActive('/auth/register') ? 'active' : ''}`}
                onClick={handleNavClick}
                data-tooltip="Criar Conta"
              >
                <span className="sidebar-item-icon">📝</span>
                <span className="sidebar-item-label">Criar Conta</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* User Footer Card */}
      {isAuthenticated && (
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user-card" onClick={handleNavClick}>
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nome || 'Utilizador'}</div>
              <div className="sidebar-user-role">{roleName}</div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
