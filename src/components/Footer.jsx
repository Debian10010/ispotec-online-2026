import React from 'react';
import { Link } from 'react-router-dom';
import { useInstitution } from '../context/InstitutionContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isIfoptec, institution, switchInstitution } = useInstitution();

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-brand">
                <strong>{institution.name}</strong>
                <p className="footer-desc">
                  {institution.tagline}
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => switchInstitution('ispotec')}
                    style={{
                      background: !isIfoptec ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '15px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🏛️ ISPOTEC (Superior)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchInstitution('ifoptec')}
                    style={{
                      background: isIfoptec ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '15px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🏥 IFOPTEC (Médio)
                  </button>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">
                {isIfoptec ? 'Contactos IFOPTEC' : 'Contactos Rápidos'}
              </h4>
              <div className="footer-links">
                {isIfoptec ? (
                  <>
                    <a
                      href="https://api.whatsapp.com/send/?phone=258840726974&text=Ola%20IFOPTEC"
                      target="_blank"
                      rel="noreferrer"
                      className="footer-contact-link"
                    >
                      <span className="footer-icon">💬</span>
                      <span>WhatsApp: 840726974</span>
                    </a>
                    <a href="tel:+258870726974" className="footer-contact-link">
                      <span className="footer-icon">📱</span>
                      <span>Telefone: 870726974</span>
                    </a>
                    <a href="tel:+258869700700" className="footer-contact-link">
                      <span className="footer-icon">📱</span>
                      <span>Telefone: 869700700</span>
                    </a>
                    <a href="mailto:ifoptec.politecnica@gmail.com" className="footer-contact-link">
                      <span className="footer-icon">✉️</span>
                      <span>ifoptec.politecnica@gmail.com</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="https://api.whatsapp.com/send/?phone=258878787442&text&type=phone_number&app_absent=0"
                      target="_blank"
                      rel="noreferrer"
                      className="footer-contact-link"
                    >
                      <span className="footer-icon">💬</span>
                      <span>WhatsApp: 878787442</span>
                    </a>
                    <a href="tel:+258877906666" className="footer-contact-link">
                      <span className="footer-icon">📱</span>
                      <span>Telefone: 877906666</span>
                    </a>
                    <a href="tel:+258873045610" className="footer-contact-link">
                      <span className="footer-icon">📱</span>
                      <span>Telefone: 873045610</span>
                    </a>
                    <a href="mailto:ifoptec.politecnica@gmail.com" className="footer-contact-link">
                      <span className="footer-icon">✉️</span>
                      <span>Email Geral</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Plataformas &amp; AVA</h4>
              <div className="footer-links">
                <Link to="/ifoptec/cursos" className="footer-contact-link">
                  <span className="footer-icon">🩺</span>
                  <span>Cursos Médios IFOPTEC</span>
                </Link>
                <Link to="/ensino" className="footer-contact-link">
                  <span className="footer-icon">📚</span>
                  <span>Planos &amp; Ensino</span>
                </Link>
                <Link to="/homeschool" className="footer-contact-link">
                  <span className="footer-icon">🏫</span>
                  <span>Ambiente Virtual (AVA)</span>
                </Link>
                <a href="https://sisga.ispotec.ac.mz/" target="_blank" rel="noreferrer" className="footer-contact-link">
                  <span className="footer-icon">📊</span>
                  <span>SISGA Académico</span>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Polos &amp; Bibliotecas</h4>
              <div className="footer-links">
                <a href="https://files.fm/u/5ba9773fmx" target="_blank" rel="noreferrer" className="footer-contact-link">
                  <span className="footer-icon">📓</span>
                  <span>Biblioteca Ensino Médio</span>
                </a>
                <a href="https://files.fm/u/3kdkcxhqjs" target="_blank" rel="noreferrer" className="footer-contact-link">
                  <span className="footer-icon">📕</span>
                  <span>Biblioteca Ensino Superior</span>
                </a>
                <span className="footer-contact-link" style={{ cursor: 'default', color: '#94a3b8' }}>
                  <span className="footer-icon">📍</span>
                  <span>Matola-Rio (Rua Mozal)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; {currentYear} {institution.name} — Plataforma Multi-Institucional (ISPOTEC &amp; IFOPTEC). Todos os direitos reservados.</p>
              <div className="footer-location">
                <span className="location-icon">📍</span>
                <span>Matola-Rio, Rua da Mozal — Moçambique</span>
              </div>
            </div>

            <div className="footer-bottom-right">
              <div className="footer-social">
                <a href="https://web.facebook.com/ISPOTEC/" target="_blank" rel="noreferrer" className="social-link" title="Facebook">
                  <span className="social-icon">📘</span>
                  <span className="social-text">Facebook</span>
                </a>
                <a href="mailto:ifoptec.politecnica@gmail.com" className="social-link" title="Email">
                  <span className="social-icon">✉️</span>
                  <span className="social-text">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
