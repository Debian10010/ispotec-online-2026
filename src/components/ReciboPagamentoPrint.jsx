import React from 'react';
import { candidaturaService } from '../services/candidaturaService';

/**
 * Componente Oficial para Impressão e Download em PDF:
 * Recibo Oficial de Pagamento e Confirmação de Pré-Inscrição 2027 (ISPOTEC)
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
  const codigoAutenticacao = candidatura.recibo?.codigoAutenticacao || `ISP-${(candidatura.numeroCandidatura || '2027').replace(/[^0-9]/g, '').slice(-6)}`;
  
  const dataFormatada = candidatura.recibo?.dataEmissao
    ? new Date(candidatura.recibo.dataEmissao).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const valorPorExtenso = (val) => {
    const v = Number(val);
    if (v === 4000) return 'Quatro Mil Meticais';
    if (v === 5000) return 'Cinco Mil Meticais';
    if (v === 10000) return 'Dez Mil Meticais';
    if (v === 7000) return 'Sete Mil Meticais';
    if (v === 6000) return 'Seis Mil Meticais';
    if (v === 6500) return 'Seis Mil e Quinhentos Meticais';
    if (v === 3500) return 'Três Mil e Quinhentos Meticais';
    return `${v.toLocaleString('pt-MZ')} Meticais`;
  };

  const linkWhatsApp = candidaturaService.gerarLinkWhatsApp(candidatura);

  return (
    <div className="recibo-print-overlay">
      <style>{`
        .recibo-print-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          z-index: 99999;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
        }

        .recibo-toolbar {
          background: white;
          padding: 0.85rem 1.5rem;
          border-radius: 10px;
          display: flex;
          gap: 0.85rem;
          align-items: center;
          flex-wrap: wrap;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          margin-bottom: 1.5rem;
          position: sticky;
          top: 1rem;
          z-index: 10;
        }

        .recibo-sheet {
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 20mm;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          color: #1e293b;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.45;
          box-sizing: border-box;
          position: relative;
        }

        .r-header {
          display: flex;
          align-items: center;
          gap: 18px;
          border-bottom: 2.5px solid #003366;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .r-logo {
          width: 75px;
          height: 75px;
          object-fit: contain;
        }

        .r-header-text {
          flex: 1;
          text-align: center;
        }

        .r-header-text h1 {
          font-size: 13pt;
          font-weight: 900;
          color: #003366;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .r-header-text h2 {
          font-size: 10.5pt;
          font-weight: 700;
          color: #0284c7;
          margin: 3px 0;
          text-transform: uppercase;
        }

        .r-header-text p {
          font-size: 7.8pt;
          color: #475569;
          margin: 2px 0 0 0;
          line-height: 1.35;
        }

        .r-title-banner {
          background: linear-gradient(135deg, #003366 0%, #004b93 100%);
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .r-title-banner h3 {
          margin: 0;
          font-size: 11pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .r-receipt-num {
          font-family: monospace;
          font-size: 11.5pt;
          font-weight: 800;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.4);
          padding: 3px 10px;
          border-radius: 4px;
        }

        .r-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .r-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 12px 14px;
        }

        .r-box-title {
          font-size: 8pt;
          font-weight: 800;
          color: #003366;
          text-transform: uppercase;
          margin-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }

        .r-field {
          font-size: 8.5pt;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }

        .r-field span.lbl {
          color: #64748b;
          font-weight: 600;
        }

        .r-field span.val {
          color: #0f172a;
          font-weight: 700;
          text-align: right;
        }

        .r-table {
          width: 100%;
          border-collapse: collapse;
          margin: 18px 0;
          font-size: 8.5pt;
        }

        .r-table th, .r-table td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
        }

        .r-table th {
          background: #f1f5f9;
          font-weight: 800;
          color: #003366;
          text-transform: uppercase;
          font-size: 7.5pt;
        }

        .r-total-bar {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 6px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .r-badge-pago {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #dcfce7;
          color: #15803d;
          border: 1.5px solid #86efac;
          font-weight: 800;
          font-size: 9pt;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .r-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 40px;
          text-align: center;
        }

        .r-sig-line {
          border-top: 1.5px solid #334155;
          padding-top: 6px;
          font-size: 8pt;
          font-weight: 800;
          color: #0f172a;
        }

        .r-stamp-box {
          border: 1.5px dashed #0284c7;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          background: #f0f9ff;
          margin-top: 14px;
          font-size: 7.5pt;
          color: #0369a1;
        }

        /* PRINT STYLES */
        @media print {
          body * {
            visibility: hidden;
          }
          .recibo-print-overlay, .recibo-print-overlay * {
            visibility: visible;
          }
          .recibo-print-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none !important;
            padding: 0 !important;
          }
          .recibo-toolbar {
            display: none !important;
          }
          .recibo-sheet {
            box-shadow: none !important;
            padding: 12mm 15mm !important;
            width: 100% !important;
            min-height: auto !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="recibo-toolbar">
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
        >
          🖨️ Descarregar Recibo em PDF / Imprimir
        </button>

        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noreferrer"
          className="btn btn-success"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          💬 Partilhar via WhatsApp
        </a>

        <button
          onClick={onClose}
          className="btn btn-outline-secondary"
          style={{ fontWeight: 600 }}
        >
          ✕ Fechar
        </button>
      </div>

      {/* A4 RECEIPT SHEET */}
      <div className="recibo-sheet">
        {/* HEADER */}
        <div className="r-header">
          <img
            src="/images/logo.png"
            alt="Logótipo ISPOTEC"
            className="r-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
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

        {/* TITLE BANNER */}
        <div className="r-title-banner">
          <div>
            <h3>Recibo Oficial de Pagamento &amp; Confirmação de Pré-Inscrição</h3>
            <div style={{ fontSize: '7.8pt', opacity: 0.9, marginTop: '2px' }}>
              Ano Lectivo de 2027 • Emitido em: {dataFormatada}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', opacity: 0.8 }}>N.º de Recibo</div>
            <div className="r-receipt-num">{numRecibo}</div>
          </div>
        </div>

        {/* INFO GRIDS */}
        <div className="r-info-grid">
          {/* CANDIDATE BOX */}
          <div className="r-box">
            <div className="r-box-title">Identificação do Estudante / Candidato</div>
            <div className="r-field">
              <span className="lbl">Nome Completo:</span>
              <span className="val" style={{ color: '#003366', fontSize: '9pt' }}>{dp.nome || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">N.º B.I. / Passaporte:</span>
              <span className="val">{dp.bi || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">N.º de Candidatura:</span>
              <span className="val" style={{ fontFamily: 'monospace' }}>{candidatura.numeroCandidatura}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Telefone Principal:</span>
              <span className="val">{dp.telefonePrincipal || '—'}</span>
            </div>
            <div className="r-field">
              <span className="lbl">Província / Município:</span>
              <span className="val">{dp.provincia || '—'} / {dp.distrito || '—'}</span>
            </div>
            {dp.nomeEncarregado && (
              <div className="r-field">
                <span className="lbl">Encarregado:</span>
                <span className="val">{dp.nomeEncarregado} ({dp.contactoEncarregado})</span>
              </div>
            )}
          </div>

          {/* ACADEMIC BOX */}
          <div className="r-box">
            <div className="r-box-title">Enquadramento Académico (Ano Lectivo 2027)</div>
            <div className="r-field">
              <span className="lbl">Curso Selecionado:</span>
              <span className="val" style={{ color: '#003366', fontSize: '9pt' }}>{da.cursoNome || '—'}</span>
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

        {/* FINANCIAL TABLE */}
        <table className="r-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Item</th>
              <th style={{ width: '55%' }}>Descrição da Operação</th>
              <th style={{ width: '15%' }}>Ano Lectivo</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Valor Liquidado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>01</td>
              <td>
                <strong>Taxa Oficial de Pré-Inscrição &amp; Processamento de Candidatura</strong>
                <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '2px' }}>
                  Liquidado no BCI / ISPOTEC (Sujeito a IVA de 5%) • ${da.grau === 'Licenciatura' ? 'Conta: 22076375610001 (NIB: 0008 0000 20763756101 13)' : 'Conta: 22076375610002 (NIB: 0008 0000 20763756102 10)'} • Comprovativo validado pelos Serviços Financeiros.
                </div>
              </td>
              <td>2027</td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '9.5pt', color: '#003366' }}>
                {Number(valor).toLocaleString('pt-MZ')},00 MT
              </td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL & EXTENSO */}
        <div className="r-total-bar">
          <div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Importância por Extenso
            </div>
            <div style={{ fontSize: '9.5pt', fontWeight: 800, color: '#166534' }}>
              {valorPorExtenso(valor)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="r-badge-pago">
              ✓ Liquidado &amp; Confirmado
            </span>
          </div>
        </div>

        {/* STAMP & CODE */}
        <div className="r-stamp-box">
          <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '8pt', color: '#003366' }}>
            Selo de Autenticidade Digital — ISPOTEC Online (Matola-Rio)
          </div>
          <div style={{ marginTop: '3px', fontFamily: 'monospace', fontWeight: 700 }}>
            Código de Confirmação: <strong>{codigoAutenticacao}</strong> • Processo: <strong>{candidatura.numeroCandidatura}</strong>
          </div>
          <div style={{ marginTop: '2px', fontSize: '7pt', color: '#64748b' }}>
            O Director Geral: Prof. Dr. Jacob Massuanganhe (Pós-Doutor em Direito) • Verificação em ispotec-online.vercel.app/consultar-candidatura
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="r-signatures">
          <div>
            <div style={{ height: '35px' }}></div>
            <div className="r-sig-line">O(A) Estudante / Candidato(a)</div>
            <div style={{ fontSize: '7pt', color: '#64748b' }}>Assinatura de Receção</div>
          </div>

          <div>
            <div style={{ height: '35px' }}></div>
            <div className="r-sig-line">Pelos Serviços Financeiros &amp; Secretaria — ISPOTEC</div>
            <div style={{ fontSize: '7pt', color: '#64748b' }}>Carimbo e Assinatura Autorizada</div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '35px', paddingTop: '8px', fontSize: '6.8pt', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
          <span>ISPOTEC — Instituto Superior Politécnico e de Tecnologias • Campus Matola-Rio</span>
          <span>Processado eletronicamente por computador • Documento Oficial</span>
        </div>
      </div>
    </div>
  );
}
