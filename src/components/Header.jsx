import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const contactsRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setContactsOpen(false);
  };

  // Close contacts dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (contactsRef.current && !contactsRef.current.contains(event.target)) {
        setContactsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close with Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    closeMenu();
    logout();
    navigate('/?logout=1');
  };

  return (
    <>
      <div 
        className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      />

      <header>
        <div className="container">
          <nav>
            <Link to="/" className="logo" onClick={closeMenu}>
              <img src="/assets/img/logo-ispotec.png" alt="ISPOTEC Online" />
              <div className="logo-text">
                <strong>ISPOTEC</strong>
                <small>Instituto Superior Politécnico e de Tecnologias</small>
              </div>
            </Link>

            <button 
              className="menu-toggle" 
              onClick={toggleMenu} 
              aria-label="Menu"
            >
              <div className="hamburger">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="navMenu">
              <li><Link to="/" onClick={closeMenu}>Início</Link></li>
              {isAuthenticated ? (
                <>
                  <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                  <li><Link to="/users" onClick={closeMenu}>Utilizadores</Link></li>

                  {/* Dropdown de Contactos */}
                  <li className={`contacts-dropdown ${contactsOpen ? 'active' : ''}`} ref={contactsRef}>
                    <button 
                      className="contacts-toggle"
                      onClick={() => setContactsOpen(prev => !prev)}
                      type="button"
                    >
                      <span className="contacts-icon">📞</span>
                      <span>Contactos</span>
                    </button>
                    <div className="contacts-dropdown-content">
                      <div className="contacts-header">
                        <h3>📞 Contactos ISPOTEC</h3>
                      </div>
                      <div className="contacts-body">
                        {/* Telefones */}
                        <div className="contact-group">
                          <div className="group-title">
                            <span>📞</span>
                            <span>Telefones</span>
                          </div>
                          <div className="contact-items">
                            <a 
                              href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
                              target="_blank" 
                              rel="noreferrer"
                              className="contact-item contact-item-link"
                              onClick={closeMenu}
                            >
                              <div className="contact-icon" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }}>💬</div>
                              <div className="contact-details">
                                <div className="contact-title">WhatsApp</div>
                                <div className="contact-info">+258 87 072 6974</div>
                              </div>
                              <div className="external-icon">↗</div>
                            </a>
                            <a 
                              href="tel:+258840726974" 
                              className="contact-item contact-item-link"
                              onClick={closeMenu}
                            >
                              <div className="contact-icon" style={{ background: 'rgba(0, 123, 255, 0.1)', color: '#007bff' }}>📱</div>
                              <div className="contact-details">
                                <div className="contact-title">Telefone</div>
                                <div className="contact-info">+258 84 072 6974</div>
                              </div>
                              <div className="external-icon">↗</div>
                            </a>
                          </div>
                        </div>

                        {/* Redes Sociais */}
                        <div className="contact-group">
                          <div className="group-title">
                            <span>🌐</span>
                            <span>Redes Sociais</span>
                          </div>
                          <div className="contact-items">
                            <a 
                              href="https://web.facebook.com/ISPOTEC/" 
                              target="_blank" 
                              rel="noreferrer"
                              className="contact-item contact-item-link"
                              onClick={closeMenu}
                            >
                              <div className="contact-icon" style={{ background: 'rgba(24, 119, 242, 0.1)', color: '#1877F2' }}>📘</div>
                              <div className="contact-details">
                                <div className="contact-title">Facebook</div>
                                <div className="contact-info">@ISPOTEC</div>
                              </div>
                              <div className="external-icon">↗</div>
                            </a>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="contact-group">
                          <div className="group-title">
                            <span>✉️</span>
                            <span>Email</span>
                          </div>
                          <div className="contact-items">
                            <a 
                              href="mailto:ifoptec.politecnica@gmail.com" 
                              className="contact-item contact-item-link"
                              onClick={closeMenu}
                            >
                              <div className="contact-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>📧</div>
                              <div className="contact-details">
                                <div className="contact-title">Email Institucional</div>
                                <div className="contact-info">ifoptec.politecnica@gmail.com</div>
                              </div>
                              <div className="external-icon">↗</div>
                            </a>
                          </div>
                        </div>

                        {/* Localização */}
                        <div className="contact-group">
                          <div className="group-title">
                            <span>📍</span>
                            <span>Localização</span>
                          </div>
                          <div className="contact-items">
                            <div className="contact-item">
                              <div className="contact-icon" style={{ background: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' }}>🏢</div>
                              <div className="contact-details">
                                <div className="contact-title">ISPOTEC</div>
                                <div className="contact-info">Rua da Mozal, 5453-Matola</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li><Link to="/profile" onClick={closeMenu}>Perfil</Link></li>
                  <li className="nav-user">{user?.nome || 'Utilizador'}</li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="nav-btn-link nav-logout"
                      type="button"
                    >
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/auth/login" 
                      className="btn btn-secondary" 
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      onClick={closeMenu}
                    >
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/auth/register" 
                      className="btn btn-success"
                      onClick={closeMenu}
                    >
                      Registar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {isAuthenticated && (
        <a 
          href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
          target="_blank" 
          rel="noreferrer"
          className="whatsapp-fixed" 
          title="Contactar via WhatsApp"
        >
          💬
        </a>
      )}
    </>
  );
}
