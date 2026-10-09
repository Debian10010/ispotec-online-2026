import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export default function Header({
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileSidebar,
  onOpenContacts,
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load notifications
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.total_nao_lidas || 0);
    } catch (_) {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
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

  const handleNotificationClick = async (notif) => {
    try {
      await notificationService.markAsRead(notif.id || notif._id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n.id || n._id) === (notif.id || notif._id) ? { ...n, lida: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_) {}
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  // Determine current section title for breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/index.php') return 'Início';
    if (path.startsWith('/dashboard/feed')) return 'Feed Académico';
    if (path.startsWith('/dashboard/chat-global')) return 'Chat Geral ISPOTEC';
    if (path.startsWith('/dashboard/chat-group')) return 'Chat da Disciplina';
    if (path.startsWith('/dashboard/my-groups')) return 'Minhas Disciplinas';
    if (path.startsWith('/dashboard/groups-manage')) return 'Gestão de Disciplinas';
    if (path.startsWith('/dashboard/users-list')) return 'Gestão de Utilizadores';
    if (path.startsWith('/dashboard/users-pending')) return 'Utilizadores Pendentes';
    if (path.startsWith('/dashboard')) return 'Painel Principal';
    if (path.startsWith('/ensino')) return 'Ensino';
    if (path.startsWith('/extensao')) return 'Extensão';
    if (path.startsWith('/investigacao')) return 'Investigação';
    if (path.startsWith('/homeschool/sala')) return 'Home School › Sala Virtual';
    if (path.startsWith('/homeschool') || path.startsWith('/grupo-de-estudos')) return 'Home School';
    if (
      path.startsWith('/chatbot') ||
      path.startsWith('/assistente-academico') ||
      path.startsWith('/assistente-ispotec') ||
      path.startsWith('/consultor-inteligente')
    )
      return 'Assistente ISPOTEC';
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
      <style>{`
        .notif-wrapper {
          position: relative;
        }
        .notif-bell-btn {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .notif-bell-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }
        .notif-badge-pill {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 10px;
          border: 2px solid #0f172a;
          line-height: 1;
        }
        .notif-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 330px;
          max-width: 90vw;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          z-index: 1200;
          overflow: hidden;
          animation: scaleInNotif 0.18s ease-out;
        }
        @keyframes scaleInNotif {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .notif-header {
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notif-header span {
          font-weight: 700;
          font-size: 0.88rem;
          color: #0f172a;
        }
        .notif-mark-read-btn {
          background: none;
          border: none;
          color: #2563eb;
          font-size: 0.75rem;
          cursor: pointer;
          font-weight: 600;
        }
        .notif-mark-read-btn:hover {
          text-decoration: underline;
        }
        .notif-list-container {
          max-height: 340px;
          overflow-y: auto;
        }
        .notif-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          text-align: left;
        }
        .notif-item:hover {
          background: #f8fafc;
        }
        .notif-item.unread {
          background: #eff6ff;
        }
        .notif-item-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .notif-item-body {
          flex: 1;
        }
        .notif-item-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 0.2rem;
        }
        .notif-item-text {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .notif-empty-state {
          padding: 2rem 1rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
        }
      `}</style>

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

            {/* Notification Bell Dropdown */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className="notif-bell-btn"
                onClick={() => setNotifDropdownOpen((prev) => !prev)}
                title="Notificações e Menções de Chat"
                aria-label="Notificações"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge-pill">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="notif-dropdown-menu">
                  <div className="notif-header">
                    <span>🔔 Notificações {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="notif-mark-read-btn"
                        onClick={handleMarkAllRead}
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="notif-list-container">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📭</div>
                        Sem notificações de momento
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id || n._id}
                          className={`notif-item ${!n.lida ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-item-icon">
                            {n.tipo === 'mencao_chat' ? '💬' : '📢'}
                          </div>
                          <div className="notif-item-body">
                            <div className="notif-item-title">{n.titulo}</div>
                            <div className="notif-item-text">{n.mensagem}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <span className={`isp-role-badge isp-role-${roleType}`}>
              {roleLabel}
            </span>

            {/* User Dropdown */}
            <div className="header-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="header-user-btn"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
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

                  {isAdmin && (
                    <Link
                      to="/dashboard/users-list"
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                      role="menuitem"
                      style={{ color: '#1d4ed8', fontWeight: 600 }}
                    >
                      <span>👥</span>
                      <span>Gestão de Utilizadores</span>
                    </Link>
                  )}

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
