import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import ContactsModal from './ContactsModal';
import FloatingChatbot from './FloatingChatbot';

export default function Layout({ children }) {
  const location = useLocation();

  // Desktop sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ispotec_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Contacts modal state
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  // Automatically close mobile drawer upon navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, location.search]);

  // Persist sidebar collapsed state
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('ispotec_sidebar_collapsed', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  const handleOpenContacts = () => {
    setIsContactsModalOpen(true);
  };

  const handleCloseContacts = () => {
    setIsContactsModalOpen(false);
  };

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={handleCloseMobile}
        aria-hidden="true"
      />

      {/* Enterprise Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
        onOpenContacts={handleOpenContacts}
      />

      {/* Main Layout Area */}
      <div className="app-main-wrapper">
        {/* Top Header */}
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
          onOpenContacts={handleOpenContacts}
        />

        {/* Page Content */}
        <main className="app-page-content" id="main-content">
          {children}
        </main>

        {/* Institutional Footer */}
        <Footer />
      </div>

      {/* Official Contacts Modal */}
      <ContactsModal
        isOpen={isContactsModalOpen}
        onClose={handleCloseContacts}
      />

      {/* Floating Chatbot Assistant */}
      <FloatingChatbot />

      {/* Floating WhatsApp Action */}
      <a
        href="https://api.whatsapp.com/send/?phone=258878787442&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noreferrer"
        className="whatsapp-fixed"
        title="Falar no WhatsApp (878787442)"
        aria-label="Contactar via WhatsApp"
      >
        💬
      </a>
    </div>
  );
}
