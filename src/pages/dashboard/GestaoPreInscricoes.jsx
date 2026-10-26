import React, { useState, useEffect } from 'react';
import {
  candidaturaService,
  ESTADOS_CANDIDATURA,
  ESTADOS_PAGAMENTO,
  OFERTA_FORMATIVA_ISPOTEC_2027
} from '../../services/candidaturaService';
import FichaCandidatoPrint from '../../components/FichaCandidatoPrint';

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

  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [candidaturaParaImprimir, setCandidaturaParaImprimir] = useState(null);
  const [imprimirPautaGeral, setImprimirPautaGeral] = useState(false);

  // Estados dos modais de acção
  const [modalAcao, setModalAcao] = useState(null); // 'aprovar' | 'rejeitar' | 'validar-pagamento' | 'rejeitar-pagamento' | 'solicitar-docs'
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

  // Executar acção de aprovação / rejeição / validação
  const executarAcao = async () => {
    if (!candidaturaSelecionada || !modalAcao) return;
    setProcessandoAcao(true);

    try {
      if (modalAcao === 'aprovar') {
        await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'Aprovada',
          observacaoAcao || 'Candidatura aprovada pelos Serviços Académicos.'
        );
      } else if (modalAcao === 'rejeitar') {
        await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'Rejeitada',
          observacaoAcao || 'Candidatura indeferida por não preencher os requisitos.'
        );
      } else if (modalAcao === 'solicitar-docs') {
        await candidaturaService.atualizarEstadoCandidatura(
          candidaturaSelecionada.id,
          'A aguardar documentos',
          observacaoAcao || 'Por favor, regularize os documentos pendentes.'
        );
      } else if (modalAcao === 'validar-pagamento') {
        await candidaturaService.atualizarEstadoPagamento(
          candidaturaSelecionada.id,
          'Validado',
          observacaoAcao || 'Comprovativo de pagamento verificado e creditado.'
        );
      } else if (modalAcao === 'rejeitar-pagamento') {
        await candidaturaService.atualizarEstadoPagamento(
          candidaturaSelecionada.id,
          'Rejeitado',
          observacaoAcao || 'Comprovativo inválido ou valor não identificado em conta.'
        );
      }

      // Recarregar item selecionado e lista
      const atualizado = await candidaturaService.getCandidaturaById(candidaturaSelecionada.id);
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
    <div className="gestao-candidaturas-page" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
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
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.85rem;
          margin-top: 0.75rem;
        }

        /* TABLE */
        .gpi-table-wrap {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
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
          background: rgba(15, 23, 42, 0.6);
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
          max-width: 900px;
          max-height: 90vh;
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
        }
      `}</style>

      {/* IMPRESSÃO A4 (INDIVIDUAL OU PAUTA) */}
      {candidaturaParaImprimir && (
        <FichaCandidatoPrint
          candidatura={candidaturaParaImprimir}
          onClose={() => setCandidaturaParaImprimir(null)}
        />
      )}

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
            ISPOTEC — Análise de processos, validação de comprovativos e emissão de fichas oficiais.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline-primary"
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setImprimirPautaGeral(true)}
            disabled={candidaturas.length === 0}
          >
            🖨️ Imprimir Pauta Selecionada ({candidaturas.length})
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
              <th style={{ textAlign: 'right' }}>Ações</th>
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
              candidaturas.map(c => (
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
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="Ver Processo Completo"
                        onClick={() => setCandidaturaSelecionada(c)}
                      >
                        👁️ Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        title="Imprimir Ficha A4"
                        onClick={() => setCandidaturaParaImprimir(c)}
                      >
                        🖨️ Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE INSPEÇÃO DETALHADA DO CANDIDATO */}
      {candidaturaSelecionada && (
        <div className="gpi-modal-backdrop" onClick={() => setCandidaturaSelecionada(null)}>
          <div className="gpi-modal-card" onClick={e => e.stopPropagation()}>
            {/* CABEÇALHO */}
            <div className="gpi-modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003366', textTransform: 'uppercase' }}>
                  Processo de Candidatura 2027
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {candidaturaSelecionada.dadosPessoais?.nome} — {candidaturaSelecionada.numeroCandidatura}
                </h2>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setCandidaturaSelecionada(null)}
              >
                ✕
              </button>
            </div>

            {/* CORPO DO PROCESSO */}
            <div className="gpi-modal-body">
              {/* STATUS ROW */}
              <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><strong>B.I.:</strong> {candidaturaSelecionada.dadosPessoais?.bi}</div>
                  <div><strong>Nascimento:</strong> {candidaturaSelecionada.dadosPessoais?.dataNascimento}</div>
                  <div><strong>Telefone Principal:</strong> {candidaturaSelecionada.dadosPessoais?.telefonePrincipal}</div>
                  <div>
                    <strong>Telefones Adicionais:</strong>{' '}
                    {[candidaturaSelecionada.dadosPessoais?.telefoneAdicional1, candidaturaSelecionada.dadosPessoais?.telefoneAdicional2]
                      .filter(Boolean)
                      .join(' / ') || 'Nenhum'}
                  </div>
                  <div><strong>Província/Distrito:</strong> {candidaturaSelecionada.dadosPessoais?.provincia} / {candidaturaSelecionada.dadosPessoais?.distrito}</div>
                  <div><strong>Morada:</strong> {candidaturaSelecionada.dadosPessoais?.morada}</div>
                  <div><strong>Encarregado:</strong> {candidaturaSelecionada.dadosPessoais?.nomeEncarregado} ({candidaturaSelecionada.dadosPessoais?.contactoEncarregado})</div>
                  <div><strong>Local de Trabalho:</strong> {candidaturaSelecionada.dadosPessoais?.localTrabalho || 'Não informado'}</div>
                </div>
              </div>

              {/* CURSO SELECIONADO */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#003366', fontSize: '0.92rem', fontWeight: 800 }}>
                  🎓 Dados Académicos do Ingresso
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div><strong>Curso:</strong> {candidaturaSelecionada.dadosAcademicos?.cursoNome}</div>
                  <div><strong>Regime:</strong> {candidaturaSelecionada.dadosAcademicos?.regime}</div>
                  <div><strong>Modalidade:</strong> {candidaturaSelecionada.dadosAcademicos?.modalidade}</div>
                  <div><strong>Nível de Ingresso:</strong> {candidaturaSelecionada.dadosAcademicos?.nivelIngresso}</div>
                  <div><strong>Proveniência:</strong> {candidaturaSelecionada.dadosAcademicos?.instituicaoProveniencia || '—'}</div>
                  <div><strong>Ano Conclusão:</strong> {candidaturaSelecionada.dadosAcademicos?.anoConclusao || '—'}</div>
                </div>
              </div>

              {/* DOCUMENTOS ANEXADOS */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#003366', fontSize: '0.92rem', fontWeight: 800 }}>
                  📎 Documentos do Candidato
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {/* COMPROVATIVO */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#fafafa' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      💳 Comprovativo de Pagamento
                    </div>
                    {candidaturaSelecionada.documentos?.comprovativoPagamento ? (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', wordBreak: 'break-all' }}>
                          {candidaturaSelecionada.documentos.comprovativoPagamento.nomeFicheiro}
                        </div>
                        {candidaturaSelecionada.documentos.comprovativoPagamento.url && (
                          <a
                            href={candidaturaSelecionada.documentos.comprovativoPagamento.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                          >
                            Visualizar Ficheiro
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Não anexado</span>
                    )}
                  </div>

                  {/* BI */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#fafafa' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      📄 Cópia do B.I.
                    </div>
                    {candidaturaSelecionada.documentos?.bi ? (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', wordBreak: 'break-all' }}>
                          {candidaturaSelecionada.documentos.bi.nomeFicheiro}
                        </div>
                        {candidaturaSelecionada.documentos.bi.url && (
                          <a
                            href={candidaturaSelecionada.documentos.bi.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                          >
                            Visualizar Ficheiro
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Não anexado</span>
                    )}
                  </div>

                  {/* CERTIFICADO */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#fafafa' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      📜 Certificado de Habilitações
                    </div>
                    {candidaturaSelecionada.documentos?.certificado ? (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', wordBreak: 'break-all' }}>
                          {candidaturaSelecionada.documentos.certificado.nomeFicheiro}
                        </div>
                        {candidaturaSelecionada.documentos.certificado.url && (
                          <a
                            href={candidaturaSelecionada.documentos.certificado.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary"
                            style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                          >
                            Visualizar Ficheiro
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Não anexado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* HISTÓRICO DE AUDITORIA */}
              {candidaturaSelecionada.historico && candidaturaSelecionada.historico.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#003366', fontSize: '0.85rem', fontWeight: 800 }}>
                    🕒 Histórico de Auditoria &amp; Despachos
                  </h4>
                  <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem' }}>
                    {candidaturaSelecionada.historico.map((h, i) => (
                      <div key={i} style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                        <strong>{new Date(h.data).toLocaleString('pt-MZ')}:</strong> {h.acao} — <em>{h.observacao}</em> ({h.autor})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ DO MODAL COM ACÇÕES */}
            <div className="gpi-modal-footer">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* VALIDAÇÃO DE PAGAMENTO */}
                {candidaturaSelecionada.estadoPagamento !== 'Validado' ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setModalAcao('validar-pagamento');
                      setObservacaoAcao('Comprovativo de pagamento validado.');
                    }}
                  >
                    💰 Validar Pagamento
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setModalAcao('rejeitar-pagamento');
                      setObservacaoAcao('Comprovativo de pagamento não confere com o extrato bancário.');
                    }}
                  >
                    Rejeitar Pagamento
                  </button>
                )}

                {/* APROVAÇÃO / REJEIÇÃO DE CANDIDATURA */}
                {candidaturaSelecionada.estado !== 'Aprovada' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setModalAcao('aprovar');
                      setObservacaoAcao('Candidatura aprovada para o Ano Académico de 2027.');
                    }}
                  >
                    ✅ Aprovar Candidatura
                  </button>
                )}

                {candidaturaSelecionada.estado !== 'Rejeitada' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      setModalAcao('rejeitar');
                      setObservacaoAcao('Candidatura indeferida por falta de pré-requisitos.');
                    }}
                  >
                    ❌ Rejeitar Candidatura
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => {
                    setModalAcao('solicitar-docs');
                    setObservacaoAcao('Favor anexar cópia autenticada do certificado de habilitações.');
                  }}
                >
                  ⚠️ Pedir Documentos
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setCandidaturaParaImprimir(candidaturaSelecionada);
                  }}
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

      {/* MODAL DE CONFIRMAÇÃO DE ACÇÃO COM MOTIVO */}
      {modalAcao && (
        <div className="gpi-modal-backdrop" style={{ zIndex: 10001 }}>
          <div className="gpi-modal-card" style={{ maxWidth: '500px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#003366', margin: '0 0 0.5rem 0' }}>
              Confirmar Acção: {modalAcao.toUpperCase()}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Insira o parecer ou observação que ficará registado na ficha do candidato e no histórico de auditoria:
            </p>

            <textarea
              className="form-control"
              rows={3}
              value={observacaoAcao}
              onChange={e => setObservacaoAcao(e.target.value)}
              placeholder="Despacho institucional / motivo..."
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
