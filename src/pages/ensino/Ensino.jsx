import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ensinoService } from '../../services/ensinoService';

const tabs = ['Cursos', 'Avaliações', 'Progresso', 'Certificações'];

export default function Ensino() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Cursos');
  const [cursos, setCursos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [progresso, setProgresso] = useState([]);
  const [certificacoes, setCertificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', categoria: 'outro', nivel: '' });
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState('');

  const isDocente = user && (user.tipo === 'docente' || user.tipo === 'especialista' || user.tipo === 'admin');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [c, av, pr, cert] = await Promise.all([
      ensinoService.getCursos(),
      ensinoService.getAvaliacoes(),
      ensinoService.getProgresso(),
      ensinoService.getCertificacoes(),
    ]);
    setCursos(c);
    setAvaliacoes(Array.isArray(av) ? av : []);
    setProgresso(Array.isArray(pr) ? pr : []);
    setCertificacoes(Array.isArray(cert) ? cert : []);
    setLoading(false);
  }

  async function handleCreateCurso(e) {
    e.preventDefault();
    try {
      await ensinoService.createCurso(form);
      setMsg('Curso criado com sucesso!');
      setMsgTipo('sucesso');
      setShowForm(false);
      setForm({ titulo: '', descricao: '', categoria: 'outro', nivel: '' });
      loadData();
    } catch {
      setMsg('Erro ao criar curso.');
      setMsgTipo('erro');
    }
  }

  return (
    <>
      <style>{`
        .module-header {
          background: linear-gradient(135deg, #0055a4 0%, #003d7a 100%);
          color: #fff;
          padding: 2rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .module-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .module-header p { margin: 0; opacity: 0.85; }
        .module-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .module-tab {
          padding: 0.5rem 1.25rem;
          border: 2px solid #0055a4;
          border-radius: 25px;
          background: transparent;
          color: #0055a4;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .module-tab.active, .module-tab:hover { background: #0055a4; color: #fff; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .item-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          transition: box-shadow 0.2s;
        }
        .item-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .item-card h3 { margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b; }
        .item-card p { margin: 0; color: #64748b; font-size: 0.875rem; }
        .badge {
          display: inline-block;
          padding: 0.2rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        .badge-azul { background: #dbeafe; color: #1e40af; }
        .badge-verde { background: #d1fae5; color: #065f46; }
        .badge-cinza { background: #f1f5f9; color: #475569; }
        .btn-primary {
          background: #0055a4; color: #fff; border: none;
          padding: 0.6rem 1.25rem; border-radius: 8px;
          font-weight: 600; cursor: pointer; margin-bottom: 1rem;
        }
        .btn-primary:hover { background: #003d7a; }
        .form-card {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem;
        }
        .form-row { margin-bottom: 1rem; }
        .form-row label { display: block; font-weight: 600; margin-bottom: 0.3rem; font-size: 0.875rem; }
        .form-row input, .form-row textarea, .form-row select {
          width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1;
          border-radius: 6px; font-size: 0.875rem; box-sizing: border-box;
        }
        .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
        .alert-sucesso { background: #d1fae5; color: #065f46; }
        .alert-erro { background: #fee2e2; color: #991b1b; }
        .empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
        .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .progress-bar-wrap { background: #e2e8f0; border-radius: 10px; height: 10px; margin-top: 0.5rem; }
        .progress-bar-fill { background: #0055a4; border-radius: 10px; height: 100%; transition: width 0.4s; }
      `}</style>

      <div className="container">
        <div className="module-header">
          <h1>🎓 Módulo de Ensino</h1>
          <p>Cursos, unidades de aprendizagem, avaliações, progresso e certificações</p>
        </div>

        {msg && (
          <div className={`alert alert-${msgTipo}`}>{msg}</div>
        )}

        <div className="module-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`module-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setMsg(''); }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span>⏳</span>A carregar...</div>
        ) : (
          <>
            {/* ---- CURSOS ---- */}
            {activeTab === 'Cursos' && (
              <>
                {isDocente && (
                  <button className="btn-primary" onClick={() => setShowForm(f => !f)}>
                    {showForm ? '✕ Cancelar' : '+ Novo Curso'}
                  </button>
                )}
                {showForm && (
                  <div className="form-card">
                    <h3 style={{ marginTop: 0 }}>Criar Curso</h3>
                    <form onSubmit={handleCreateCurso}>
                      <div className="form-row">
                        <label>Título *</label>
                        <input required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Descrição</label>
                        <textarea rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
                      </div>
                      <div className="form-row">
                        <label>Categoria</label>
                        <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                          <option value="licenciatura">Licenciatura</option>
                          <option value="mestrado">Mestrado</option>
                          <option value="tecnico">Técnico</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Nível</label>
                        <input value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))} placeholder="ex: 1º Ano" />
                      </div>
                      <button type="submit" className="btn-primary">Guardar Curso</button>
                    </form>
                  </div>
                )}
                {cursos.length === 0 ? (
                  <div className="empty-state">
                    <span>📚</span>
                    <p>Nenhum curso disponível.</p>
                    {isDocente && <p>Crie o primeiro curso usando o botão acima.</p>}
                  </div>
                ) : (
                  <div className="card-grid">
                    {cursos.map(curso => (
                      <div key={curso.id || curso._id} className="item-card">
                        <h3>{curso.titulo}</h3>
                        <p>{curso.descricao || 'Sem descrição'}</p>
                        <span className="badge badge-azul">{curso.categoria}</span>
                        {curso.nivel && <span className="badge badge-cinza" style={{ marginLeft: '0.5rem' }}>{curso.nivel}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---- AVALIAÇÕES ---- */}
            {activeTab === 'Avaliações' && (
              avaliacoes.length === 0 ? (
                <div className="empty-state">
                  <span>📝</span>
                  <p>Sem avaliações registadas.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {avaliacoes.map(av => (
                    <div key={av.id || av._id} className="item-card">
                      <h3>Avaliação — {av.tipo}</h3>
                      <p>Nota: <strong>{av.nota !== undefined ? av.nota + '/20' : 'N/D'}</strong></p>
                      {av.comentario && <p style={{ marginTop: '0.5rem' }}>{av.comentario}</p>}
                      <span className="badge badge-cinza">{av.tipo}</span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ---- PROGRESSO ---- */}
            {activeTab === 'Progresso' && (
              Array.isArray(progresso) && progresso.length === 0 ? (
                <div className="empty-state">
                  <span>📊</span>
                  <p>Sem dados de progresso registados.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {(Array.isArray(progresso) ? progresso : []).map(pr => (
                    <div key={pr.id || pr._id} className="item-card">
                      <h3>Progresso no Curso</h3>
                      <p>{pr.unidades_concluidas}/{pr.total_unidades} unidades concluídas</p>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${pr.percentagem || 0}%` }} />
                      </div>
                      <p style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>{pr.percentagem || 0}%</p>
                      {pr.concluido && <span className="badge badge-verde">✓ Concluído</span>}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ---- CERTIFICAÇÕES ---- */}
            {activeTab === 'Certificações' && (
              certificacoes.length === 0 ? (
                <div className="empty-state">
                  <span>🏅</span>
                  <p>Sem certificações emitidas.</p>
                </div>
              ) : (
                <div className="card-grid">
                  {certificacoes.map(cert => (
                    <div key={cert.id || cert._id} className="item-card">
                      <h3>🏅 {cert.titulo}</h3>
                      <p>Tipo: {cert.tipo}</p>
                      {cert.codigo && <p>Código: <strong>{cert.codigo}</strong></p>}
                      <span className="badge badge-verde">{cert.tipo}</span>
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
