import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { extensaoService } from '../../services/extensaoService';

const tabs = ['Projectos', 'Actividades', 'Biblioteca Digital', 'Portfólio'];

const tipoBiblioteca = { livro: '📖', artigo: '📄', revista: '📰', recurso: '🔗' };

export default function Extensao() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Projectos');
  const [projetos, setProjetos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [biblioteca, setBiblioteca] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formProjeto, setFormProjeto] = useState({ titulo: '', descricao: '', objetivos: '' });
  const [formBib, setFormBib] = useState({ titulo: '', autor: '', tipo: 'recurso', url: '', descricao: '', area_tematica: '' });
  const [showBibForm, setShowBibForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');

  const isDocente = user && (user.tipo === 'docente' || user.tipo === 'especialista' || user.tipo === 'admin');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [p, a, b] = await Promise.all([
      extensaoService.getProjetos(),
      extensaoService.getAtividades(),
      extensaoService.getBiblioteca(),
    ]);
    setProjetos(p);
    setAtividades(Array.isArray(a) ? a : []);
    setBiblioteca(Array.isArray(b) ? b : []);
    setLoading(false);
  }

  async function handleCreateProjeto(e) {
    e.preventDefault();
    try {
      await extensaoService.createProjeto(formProjeto);
      setMsg('Projeto criado com sucesso!');
      setMsgTipo('sucesso');
      setShowForm(false);
      setFormProjeto({ titulo: '', descricao: '', objetivos: '' });
      loadData();
    } catch { setMsg('Erro ao criar projeto.'); setMsgTipo('erro'); }
  }

  async function handleAddBiblioteca(e) {
    e.preventDefault();
    try {
      await extensaoService.addBibliotecaItem(formBib);
      setMsg('Item adicionado à biblioteca!');
      setMsgTipo('sucesso');
      setShowBibForm(false);
      setFormBib({ titulo: '', autor: '', tipo: 'recurso', url: '', descricao: '', area_tematica: '' });
      loadData();
    } catch { setMsg('Erro ao adicionar item.'); setMsgTipo('erro'); }
  }

  const statusCor = { planeamento: 'badge-cinza', em_curso: 'badge-azul', concluido: 'badge-verde', suspenso: 'badge-erro' };

  return (
    <>
      <style>{`
        .module-header-ext {
          background: linear-gradient(135deg, #10b981 0%, #065f46 100%);
          color: #fff; padding: 2rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;
        }
        .module-header-ext h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .module-header-ext p { margin: 0; opacity: 0.85; }
        .module-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .module-tab {
          padding: 0.5rem 1.25rem; border: 2px solid #10b981; border-radius: 25px;
          background: transparent; color: #10b981; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .module-tab.active, .module-tab:hover { background: #10b981; color: #fff; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .item-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 1.25rem; transition: box-shadow 0.2s;
        }
        .item-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .item-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b; }
        .item-card p { margin: 0 0 0.25rem; color: #64748b; font-size: 0.875rem; }
        .item-card a { color: #10b981; font-size: 0.875rem; word-break: break-all; }
        .badge { display: inline-block; padding: 0.2rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 0.5rem; }
        .badge-azul { background: #dbeafe; color: #1e40af; }
        .badge-verde { background: #d1fae5; color: #065f46; }
        .badge-cinza { background: #f1f5f9; color: #475569; }
        .badge-erro { background: #fee2e2; color: #991b1b; }
        .btn-primary { background: #10b981; color: #fff; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 1rem; }
        .btn-primary:hover { background: #065f46; }
        .form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .form-row { margin-bottom: 1rem; }
        .form-row label { display: block; font-weight: 600; margin-bottom: 0.3rem; font-size: 0.875rem; }
        .form-row input, .form-row textarea, .form-row select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
        .alert-sucesso { background: #d1fae5; color: #065f46; }
        .alert-erro { background: #fee2e2; color: #991b1b; }
        .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
        .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .bib-icon { font-size: 1.5rem; margin-right: 0.5rem; }
      `}</style>

      <div className="container">
        <div className="module-header-ext">
          <h1>🏗️ Módulo de Extensão</h1>
          <p>Projectos, actividades, biblioteca digital e portfólio académico</p>
        </div>

        {msg && <div className={`alert alert-${msgTipo}`}>{msg}</div>}

        <div className="module-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`module-tab ${activeTab === tab ? 'active' : ''}`}
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
                {isDocente && (
                  <button className="btn-primary" onClick={() => setShowForm(f => !f)}>
                    {showForm ? '✕ Cancelar' : '+ Novo Projecto'}
                  </button>
                )}
                {showForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Criar Projecto de Extensão</h3>
                    <form onSubmit={handleCreateProjeto}>
                      <div className="form-row">
                        <label>Título *</label>
                        <input required value={formProjeto.titulo} onChange={e => setFormProjeto(f => ({ ...f, titulo: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Descrição</label>
                        <textarea rows={3} value={formProjeto.descricao} onChange={e => setFormProjeto(f => ({ ...f, descricao: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Objectivos</label>
                        <textarea rows={2} value={formProjeto.objetivos} onChange={e => setFormProjeto(f => ({ ...f, objetivos: e.target.value }))} />
                      </div>
                      <button type="submit" className="btn-primary">Guardar Projecto</button>
                    </form>
                  </div>
                )}
                {projetos.length === 0 ? (
                  <div className="empty-state"><span>🏗️</span><p>Nenhum projecto disponível.</p></div>
                ) : (
                  <div className="card-grid">
                    {projetos.map(p => (
                      <div key={p.id || p._id} className="item-card">
                        <h3>{p.titulo}</h3>
                        <p>{p.descricao || 'Sem descrição'}</p>
                        {p.objetivos && <p style={{ marginTop: '0.5rem' }}>🎯 {p.objetivos}</p>}
                        <span className={`badge ${statusCor[p.status] || 'badge-cinza'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- ACTIVIDADES ---- */}
            {activeTab === 'Actividades' && (
              atividades.length === 0 ? (
                <div className="empty-state"><span>📋</span><p>Sem actividades registadas.</p></div>
              ) : (
                <div className="card-grid">
                  {atividades.map(a => (
                    <div key={a.id || a._id} className="item-card">
                      <h3>{a.titulo}</h3>
                      <p>{a.descricao}</p>
                      <span className={`badge ${a.status === 'concluida' ? 'badge-verde' : a.status === 'em_curso' ? 'badge-azul' : 'badge-cinza'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ---- BIBLIOTECA DIGITAL ---- */}
            {activeTab === 'Biblioteca Digital' && (
              <>
                {isDocente && (
                  <button className="btn-primary" onClick={() => setShowBibForm(f => !f)}>
                    {showBibForm ? '✕ Cancelar' : '+ Adicionar Recurso'}
                  </button>
                )}
                {showBibForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Adicionar à Biblioteca</h3>
                    <form onSubmit={handleAddBiblioteca}>
                      <div className="form-row">
                        <label>Título *</label>
                        <input required value={formBib.titulo} onChange={e => setFormBib(f => ({ ...f, titulo: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Autor</label>
                        <input value={formBib.autor} onChange={e => setFormBib(f => ({ ...f, autor: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Tipo</label>
                        <select value={formBib.tipo} onChange={e => setFormBib(f => ({ ...f, tipo: e.target.value }))}>
                          <option value="livro">Livro</option>
                          <option value="artigo">Artigo Científico</option>
                          <option value="revista">Revista</option>
                          <option value="recurso">Recurso Digital</option>
                        </select>
                      </div>
                      <div className="form-row">
                        <label>URL / Link</label>
                        <input type="url" value={formBib.url} onChange={e => setFormBib(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
                      </div>
                      <div className="form-row">
                        <label>Área Temática</label>
                        <input value={formBib.area_tematica} onChange={e => setFormBib(f => ({ ...f, area_tematica: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Descrição</label>
                        <textarea rows={2} value={formBib.descricao} onChange={e => setFormBib(f => ({ ...f, descricao: e.target.value }))} />
                      </div>
                      <button type="submit" className="btn-primary">Adicionar</button>
                    </form>
                  </div>
                )}
                {biblioteca.length === 0 ? (
                  <div className="empty-state"><span>📚</span><p>Biblioteca digital vazia.</p>{isDocente && <p>Adicione livros, artigos e recursos académicos.</p>}</div>
                ) : (
                  <div className="card-grid">
                    {biblioteca.map(item => (
                      <div key={item.id || item._id} className="item-card">
                        <h3><span className="bib-icon">{tipoBiblioteca[item.tipo] || '📄'}</span>{item.titulo}</h3>
                        {item.autor && <p>✍️ {item.autor}</p>}
                        {item.area_tematica && <p>🏷️ {item.area_tematica}</p>}
                        {item.descricao && <p>{item.descricao}</p>}
                        {item.url && <p><a href={item.url} target="_blank" rel="noreferrer">🔗 Aceder ao recurso</a></p>}
                        <span className="badge badge-cinza">{item.tipo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- PORTFÓLIO ---- */}
            {activeTab === 'Portfólio' && (
              <div className="empty-state">
                <span>🗂️</span>
                <p>O portfólio académico é gerido no seu perfil.</p>
                <a href="/profile/portfolio-add" style={{ color: '#10b981', fontWeight: 600 }}>→ Ir para o Portfólio</a>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
