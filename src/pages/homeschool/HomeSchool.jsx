import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { api } from '../../services/api';

const tabs = ['Meus Grupos', 'Trilhas de Aprendizagem', 'Mini-Cursos', 'Microcredenciais'];

const coresCards = [
  { border: 'var(--secondary-blue)', bg: 'rgba(0, 85, 164, 0.08)' },
  { border: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.08)' },
  { border: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.08)' },
  { border: 'var(--accent-orange)', bg: 'rgba(245, 158, 11, 0.08)' },
  { border: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.08)' },
];

export default function HomeSchool() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Meus Grupos');
  const [meusGrupos, setMeusGrupos] = useState([]);
  const [todosGrupos, setTodosGrupos] = useState([]);
  const [percursos, setPercursos] = useState([]);
  const [miniCursos, setMiniCursos] = useState([]);
  const [microcredenciais, setMicrocredenciais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');
  const [showPercursoForm, setShowPercursoForm] = useState(false);
  const [formPercurso, setFormPercurso] = useState({ titulo: '', descricao: '', nivel: 'iniciante', duracao_estimada: '' });

  const isDocente = user && (user.tipo === 'docente' || user.tipo === 'especialista' || user.tipo === 'admin');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [myG, allG, perc, mini, micro] = await Promise.all([
        groupService.getMyGroups(user?.id),
        groupService.getAllGroups(),
        api.get('/homeschool/percursos').then(r => r.dados || []).catch(() => []),
        api.get('/homeschool/mini-cursos').then(r => r.dados || []).catch(() => []),
        api.get('/ensino/certificacoes').then(r => r.dados || []).catch(() => []),
      ]);
      setMeusGrupos(Array.isArray(myG) ? myG : []);
      setTodosGrupos(Array.isArray(allG) ? allG : []);
      setPercursos(Array.isArray(perc) ? perc : []);
      setMiniCursos(Array.isArray(mini) ? mini : []);
      setMicrocredenciais(Array.isArray(micro) ? micro.filter(c => c.tipo === 'microcredencial' || c.tipo === 'badge') : []);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(grupoId) {
    try {
      await groupService.joinGroup(grupoId);
      setMsg('Entrou no grupo com sucesso!'); setMsgTipo('sucesso');
      loadData();
    } catch { setMsg('Erro ao entrar no grupo.'); setMsgTipo('erro'); }
  }

  async function handleCreatePercurso(e) {
    e.preventDefault();
    try {
      await api.post('/homeschool/percursos', formPercurso);
      setMsg('Trilha criada!'); setMsgTipo('sucesso');
      setShowPercursoForm(false);
      setFormPercurso({ titulo: '', descricao: '', nivel: 'iniciante', duracao_estimada: '' });
      loadData();
    } catch { setMsg('Erro ao criar trilha.'); setMsgTipo('erro'); }
  }

  const isMember = (grupo) => {
    if (!user) return false;
    return (grupo.membros || []).some(m => {
      const id = typeof m === 'object' ? (m._id || m.id) : m;
      return id?.toString() === user.id?.toString();
    });
  };

  return (
    <>
      <style>{`
        .module-header-hs {
          background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
          color: #fff; padding: 2rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;
        }
        .module-header-hs h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .module-header-hs p { margin: 0; opacity: 0.85; }
        .module-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .module-tab-hs {
          padding: 0.5rem 1.25rem; border: 2px solid #f59e0b; border-radius: 25px;
          background: transparent; color: #b45309; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .module-tab-hs.active, .module-tab-hs:hover { background: #f59e0b; color: #fff; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .grupo-card {
          border-radius: 10px; padding: 1.25rem; border-left: 4px solid;
          background: #fff; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;
          transition: box-shadow 0.2s;
        }
        .grupo-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .grupo-card h3 { margin: 0 0 0.25rem; font-size: 1rem; color: #1e293b; }
        .grupo-card p { margin: 0 0 0.5rem; color: #64748b; font-size: 0.875rem; }
        .item-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem; transition: box-shadow 0.2s; }
        .item-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .item-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b; }
        .item-card p { margin: 0 0 0.25rem; color: #64748b; font-size: 0.875rem; }
        .badge { display: inline-block; padding: 0.2rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 0.4rem; }
        .badge-azul { background: #dbeafe; color: #1e40af; }
        .badge-verde { background: #d1fae5; color: #065f46; }
        .badge-cinza { background: #f1f5f9; color: #475569; }
        .badge-amarelo { background: #fef3c7; color: #92400e; }
        .btn-primary-hs { background: #f59e0b; color: #fff; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 1rem; }
        .btn-primary-hs:hover { background: #b45309; }
        .btn-join { background: transparent; border: 1.5px solid #f59e0b; color: #b45309; padding: 0.35rem 0.9rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .btn-join:hover { background: #f59e0b; color: #fff; }
        .btn-joined { background: #d1fae5; border: 1.5px solid #10b981; color: #065f46; padding: 0.35rem 0.9rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: default; }
        .form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .form-row { margin-bottom: 1rem; }
        .form-row label { display: block; font-weight: 600; margin-bottom: 0.3rem; font-size: 0.875rem; }
        .form-row input, .form-row textarea, .form-row select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; box-sizing: border-box; }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
        .alert-sucesso { background: #d1fae5; color: #065f46; }
        .alert-erro { background: #fee2e2; color: #991b1b; }
        .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
        .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .section-sub { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 1.5rem 0 1rem; }
      `}</style>

      <div className="container">
        <div className="module-header-hs">
          <h1>🏠 Home School</h1>
          <p>Grupos, trilhas de aprendizagem, mini-cursos, microcredenciais e aprendizagem personalizada</p>
        </div>

        {msg && <div className={`alert alert-${msgTipo}`}>{msg}</div>}

        <div className="module-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`module-tab-hs ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setMsg(''); }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span>⏳</span>A carregar...</div>
        ) : (
          <>
            {/* ---- MEUS GRUPOS ---- */}
            {activeTab === 'Meus Grupos' && (
              <>
                {meusGrupos.length > 0 && (
                  <>
                    <h3 className="section-sub">Os Meus Grupos ({meusGrupos.length})</h3>
                    <div className="card-grid" style={{ marginBottom: '2rem' }}>
                      {meusGrupos.map((grupo, i) => {
                        const cor = coresCards[i % coresCards.length];
                        return (
                          <div key={grupo.id || grupo._id} className="grupo-card" style={{ borderLeftColor: cor.border, backgroundColor: cor.bg }}>
                            <h3>📚 {grupo.nome || grupo.disciplina}</h3>
                            <p>{grupo.descricao || 'Sem descrição'}</p>
                            <p style={{ fontSize: '0.8rem' }}>👥 {grupo.total_membros || (grupo.membros?.length ?? 0)} membros</p>
                            <Link to={`/dashboard/group-view?id=${grupo.id || grupo._id}`} style={{ color: cor.border, fontSize: '0.85rem', fontWeight: 600 }}>
                              Ver grupo →
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <h3 className="section-sub">Todos os Grupos Disponíveis</h3>
                {todosGrupos.length === 0 ? (
                  <div className="empty-state"><span>👥</span><p>Nenhum grupo disponível.</p></div>
                ) : (
                  <div className="card-grid">
                    {todosGrupos.map((grupo, i) => {
                      const cor = coresCards[i % coresCards.length];
                      const membro = isMember(grupo);
                      return (
                        <div key={grupo.id || grupo._id} className="grupo-card" style={{ borderLeftColor: cor.border }}>
                          <h3>📚 {grupo.nome || grupo.disciplina}</h3>
                          <p>{grupo.descricao || 'Sem descrição'}</p>
                          <p style={{ fontSize: '0.8rem' }}>👥 {grupo.total_membros || (grupo.membros?.length ?? 0)} membros</p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {membro ? (
                              <span className="btn-joined">✓ Membro</span>
                            ) : (
                              <button className="btn-join" onClick={() => handleJoin(grupo.id || grupo._id)}>Entrar</button>
                            )}
                            {membro && (
                              <Link to={`/dashboard/group-view?id=${grupo.id || grupo._id}`} style={{ color: cor.border, fontSize: '0.85rem', fontWeight: 600, alignSelf: 'center' }}>
                                Ver →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ---- TRILHAS ---- */}
            {activeTab === 'Trilhas de Aprendizagem' && (
              <>
                {isDocente && (
                  <button className="btn-primary-hs" onClick={() => setShowPercursoForm(f => !f)}>
                    {showPercursoForm ? '✕ Cancelar' : '+ Nova Trilha'}
                  </button>
                )}
                {showPercursoForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Criar Trilha de Aprendizagem</h3>
                    <form onSubmit={handleCreatePercurso}>
                      <div className="form-row"><label>Título *</label><input required value={formPercurso.titulo} onChange={e => setFormPercurso(f => ({ ...f, titulo: e.target.value }))} /></div>
                      <div className="form-row"><label>Descrição</label><textarea rows={2} value={formPercurso.descricao} onChange={e => setFormPercurso(f => ({ ...f, descricao: e.target.value }))} /></div>
                      <div className="form-row">
                        <label>Nível</label>
                        <select value={formPercurso.nivel} onChange={e => setFormPercurso(f => ({ ...f, nivel: e.target.value }))}>
                          <option value="iniciante">Iniciante</option>
                          <option value="intermedio">Intermédio</option>
                          <option value="avancado">Avançado</option>
                        </select>
                      </div>
                      <div className="form-row"><label>Duração Estimada</label><input value={formPercurso.duracao_estimada} onChange={e => setFormPercurso(f => ({ ...f, duracao_estimada: e.target.value }))} placeholder="ex: 4 semanas" /></div>
                      <button type="submit" className="btn-primary-hs">Guardar Trilha</button>
                    </form>
                  </div>
                )}
                {percursos.length === 0 ? (
                  <div className="empty-state"><span>🗺️</span><p>Nenhuma trilha de aprendizagem disponível.</p></div>
                ) : (
                  <div className="card-grid">
                    {percursos.map(p => (
                      <div key={p.id || p._id} className="item-card">
                        <h3>🗺️ {p.titulo}</h3>
                        <p>{p.descricao}</p>
                        {p.duracao_estimada && <p>⏱️ {p.duracao_estimada}</p>}
                        <span className={`badge ${p.nivel === 'avancado' ? 'badge-azul' : p.nivel === 'intermedio' ? 'badge-amarelo' : 'badge-verde'}`}>{p.nivel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- MINI-CURSOS ---- */}
            {activeTab === 'Mini-Cursos' && (
              miniCursos.length === 0 ? (
                <div className="empty-state"><span>🎯</span><p>Nenhum mini-curso disponível.</p></div>
              ) : (
                <div className="card-grid">
                  {miniCursos.map(mc => (
                    <div key={mc.id || mc._id} className="item-card">
                      <h3>🎯 {mc.titulo}</h3>
                      <p>{mc.descricao}</p>
                      {mc.duracao_minutos > 0 && <p>⏱️ {mc.duracao_minutos} min</p>}
                      <span className="badge badge-cinza">{mc.tipo}</span>
                      <span className={`badge ${mc.nivel === 'avancado' ? 'badge-azul' : mc.nivel === 'intermedio' ? 'badge-amarelo' : 'badge-verde'}`} style={{ marginLeft: '0.5rem' }}>{mc.nivel}</span>
                      {mc.conteudo_url && (
                        <p style={{ marginTop: '0.5rem' }}>
                          <a href={mc.conteudo_url} target="_blank" rel="noreferrer" style={{ color: '#f59e0b' }}>🔗 Aceder ao conteúdo</a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ---- MICROCREDENCIAIS ---- */}
            {activeTab === 'Microcredenciais' && (
              microcredenciais.length === 0 ? (
                <div className="empty-state">
                  <span>🏅</span>
                  <p>Nenhuma microcredencial obtida ainda.</p>
                  <p style={{ fontSize: '0.875rem' }}>Complete cursos e avaliações para obter microcredenciais e badges.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {microcredenciais.map(mc => (
                    <div key={mc.id || mc._id} className="item-card">
                      <h3>🏅 {mc.titulo}</h3>
                      <p>Tipo: {mc.tipo}</p>
                      {mc.codigo && <p>Código: <strong>{mc.codigo}</strong></p>}
                      <span className="badge badge-amarelo">{mc.tipo}</span>
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
