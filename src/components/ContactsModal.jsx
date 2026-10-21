import React, { useEffect, useState } from 'react';
import { useInstitution } from '../context/InstitutionContext';

export default function ContactsModal({ isOpen, onClose }) {
  const { isIfoptec, institution } = useInstitution();
  const [activeTab, setActiveTab] = useState(isIfoptec ? 'ifoptec' : 'ispotec');

  useEffect(() => {
    setActiveTab(isIfoptec ? 'ifoptec' : 'ispotec');
  }, [isIfoptec]);

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
            <span>Contactos Oficiais Multi-Institucionais</span>
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
          {/* Institution selector tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('ispotec')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: activeTab === 'ispotec' ? '#0055a4' : '#f8fafc',
                color: activeTab === 'ispotec' ? 'white' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🏛️ ISPOTEC (Superior)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ifoptec')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: activeTab === 'ifoptec' ? '#02529c' : '#f8fafc',
                color: activeTab === 'ifoptec' ? 'white' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🏥 IFOPTEC (Médio)
            </button>
          </div>

          {activeTab === 'ifoptec' ? (
            <>
              {/* IFOPTEC Numbers */}
              <div className="official-numbers-banner" style={{ background: 'linear-gradient(135deg, #02529c, #002f5e)' }}>
                <div className="official-numbers-title">Linhas Oficiais IFOPTEC</div>
                <div className="official-numbers-display">
                  840726974 | 870726974 | 869700700
                </div>
              </div>

              <div className="contact-tile-list">
                <a
                  href="https://api.whatsapp.com/send/?phone=258840726974&text=Ola%20IFOPTEC,%20gostaria%20de%20informacoes"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-tile"
                >
                  <div className="contact-tile-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    💬
                  </div>
                  <div className="contact-tile-info">
                    <div className="contact-tile-label">WhatsApp IFOPTEC / Matrículas</div>
                    <div className="contact-tile-value">840726974</div>
                  </div>
                  <div className="contact-tile-action">Conversar ↗</div>
                </a>

                <a href="tel:+258870726974" className="contact-tile">
                  <div className="contact-tile-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
                    📱
                  </div>
                  <div className="contact-tile-info">
                    <div className="contact-tile-label">Linha Vodacom / Atendimento Geral</div>
                    <div className="contact-tile-value">870726974</div>
                  </div>
                  <div className="contact-tile-action">Ligar ↗</div>
                </a>

                <a href="tel:+258869700700" className="contact-tile">
                  <div className="contact-tile-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                    📱
                  </div>
                  <div className="contact-tile-info">
                    <div className="contact-tile-label">Linha Tmcel / Pedagógica</div>
                    <div className="contact-tile-value">869700700</div>
                  </div>
                  <div className="contact-tile-action">Ligar ↗</div>
                </a>

                <a href="mailto:ifoptec.politecnica@gmail.com" className="contact-tile">
                  <div className="contact-tile-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    ✉️
                  </div>
                  <div className="contact-tile-info">
                    <div className="contact-tile-label">Email Oficial IFOPTEC</div>
                    <div className="contact-tile-value">ifoptec.politecnica@gmail.com</div>
                  </div>
                  <div className="contact-tile-action">Enviar Email ↗</div>
                </a>

                <div className="contact-tile" style={{ cursor: 'default' }}>
                  <div className="contact-tile-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                    📍
                  </div>
                  <div className="contact-tile-info">
                    <div className="contact-tile-label">Polos de Atendimento &amp; Práticas</div>
                    <div className="contact-tile-value" style={{ fontSize: '0.85rem' }}>
                      • Polo Matola-Rio: Rua da Mozal<br />
                      • Polo Marracuene: Rua da Facim
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ISPOTEC Numbers */}
              <div className="official-numbers-banner">
                <div className="official-numbers-title">Linhas Oficiais ISPOTEC</div>
                <div className="official-numbers-display">
                  878787442 | 877906666 | 873045610
                </div>
              </div>

              <div className="contact-tile-list">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
