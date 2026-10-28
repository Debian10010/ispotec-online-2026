import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { candidaturaService } from '../../services/candidaturaService';
import FichaCandidatoPrint from '../../components/FichaCandidatoPrint';
import ReciboPagamentoPrint from '../../components/ReciboPagamentoPrint';

export default function ConsultarCandidatura() {
  const [searchParams] = useSearchParams();
  const codigoUrl = searchParams.get('codigo') || '';

  const [busca, setBusca] = useState(codigoUrl);
  const [carregando, setCarregando] = useState(false);
  const [candidatura, setCandidatura] = useState(null);
  const [erro, setErro] = useState('');
  const [imprimirAberto, setImprimirAberto] = useState(false);
  const [reciboAberto, setReciboAberto] = useState(false);

  useEffect(() => {
    if (codigoUrl) {
      pesquisarCandidatura(codigoUrl);
    }
  }, [codigoUrl]);

  const pesquisarCandidatura = async (termo) => {
    const limpo = (termo || busca).trim();
    if (!limpo) {
      setErro('Por favor, introduza o número da candidatura (ex: ISP-2027-104928) ou o número de B.I.');
      return;
    }

    setCarregando(true);
    setErro('');
    setCandidatura(null);

    try {
      const res = await candidaturaService.consultarPorNumeroOuBI(limpo);
      if (res) {
        setCandidatura(res);
      } else {
        setErro(`Nenhuma candidatura encontrada para "${limpo}". Verifique o código ou B.I. digitado.`);
      }
    } catch (err) {
      setErro('Ocorreu um erro ao pesquisar a candidatura. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    pesquisarCandidatura();
  };

  return (
    <div className="consultar-candidatura-page">
      <style>{`
        .consultar-candidatura-page {
          max-width: 900px;
          margin: 2rem auto;
          padding: 0 1.25rem 4rem 1.25rem;
        }

        .cc-search-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          margin-bottom: 2rem;
        }

        .cc-search-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #003366;
          margin: 0 0 0.5rem 0;
        }

        .cc-search-box {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .cc-input {
          flex: 1;
          padding: 0.8rem 1rem;
          font-size: 0.95rem;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
        }

        .cc-input:focus {
          border-color: #003366;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1);
        }

        /* RESULT CARD */
        .cc-result-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        .cc-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .cc-num {
          font-family: monospace;
          font-size: 1.5rem;
          font-weight: 900;
          color: #003366;
        }

        .cc-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .cc-badge-green { background: #dcfce7; color: #166534; }
        .cc-badge-amber { background: #fef3c7; color: #92400e; }
        .cc-badge-blue  { background: #e0f2fe; color: #075985; }
        .cc-badge-red   { background: #fee2e2; color: #991b1b; }

        /* TIMELINE */
        .cc-timeline {
          display: flex;
          justify-content: space-between;
          margin: 1.75rem 0;
          position: relative;
        }

        .cc-timeline::before {
          content: '';
          position: absolute;
          top: 14px;
          left: 30px;
          right: 30px;
          height: 3px;
          background: #e2e8f0;
          z-index: 1;
        }

        .cc-step {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 25%;
        }

        .cc-step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          border: 3px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .cc-step.active .cc-step-dot {
          border-color: #003366;
          background: #003366;
          color: white;
        }

        .cc-step.completed .cc-step-dot {
          border-color: #16a34a;
          background: #16a34a;
          color: white;
        }

        .cc-step-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }

        .cc-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        /* RESPONSIVIDADE MOBILE E TABLET */
        @media screen and (max-width: 820px) {
          .consultar-candidatura-page {
            margin: 1rem auto;
            padding: 0 1rem 3rem 1rem;
          }
          .cc-search-card, .cc-result-card {
            padding: 1.25rem;
          }
          .cc-timeline {
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .cc-timeline::before {
            display: none;
          }
          .cc-step {
            width: 48%;
            margin-bottom: 0.5rem;
          }
        }

        @media screen and (max-width: 600px) {
          .consultar-candidatura-page {
            margin: 0.5rem auto;
            padding: 0 0.5rem 2.5rem 0.5rem;
          }
          .cc-search-card, .cc-result-card {
            padding: 1rem;
            border-radius: 10px;
          }
          .cc-search-title {
            font-size: 1.15rem;
          }
          .cc-search-box {
            flex-direction: column;
          }
          .cc-search-box .btn {
            width: 100%;
          }
          .cc-header-row {
            flex-direction: column;
            gap: 0.5rem;
          }
          .cc-num {
            font-size: 1.25rem;
          }
          .cc-info-grid {
            grid-template-columns: 1fr;
            padding: 1rem 0.75rem;
            gap: 0.75rem;
          }
          .cc-step {
            width: 100%;
            flex-direction: row;
            gap: 0.75rem;
            text-align: left;
          }
          .cc-step-dot {
            margin-bottom: 0;
            flex-shrink: 0;
          }
          .cc-step-label {
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* PRINT MODAL */}
      {imprimirAberto && candidatura && (
        <FichaCandidatoPrint
          candidatura={candidatura}
          onClose={() => setImprimirAberto(false)}
        />
      )}

      {/* RECIBO OFICIAL DE PAGAMENTO MODAL */}
      {reciboAberto && candidatura && (
        <ReciboPagamentoPrint
          candidatura={candidatura}
          onClose={() => setReciboAberto(false)}
        />
      )}

      {/* SEARCH CARD */}
      <div className="cc-search-card">
        <h1 className="cc-search-title">🔍 Consulta de Candidatura — ISPOTEC 2027</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Consulte o andamento da sua pré-inscrição, validação do pagamento e despacho administrativo.
        </p>

        <form onSubmit={handleFormSubmit} className="cc-search-box">
          <input
            type="text"
            className="cc-input"
            placeholder="Introduza o N.º de Candidatura (ex: ISP-2027-104928) ou B.I."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={carregando}
            style={{ fontWeight: 700, padding: '0.8rem 1.75rem' }}
          >
            {carregando ? 'A Consultar...' : 'Pesquisar'}
          </button>
        </form>

        {erro && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #f87171',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '0.85rem'
          }}>
            ⚠️ {erro}
          </div>
        )}
      </div>

      {/* RESULTADO DA CANDIDATURA */}
      {candidatura && (
        <div className="cc-result-card">
          <div className="cc-header-row">
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                N.º de Candidatura
              </div>
              <div className="cc-num">{candidatura.numeroCandidatura}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Submetida em: {new Date(candidatura.criadoEm || candidatura.dataSubmissao).toLocaleDateString('pt-MZ', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`cc-badge ${
                candidatura.estado === 'Aprovada' ? 'cc-badge-green' :
                candidatura.estado === 'Rejeitada' ? 'cc-badge-red' :
                candidatura.estado === 'Em análise' ? 'cc-badge-blue' : 'cc-badge-amber'
              }`}>
                Estado: {candidatura.estado}
              </span>

              <span className={`cc-badge ${
                candidatura.estadoPagamento === 'Validado' ? 'cc-badge-green' :
                candidatura.estadoPagamento === 'Rejeitado' ? 'cc-badge-red' : 'cc-badge-amber'
              }`}>
                Taxa: {candidatura.estadoPagamento}
              </span>
            </div>
          </div>

          {/* TIMELINE DE EVOLUÇÃO */}
          <div className="cc-timeline">
            <div className={`cc-step ${candidatura.estado ? 'completed' : 'active'}`}>
              <div className="cc-step-dot">1</div>
              <div className="cc-step-label">Submissão</div>
            </div>
            <div className={`cc-step ${candidatura.estadoPagamento === 'Validado' ? 'completed' : 'active'}`}>
              <div className="cc-step-dot">2</div>
              <div className="cc-step-label">Validação da Taxa</div>
            </div>
            <div className={`cc-step ${['Em análise', 'Aprovada'].includes(candidatura.estado) ? 'completed' : ''}`}>
              <div className="cc-step-dot">3</div>
              <div className="cc-step-label">Análise Documental</div>
            </div>
            <div className={`cc-step ${candidatura.estado === 'Aprovada' ? 'completed' : ''}`}>
              <div className="cc-step-dot">4</div>
              <div className="cc-step-label">Decisão Final</div>
            </div>
          </div>

          {/* DADOS DETALHADOS */}
          <div className="cc-info-grid">
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Candidato</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{candidatura.dadosPessoais?.nome}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                B.I.: {candidatura.dadosPessoais?.bi} • Telefone: {candidatura.dadosPessoais?.telefonePrincipal}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Curso Solicitado (2027)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#003366' }}>{candidatura.dadosAcademicos?.cursoNome}</div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                Regime: {candidatura.dadosAcademicos?.regime} • Modalidade: {candidatura.dadosAcademicos?.modalidade}
              </div>
            </div>
          </div>

          {/* SE O PAGAMENTO ESTIVER PENDENTE: MOSTRAR CONTAS BANCÁRIAS DO EDITAL 2027 */}
          {candidatura.estadoPagamento === 'Pendente de verificação' && (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #003366',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 51, 102, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🏦</span>
                <div style={{ fontWeight: 800, color: '#003366', fontSize: '0.95rem' }}>
                  Contas BCI / ISPOTEC para Liquidação da Taxa ({Number(candidatura.dadosAcademicos?.matricula || 4000).toLocaleString('pt-MZ')} MT)
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
                Caso ainda não tenha regularizado ou necessite reenviar o comprovativo:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#003366' }}>Licenciaturas</div>
                  <div>Conta: <code>22076375610001</code></div>
                  <div>NIB: <code>0008 0000 20763756101 13</code></div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#003366' }}>Mestrado, Pós-graduação e Especialização</div>
                  <div>N.º Conta: <code>22076375610002</code></div>
                  <div>NIB: <code>0008 0000 20763756102 10</code></div>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: '#64748b' }}>
                Banco: BCI • Titular: ISPOTEC (Sujeito a IVA de 5%) • Telefones: 878787442 / 879 6666 / 873045610
              </div>
            </div>
          )}

          {/* BANNER DE PRÉ-INSCRIÇÃO CONFIRMADA & RECIBO DISPONÍVEL */}
          {(candidatura.estado === 'Aprovada' || candidatura.estadoPagamento === 'Validado') && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🎉</span> Pré-Inscrição Confirmada &amp; Pagamento Validado!
                </div>
                <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '3px' }}>
                  O seu Recibo Oficial de Pagamento e Pré-Inscrição 2027 encontra-se emitido e disponível para download.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.15rem' }}
                  onClick={() => setReciboAberto(true)}
                >
                  📄 Baixar Recibo de Pagamento (PDF)
                </button>

                <a
                  href={candidaturaService.gerarLinkWhatsApp(candidatura)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-success"
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white' }}
                >
                  💬 Partilhar no WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* OBSERVAÇÃO ADMINISTRATIVA SE HOUVER */}
          {candidatura.observacoesAdmin && (
            <div style={{
              background: '#fffbeb',
              borderLeft: '4px solid #f59e0b',
              padding: '1rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
              color: '#92400e'
            }}>
              <strong>Mensagem dos Serviços Académicos:</strong>
              <div style={{ marginTop: '0.25rem' }}>{candidatura.observacoesAdmin}</div>
            </div>
          )}

          {/* BOTÕES DE AÇÃO */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setImprimirAberto(true)}
              >
                🖨️ Imprimir Ficha do Processo (A4)
              </button>

              {(candidatura.estado === 'Aprovada' || candidatura.estadoPagamento === 'Validado') && (
                <button
                  type="button"
                  className="btn btn-outline-success"
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={() => setReciboAberto(true)}
                >
                  📄 Recibo Oficial (PDF)
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Dúvidas? Contacte a Secretaria Geral: <strong>(+258) 878 787 442</strong>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CALLOUT */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/pre-inscricao" className="btn btn-outline-primary" style={{ fontWeight: 700 }}>
          ➕ Fazer Nova Pré-Inscrição para 2027
        </Link>
      </div>
    </div>
  );
}
