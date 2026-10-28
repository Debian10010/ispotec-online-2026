import React from 'react';
import LOGO_ISPOTEC_BASE64 from '../assets/logoIspotecBase64';

/**
 * Componente de Impressão Oficial A4:
 * 1) Ficha Individual do Processo do Candidato (Dossiê Completo - 1 PÁGINA RIGOROSA)
 * 2) Relatório / Pauta de Candidaturas Selecionadas (Modo Lista)
 */
export default function FichaCandidatoPrint({ candidatura, listaCandidaturas = null, onClose }) {
  const isLista = Boolean(listaCandidaturas && listaCandidaturas.length > 0);

  const handlePrint = () => {
    window.print();
  };

  const formatarData = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (_) {
      return iso;
    }
  };

  const formatarValor = (val) => {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('pt-MZ') + ' MT';
  };

  const dp = candidatura?.dadosPessoais || {};
  const da = candidatura?.dadosAcademicos || {};
  const docs = candidatura?.documentos || {};
  const compDoc = docs.comprovativoPagamento || null;

  // Informações bancárias adequadas ao grau
  const isLic = (da.grau || '').toLowerCase().includes('licenciatura');
  const contaBCI = isLic ? '22076375610001' : '22076375610002';
  const nibBCI = isLic ? '0008 0000 20763756101 13' : '0008 0000 20763756102 10';

  return (
    <div className="ficha-print-overlay">
      <style>{`
        .ficha-print-overlay {
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
          padding: 1.5rem 1rem;
        }

        .ficha-print-toolbar {
          background: white;
          padding: 0.65rem 1.25rem;
          border-radius: 8px;
          display: flex;
          gap: 1rem;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          margin-bottom: 1rem;
          position: sticky;
          top: 0.5rem;
          z-index: 10;
        }

        .ficha-print-sheet {
          background: white;
          width: 210mm;
          max-width: 100%;
          min-height: 295mm;
          max-height: 297mm;
          padding: 10mm 14mm 8mm 14mm;
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          color: #0f172a;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 8pt;
          line-height: 1.3;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          page-break-inside: avoid;
        }

        /* HEADER INSTITUCIONAL */
        .f-header {
          display: flex;
          align-items: center;
          gap: 14px;
          border-bottom: 2px solid #003366;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        .f-logo-img {
          width: 62px;
          height: 62px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .f-header-text {
          flex: 1;
          text-align: center;
        }

        .f-header-text h1 {
          font-size: 11pt;
          font-weight: 900;
          letter-spacing: 0.4px;
          color: #003366;
          margin: 0;
          text-transform: uppercase;
        }

        .f-header-text h2 {
          font-size: 8.5pt;
          font-weight: 700;
          color: #0284c7;
          margin: 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .f-header-text p {
          font-size: 6.8pt;
          color: #475569;
          margin: 1px 0 0 0;
          line-height: 1.25;
        }

        /* PROCESS TITLE BAR */
        .f-title-bar {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #003366;
          padding: 5px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .f-title-bar h3 {
          margin: 0;
          font-size: 9.5pt;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
        }

        .f-num-candidatura {
          font-family: monospace;
          font-size: 10pt;
          font-weight: 800;
          color: #003366;
          background: white;
          border: 1px solid #94a3b8;
          padding: 2px 8px;
          border-radius: 4px;
        }

        /* SECTIONS */
        .f-section {
          margin-bottom: 8px;
        }

        .f-section-title {
          font-size: 7.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: #003366;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 2px;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .f-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
        }

        .f-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4px 10px;
        }

        .f-grid-personal {
          display: grid;
          grid-template-columns: 85px 1fr;
          gap: 10px;
        }

        .f-photo-box {
          width: 85px;
          height: 100px;
          border: 1px dashed #94a3b8;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          overflow: hidden;
          font-size: 6.5pt;
          color: #64748b;
          text-align: center;
          padding: 2px;
        }

        .f-photo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .f-field {
          display: flex;
          flex-direction: column;
          font-size: 7.8pt;
          margin-bottom: 2px;
        }

        .f-label {
          font-size: 6.2pt;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          margin-bottom: 1px;
        }

        .f-value {
          color: #0f172a;
          font-weight: 600;
          word-break: break-word;
          line-height: 1.25;
        }

        .f-badge {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 6.8pt;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
        }

        .f-badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .f-badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .f-badge-blue  { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
        .f-badge-red   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

        /* COMPROVATIVO DESTAQUE */
        .f-comp-box {
          background: #f0fdf4;
          border: 1.5px solid #86efac;
          border-radius: 6px;
          padding: 6px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        /* TABLES */
        .f-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7.2pt;
          margin-top: 3px;
        }

        .f-table th, .f-table td {
          border: 1px solid #cbd5e1;
          padding: 3px 6px;
          text-align: left;
        }

        .f-table th {
          background: #f1f5f9;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          font-size: 6.5pt;
        }

        /* AUDIT & SIGNATURES */
        .f-declaration {
          font-size: 6.5pt;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 5px 8px;
          margin: 6px 0 8px 0;
          line-height: 1.25;
          border-radius: 4px;
        }

        .f-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-top: 12px;
          text-align: center;
        }

        .f-sig-line {
          border-top: 1px solid #334155;
          padding-top: 3px;
          font-size: 7.2pt;
          font-weight: 700;
          color: #1e293b;
        }

        .f-sig-sub {
          font-size: 6.2pt;
          color: #64748b;
        }

        /* PRINT STYLES - RIGID 1 PAGE A4 */
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden;
          }
          .ficha-print-overlay, .ficha-print-overlay * {
            visibility: visible;
          }
          .ficha-print-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: none !important;
            padding: 0 !important;
            backdrop-filter: none !important;
            overflow: visible !important;
          }
          .ficha-print-toolbar {
            display: none !important;
          }
          .ficha-print-sheet {
            box-shadow: none !important;
            padding: 6mm 10mm 4mm 10mm !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 285mm !important;
            height: auto !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            overflow: hidden !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="ficha-print-toolbar">
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, padding: '0.45rem 1rem' }}
        >
          🖨️ Descarregar Ficha em PDF / Imprimir (A4 - 1 Página)
        </button>
        <button
          onClick={onClose}
          className="btn btn-outline-secondary"
          style={{ fontWeight: 600, padding: '0.45rem 0.9rem' }}
        >
          ✕ Fechar
        </button>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Documento oficial com logótipo ISPOTEC e comprovativo de pagamento incluído.
        </span>
      </div>

      {/* SINGLE CANDIDATE DOSSIER (EXATAMENTE 1 PÁGINA) */}
      {!isLista && candidatura && (
        <div className="ficha-print-sheet">
          {/* HEADER COM LOGÓTIPO OFICIAL DO ISPOTEC */}
          <div className="f-header">
            <img
              src={LOGO_ISPOTEC_BASE64}
              alt="Logótipo ISPOTEC"
              className="f-logo-img"
            />

            <div className="f-header-text">
              <h1>Instituto Superior Politécnico e de Tecnologias</h1>
              <h2>ISPOTEC — Secretaria Geral &amp; Direcção Pedagógica</h2>
              <p>
                Campus Matola-Rio: Rua da Mozal, 5354, Paragem Antena, Matola-Rio • Província de Maputo
                <br />
                Telefones Oficiais: (+258) 878 787 442 / 879 6666 / 873 045 610 • E-mail: ispotec.politecnica@gmail.com
              </p>
            </div>
          </div>

          {/* PROCESS TITLE BAR */}
          <div className="f-title-bar">
            <div>
              <h3>Ficha Oficial de Pré-Inscrição &amp; Candidatura 2027</h3>
              <div style={{ fontSize: '6.8pt', color: '#64748b' }}>
                Ano Lectivo 2027 • Submetido em: {formatarData(candidatura.dataSubmissao || candidatura.createdAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '6pt', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  N.º Candidatura
                </div>
                <div className="f-num-candidatura">{candidatura.numeroCandidatura}</div>
              </div>
              <span className={`f-badge ${
                candidatura.estado === 'Aprovada' ? 'f-badge-green' :
                candidatura.estado === 'Rejeitada' ? 'f-badge-red' :
                candidatura.estado === 'Em análise' ? 'f-badge-blue' : 'f-badge-amber'
              }`}>
                {candidatura.estado || 'Submetida'}
              </span>
            </div>
          </div>

          {/* 1. DADOS PESSOAIS */}
          <div className="f-section">
            <div className="f-section-title">
              <span>1. Identificação e Dados Pessoais do Estudante</span>
              <span style={{ fontSize: '6.5pt', color: '#64748b', textTransform: 'none' }}>
                {dp.provincia} • {dp.distrito}
              </span>
            </div>

            <div className="f-grid-personal">
              {/* FOTOGRAFIA */}
              <div className="f-photo-box">
                {dp.fotoPreview || docs.fotografia?.url ? (
                  <img
                    src={dp.fotoPreview || docs.fotografia?.url}
                    alt="Foto do Candidato"
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '18pt', color: '#94a3b8' }}>👤</span>
                    <span>Fotografia Tipo Passe</span>
                  </>
                )}
              </div>

              {/* CAMPOS PESSOAIS */}
              <div>
                <div className="f-grid-2">
                  <div className="f-field" style={{ gridColumn: 'span 2' }}>
                    <span className="f-label">Nome Completo do Estudante</span>
                    <span className="f-value" style={{ fontSize: '9pt', color: '#003366', fontWeight: 800 }}>
                      {dp.nome || '—'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">N.º Bilhete de Identidade (B.I.)</span>
                    <span className="f-value">{dp.bi || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Data de Nascimento</span>
                    <span className="f-value">{dp.dataNascimento || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Telefone Principal</span>
                    <span className="f-value">{dp.telefonePrincipal || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Contactos Adicionais</span>
                    <span className="f-value">
                      {[dp.telefoneAdicional1, dp.telefoneAdicional2].filter(Boolean).join(' / ') || 'Nenhum'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Morada / Bairro</span>
                    <span className="f-value">
                      {dp.bairro ? `${dp.bairro}, ` : ''}{dp.morada || '—'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Encarregado de Educação</span>
                    <span className="f-value">
                      {dp.nomeEncarregado ? `${dp.nomeEncarregado} (${dp.contactoEncarregado || 's/ contacto'})` : 'Não informado'}
                    </span>
                  </div>

                  {dp.localTrabalho && (
                    <div className="f-field" style={{ gridColumn: 'span 2' }}>
                      <span className="f-label">Local de Trabalho / Profissão</span>
                      <span className="f-value">{dp.localTrabalho}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. DADOS ACADÉMICOS E CURSO */}
          <div className="f-section">
            <div className="f-section-title">
              <span>2. Curso Seleccionado e Enquadramento Académico (2027)</span>
              <span style={{ fontSize: '6.5pt', color: '#003366', fontWeight: 700 }}>
                {da.duracao || '4 anos com estágios'}
              </span>
            </div>

            <div className="f-grid-3">
              <div className="f-field" style={{ gridColumn: 'span 2' }}>
                <span className="f-label">Curso Pretendido</span>
                <span className="f-value" style={{ fontSize: '8.8pt', color: '#003366', fontWeight: 800 }}>
                  {da.cursoNome || '—'}
                </span>
              </div>

              <div className="f-field">
                <span className="f-label">Grau Académico</span>
                <span className="f-value">{da.grau || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Regime de Frequência</span>
                <span className="f-value">{da.regime || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Modalidade de Ensino</span>
                <span className="f-value">{da.modalidade || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Nível de Ingresso</span>
                <span className="f-value">{da.nivelIngresso || '12.ª Classe'}</span>
              </div>

              <div className="f-field" style={{ gridColumn: 'span 2' }}>
                <span className="f-label">Instituição de Ensino de Proveniência</span>
                <span className="f-value">{da.instituicaoProveniencia || 'Não indicada'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Ano de Conclusão</span>
                <span className="f-value">{da.anoConclusao || '—'}</span>
              </div>
            </div>

            {/* TIRA DE VALORES */}
            <div style={{ marginTop: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '7.2pt' }}>
              <div>
                <strong>Propina Mensal:</strong>{' '}
                <span style={{ color: '#003366', fontWeight: 700 }}>{formatarValor(da.propinaMensal)}</span>
              </div>
              <div>
                <strong>Taxa de Inscrição/Matrícula:</strong>{' '}
                <span style={{ color: '#003366', fontWeight: 700 }}>{formatarValor(da.matricula)}</span>
              </div>
              <div>
                <strong>Regime de Propinas:</strong> BCI / ISPOTEC (Sujeito a IVA 5%)
              </div>
            </div>
          </div>

          {/* 3. COMPROVATIVO DE PAGAMENTO & DOCUMENTOS (TRABALHO DETALHADO) */}
          <div className="f-section">
            <div className="f-section-title">
              <span>3. Comprovativo de Pagamento e Documentos Anexados</span>
              <span className={`f-badge ${
                candidatura.estadoPagamento === 'Validado' ? 'f-badge-green' :
                candidatura.estadoPagamento === 'Rejeitado' ? 'f-badge-red' : 'f-badge-amber'
              }`}>
                Pagamento: {candidatura.estadoPagamento || 'Pendente de verificação'}
              </span>
            </div>

            {/* DESTAQUE PRINCIPAL: COMPROVATIVO DE PAGAMENTO */}
            <div className="f-comp-box">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11pt' }}>🏦</span>
                  <strong style={{ fontSize: '7.8pt', color: '#166534' }}>
                    Comprovativo de Pagamento da Taxa de Pré-Inscrição ({formatarValor(da.matricula || 4000)})
                  </strong>
                </div>
                <div style={{ fontSize: '6.8pt', color: '#334155' }}>
                  <strong>Banco:</strong> BCI • <strong>Conta:</strong> <code>{contaBCI}</code> • <strong>NIB:</strong> <code>{nibBCI}</code>
                </div>
                <div style={{ fontSize: '6.8pt', color: '#475569', marginTop: '1px' }}>
                  <strong>Ficheiro Anexado:</strong> {compDoc?.nomeFicheiro || docs.comprovativoPagamentoNome || 'comprovativo_pagamento.pdf'} • <strong>Data Envio:</strong> {formatarData(compDoc?.dataUpload || candidatura.dataSubmissao)}
                </div>
              </div>

              {/* MINIATURA OU BADGE DE AUTENTICAÇÃO */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                {compDoc?.url && compDoc.url.startsWith('data:image') ? (
                  <img
                    src={compDoc.url}
                    alt="Miniatura Comprovativo"
                    style={{ height: '42px', maxWidth: '80px', objectFit: 'contain', border: '1px solid #86efac', borderRadius: '3px', background: 'white' }}
                  />
                ) : (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '4px', fontSize: '6.5pt', color: '#15803d', fontWeight: 700 }}>
                    {candidatura.estadoPagamento === 'Validado' ? '✓ Recibo BCI Validado' : '⏳ Comprovativo em Verificação'}
                  </div>
                )}
              </div>
            </div>

            {/* TABELA DE DEMAIS DOCUMENTOS */}
            <table className="f-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Documento</th>
                  <th style={{ width: '37%' }}>Ficheiro Anexado</th>
                  <th style={{ width: '25%' }}>Estado de Recepção</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cópia do Bilhete de Identidade (B.I.)</td>
                  <td>{docs.bi?.nomeFicheiro || docs.biNome || 'Documento carregado no sistema'}</td>
                  <td><span className="f-badge f-badge-green">Apresentado</span></td>
                </tr>
                <tr>
                  <td>Certificado de Habilitações Literárias</td>
                  <td>{docs.certificado?.nomeFicheiro || docs.certificadoNome || 'Certificado submetido'}</td>
                  <td><span className="f-badge f-badge-green">Apresentado</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. OBSERVAÇÕES / DESPACHO SE HOUVER */}
          {candidatura.observacoesAdmin && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 8px', fontSize: '6.8pt', color: '#92400e', borderRadius: '4px', marginBottom: '6px' }}>
              <strong>Despacho da Secretaria:</strong> {candidatura.observacoesAdmin}
            </div>
          )}

          {/* TERMO DE COMPROMISSO E DECLARAÇÃO LEGAL */}
          <div className="f-declaration">
            <strong>Declaração de Veracidade e Compromisso de Honra:</strong> O candidato declara que os dados prestados e documentos anexados correspondem integralmente à verdade. A presente pré-inscrição constitui candidatura para o Ano Lectivo de 2027, sendo a confirmação e matrícula definitivas efectivadas após a validação física dos documentos originais e confirmação bancária pelos Serviços Financeiros do ISPOTEC.
          </div>

          {/* ASSINATURAS */}
          <div className="f-signatures">
            <div>
              <div style={{ height: '28px' }}></div>
              <div className="f-sig-line">O(A) Candidato(a) / Estudante</div>
              <div className="f-sig-sub">Assinatura de Conformidade</div>
            </div>
            <div>
              <div style={{ height: '28px' }}></div>
              <div className="f-sig-line">Serviços Académicos &amp; Secretaria Geral — ISPOTEC</div>
              <div className="f-sig-sub">Prof. Dr. Jacob Massuanganhe • Carimbo Oficial</div>
            </div>
          </div>

          {/* RODAPÉ DO DOCUMENTO */}
          <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '10px', paddingTop: '4px', fontSize: '6pt', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>ISPOTEC — Instituto Superior Politécnico e de Tecnologias (Campus Matola-Rio)</span>
            <span>Documento Oficial de Pré-Inscrição • Processo: {candidatura.numeroCandidatura}</span>
          </div>
        </div>
      )}

      {/* MULTIPLE CANDIDATES LIST (PAUTA) */}
      {isLista && (
        <div className="ficha-print-sheet">
          <div className="f-header">
            <img src={LOGO_ISPOTEC_BASE64} alt="Logótipo ISPOTEC" className="f-logo-img" />
            <div className="f-header-text">
              <h1>Instituto Superior Politécnico e de Tecnologias (ISPOTEC)</h1>
              <h2>Pauta Geral de Pré-Inscrições e Candidaturas — 2027</h2>
              <p>Campus Matola-Rio • Total de Candidatos Selecionados: {listaCandidaturas.length}</p>
            </div>
          </div>

          <table className="f-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>N.º Candidatura</th>
                <th style={{ width: '22%' }}>Nome do Candidato</th>
                <th style={{ width: '13%' }}>B.I. / Telefone</th>
                <th style={{ width: '25%' }}>Curso Pretendido</th>
                <th style={{ width: '12%' }}>Regime/Mod.</th>
                <th style={{ width: '13%' }}>Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {listaCandidaturas.map((c, i) => (
                <tr key={c.id || i}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{c.numeroCandidatura}</td>
                  <td><strong>{c.dadosPessoais?.nome}</strong></td>
                  <td>{c.dadosPessoais?.bi || c.dadosPessoais?.telefonePrincipal}</td>
                  <td>{c.dadosAcademicos?.cursoNome}</td>
                  <td>{c.dadosAcademicos?.regime} / {c.dadosAcademicos?.modalidade}</td>
                  <td>
                    <span className={`f-badge ${
                      c.estadoPagamento === 'Validado' ? 'f-badge-green' :
                      c.estadoPagamento === 'Rejeitado' ? 'f-badge-red' : 'f-badge-amber'
                    }`}>
                      {c.estadoPagamento || 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="f-signatures" style={{ marginTop: '30px' }}>
            <div>
              <div style={{ height: '30px' }}></div>
              <div className="f-sig-line">Responsável pelas Admissões</div>
            </div>
            <div>
              <div style={{ height: '30px' }}></div>
              <div className="f-sig-line">Direcção Pedagógica — ISPOTEC</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
