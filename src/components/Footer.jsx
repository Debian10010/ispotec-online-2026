import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-brand">
                <strong>ISPOTEC Online</strong>
                <p className="footer-desc">Rede Social Académica do Instituto Superior Politécnico e de Tecnologias</p>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Contactos Rápidos</h4>
              <div className="footer-links">
                <a 
                  href="https://api.whatsapp.com/send/?phone=258870726974&text&type=phone_number&app_absent=0" 
                  target="_blank" 
                  rel="noreferrer"
                  className="footer-contact-link"
                >
                  <span className="footer-icon">💬</span>
                  <span>WhatsApp: +258 87 072 6974</span>
                </a>
                <a href="tel:+258840726974" className="footer-contact-link">
                  <span className="footer-icon">📱</span>
                  <span>Telefone: +258 84 072 6974</span>
                </a>
                <a href="mailto:ifoptec.politecnica@gmail.com" className="footer-contact-link">
                  <span className="footer-icon">✉️</span>
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Plataformas</h4>
              <div className="footer-links">
                <a href="https://sisga.ispotec.ac.mz/" target="_blank" rel="noreferrer">
                  <span className="footer-icon">📊</span>
                  <span>SISGA</span>
                </a>
                <a href="https://classroom.google.com/" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🏫</span>
                  <span>Google Classroom</span>
                </a>
                <a href="https://ispotec.moodlecloud.com/login/index.php" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🎯</span>
                  <span>Moodle</span>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Unidades ISPOTEC</h4>
              <div className="footer-links">
                <a href="https://ispotec.ac.mz/ISPOTEC" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🏛️</span>
                  <span>ISPOTEC</span>
                </a>
                <a href="https://ispotec.ac.mz/Ceap" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🎨</span>
                  <span>CEAP</span>
                </a>
                <a href="https://ispotec.ac.mz/Cmu" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🎵</span>
                  <span>CMU</span>
                </a>
                <a href="https://ispotec.ac.mz/Crc" target="_blank" rel="noreferrer">
                  <span className="footer-icon">⚖️</span>
                  <span>CRC</span>
                </a>
                <a href="https://ispotec.ac.mz/Ctodh" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🌍</span>
                  <span>CTODH</span>
                </a>
                <a href="https://ispotec.ac.mz/" target="_blank" rel="noreferrer">
                  <span className="footer-icon">🌐</span>
                  <span>Site Principal</span>
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Bibliotecas Digitais</h4>
              <div className="footer-links">
                <a href="https://files.fm/u/5ba9773fmx" target="_blank" rel="noreferrer">
                  <span className="footer-icon">📓</span>
                  <span>Ensino Médio</span>
                </a>
                <a href="https://files.fm/u/3kdkcxhqjs" target="_blank" rel="noreferrer">
                  <span className="footer-icon">📕</span>
                  <span>Ensino Superior</span>
                </a>
                <a href="https://ispotec.sgeapp.com" target="_blank" rel="noreferrer">
                  <span className="footer-icon">📱</span>
                  <span>SGE App</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; {currentYear} ISPOTEC Online. Todos os direitos reservados.</p>
              <div className="footer-location">
                <span className="location-icon">📍</span>
                <span>Rua da Mozal, 5453-Matola</span>
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
