import React from 'react';

/**
 * Componente de Impressão Oficial A4:
 * 1) Ficha Individual do Processo do Candidato (Dossiê Completo)
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return iso;
    }
  };

  const formatarValor = (val) => {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('pt-MZ') + ' MT';
  };

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
          padding: 2rem 1rem;
        }

        .ficha-print-toolbar {
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          display: flex;
          gap: 1rem;
          align-items: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          margin-bottom: 1.5rem;
          position: sticky;
          top: 1rem;
          z-index: 10;
        }

        .ficha-print-sheet {
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 18mm 18mm 15mm 18mm;
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          color: #1e293b;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 10pt;
          line-height: 1.45;
          box-sizing: border-box;
          position: relative;
        }

        /* HEADER INSTITUCIONAL */
        .f-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 2px solid #003366;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .f-logo-img {
          width: 72px;
          height: 72px;
          object-fit: contain;
        }

        .f-logo-fallback {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          background: linear-gradient(135deg, #003366, #0284c7);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15pt;
        }

        .f-header-text {
          flex: 1;
          text-align: center;
        }

        .f-header-text h1 {
          font-size: 12.5pt;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #003366;
          margin: 0;
          text-transform: uppercase;
        }

        .f-header-text h2 {
          font-size: 10pt;
          font-weight: 700;
          color: #0284c7;
          margin: 3px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .f-header-text p {
          font-size: 7.8pt;
          color: #475569;
          margin: 2px 0 0 0;
        }

        /* PROCESS TITLE BAR */
        .f-title-bar {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-left: 5px solid #003366;
          padding: 7px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .f-title-bar h3 {
          margin: 0;
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
        }

        .f-num-candidatura {
          font-family: monospace;
          font-size: 12pt;
          font-weight: 800;
          color: #003366;
          background: white;
          border: 1px solid #94a3b8;
          padding: 2px 10px;
          border-radius: 4px;
        }

        /* SECTIONS */
        .f-section {
          margin-bottom: 12px;
        }

        .f-section-title {
          font-size: 8.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #003366;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }

        .f-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 14px;
        }

        .f-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px 12px;
        }

        .f-grid-personal {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 14px;
        }

        .f-photo-box {
          width: 105px;
          height: 130px;
          border: 1px dashed #94a3b8;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          overflow: hidden;
          font-size: 7.5pt;
          color: #64748b;
          text-align: center;
          padding: 4px;
        }

        .f-photo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .f-field {
          display: flex;
          flex-direction: column;
          font-size: 8.5pt;
          margin-bottom: 4px;
        }

        .f-label {
          font-size: 7pt;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 1px;
        }

        .f-value {
          color: #0f172a;
          font-weight: 600;
          word-break: break-word;
        }

        .f-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
        }

        .f-badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .f-badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .f-badge-blue  { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
        .f-badge-red   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

        /* TABLES */
        .f-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
          margin-top: 4px;
        }

        .f-table th, .f-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          text-align: left;
        }

        .f-table th {
          background: #f1f5f9;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          font-size: 7.2pt;
        }

        /* AUDIT & SIGNATURES */
        .f-declaration {
          font-size: 7.5pt;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          margin: 14px 0;
          line-height: 1.35;
          border-radius: 4px;
        }

        .f-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 25px;
          text-align: center;
        }

        .f-sig-line {
          border-top: 1px solid #334155;
          padding-top: 4px;
          font-size: 8pt;
          font-weight: 700;
          color: #1e293b;
        }

        .f-sig-sub {
          font-size: 7pt;
          color: #64748b;
        }

        /* WATERMARK / NOTICE */
        .f-notice {
          border: 1px dashed #0284c7;
          background: #f0f9ff;
          padding: 6px 10px;
          font-size: 7.5pt;
          color: #0369a1;
          margin-top: 10px;
          border-radius: 4px;
        }

        /* PRINT STYLES */
        @media print {
          body * {
            visibility: hidden;
          }
          .ficha-print-overlay, .ficha-print-overlay * {
            visibility: visible;
          }
          .ficha-print-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none !important;
            padding: 0 !important;
            backdrop-filter: none !important;
          }
          .ficha-print-toolbar {
            display: none !important;
          }
          .ficha-print-sheet {
            box-shadow: none !important;
            padding: 10mm 15mm !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            page-break-after: always;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="ficha-print-toolbar">
        <button
          onClick={handlePrint}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          🖨️ Imprimir / Guardar como PDF
        </button>
        <button
          onClick={onClose}
          className="btn btn-outline-secondary"
          style={{ fontWeight: 600 }}
        >
          ✕ Fechar
        </button>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Formato otimizado para papel A4 com carimbos e cabeçalho institucional.
        </span>
      </div>

      {/* SINGLE CANDIDATE DOSSIER */}
      {!isLista && candidatura && (
        <div className="ficha-print-sheet">
          {/* HEADER */}
          <div className="f-header">
            <img
              src="/images/logo.png"
              alt="Logótipo ISPOTEC"
              className="f-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="f-logo-fallback" style={{ display: 'none' }}>
              ISP
            </div>

            <div className="f-header-text">
              <h1>Instituto Superior Politécnico e de Tecnologias</h1>
              <h2>ISPOTEC — Direcção Pedagógica e Secretaria Geral</h2>
              <p>
                Rua da Mozal, Paragem Antena, Matola-Rio, Maputo • Contactos: (+258) 878 787 442 / 877 906 666 / 873 045 610
                <br />
                Correio Electrónico: Ispotec.politecnica@gmail.com • Website: ispotec-online.vercel.app
              </p>
            </div>
          </div>

          {/* TITLE BAR */}
          <div className="f-title-bar">
            <div>
              <h3>Ficha de Pré-Inscrição &amp; Processo de Candidatura — 2027</h3>
              <div style={{ fontSize: '7.5pt', color: '#64748b', marginTop: '2px' }}>
                Ano Lectivo de 2027 • Registado em: {formatarData(candidatura.criadoEm || candidatura.dataSubmissao)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '7pt', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                N.º de Candidatura
              </div>
              <div className="f-num-candidatura">{candidatura.numeroCandidatura}</div>
            </div>
          </div>

          {/* ESTADO GERAL */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', background: '#f8fafc', padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <div className="f-field" style={{ margin: 0 }}>
              <span className="f-label">Estado da Candidatura</span>
              <span className={`f-badge ${
                candidatura.estado === 'Aprovada' ? 'f-badge-green' :
                candidatura.estado === 'Rejeitada' ? 'f-badge-red' :
                candidatura.estado === 'Em análise' ? 'f-badge-blue' : 'f-badge-amber'
              }`}>
                {candidatura.estado || 'Submetida'}
              </span>
            </div>
            <div className="f-field" style={{ margin: 0 }}>
              <span className="f-label">Validação Financeira (Taxa de Pré-Inscrição)</span>
              <span className={`f-badge ${
                candidatura.estadoPagamento === 'Validado' ? 'f-badge-green' :
                candidatura.estadoPagamento === 'Rejeitado' ? 'f-badge-red' : 'f-badge-amber'
              }`}>
                {candidatura.estadoPagamento || 'Pendente de verificação'}
              </span>
            </div>
            <div className="f-field" style={{ margin: 0, marginLeft: 'auto', textAlign: 'right' }}>
              <span className="f-label">Natureza do Documento</span>
              <span style={{ fontSize: '7.5pt', fontWeight: 700, color: '#0369a1' }}>
                Comprovativo de Candidatura Provisória (Pré-Inscrição)
              </span>
            </div>
          </div>

          {/* DADOS PESSOAIS */}
          <div className="f-section">
            <div className="f-section-title">
              <span>1. Identificação e Dados Pessoais do Candidato</span>
            </div>

            <div className="f-grid-personal">
              {/* FOTOGRAFIA */}
              <div className="f-photo-box">
                {candidatura.dadosPessoais?.fotoPreview || candidatura.documentos?.fotografia?.url ? (
                  <img
                    src={candidatura.dadosPessoais?.fotoPreview || candidatura.documentos?.fotografia?.url}
                    alt="Foto do Candidato"
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '24pt', color: '#94a3b8' }}>👤</span>
                    <span>Fotografia Tipo Passe</span>
                  </>
                )}
              </div>

              {/* CAMPOS PESSOAIS */}
              <div>
                <div className="f-grid-2">
                  <div className="f-field" style={{ gridColumn: 'span 2' }}>
                    <span className="f-label">Nome Completo do Candidato</span>
                    <span className="f-value" style={{ fontSize: '10pt', color: '#003366' }}>
                      {candidatura.dadosPessoais?.nome || '—'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">N.º do Bilhete de Identidade (B.I.) / Passaporte</span>
                    <span className="f-value">{candidatura.dadosPessoais?.bi || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Data de Nascimento</span>
                    <span className="f-value">{candidatura.dadosPessoais?.dataNascimento || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Telefone Principal</span>
                    <span className="f-value">{candidatura.dadosPessoais?.telefonePrincipal || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Telefone Adicional (1 / 2)</span>
                    <span className="f-value">
                      {[candidatura.dadosPessoais?.telefoneAdicional1, candidatura.dadosPessoais?.telefoneAdicional2]
                        .filter(Boolean)
                        .join(' / ') || 'Nenhum registado'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Província / Município</span>
                    <span className="f-value">
                      {candidatura.dadosPessoais?.provincia || '—'} / {candidatura.dadosPessoais?.distrito || '—'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Bairro / Morada Completa</span>
                    <span className="f-value">
                      {candidatura.dadosPessoais?.bairro ? `${candidatura.dadosPessoais.bairro}, ` : ''}
                      {candidatura.dadosPessoais?.morada || '—'}
                    </span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Encarregado de Educação</span>
                    <span className="f-value">{candidatura.dadosPessoais?.nomeEncarregado || '—'}</span>
                  </div>

                  <div className="f-field">
                    <span className="f-label">Contacto do Encarregado</span>
                    <span className="f-value">{candidatura.dadosPessoais?.contactoEncarregado || '—'}</span>
                  </div>

                  {candidatura.dadosPessoais?.localTrabalho && (
                    <div className="f-field" style={{ gridColumn: 'span 2' }}>
                      <span className="f-label">Local de Trabalho / Ocupação Profissional</span>
                      <span className="f-value">{candidatura.dadosPessoais.localTrabalho}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DADOS ACADÉMICOS E CURSO */}
          <div className="f-section">
            <div className="f-section-title">
              <span>2. Opção de Curso e Habilitações Literárias de Ingresso (2027)</span>
            </div>

            <div className="f-grid-3">
              <div className="f-field" style={{ gridColumn: 'span 2' }}>
                <span className="f-label">Curso Solicitado</span>
                <span className="f-value" style={{ fontSize: '9.5pt', color: '#003366', fontWeight: 800 }}>
                  {candidatura.dadosAcademicos?.cursoNome || '—'}
                </span>
              </div>

              <div className="f-field">
                <span className="f-label">Grau Académico</span>
                <span className="f-value">{candidatura.dadosAcademicos?.grau || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Regime de Frequência</span>
                <span className="f-value">{candidatura.dadosAcademicos?.regime || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Modalidade de Ensino</span>
                <span className="f-value">{candidatura.dadosAcademicos?.modalidade || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Nível Académico de Ingresso</span>
                <span className="f-value">{candidatura.dadosAcademicos?.nivelIngresso || '—'}</span>
              </div>

              <div className="f-field" style={{ gridColumn: 'span 2' }}>
                <span className="f-label">Instituição de Ensino de Proveniência</span>
                <span className="f-value">{candidatura.dadosAcademicos?.instituicaoProveniencia || '—'}</span>
              </div>

              <div className="f-field">
                <span className="f-label">Ano de Conclusão</span>
                <span className="f-value">{candidatura.dadosAcademicos?.anoConclusao || '—'}</span>
              </div>
            </div>

            {/* ENQUADRAMENTO FINANCEIRO */}
            <div style={{ marginTop: '6px', background: '#f1f5f9', padding: '6px 10px', borderRadius: '4px', display: 'flex', gap: '20px', fontSize: '8pt' }}>
              <div>
                <strong>Propina Mensal Prevista:</strong>{' '}
                <span style={{ color: '#003366', fontWeight: 700 }}>
                  {formatarValor(candidatura.dadosAcademicos?.propinaMensal)}
                </span>
              </div>
              <div>
                <strong>Inscrição / Matrícula:</strong>{' '}
                <span style={{ color: '#003366', fontWeight: 700 }}>
                  {formatarValor(candidatura.dadosAcademicos?.matricula)}
                </span>
              </div>
              <div>
                <strong>Duração Curricular:</strong> {candidatura.dadosAcademicos?.duracao || 'Conforme plano de estudos'}
              </div>
            </div>
          </div>

          {/* DOCUMENTOS APRESENTADOS */}
          <div className="f-section">
            <div className="f-section-title">
              <span>3. Documentos Submetidos no Processo</span>
            </div>

            <table className="f-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Documento</th>
                  <th style={{ width: '30%' }}>Nome do Ficheiro</th>
                  <th style={{ width: '20%' }}>Data de Envio</th>
                  <th style={{ width: '15%' }}>Conformidade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Comprovativo de Pagamento (Taxa)</strong></td>
                  <td>{candidatura.documentos?.comprovativoPagamento?.nomeFicheiro || 'Anexo carregado'}</td>
                  <td>{formatarData(candidatura.documentos?.comprovativoPagamento?.dataUpload || candidatura.criadoEm)}</td>
                  <td>
                    <span className={`f-badge ${
                      candidatura.estadoPagamento === 'Validado' ? 'f-badge-green' :
                      candidatura.estadoPagamento === 'Rejeitado' ? 'f-badge-red' : 'f-badge-amber'
                    }`}>
                      {candidatura.estadoPagamento || 'Pendente'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Cópia do Bilhete de Identidade (B.I.)</td>
                  <td>{candidatura.documentos?.bi?.nomeFicheiro || (candidatura.documentos?.bi ? 'Anexo disponível' : 'Não anexado')}</td>
                  <td>{formatarData(candidatura.documentos?.bi?.dataUpload || candidatura.criadoEm)}</td>
                  <td>{candidatura.documentos?.bi ? 'Apresentado' : 'Pendente'}</td>
                </tr>
                <tr>
                  <td>Certificado de Habilitações Literárias</td>
                  <td>{candidatura.documentos?.certificado?.nomeFicheiro || (candidatura.documentos?.certificado ? 'Anexo disponível' : 'Não anexado')}</td>
                  <td>{formatarData(candidatura.documentos?.certificado?.dataUpload || candidatura.criadoEm)}</td>
                  <td>{candidatura.documentos?.certificado ? 'Apresentado' : 'Pendente'}</td>
                </tr>
                <tr>
                  <td>Fotografia Tipo Passe</td>
                  <td>{candidatura.documentos?.fotografia?.nomeFicheiro || (candidatura.dadosPessoais?.fotoPreview ? 'Imagem carregada' : 'Pendente')}</td>
                  <td>{formatarData(candidatura.criadoEm)}</td>
                  <td>{candidatura.dadosPessoais?.fotoPreview || candidatura.documentos?.fotografia ? 'Apresentada' : 'Pendente'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* OBSERVAÇÕES ADMINISTRATIVAS */}
          {candidatura.observacoesAdmin && (
            <div className="f-section">
              <div className="f-section-title">
                <span>4. Despacho / Observações dos Serviços Académicos</span>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '6px 10px', fontSize: '8pt', color: '#92400e', borderRadius: '4px' }}>
                {candidatura.observacoesAdmin}
              </div>
            </div>
          )}

          {/* TERMO DE RESPONSABILIDADE */}
          <div className="f-declaration">
            <strong>Declaração de Veracidade e Advertência Legal:</strong> O candidato declara, sob compromisso de honra, que todas as informações prestadas e os documentos submetidos nesta pré-inscrição correspondem rigorosamente à verdade. Tem conhecimento de que a presente pré-inscrição confere apenas o direito de candidatura para o Ano Académico de 2027, ficando a admissão e matrícula definitivas sujeitas à verificação documental e cumprimento dos requisitos previstos no Regulamento Pedagógico do ISPOTEC.
          </div>

          {/* ASSINATURAS */}
          <div className="f-signatures">
            <div>
              <div style={{ height: '40px' }}></div>
              <div className="f-sig-line">Assinatura do(a) Candidato(a)</div>
              <div className="f-sig-sub">Data: _____ / _____ / 202___</div>
            </div>
            <div>
              <div style={{ height: '40px' }}></div>
              <div className="f-sig-line">Serviços Académicos &amp; Secretaria Geral — ISPOTEC</div>
              <div className="f-sig-sub">Carimbo e Visto Institucional</div>
            </div>
          </div>

          {/* RODAPÉ DO DOCUMENTO */}
          <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '20px', paddingTop: '6px', fontSize: '6.8pt', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>ISPOTEC Online — Sistema Integrado de Gestão Académica (Matola-Rio)</span>
            <span>Documento processado por computador • Código: {candidatura.numeroCandidatura}</span>
          </div>
        </div>
      )}

      {/* MULTIPLE CANDIDATES LIST (PAUTA) */}
      {isLista && (
        <div className="ficha-print-sheet">
          {/* HEADER */}
          <div className="f-header">
            <div className="f-header-text">
              <h1>Instituto Superior Politécnico e de Tecnologias (ISPOTEC)</h1>
              <h2>Pauta Geral de Pré-Inscrições e Candidaturas — 2027</h2>
              <p>Rua da Mozal, Paragem Antena, Matola-Rio, Maputo • Total de Candidatos Selecionados: {listaCandidaturas.length}</p>
            </div>
          </div>

          <table className="f-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>N.º Candidatura</th>
                <th style={{ width: '22%' }}>Nome do Candidato</th>
                <th style={{ width: '12%' }}>B.I. / Telefone</th>
                <th style={{ width: '24%' }}>Curso Pretendido</th>
                <th style={{ width: '10%' }}>Regime/Mod.</th>
                <th style={{ width: '10%' }}>Pagamento</th>
                <th style={{ width: '10%' }}>Estado</th>
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
                  <td>
                    <span className={`f-badge ${
                      c.estado === 'Aprovada' ? 'f-badge-green' :
                      c.estado === 'Rejeitada' ? 'f-badge-red' :
                      c.estado === 'Em análise' ? 'f-badge-blue' : 'f-badge-amber'
                    }`}>
                      {c.estado || 'Submetida'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="f-signatures" style={{ marginTop: '40px' }}>
            <div>
              <div style={{ height: '40px' }}></div>
              <div className="f-sig-line">Responsável pelas Admissões</div>
            </div>
            <div>
              <div style={{ height: '40px' }}></div>
              <div className="f-sig-line">Direcção Pedagógica — ISPOTEC</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
