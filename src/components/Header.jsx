import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileSidebar,
  onOpenContacts
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    setUserDropdownOpen(false);
    logout();
    navigate('/?logout=1');
  };

  // Determine current section title for breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/index.php') return 'Início';
    if (path.startsWith('/dashboard/feed')) return 'Feed Académico';
    if (path.startsWith('/dashboard/chat-global')) return 'Chat Geral ISPOTEC';
    if (path.startsWith('/dashboard/my-groups')) return 'Minhas Disciplinas';
    if (path.startsWith('/dashboard/groups-manage')) return 'Gestão de Disciplinas';
    if (path.startsWith('/dashboard/users-list')) return 'Gestão de Utilizadores';
    if (path.startsWith('/dashboard/users-pending')) return 'Utilizadores Pendentes';
    if (path.startsWith('/dashboard')) return 'Painel Principal';
    if (path.startsWith('/ensino')) return 'Ensino';
    if (path.startsWith('/extensao')) return 'Extensão';
    if (path.startsWith('/investigacao')) return 'Investigação';
    if (path.startsWith('/grupo-de-estudos') || path.startsWith('/homeschool')) return 'Grupo de Estudos';
    if (path.startsWith('/chatbot')) return 'Assistente Virtual IA';
    if (path.startsWith('/profile')) return 'O Meu Perfil';
    if (path.startsWith('/users')) return 'Directório de Utilizadores';
    if (path.startsWith('/auth/login')) return 'Iniciar Sessão';
    if (path.startsWith('/auth/register')) return 'Registar Conta';
    return 'Portal Académico';
  };

  const userInitial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';
  const roleType = user?.tipo || 'estudante';
  const roleLabel = roleType.charAt(0).toUpperCase() + roleType.slice(1);

  return (
    <header className="app-header">
      {/* Left side: Toggles & Breadcrumb */}
      <div className="header-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="header-toggle-btn header-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Abrir menu de navegação"
          title="Menu de navegação"
        >
          ☰
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          className="header-toggle-btn header-desktop-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {isSidebarCollapsed ? '▶' : '◀'}
        </button>

        {/* Institutional Breadcrumb */}
        <nav className="header-breadcrumb" aria-label="Caminho da página">
          <Link to="/">ISPOTEC</Link>
          <span>/</span>
          <span className="header-breadcrumb-active">{getBreadcrumb()}</span>
        </nav>
      </div>

      {/* Right side: Quick actions & User menu */}
      <div className="header-right">
        {/* Quick Official Contacts Button */}
        <button
          type="button"
          className="header-contact-btn"
          onClick={onOpenContacts}
          title="Contactos Oficiais ISPOTEC: 878787442 | 877906666 | 873045610"
        >
          <span>📞</span>
          <span>Contactos</span>
        </button>

        {isAuthenticated ? (
          <>
            {/* Quick Chat Link */}
            <Link
              to="/dashboard/chat-global"
              className="header-chat-btn"
              title="Aceder ao Chat Geral em tempo real"
            >
              <span>💬</span>
              <span>Chat Geral</span>
            </Link>

            {/* Role Badge */}
            <span className={`isp-role-badge isp-role-${roleType}`}>
              {roleLabel}
            </span>

            {/* User Dropdown */}
            <div className="header-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="header-user-btn"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                aria-expanded={userDropdownOpen}
                aria-label="Menu do utilizador"
              >
                <div className="header-avatar">{userInitial}</div>
                <span className="header-user-name">{user?.nome || 'Utilizador'}</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
              </button>

              {userDropdownOpen && (
                <div className="header-dropdown-panel" role="menu">
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-name">{user?.nome || 'Utilizador'}</div>
                    <div className="dropdown-user-email">{user?.email || ''}</div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                    role="menuitem"
                  >
                    <span>👤</span>
                    <span>O Meu Perfil</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                    role="menuitem"
                  >
                    <span>📊</span>
                    <span>Painel Dashboard</span>
                  </Link>

                  <Link
                    to="/dashboard/chat-global"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                    role="menuitem"
                  >
                    <span>💬</span>
                    <span>Chat Geral</span>
                  </Link>

                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span>🚪</span>
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              to="/auth/login"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
            >
              Entrar
            </Link>
            <Link
              to="/auth/register"
              className="btn btn-primary btn-sm"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
            >
              Registar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
