import React from 'react';
import { candidaturaService } from '../services/candidaturaService';
import LOGO_ISPOTEC_BASE64 from '../assets/logoIspotecBase64';

/**
 * Componente Oficial para Impressão e Download em PDF:
 * Recibo Provisório de Pagamento e Confirmação de Pré-Inscrição 2027 (ISPOTEC)
 * - Visualização 100% responsiva em telas móveis, tablets e computadores.
 * - Impressão estritamente contida em exatamente 1 única página A4.
 */
export default function ReciboPagamentoPrint({ candidatura, onClose }) {
  if (!candidatura) return null;

  const handlePrint = () => {
    window.print();
  };

  const dp = candidatura.dadosPessoais || {};
  const da = candidatura.dadosAcademicos || {};
  const valor = da.matricula || 4000;
  const numRecibo = candidatura.recibo?.numeroRecibo || `REC-${candidatura.numeroCandidatura}`;
  const codigoAutenticacao =
    candidatura.recibo?.codigoAutenticacao ||
    `ISP-REC-${(candidatura.numeroCandidatura || '2027').replace(/[^0-9]/g, '').slice(-6)}-2027`;

  const dataFormatada = candidatura.recibo?.dataEmissao
    ? new Date(candidatura.recibo.dataEmissao).toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

  const valorPorExtenso = (val) => {
    const v = Number(val);
    if (v === 4000) return 'Quatro Mil Meticais';
    if (v === 5000) return 'Cinco Mil Meticais';
    if (v === 10000) return 'Dez Mil Meticais';
    if (v === 7000) return 'Sete Mil Meticais';
    if (v === 6000) return 'Seis Mil Meticais';
    if (v === 6500) return 'Seis Mil e Quinhentos Meticais';
    if (v === 3500) return 'Três Mil e Quinhentos Meticais';
    if (v === 2000) return 'Dois Mil Meticais';
    return `${v.toLocaleString('pt-MZ')} Meticais`;
  };

  const linkWhatsApp = candidaturaService.gerarLinkWhatsApp(candidatura);

  // URL para consulta rápida no telemóvel via QR Code
  const baseUrl = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost'))
    ? window.location.origin
    : 'https://ispotec-online.vercel.app';
  const qrCodeUrl = `${baseUrl}/consultar-candidatura?codigo=${encodeURIComponent(candidatura.numeroCandidatura || candidatura.bi || '')}`;

  // Detalhes bancários do BCI de acordo com o grau
  const ehLicenciatura = da.grau === 'Licenciatura';
  const infoBancoBCI = ehLicenciatura
    ? 'Conta BCI: 22076375610001 • NIB: 0008 0000 20763756101 13'
    : 'Conta BCI: 22076375610002 • NIB: 0008 0000 20763756102 10';

  return (
    <div className="recibo-print-overlay">
      <style>{`
        /* --- ESTILOS DE PRÉ-VISUALIZAÇÃO (RESPONSIVO) --- */
        .recibo-print-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 99999;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.25rem 0.75rem;
          box-sizing: border-box;
        }

        .recibo-toolbar {
          background: #ffffff;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          margin-bottom: 1.25rem;
          position: sticky;
          top: 0.75rem;
          z-index: 100;
          width: 100%;
          max-width: 210mm;
          box-sizing: border-box;
        }

        .recibo-toolbar .btn {
          font-size: 0.88rem;
          padding: 0.55rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 700;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .recibo-toolbar .btn-primary {
          background: #003366;
          color: #ffffff;
        }
        .recibo-toolbar .btn-primary:hover {
          background: #002244;
        }

        .recibo-toolbar .btn-success {
          background: #16a34a;
          color: #ffffff;
        }
        .recibo-toolbar .btn-success:hover {
          background: #15803d;
        }

        .recibo-toolbar .btn-outline {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .recibo-toolbar .btn-outline:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* FOLHA DE RECIBO */
        .recibo-sheet {
          background: #ffffff;
          width: 210mm;
          max-width: 100%;
          min-height: 297mm;
          padding: 14mm 16mm;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          color: #1e293b;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
          font-size: 9.5pt;
          line-height: 1.38;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* CABEÇALHO */
        .r-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 2px solid #003366;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }

        .r-logo {
          width: 70px;
          height: 70px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .r-header-text {
          flex: 1;
          text-align: center;
        }

        .r-header-text h1 {
          font-size: 11.5pt;
          font-weight: 900;
          color: #003366;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          line-height: 1.25;
        }

        .r-header-text h2 {
          font-size: 9pt;
          font-weight: 700;
          color: #0284c7;
          margin: 3px 0 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .r-header-text p {
          font-size: 7.2pt;
          color: #475569;
          margin: 2px 0 0 0;
          line-height: 1.3;
        }

        /* BANNER DO RECIBO */
        .r-title-banner {
          background: linear-gradient(135deg, #003366 0%, #004b93 100%);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .r-title-banner h3 {
          margin: 0;
          font-size: 10.2pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .r-receipt-num {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11pt;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.45);
          padding: 3px 9px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* GRELHA DE INFORMAÇÕES */
        .r-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 12px;
        }

        .r-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 9px 12px;
          box-sizing: border-box;
        }

        .r-box-title {
          font-size: 7.8pt;
          font-weight: 800;
          color: #003366;
          text-transform: uppercase;
          margin-bottom: 6px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          letter-spacing: 0.3px;
        }

        .r-field {
          font-size: 8.3pt;
          margin-bottom: 3.5px;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          line-height: 1.25;
        }

        .r-field:last-child {
          margin-bottom: 0;
        }

        .r-field span.lbl {
          color: #64748b;
          font-weight: 600;
          flex-shrink: 0;
        }

        .r-field span.val {
          color: #0f172a;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
        }

        /* TABELA FINANCEIRA */
        .r-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 12px 0;
          font-size: 8.3pt;
        }

        .r-table th,
        .r-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
        }

        .r-table th {
          background: #f1f5f9;
          font-weight: 800;
          color: #003366;
          text-transform: uppercase;
          font-size: 7.4pt;
          letter-spacing: 0.3px;
        }

        /* BARRA DE TOTAL */
        .r-total-bar {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 6px;
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          gap: 12px;
        }

        .r-badge-pago {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #dcfce7;
          color: #15803d;
          border: 1.5px solid #86efac;
          font-weight: 800;
          font-size: 8.5pt;
          padding: 3px 10px;
          border-radius: 16px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* SELO E CÓDIGO DE AUTENTICAÇÃO */
        .r-stamp-box {
          border: 1.2px dashed #0284c7;
          border-radius: 6px;
          padding: 7px 10px;
          text-align: center;
          background: #f0f9ff;
          margin-bottom: 12px;
          font-size: 7.3pt;
          color: #0369a1;
          line-height: 1.35;
        }

        /* ASSINATURAS E QR CODE */
        .r-signatures {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 20px;
          margin-top: 6px;
          margin-bottom: 8px;
          align-items: flex-end;
          text-align: center;
        }

        .r-qr-container {
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 7px;
        }

        .r-qr-code-img {
          width: 52px;
          height: 52px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #fff;
          padding: 2px;
          flex-shrink: 0;
        }

        .r-qr-details {
          min-width: 0;
          flex: 1;
        }

        .r-qr-title {
          font-weight: 800;
          font-size: 7.2pt;
          color: #003366;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          line-height: 1.2;
        }

        .r-qr-desc {
          font-size: 6.4pt;
          color: #64748b;
          margin-top: 2px;
          line-height: 1.25;
        }

        .r-qr-code-val {
          font-size: 6.4pt;
          color: #0055a4;
          font-family: monospace;
          font-weight: 700;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .r-sig-space {
          height: 26px;
        }

        .r-sig-line {
          border-top: 1.5px solid #334155;
          padding-top: 4px;
          font-size: 7.8pt;
          font-weight: 800;
          color: #0f172a;
        }

        /* RODAPÉ */
        .r-footer {
          border-top: 1px solid #cbd5e1;
          padding-top: 6px;
          font-size: 6.8pt;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        /* RESPONSIVIDADE EM TELAS PEQUENAS (MOBILE / TABLET) */
        @media screen and (max-width: 992px) {
          .recibo-print-overlay {
            padding: 0.6rem 0.5rem;
          }
          .recibo-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto;
            padding: 1.25rem 1rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .recibo-toolbar {
            position: relative;
            top: 0;
            width: 100%;
            padding: 0.65rem 0.85rem;
            gap: 0.5rem;
          }
          .recibo-toolbar .btn {
            font-size: 0.82rem;
            padding: 0.5rem 0.85rem;
          }
          .r-signatures {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .r-qr-container {
            width: 100%;
            box-sizing: border-box;
          }
        }

        @media screen and (max-width: 640px) {
          .recibo-print-overlay {
            padding: 0.35rem 0.25rem;
          }
          .recibo-sheet {
            padding: 1rem 0.75rem;
            border-radius: 8px;
            font-size: 9pt;
          }
          .recibo-toolbar {
            flex-direction: column;
            width: 100%;
            gap: 0.45rem;
          }
          .recibo-toolbar .btn {
            width: 100%;
            justify-content: center;
          }
          .r-header {
            flex-direction: column;
            text-align: center;
            gap: 8px;
            padding-bottom: 8px;
          }
          .r-logo {
            width: 55px;
            height: 55px;
          }
          .r-header-text h1 {
            font-size: 10pt;
          }
          .r-header-text h2 {
            font-size: 8.2pt;
          }
          .r-header-text p {
            font-size: 6.8pt;
          }
          .r-title-banner {
            flex-direction: column;
            text-align: center;
            gap: 6px;
            padding: 8px 10px;
          }
          .r-title-banner h3 {
            font-size: 9.5pt !important;
          }
          .r-info-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .r-table th, .r-table td {
            padding: 5px 6px;
            font-size: 7.5pt;
          }
          .r-total-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .r-stamp-box {
            font-size: 7pt;
            padding: 6px 8px;
          }
          .r-signatures {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .r-qr-container {
            flex-direction: row;
            gap: 8px;
            padding: 6px 8px;
          }
          .r-qr-code-img {
            width: 48px;
            height: 48px;
          }
          .r-footer {
            flex-direction: column;
            text-align: center;
            gap: 4px;
            font-size: 6.5pt;
          }
        }

        /* --- IMPRESSÃO EM 1 ÚNICA PÁGINA A4 --- */
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }

        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .recibo-print-overlay,
          .recibo-print-overlay * {
            visibility: visible !important;
          }

          .recibo-print-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            display: block !important;
            box-sizing: border-box !important;
          }

          .recibo-toolbar {
            display: none !important;
          }

          .recibo-sheet {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 284mm !important;
            padding: 2mm 5mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          /* Garantir grelhas lado-a-lado no papel */
          .r-header {
            display: flex !important;
            flex-direction: row !important;
            gap: 14px !important;
            padding-bottom: 6px !important;
            margin-bottom: 8px !important;
          }

          .r-title-banner {
            display: flex !important;
            flex-direction: row !important;
            padding: 6px 12px !important;
            margin-bottom: 8px !important;
          }

          .r-info-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            margin-bottom: 8px !important;
          }

          .r-box {
            padding: 6px 10px !important;
          }

          .r-table {
            margin: 6px 0 8px 0 !important;
          }

          .r-table th,
          .r-table td {
            padding: 4px 8px !important;
          }

          .r-total-bar {
            padding: 6px 12px !important;
            margin-bottom: 8px !important;
          }

          .r-stamp-box {
            padding: 5px 8px !important;
            margin-bottom: 8px !important;
          }

          .r-signatures {
            display: grid !important;
            grid-template-columns: 1.15fr 1fr !important;
            gap: 18px !important;
            margin-top: 4px !important;
            margin-bottom: 4px !important;
            align-items: flex-end !important;
          }

          .r-qr-container {
            padding: 3px 6px !important;
          }

          .r-qr-code-img {
            width: 46px !important;
            height: 46px !important;
          }

          .r-sig-space {
            height: 22px !important;
          }

          .r-footer {
            margin-top: 4px !important;
            padding-top: 4px !important;
          }
        }
      `}</style>

      {/* BARRA DE AÇÕES (TOOLBAR) */}
      <div className="recibo-toolbar">
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          title="Descarregar Recibo Oficial em PDF ou Imprimir"
        >
          🖨️ Descarregar Recibo em PDF / Imprimir
        </button>

        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noreferrer"
          className="btn btn-success"
          title="Enviar comprovativo oficial por WhatsApp ao estudante"
        >
          💬 Partilhar via WhatsApp
        </a>

        <button
          onClick={onClose}
          className="btn btn-outline"
          title="Fechar visualização"
        >
          ✕ Fechar
        </button>
      </div>

      {/* FOLHA DE RECIBO A4 */}
      <div className="recibo-sheet">
        {/* CABEÇALHO */}
        <div className="r-header">
          <img
            src={LOGO_ISPOTEC_BASE64}
            alt="Logótipo ISPOTEC"
            className="r-logo"
          />

          <div className="r-header-text">
            <h1>Instituto Superior Politécnico e de Tecnologias</h1>
            <h2>Secretaria Geral • Direcção de Administração e Finanças</h2>
            <p>
              Rua da Mozal, Paragem Antena, Matola-Rio, Província de Maputo • República de Moçambique
              <br />
              Telefones Oficiais: (+258) 878 787 442 / 877 906 666 / 873 045 610
              <br />
              E-mail: Ispotec.politecnica@gmail.com • Portal: ispotec-online.vercel.app
            </p>
          </div>
        </div>

        {/* BANNER DO RECIBO */}
        <div className="r-title-banner">
          <div>
            <h3>Recibo Provisório de Pagamento &amp; Confirmação de Pré-Inscrição</h3>
            <div style={{ fontSize: '7.5pt', opacity: 0.95, marginTop: '2px' }}>
              Ano Lectivo de 2027 • Emitido em: <strong>{dataFormatada}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '6.8pt', textTransform: 'uppercase', opacity: 0.85 }}>N.º de Recibo</div>
            <div className="r-receipt-num">{numRecibo}</div>
          </div>
        </div>

        {/* GRELHA COM DADOS DO ESTUDANTE E ACADÉMICOS */}
        <div className="r-info-grid">
          {/* IDENTIFICAÇÃO DO ESTUDANTE */}
          <div className="r-box">
            <div className="r-box-title">Identificação do Estudante / Candidato</div>
            <div className="r-field">
              <span className="lbl">Nome Completo:</span>
              <span className="val" style={{ color: '#003366', fontSize: '8.8pt' }}>
                {dp.nome || '—'}
              </span>
            </div>
            <div className="r-field">
              <span className="lbl">N.º B.I. / Passaporte:</span>
              <span className="val">{dp.bi || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">N.º de Candidatura:</span>
              <span className="val" style={{ fontFamily: 'monospace' }}>
                {candidatura.numeroCandidatura}
              </span>
            </div>
            <div className="r-field">
              <span className="lbl">Telefone Principal:</span>
              <span className="val">{dp.telefonePrincipal || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Província / Município:</span>
              <span className="val">
                {dp.provincia || '—'} {dp.distrito ? `/ ${dp.distrito}` : ''}
              </span>
            </div>
            {dp.nomeEncarregado && (
              <div className="r-field">
                <span className="lbl">Encarregado:</span>
                <span className="val">
                  {dp.nomeEncarregado} {dp.contactoEncarregado ? `(${dp.contactoEncarregado})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* ENQUADRAMENTO ACADÉMICO */}
          <div className="r-box">
            <div className="r-box-title">Enquadramento Académico (Ano Lectivo 2027)</div>
            <div className="r-field">
              <span className="lbl">Curso Selecionado:</span>
              <span className="val" style={{ color: '#003366', fontSize: '8.8pt' }}>
                {da.cursoNome || '—'}
              </span>
            </div>
            <div className="r-field">
              <span className="lbl">Grau Académico:</span>
              <span className="val">{da.grau || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Regime de Frequência:</span>
              <span className="val">{da.regime || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Modalidade de Ensino:</span>
              <span className="val">{da.modalidade || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Habilitação de Ingresso:</span>
              <span className="val">{da.nivelIngresso || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Duração Curricular:</span>
              <span className="val">{da.duracao || 'Conforme Edital'}</span>
            </div>
          </div>
        </div>

        {/* TABELA DE LIQUIDAÇÃO FINANCEIRA */}
        <table className="r-table">
          <thead>
            <tr>
              <th style={{ width: '8%', textAlign: 'center' }}>Item</th>
              <th style={{ width: '56%' }}>Descrição da Operação</th>
              <th style={{ width: '14%', textAlign: 'center' }}>Ano Lectivo</th>
              <th style={{ width: '22%', textAlign: 'right' }}>Valor Liquidado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>01</td>
              <td>
                <strong>Taxa Oficial de Pré-Inscrição &amp; Processamento de Candidatura</strong>
                <div style={{ fontSize: '7.2pt', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                  Liquidado via Banco BCI / ISPOTEC (Sujeito a IVA de 5%)
                  <br />
                  <strong>{infoBancoBCI}</strong>
                  <br />
                  Comprovativo conferido e validado pela Direcção Financeira.
                </div>
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>2027</td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '9.2pt', color: '#003366' }}>
                {Number(valor).toLocaleString('pt-MZ')},00 MT
              </td>
            </tr>
          </tbody>
        </table>

        {/* BARRA DE VALOR POR EXTENSO & BADGE */}
        <div className="r-total-bar">
          <div>
            <div style={{ fontSize: '7.2pt', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Importância por Extenso
            </div>
            <div style={{ fontSize: '9.2pt', fontWeight: 800, color: '#166534' }}>
              {valorPorExtenso(valor)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="r-badge-pago">
              ✓ Liquidado &amp; Confirmado
            </span>
          </div>
        </div>

        {/* SELO DE AUTENTICIDADE DIGITAL */}
        <div className="r-stamp-box">
          <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '7.8pt', color: '#003366' }}>
            Selo de Autenticidade Digital — ISPOTEC Online (Campus Matola-Rio)
          </div>
          <div style={{ marginTop: '2px', fontFamily: 'monospace', fontWeight: 700, fontSize: '8pt' }}>
            Código de Confirmação: <strong>{codigoAutenticacao}</strong> • Processo: <strong>{candidatura.numeroCandidatura}</strong>
          </div>
          <div style={{ marginTop: '2px', fontSize: '6.9pt', color: '#64748b' }}>
            O Director Geral: Prof. Dr. Jacob Massuanganhe (Pós-Doutor em Direito) • Autenticidade verificável em: <strong>ispotec-online.vercel.app/consultar-candidatura</strong>
          </div>
        </div>

        {/* ASSINATURA, CARIMBO E QR CODE DE CONSULTA */}
        <div className="r-signatures">
          <div className="r-qr-container">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=2&data=${encodeURIComponent(qrCodeUrl)}`}
              alt="QR Code Consulta de Candidatura — ISPOTEC 2027"
              className="r-qr-code-img"
            />
            <div className="r-qr-details">
              <div className="r-qr-title">
                Consulta de Candidatura — ISPOTEC 2027
              </div>
              <div className="r-qr-desc">
                Escaneie com a câmara do telemóvel para consultar e acompanhar o processo online.
              </div>
              <div className="r-qr-code-val">
                Candidatura: {candidatura.numeroCandidatura}
              </div>
            </div>
          </div>

          <div>
            <div className="r-sig-space"></div>
            <div className="r-sig-line">Pelos Serviços Financeiros &amp; Secretaria — ISPOTEC</div>
            <div style={{ fontSize: '6.8pt', color: '#64748b' }}>Carimbo e Assinatura Autorizada</div>
          </div>
        </div>

        {/* RODAPÉ DO DOCUMENTO */}
        <div className="r-footer">
          <span>ISPOTEC — Instituto Superior Politécnico e de Tecnologias • Campus Matola-Rio</span>
          <span>Processado eletronicamente por computador • Documento Oficial</span>
        </div>
      </div>
    </div>
  );
}
