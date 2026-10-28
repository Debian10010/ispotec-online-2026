import React, { useState, useEffect } from 'react';
import {
  candidaturaService,
  ESTADOS_CANDIDATURA,
  ESTADOS_PAGAMENTO,
  NIVEIS_INGRESSO,
  PROVINCIAS_MOCAMBIQUE,
  OFERTA_FORMATIVA_ISPOTEC_2027
} from '../../services/candidaturaService';
import FichaCandidatoPrint from '../../components/FichaCandidatoPrint';
import ReciboPagamentoPrint from '../../components/ReciboPagamentoPrint';

export default function GestaoPreInscricoes() {
  const [candidaturas, setCandidaturas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submetidas: 0,
    emAnalise: 0,
    aguardandoDocs: 0,
    aguardandoPagamento: 0,
    pagamentoValidado: 0,
    aprovadas: 0,
    rejeitadas: 0
  });

  const [filtros, setFiltros] = useState({
    termo: '',
    grau: '',
    cursoId: '',
    estado: '',
    estadoPagamento: '',
    regime: '',
    modalidade: ''
  });

  // Modais de Visualização e Impressão
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [candidaturaParaImprimir, setCandidaturaParaImprimir] = useState(null);
  const [candidaturaParaRecibo, setCandidaturaParaRecibo] = useState(null);
  const [imprimirPautaGeral, setImprimirPautaGeral] = useState(false);

  // Modal de Edição de Candidato
  const [candidaturaEmEdicao, setCandidaturaEmEdicao] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Modal de Visualização de Documento (Lightbox)
  const [docParaVisualizar, setDocParaVisualizar] = useState(null);

  // Estados dos modais de acção
  const [modalAcao, setModalAcao] = useState(null); // 'aprovar' | 'rejeitar' | 'validar-pagamento' | 'rejeitar-pagamento' | 'solicitar-docs' | 'confirmar-completo'
  const [observacaoAcao, setObservacaoAcao] = useState('');
  const [processandoAcao, setProcessandoAcao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    const lista = await candidaturaService.listarCandidaturas(filtros);
    setCandidaturas(lista);
    const s = await candidaturaService.getEstatisticas();
    setStats(s);
  };

  const limparFiltros = () => {
    setFiltros({
      termo: '',
      grau: '',
      cursoId: '',
      estado: '',
      estadoPagamento: '',
      regime: '',
      modalidade: ''
    });
  };

  // Abrir modal de edição com cópia profunda
  const iniciarEdicao = (cand) => {
    setCandidaturaEmEdicao(JSON.parse(JSON.stringify(cand)));
  };

  // Salvar alterações de edição
  const salvarEdicao = async (e) => {
    e.preventDefault();
    if (!candidaturaEmEdicao) return;
    setSalvandoEdicao(true);

    try {
      const atualizado = await candidaturaService.atualizarDadosCompletos(
        candidaturaEmEdicao.id,
        candidaturaEmEdicao,
        'Administrador'
      );
      setCandidaturaEmEdicao(null);
      if (candidaturaSelecionada && candidaturaSelecionada.id === atualizado.id) {
        setCandidaturaSelecionada(atualizado);
      }
      await carregarDados();
      alert('Informações do candidato atualizadas com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Confirmar pré-inscrição e abrir recibo
  const handleConfirmarPreInscricao = async (cand) => {
    const confirmacao = window.confirm(
      `Deseja confirmar a pré-inscrição de ${cand.dadosPessoais?.nome}? Isto validará o pagamento, aprovará a candidatura e emitirá o recibo oficial.`
    );
    if (!confirmacao) return;

    try {
      const atualizado = await candidaturaService.confirmarPreInscricao(
        cand.id,
        'Pré-inscrição confirmada pelo Administrador.',
        'Administrador'
      );
      await carregarDados();
      if (candidaturaSelecionada && candidaturaSelecionada.id === atualizado.id) {
        setCandidaturaSelecionada(atualizado);
      }
      // Imediatamente abre o recibo para download
      setCandidaturaParaRecibo(atualizado);
    } catch (err) {
      alert('Erro ao confirmar: ' + err.message);
    }
  };

  // Executar acções de aprovação / validação
  const executarAcao = async () => {
    if (!candidaturaSelecionada || !modalAcao) return;
    setProcessandoAcao(true);

    try {
      let atualizado = null;
      if (modalAcao === 'aprovar') {
        atualizado = await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'Aprovada',
          observacaoAcao || 'Candidatura aprovada pelos Serviços Académicos.'
        );
      } else if (modalAcao === 'confirmar-completo') {
        atualizado = await candidaturaService.confirmarPreInscricao(
          candidaturaSelecionada.id,
          observacaoAcao || 'Pré-inscrição confirmada e validada.',
          'Administrador'
        );
        setCandidaturaParaRecibo(atualizado);
      } else if (modalAcao === 'rejeitar') {
        atualizado = await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'Rejeitada',
          observacaoAcao || 'Candidatura indeferida por não preencher os requisitos.'
        );
      } else if (modalAcao === 'solicitar-docs') {
        atualizado = await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'A aguardar documentos',
          observacaoAcao || 'Por favor, regularize os documentos pendentes.'
        );
      } else if (modalAcao === 'validar-pagamento') {
        atualizado = await candidaturaService.atualizarEstadoPagamento(
          candidaturaSelecionada.id,
          'Validado',
          observacaoAcao || 'Comprovativo de pagamento verificado e creditado.'
        );
      } else if (modalAcao === 'rejeitar-pagamento') {
        atualizado = await candidaturaService.atualizarEstadoPagamento(
          candidaturaSelecionada.id,
          'Rejeitado',
          observacaoAcao || 'Comprovativo inválido ou valor não identificado em conta.'
        );
      }

      setCandidaturaSelecionada(atualizado);
      setModalAcao(null);
      setObservacaoAcao('');
      await carregarDados();
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setProcessandoAcao(false);
    }
  };

  return (
    <div className="gestao-candidaturas-page" style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      <style>{`
        .gpi-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .gpi-stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          border-left: 4px solid #003366;
        }

        .gpi-stat-val {
          font-size: 1.85rem;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.2;
        }

        .gpi-stat-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 0.35rem;
        }

        /* FILTERS */
        .gpi-filter-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }

        .gpi-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 0.85rem;
          margin-top: 0.75rem;
        }

        /* TABLE */
        .gpi-table-wrap {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow-x: auto;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .gpi-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.86rem;
        }

        .gpi-table th {
          background: #f8fafc;
          padding: 0.85rem 1rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .gpi-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .gpi-table tr:hover td {
          background: #f8fafc;
        }

        /* BADGES */
        .gpi-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .gpi-badge-green { background: #dcfce7; color: #166534; }
        .gpi-badge-amber { background: #fef3c7; color: #92400e; }
        .gpi-badge-blue  { background: #e0f2fe; color: #075985; }
        .gpi-badge-red   { background: #fee2e2; color: #991b1b; }

        /* MODAL */
        .gpi-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .gpi-modal-card {
          background: white;
          width: 100%;
          max-width: 960px;
          max-height: 92vh;
          border-radius: 14px;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
        }

        .gpi-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .gpi-modal-body {
          padding: 1.5rem;
          flex: 1;
        }

        .gpi-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          position: sticky;
          bottom: 0;
          z-index: 5;
        }

        /* DOC CARDS */
        .gpi-doc-card {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.85rem;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s;
        }
        .gpi-doc-card:hover {
          border-color: #0284c7;
          background: #f0f9ff;
        }
      `}</style>

      {/* IMPRESSÃO A4 DO DOSSIÊ DO PROCESSO */}
      {candidaturaParaImprimir && (
        <FichaCandidatoPrint
          candidatura={candidaturaParaImprimir}
          onClose={() => setCandidaturaParaImprimir(null)}
        />
      )}

      {/* IMPRESSÃO DO RECIBO OFICIAL DE PAGAMENTO */}
      {candidaturaParaRecibo && (
        <ReciboPagamentoPrint
          candidatura={candidaturaParaRecibo}
          onClose={() => setCandidaturaParaRecibo(null)}
        />
      )}

      {/* IMPRESSÃO DA PAUTA GERAL */}
      {imprimirPautaGeral && (
        <FichaCandidatoPrint
          listaCandidaturas={candidaturas}
          onClose={() => setImprimirPautaGeral(false)}
        />
      )}

      {/* HEADER DA PÁGINA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#003366', margin: 0 }}>
            🏛️ Gestão de Pré-Inscrições &amp; Candidaturas 2027
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            ISPOTEC — Análise de processos, edição de dados, validação de comprovativos e emissão de recibos.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* EXPORTAR EXCEL */}
          <button
            type="button"
            className="btn btn-success"
            style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => candidaturaService.exportarExcel(candidaturas, 'pre_inscricoes_ispotec_2027.xls')}
            disabled={candidaturas.length === 0}
          >
            📊 Exportar para Excel (.xls)
          </button>

          {/* IMPRIMIR PAUTA */}
          <button
            type="button"
            className="btn btn-outline-primary"
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setImprimirPautaGeral(true)}
            disabled={candidaturas.length === 0}
          >
            🖨️ Imprimir Pauta ({candidaturas.length})
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="gpi-stat-grid">
        <div className="gpi-stat-card">
          <div className="gpi-stat-val">{stats.total}</div>
          <div className="gpi-stat-label">Total Candidaturas</div>
        </div>
        <div className="gpi-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="gpi-stat-val" style={{ color: '#d97706' }}>{stats.aguardandoPagamento}</div>
          <div className="gpi-stat-label">Pagamentos Pendentes</div>
        </div>
        <div className="gpi-stat-card" style={{ borderLeftColor: '#0284c7' }}>
          <div className="gpi-stat-val" style={{ color: '#0284c7' }}>{stats.emAnalise + stats.submetidas}</div>
          <div className="gpi-stat-label">Em Análise / Submetidas</div>
        </div>
        <div className="gpi-stat-card" style={{ borderLeftColor: '#16a34a' }}>
          <div className="gpi-stat-val" style={{ color: '#16a34a' }}>{stats.aprovadas}</div>
          <div className="gpi-stat-label">Candidaturas Aprovadas</div>
        </div>
        <div className="gpi-stat-card" style={{ borderLeftColor: '#dc2626' }}>
          <div className="gpi-stat-val" style={{ color: '#dc2626' }}>{stats.rejeitadas}</div>
          <div className="gpi-stat-label">Rejeitadas</div>
        </div>
      </div>

      {/* BARRA DE FILTROS E PESQUISA */}
      <div className="gpi-filter-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#003366', textTransform: 'uppercase' }}>
            Filtros de Candidatura
          </span>
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none"
            onClick={limparFiltros}
            style={{ fontSize: '0.8rem', color: '#64748b' }}
          >
            Limpar Filtros
          </button>
        </div>

        <input
          type="text"
          className="form-control"
          placeholder="🔎 Pesquisar por Nome, N.º de Candidatura, B.I. ou Telefone..."
          value={filtros.termo}
          onChange={(e) => setFiltros(f => ({ ...f, termo: e.target.value }))}
          style={{ width: '100%', marginBottom: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
        />

        <div className="gpi-filter-grid">
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Grau</label>
            <select
              className="form-select form-select-sm"
              value={filtros.grau}
              onChange={(e) => setFiltros(f => ({ ...f, grau: e.target.value }))}
            >
              <option value="">Todos os Graus</option>
              <option value="Mestrado">Mestrado</option>
              <option value="Licenciatura">Licenciatura</option>
              <option value="Pós-graduação">Pós-graduação</option>
              <option value="Especialização">Especialização</option>
              <option value="Curta Duração">Curta Duração</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Estado da Candidatura</label>
            <select
              className="form-select form-select-sm"
              value={filtros.estado}
              onChange={(e) => setFiltros(f => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos os Estados</option>
              {ESTADOS_CANDIDATURA.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Estado do Pagamento</label>
            <select
              className="form-select form-select-sm"
              value={filtros.estadoPagamento}
              onChange={(e) => setFiltros(f => ({ ...f, estadoPagamento: e.target.value }))}
            >
              <option value="">Todos os Pagamentos</option>
              {ESTADOS_PAGAMENTO.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Regime</label>
            <select
              className="form-select form-select-sm"
              value={filtros.regime}
              onChange={(e) => setFiltros(f => ({ ...f, regime: e.target.value }))}
            >
              <option value="">Todos os Regimes</option>
              <option value="Laboral">Laboral</option>
              <option value="Pós-laboral">Pós-laboral</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Modalidade</label>
            <select
              className="form-select form-select-sm"
              value={filtros.modalidade}
              onChange={(e) => setFiltros(f => ({ ...f, modalidade: e.target.value }))}
            >
              <option value="">Todas as Modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Semi-presencial">Semi-presencial</option>
              <option value="Distância (Online)">Distância (Online)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELA DE CANDIDATURAS */}
      <div className="gpi-table-wrap">
        <table className="gpi-table">
          <thead>
            <tr>
              <th>N.º Candidatura</th>
              <th>Candidato</th>
              <th>Curso Pretendido</th>
              <th>Regime / Modalidade</th>
              <th>Pagamento</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Ações Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {candidaturas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Nenhuma candidatura encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              candidaturas.map(c => {
                const podeRecibo = c.estado === 'Aprovada' || c.estadoPagamento === 'Validado';
                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#003366' }}>
                      {c.numeroCandidatura}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.dadosPessoais?.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        B.I.: {c.dadosPessoais?.bi} • 📞 {c.dadosPessoais?.telefonePrincipal}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.dadosAcademicos?.cursoNome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.dadosAcademicos?.grau}</div>
                    </td>
                    <td>
                      <div>{c.dadosAcademicos?.regime}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.dadosAcademicos?.modalidade}</div>
                    </td>
                    <td>
                      <span className={`gpi-badge ${
                        c.estadoPagamento === 'Validado' ? 'gpi-badge-green' :
                        c.estadoPagamento === 'Rejeitado' ? 'gpi-badge-red' : 'gpi-badge-amber'
                      }`}>
                        {c.estadoPagamento}
                      </span>
                    </td>
                    <td>
                      <span className={`gpi-badge ${
                        c.estado === 'Aprovada' ? 'gpi-badge-green' :
                        c.estado === 'Rejeitada' ? 'gpi-badge-red' :
                        c.estado === 'Em análise' ? 'gpi-badge-blue' : 'gpi-badge-amber'
                      }`}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* VER DETALHES */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          title="Ver Processo Completo"
                          onClick={() => setCandidaturaSelecionada(c)}
                        >
                          👁️ Ver
                        </button>

                        {/* EDITAR */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning"
                          title="Editar Dados do Estudante"
                          onClick={() => iniciarEdicao(c)}
                        >
                          ✏️ Editar
                        </button>

                        {/* CONFIRMAR PRÉ-INSCRIÇÃO SE PENDENTE */}
                        {!podeRecibo ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            title="Confirmar Pré-Inscrição & Emitir Recibo"
                            onClick={() => handleConfirmarPreInscricao(c)}
                          >
                            ✅ Confirmar
                          </button>
                        ) : (
                          <>
                            {/* BAIXAR RECIBO */}
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              title="Baixar Recibo de Pagamento (PDF)"
                              onClick={() => setCandidaturaParaRecibo(c)}
                            >
                              🧾 Recibo
                            </button>

                            {/* PARTILHAR WHATSAPP */}
                            <a
                              href={candidaturaService.gerarLinkWhatsApp(c)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-outline-success"
                              title="Partilhar Recibo via WhatsApp"
                            >
                              💬
                            </a>
                          </>
                        )}

                        {/* IMPRIMIR PROCESSO A4 */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          title="Imprimir Ficha Completa do Processo A4"
                          onClick={() => setCandidaturaParaImprimir(c)}
                        >
                          🖨️ Ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MODAL 1: INSPEÇÃO DETALHADA E GESTÃO DE DOCUMENTOS
          ======================================================== */}
      {candidaturaSelecionada && (
        <div className="gpi-modal-backdrop" onClick={() => setCandidaturaSelecionada(null)}>
          <div className="gpi-modal-card" onClick={e => e.stopPropagation()}>
            {/* CABEÇALHO */}
            <div className="gpi-modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003366', textTransform: 'uppercase' }}>
                  Processo Individual de Pré-Inscrição 2027
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {candidaturaSelecionada.dadosPessoais?.nome} — {candidaturaSelecionada.numeroCandidatura}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => iniciarEdicao(candidaturaSelecionada)}
                >
                  ✏️ Editar Dados
                </button>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCandidaturaSelecionada(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* CORPO DO PROCESSO */}
            <div className="gpi-modal-body">
              {/* STATUS ROW */}
              <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Estado Geral</div>
                  <span className={`gpi-badge ${
                    candidaturaSelecionada.estado === 'Aprovada' ? 'gpi-badge-green' :
                    candidaturaSelecionada.estado === 'Rejeitada' ? 'gpi-badge-red' :
                    candidaturaSelecionada.estado === 'Em análise' ? 'gpi-badge-blue' : 'gpi-badge-amber'
                  }`}>
                    {candidaturaSelecionada.estado}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Validação Financeira</div>
                  <span className={`gpi-badge ${
                    candidaturaSelecionada.estadoPagamento === 'Validado' ? 'gpi-badge-green' :
                    candidaturaSelecionada.estadoPagamento === 'Rejeitado' ? 'gpi-badge-red' : 'gpi-badge-amber'
                  }`}>
                    {candidaturaSelecionada.estadoPagamento}
                  </span>
                </div>

                {candidaturaSelecionada.recibo?.numeroRecibo && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Recibo Emitido</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>
                      {candidaturaSelecionada.recibo.numeroRecibo}
                    </span>
                  </div>
                )}

                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Data de Entrada</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {new Date(candidaturaSelecionada.criadoEm || candidaturaSelecionada.dataSubmissao).toLocaleDateString('pt-MZ', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* DADOS PESSOAIS E FOTO */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '120px',
                  height: '145px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {candidaturaSelecionada.dadosPessoais?.fotoPreview || candidaturaSelecionada.documentos?.fotografia?.url ? (
                    <img
                      src={candidaturaSelecionada.dadosPessoais?.fotoPreview || candidaturaSelecionada.documentos?.fotografia?.url}
                      alt="Foto"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '2.5rem', color: '#94a3b8' }}>👤</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem 1rem', fontSize: '0.85rem' }}>
                  <div><strong>Nome Completo:</strong> {candidaturaSelecionada.dadosPessoais?.nome}</div>
                  <div><strong>B.I. / Passaporte:</strong> {candidaturaSelecionada.dadosPessoais?.bi}</div>
                  <div><strong>Nascimento:</strong> {candidaturaSelecionada.dadosPessoais?.dataNascimento}</div>
                  <div><strong>Telefone Principal:</strong> {candidaturaSelecionada.dadosPessoais?.telefonePrincipal}</div>
                  <div>
                    <strong>Telefones Adicionais:</strong>{' '}
                    {[candidaturaSelecionada.dadosPessoais?.telefoneAdicional1, candidaturaSelecionada.dadosPessoais?.telefoneAdicional2]
                      .filter(Boolean)
                      .join(' / ') || 'Nenhum'}
                  </div>
                  <div><strong>Província / Distrito:</strong> {candidaturaSelecionada.dadosPessoais?.provincia} / {candidaturaSelecionada.dadosPessoais?.distrito}</div>
                  <div><strong>Bairro / Morada:</strong> {candidaturaSelecionada.dadosPessoais?.bairro ? `${candidaturaSelecionada.dadosPessoais.bairro}, ` : ''}{candidaturaSelecionada.dadosPessoais?.morada}</div>
                  <div><strong>Encarregado:</strong> {candidaturaSelecionada.dadosPessoais?.nomeEncarregado} ({candidaturaSelecionada.dadosPessoais?.contactoEncarregado})</div>
                  <div><strong>Local de Trabalho:</strong> {candidaturaSelecionada.dadosPessoais?.localTrabalho || 'Não informado'}</div>
                </div>
              </div>

              {/* CURSO SELECIONADO */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#003366', fontSize: '0.92rem', fontWeight: 800 }}>
                  🎓 Dados Académicos do Ingresso
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div><strong>Curso:</strong> {candidaturaSelecionada.dadosAcademicos?.cursoNome}</div>
                  <div><strong>Grau Académico:</strong> {candidaturaSelecionada.dadosAcademicos?.grau}</div>
                  <div><strong>Regime:</strong> {candidaturaSelecionada.dadosAcademicos?.regime}</div>
                  <div><strong>Modalidade:</strong> {candidaturaSelecionada.dadosAcademicos?.modalidade}</div>
                  <div><strong>Nível de Ingresso:</strong> {candidaturaSelecionada.dadosAcademicos?.nivelIngresso}</div>
                  <div><strong>Proveniência:</strong> {candidaturaSelecionada.dadosAcademicos?.instituicaoProveniencia || '—'}</div>
                  <div><strong>Ano Conclusão:</strong> {candidaturaSelecionada.dadosAcademicos?.anoConclusao || '—'}</div>
                  <div><strong>Propina Mensal:</strong> {candidaturaSelecionada.dadosAcademicos?.propinaMensal ? `${Number(candidaturaSelecionada.dadosAcademicos.propinaMensal).toLocaleString('pt-MZ')} MT` : '—'}</div>
                  <div><strong>Taxa de Matrícula:</strong> {candidaturaSelecionada.dadosAcademicos?.matricula ? `${Number(candidaturaSelecionada.dadosAcademicos.matricula).toLocaleString('pt-MZ')} MT` : '—'}</div>
                </div>
              </div>

              {/* DOCUMENTOS ANEXADOS PELO ESTUDANTE (COM VISUALIZAÇÃO E DOWNLOAD) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#003366', fontSize: '0.92rem', fontWeight: 800 }}>
                    📎 Documentos Anexados pelo Estudante
                  </h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    style={{ fontWeight: 700 }}
                    onClick={() => candidaturaService.baixarTodosDocumentos(candidaturaSelecionada)}
                  >
                    ⬇️ Descarregar Todos os Documentos
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {candidaturaService.obterDocumentosCandidatura(candidaturaSelecionada).map(doc => (
                    <div key={doc.id} className="gpi-doc-card">
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#003366', marginBottom: '0.25rem' }}>
                          {doc.titulo}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                          📄 {doc.nomeFicheiro}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '0.75rem', flex: 1 }}
                          onClick={() => setDocParaVisualizar({ doc, cand: candidaturaSelecionada })}
                        >
                          👁️ Ver
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.75rem', flex: 1, fontWeight: 700 }}
                          onClick={() => candidaturaService.baixarDocumento(doc, candidaturaSelecionada)}
                        >
                          ⬇️ Baixar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HISTÓRICO DE AUDITORIA */}
              {candidaturaSelecionada.historico && candidaturaSelecionada.historico.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#003366', fontSize: '0.85rem', fontWeight: 800 }}>
                    🕒 Histórico de Auditoria &amp; Despachos
                  </h4>
                  <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {candidaturaSelecionada.historico.map((h, i) => (
                      <div key={i} style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                        <strong>{new Date(h.data).toLocaleString('pt-MZ')}:</strong> {h.acao} — <em>{h.observacao}</em> ({h.autor})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ DO MODAL COM ACÇÕES COMPLETAS */}
            <div className="gpi-modal-footer">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* BOTÃO MÁGICO DE CONFIRMAÇÃO & RECIBO */}
                {candidaturaSelecionada.estado !== 'Aprovada' || candidaturaSelecionada.estadoPagamento !== 'Validado' ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    style={{ fontWeight: 800 }}
                    onClick={() => {
                      setModalAcao('confirmar-completo');
                      setObservacaoAcao('Pré-inscrição validada e confirmada pelos Serviços Académicos.');
                    }}
                  >
                    ✅ Confirmar Pré-Inscrição &amp; Emitir Recibo
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      style={{ fontWeight: 800 }}
                      onClick={() => setCandidaturaParaRecibo(candidaturaSelecionada)}
                    >
                      🧾 Descarregar Recibo (PDF)
                    </button>
                    <a
                      href={candidaturaService.gerarLinkWhatsApp(candidaturaSelecionada)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-success"
                      style={{ fontWeight: 700 }}
                    >
                      💬 Partilhar via WhatsApp
                    </a>
                  </>
                )}

                {/* INDEFERIR */}
                {candidaturaSelecionada.estado !== 'Rejeitada' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setModalAcao('rejeitar');
                      setObservacaoAcao('Candidatura indeferida por não preencher os requisitos.');
                    }}
                  >
                    ❌ Indeferir
                  </button>
                )}

                {/* PEDIR DOCUMENTOS */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => {
                    setModalAcao('solicitar-docs');
                    setObservacaoAcao('Favor regularizar os documentos pendentes.');
                  }}
                >
                  ⚠️ Pedir Documentos
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setCandidaturaParaImprimir(candidaturaSelecionada)}
                >
                  🖨️ Imprimir Processo A4
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setCandidaturaSelecionada(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIÇÃO COMPLETA DAS INFORMAÇÕES DO ESTUDANTE
          ======================================================== */}
      {candidaturaEmEdicao && (
        <div className="gpi-modal-backdrop" onClick={() => setCandidaturaEmEdicao(null)}>
          <div className="gpi-modal-card" onClick={e => e.stopPropagation()}>
            <div className="gpi-modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003366', textTransform: 'uppercase' }}>
                  Edição Administrativa do Candidato
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                  Editar: {candidaturaEmEdicao.dadosPessoais?.nome} ({candidaturaEmEdicao.numeroCandidatura})
                </h2>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setCandidaturaEmEdicao(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={salvarEdicao}>
              <div className="gpi-modal-body">
                {/* 1. DADOS PESSOAIS */}
                <h4 style={{ color: '#003366', fontSize: '0.92rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '12px' }}>
                  1. Dados Pessoais &amp; Contactos
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.nome || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, nome: e.target.value }
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>N.º de B.I. / Passaporte *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.bi || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, bi: e.target.value }
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Data de Nascimento *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.dataNascimento || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, dataNascimento: e.target.value }
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Telefone Principal *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.telefonePrincipal || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, telefonePrincipal: e.target.value }
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Telefone Adicional 1</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.telefoneAdicional1 || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, telefoneAdicional1: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Telefone Adicional 2</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.telefoneAdicional2 || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, telefoneAdicional2: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Província</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.provincia || 'Maputo Província'}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, provincia: e.target.value }
                      }))}
                    >
                      {PROVINCIAS_MOCAMBIQUE.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Distrito / Município</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.distrito || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, distrito: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Bairro / Localidade</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.bairro || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, bairro: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Morada Completa</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.morada || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, morada: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nome do Encarregado</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.nomeEncarregado || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, nomeEncarregado: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Contacto do Encarregado</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.contactoEncarregado || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, contactoEncarregado: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Local de Trabalho / Ocupação</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosPessoais?.localTrabalho || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosPessoais: { ...p.dadosPessoais, localTrabalho: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                {/* 2. DADOS ACADÉMICOS */}
                <h4 style={{ color: '#003366', fontSize: '0.92rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '12px' }}>
                  2. Curso &amp; Habilitações de Ingresso
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Curso Pretendido *</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.cursoId || ''}
                      onChange={e => {
                        const curso = OFERTA_FORMATIVA_ISPOTEC_2027.find(c => c.id === e.target.value);
                        if (curso) {
                          setCandidaturaEmEdicao(p => ({
                            ...p,
                            dadosAcademicos: {
                              ...p.dadosAcademicos,
                              cursoId: curso.id,
                              cursoNome: curso.nome,
                              grau: curso.grau,
                              duracao: curso.duracao,
                              propinaMensal: curso.propinaMensal,
                              matricula: curso.matricula
                            }
                          }));
                        }
                      }}
                    >
                      {OFERTA_FORMATIVA_ISPOTEC_2027.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.grau})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Regime *</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.regime || 'Laboral'}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosAcademicos: { ...p.dadosAcademicos, regime: e.target.value }
                      }))}
                    >
                      <option value="Laboral">Laboral</option>
                      <option value="Pós-laboral">Pós-laboral</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Modalidade *</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.modalidade || 'Presencial'}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosAcademicos: { ...p.dadosAcademicos, modalidade: e.target.value }
                      }))}
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Semi-presencial">Semi-presencial</option>
                      <option value="Distância (Online)">Distância (Online)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Nível Académico de Ingresso</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.nivelIngresso || '12.ª Classe'}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosAcademicos: { ...p.dadosAcademicos, nivelIngresso: e.target.value }
                      }))}
                    >
                      {NIVEIS_INGRESSO.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Instituição de Proveniência</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.instituicaoProveniencia || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosAcademicos: { ...p.dadosAcademicos, instituicaoProveniencia: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ano de Conclusão</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.dadosAcademicos?.anoConclusao || 2025}
                      onChange={e => setCandidaturaEmEdicao(p => ({
                        ...p,
                        dadosAcademicos: { ...p.dadosAcademicos, anoConclusao: Number(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                {/* 3. ESTADOS ADMINISTRATIVOS */}
                <h4 style={{ color: '#003366', fontSize: '0.92rem', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '12px' }}>
                  3. Decisão &amp; Validação Administrativa
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Estado da Candidatura</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.estado || 'Submetida'}
                      onChange={e => setCandidaturaEmEdicao(p => ({ ...p, estado: e.target.value }))}
                    >
                      {ESTADOS_CANDIDATURA.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Validação Financeira</label>
                    <select
                      className="form-select form-select-sm"
                      value={candidaturaEmEdicao.estadoPagamento || 'Pendente de verificação'}
                      onChange={e => setCandidaturaEmEdicao(p => ({ ...p, estadoPagamento: e.target.value }))}
                    >
                      {ESTADOS_PAGAMENTO.map(pg => (
                        <option key={pg} value={pg}>{pg}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Observações / Despacho Institucional</label>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm"
                      value={candidaturaEmEdicao.observacoesAdmin || ''}
                      onChange={e => setCandidaturaEmEdicao(p => ({ ...p, observacoesAdmin: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="gpi-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCandidaturaEmEdicao(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 800 }}
                  disabled={salvandoEdicao}
                >
                  {salvandoEdicao ? 'A Gravar...' : '💾 Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: PRÉ-VISUALIZAÇÃO DE DOCUMENTO (LIGHTBOX)
          ======================================================== */}
      {docParaVisualizar && (
        <div className="gpi-modal-backdrop" style={{ zIndex: 10002 }} onClick={() => setDocParaVisualizar(null)}>
          <div className="gpi-modal-card" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
            <div className="gpi-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#003366' }}>
                📄 {docParaVisualizar.doc.titulo}
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setDocParaVisualizar(null)}
              >
                ✕
              </button>
            </div>

            <div className="gpi-modal-body" style={{ textAlign: 'center', background: '#f8fafc' }}>
              {docParaVisualizar.doc.url && docParaVisualizar.doc.url.startsWith('data:image') ? (
                <img
                  src={docParaVisualizar.doc.url}
                  alt={docParaVisualizar.doc.titulo}
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              ) : (
                <div style={{ padding: '2.5rem', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '3rem', color: '#0284c7' }}>📄</div>
                  <h4 style={{ margin: '0.75rem 0 0.25rem 0', color: '#0f172a' }}>{docParaVisualizar.doc.nomeFicheiro}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Documento digital verificado e indexado no processo de {docParaVisualizar.cand?.dadosPessoais?.nome}.
                  </p>
                </div>
              )}
            </div>

            <div className="gpi-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontWeight: 800 }}
                onClick={() => candidaturaService.baixarDocumento(docParaVisualizar.doc, docParaVisualizar.cand)}
              >
                ⬇️ Descarregar Ficheiro
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setDocParaVisualizar(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: CONFIRMAÇÃO DE ACÇÃO COM MOTIVO
          ======================================================== */}
      {modalAcao && (
        <div className="gpi-modal-backdrop" style={{ zIndex: 10001 }}>
          <div className="gpi-modal-card" style={{ maxWidth: '520px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#003366', margin: '0 0 0.5rem 0' }}>
              Confirmar Acção: {modalAcao.toUpperCase().replace('-', ' ')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Insira o despacho institucional ou parecer dos Serviços Académicos:
            </p>

            <textarea
              className="form-control"
              rows={3}
              value={observacaoAcao}
              onChange={e => setObservacaoAcao(e.target.value)}
              placeholder="Despacho institucional..."
              style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={processandoAcao}
                onClick={() => setModalAcao(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={processandoAcao}
                onClick={executarAcao}
              >
                {processandoAcao ? 'A Gravar...' : 'Confirmar e Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
