import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { investigacaoService } from '../../services/investigacaoService';

const tabs = ['Projectos', 'Propostas', 'Resultados'];

export default function Investigacao() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Projectos');
  const [projetos, setProjetos] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjetoForm, setShowProjetoForm] = useState(false);
  const [showPropostaForm, setShowPropostaForm] = useState(false);
  const [formProjeto, setFormProjeto] = useState({ titulo: '', tema: '', objetivos: '', metodologia: '' });
  const [formProposta, setFormProposta] = useState({ titulo: '', tema: '', objetivos: '', metodologia: '' });
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');

  const isDocente = user && (user.tipo === 'docente' || user.tipo === 'especialista' || user.tipo === 'admin');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [p, pr, r] = await Promise.all([
      investigacaoService.getProjetos(),
      investigacaoService.getPropostas(),
      investigacaoService.getResultados(),
    ]);
    setProjetos(Array.isArray(p) ? p : []);
    setPropostas(Array.isArray(pr) ? pr : []);
    setResultados(Array.isArray(r) ? r : []);
    setLoading(false);
  }

  async function handleCreateProjeto(e) {
    e.preventDefault();
    try {
      await investigacaoService.createProjeto(formProjeto);
      setMsg('Projecto criado!'); setMsgTipo('sucesso');
      setShowProjetoForm(false);
      setFormProjeto({ titulo: '', tema: '', objetivos: '', metodologia: '' });
      loadData();
    } catch { setMsg('Erro ao criar projecto.'); setMsgTipo('erro'); }
  }

  async function handleCreateProposta(e) {
    e.preventDefault();
    try {
      await investigacaoService.createProposta(formProposta);
      setMsg('Proposta submetida!'); setMsgTipo('sucesso');
      setShowPropostaForm(false);
      setFormProposta({ titulo: '', tema: '', objetivos: '', metodologia: '' });
      loadData();
    } catch { setMsg('Erro ao submeter proposta.'); setMsgTipo('erro'); }
  }

  const statusCor = {
    proposta: 'badge-cinza', aprovado: 'badge-verde', em_curso: 'badge-azul',
    concluido: 'badge-verde', rejeitado: 'badge-erro', pendente: 'badge-cinza', aprovada: 'badge-verde', rejeitada: 'badge-erro',
  };

  return (
    <>
      <style>{`
        .module-header-inv {
          background: linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%);
          color: #fff; padding: 2rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;
        }
        .module-header-inv h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .module-header-inv p { margin: 0; opacity: 0.85; }
        .module-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .module-tab-inv {
          padding: 0.5rem 1.25rem; border: 2px solid #8b5cf6; border-radius: 25px;
          background: transparent; color: #8b5cf6; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .module-tab-inv.active, .module-tab-inv:hover { background: #8b5cf6; color: #fff; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .item-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; transition: box-shadow 0.2s; }
        .item-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .item-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b; }
        .item-card p { margin: 0 0 0.25rem; color: #64748b; font-size: 0.875rem; }
        .badge { display: inline-block; padding: 0.2rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 0.5rem; }
        .badge-azul { background: #dbeafe; color: #1e40af; }
        .badge-verde { background: #d1fae5; color: #065f46; }
        .badge-cinza { background: #f1f5f9; color: #475569; }
        .badge-erro { background: #fee2e2; color: #991b1b; }
        .btn-primary-inv { background: #8b5cf6; color: #fff; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 1rem; margin-right: 0.5rem; }
        .btn-primary-inv:hover { background: #5b21b6; }
        .form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .form-row { margin-bottom: 1rem; }
        .form-row label { display: block; font-weight: 600; margin-bottom: 0.3rem; font-size: 0.875rem; }
        .form-row input, .form-row textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
        .alert-sucesso { background: #d1fae5; color: #065f46; }
        .alert-erro { background: #fee2e2; color: #991b1b; }
        .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
        .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
      `}</style>

      <div className="container">
        <div className="module-header-inv">
          <h1>🔬 Módulo de Investigação</h1>
          <p>Projectos de investigação, propostas, metodologias e resultados académicos</p>
        </div>

        {msg && <div className={`alert alert-${msgTipo}`}>{msg}</div>}

        <div className="module-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`module-tab-inv ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setMsg(''); }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span>⏳</span>A carregar...</div>
        ) : (
          <>
            {/* ---- PROJECTOS ---- */}
            {activeTab === 'Projectos' && (
              <>
                <button className="btn-primary-inv" onClick={() => { setShowProjetoForm(f => !f); setShowPropostaForm(false); }}>
                  {showProjetoForm ? '✕ Cancelar' : '+ Novo Projecto'}
                </button>
                {showProjetoForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Criar Projecto de Investigação</h3>
                    <form onSubmit={handleCreateProjeto}>
                      <div className="form-row"><label>Título *</label><input required value={formProjeto.titulo} onChange={e => setFormProjeto(f => ({ ...f, titulo: e.target.value }))} /></div>
                      <div className="form-row"><label>Tema *</label><input required value={formProjeto.tema} onChange={e => setFormProjeto(f => ({ ...f, tema: e.target.value }))} /></div>
                      <div className="form-row"><label>Objectivos</label><textarea rows={2} value={formProjeto.objetivos} onChange={e => setFormProjeto(f => ({ ...f, objetivos: e.target.value }))} /></div>
                      <div className="form-row"><label>Metodologia</label><textarea rows={2} value={formProjeto.metodologia} onChange={e => setFormProjeto(f => ({ ...f, metodologia: e.target.value }))} /></div>
                      <button type="submit" className="btn-primary-inv">Guardar</button>
                    </form>
                  </div>
                )}
                {projetos.length === 0 ? (
                  <div className="empty-state"><span>🔬</span><p>Nenhum projecto de investigação registado.</p></div>
                ) : (
                  <div className="card-grid">
                    {projetos.map(p => (
                      <div key={p.id || p._id} className="item-card">
                        <h3>{p.titulo}</h3>
                        <p>🏷️ <strong>Tema:</strong> {p.tema}</p>
                        {p.objetivos && <p>🎯 {p.objetivos}</p>}
                        {p.metodologia && <p>🔍 {p.metodologia}</p>}
                        <span className={`badge ${statusCor[p.status] || 'badge-cinza'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- PROPOSTAS ---- */}
            {activeTab === 'Propostas' && (
              <>
                <button className="btn-primary-inv" onClick={() => { setShowPropostaForm(f => !f); setShowProjetoForm(false); }}>
                  {showPropostaForm ? '✕ Cancelar' : '+ Submeter Proposta'}
                </button>
                {showPropostaForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Nova Proposta de Investigação</h3>
                    <form onSubmit={handleCreateProposta}>
                      <div className="form-row"><label>Título *</label><input required value={formProposta.titulo} onChange={e => setFormProposta(f => ({ ...f, titulo: e.target.value }))} /></div>
                      <div className="form-row"><label>Tema *</label><input required value={formProposta.tema} onChange={e => setFormProposta(f => ({ ...f, tema: e.target.value }))} /></div>
                      <div className="form-row"><label>Objectivos</label><textarea rows={2} value={formProposta.objetivos} onChange={e => setFormProposta(f => ({ ...f, objetivos: e.target.value }))} /></div>
                      <div className="form-row"><label>Metodologia</label><textarea rows={2} value={formProposta.metodologia} onChange={e => setFormProposta(f => ({ ...f, metodologia: e.target.value }))} /></div>
                      <button type="submit" className="btn-primary-inv">Submeter Proposta</button>
                    </form>
                  </div>
                )}
                {propostas.length === 0 ? (
                  <div className="empty-state"><span>📋</span><p>Nenhuma proposta submetida.</p></div>
                ) : (
                  <div className="card-grid">
                    {propostas.map(pr => (
                      <div key={pr.id || pr._id} className="item-card">
                        <h3>{pr.titulo}</h3>
                        <p>🏷️ {pr.tema}</p>
                        {pr.objetivos && <p>🎯 {pr.objetivos}</p>}
                        <span className={`badge ${statusCor[pr.status] || 'badge-cinza'}`}>{pr.status}</span>
                        {pr.feedback && pr.feedback.length > 0 && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                            💬 {pr.feedback.length} comentário(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- RESULTADOS ---- */}
            {activeTab === 'Resultados' && (
              resultados.length === 0 ? (
                <div className="empty-state"><span>📊</span><p>Sem resultados registados.</p></div>
              ) : (
                <div className="card-grid">
                  {resultados.map(r => (
                    <div key={r.id || r._id} className="item-card">
                      <h3>{r.titulo}</h3>
                      <p>{r.descricao}</p>
                      {r.avaliacao !== undefined && <p>Avaliação: <strong>{r.avaliacao}/20</strong></p>}
                      {r.documentos && r.documentos.length > 0 && <p>📎 {r.documentos.length} documento(s)</p>}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}
