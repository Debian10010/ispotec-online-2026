import React, { useEffect } from 'react';

export default function ContactsModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="contacts-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="contacts-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="contacts-modal-header">
          <h3 className="contacts-modal-title">
            <span>📞</span>
            <span>Contactos Oficiais ISPOTEC</span>
          </h3>
          <button
            type="button"
            className="contacts-modal-close"
            onClick={onClose}
            aria-label="Fechar contactos"
          >
            ✕
          </button>
        </div>

        <div className="contacts-modal-body">
          {/* Official Numbers Banner */}
          <div className="official-numbers-banner">
            <div className="official-numbers-title">Linhas Oficiais de Atendimento</div>
            <div className="official-numbers-display">
              878787442 | 877906666 | 873045610
            </div>
          </div>

          <div className="contact-tile-list">
            {/* WhatsApp & Chamadas 1 */}
            <a
              href="https://api.whatsapp.com/send/?phone=258878787442&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noreferrer"
              className="contact-tile"
            >
              <div className="contact-tile-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                💬
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">WhatsApp Institucional / Chamadas</div>
                <div className="contact-tile-value">878787442</div>
              </div>
              <div className="contact-tile-action">Conversar ↗</div>
            </a>

            {/* Linha 2 */}
            <a href="tel:+258877906666" className="contact-tile">
              <div className="contact-tile-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                📱
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">Secretaria / Atendimento Geral</div>
                <div className="contact-tile-value">877906666</div>
              </div>
              <div className="contact-tile-action">Ligar ↗</div>
            </a>

            {/* Linha 3 */}
            <a href="tel:+258873045610" className="contact-tile">
              <div className="contact-tile-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                📱
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">Apoio ao Estudante &amp; Inscrições</div>
                <div className="contact-tile-value">873045610</div>
              </div>
              <div className="contact-tile-action">Ligar ↗</div>
            </a>

            {/* Email */}
            <a href="mailto:ifoptec.politecnica@gmail.com" className="contact-tile">
              <div className="contact-tile-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                ✉️
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">Correio Eletrónico Institucional</div>
                <div className="contact-tile-value">ifoptec.politecnica@gmail.com</div>
              </div>
              <div className="contact-tile-action">Enviar Email ↗</div>
            </a>

            {/* Facebook */}
            <a
              href="https://web.facebook.com/ISPOTEC/"
              target="_blank"
              rel="noreferrer"
              className="contact-tile"
            >
              <div className="contact-tile-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                📘
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">Página Oficial no Facebook</div>
                <div className="contact-tile-value">@ISPOTEC</div>
              </div>
              <div className="contact-tile-action">Aceder ↗</div>
            </a>

            {/* Localização */}
            <div className="contact-tile" style={{ cursor: 'default' }}>
              <div className="contact-tile-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                📍
              </div>
              <div className="contact-tile-info">
                <div className="contact-tile-label">Campus &amp; Instalações</div>
                <div className="contact-tile-value" style={{ fontSize: '0.92rem' }}>
                  Rua da Mozal, 5453-Matola, Moçambique
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
