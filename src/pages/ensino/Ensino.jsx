import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ensinoService } from '../../services/ensinoService';

// ── shared styles ─────────────────────────────────────────────────────────────
const css = `
  .ensino-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
  .ensino-sidebar {
    width: 240px; flex-shrink: 0;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 1.25rem 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);
    position: sticky; top: 80px;
  }
  .ensino-sidebar-title {
    font-size: 0.72rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px;
    padding: 0 1.25rem 0.75rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 0.5rem;
  }
  .ensino-nav-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 1.25rem; font-size: 0.88rem; font-weight: 500;
    color: #475569; cursor: pointer; transition: all 0.15s;
    text-decoration: none; border-left: 3px solid transparent;
  }
  .ensino-nav-item:hover { background: #f8fafc; color: #0055a4; }
  .ensino-nav-item.active {
    background: #eff6ff; color: #0055a4; font-weight: 700;
    border-left-color: #0055a4;
  }
  .ensino-content { flex: 1; min-width: 0; padding-bottom: 5rem; }
  .ensino-sidebar-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 1.1rem 1.25rem 0.9rem;
  }
  .ensino-sidebar-widget {
    padding: 0 1.25rem;
  }
  .ensino-widget-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .ensino-quick-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
    margin-bottom: 0.9rem;
  }
  .ensino-quick-stat-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.45rem 0.5rem;
    text-align: center;
  }
  .ensino-quick-stat-val {
    font-size: 0.92rem;
    font-weight: 800;
    color: #0055a4;
    line-height: 1.15;
  }
  .ensino-quick-stat-lbl {
    font-size: 0.68rem;
    color: #64748b;
    margin-top: 2px;
    white-space: nowrap;
  }
  .ensino-quick-link {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.6rem;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
    color: #334155;
    font-size: 0.78rem;
    font-weight: 600;
    text-decoration: none;
    margin-bottom: 0.4rem;
    transition: all 0.15s;
    cursor: pointer;
  }
  .ensino-quick-link:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #0055a4;
  }
  .ensino-quick-support {
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #dbeafe;
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
    color: #1e3a8a;
    line-height: 1.45;
  }
  .ensino-quick-support strong {
    display: block;
    color: #0055a4;
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
  }
  .ensino-header {
    background: linear-gradient(135deg, #0055a4 0%, #003366 100%);
    color: #fff; padding: 2.25rem 1.75rem; border-radius: 12px;
    margin-bottom: 1.75rem; box-shadow: 0 4px 15px rgba(0,85,164,0.2);
    position: relative; overflow: hidden;
  }
  .ensino-header::after {
    content:''; position:absolute; right:-30px; bottom:-30px;
    width:160px; height:160px; background:rgba(255,255,255,0.05);
    border-radius:50%; pointer-events:none;
  }
  .ensino-badge {
    display:inline-flex; align-items:center; gap:0.4rem;
    background:rgba(255,255,255,0.15); color:#fff;
    padding:0.3rem 0.85rem; border-radius:20px;
    font-size:0.75rem; font-weight:600; margin-bottom:0.6rem;
    letter-spacing:0.5px; text-transform:uppercase;
  }
  .ensino-header h1 { font-size:1.75rem; font-weight:700; margin:0 0 0.5rem; }
  .ensino-header p  { margin:0; opacity:0.9; font-size:0.95rem; line-height:1.6; }
  .ensino-section-bar {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .ensino-section-title {
    font-size:1.1rem; font-weight:700; color:#1e293b;
    margin:0; display:flex; align-items:center; gap:0.5rem;
  }
  .btn-add-action {
    background: #0055a4; color: #fff; border: none; border-radius: 8px;
    padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
  }
  .btn-add-action:hover { background: #004080; }
  .item-actions {
    display: flex; gap: 0.4rem; margin-top: 0.75rem; padding-top: 0.6rem;
    border-top: 1px solid #f1f5f9; justify-content: flex-end;
  }
  .btn-edit-action {
    background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px;
    padding: 0.3rem 0.65rem; font-size: 0.78rem; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
  }
  .btn-edit-action:hover { background: #e2e8f0; color: #0f172a; }
  .btn-del-action {
    background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 6px;
    padding: 0.3rem 0.65rem; font-size: 0.78rem; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
  }
  .btn-del-action:hover { background: #fca5a5; }
  .ensino-inline-form {
    background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px;
    padding: 1.25rem; margin-bottom: 1.5rem; display: grid; gap: 0.85rem;
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .ensino-input {
    width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1;
    border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
  }
  .ensino-card {
    background:#fff; border:1px solid #e2e8f0; border-radius:12px;
    padding:1.35rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.06);
    transition:transform .2s,box-shadow .2s;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .ensino-card:hover { transform:translateY(-3px); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); }
  .ensino-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; margin-bottom:2rem; }
  .ensino-grid-2 { display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:1.25rem; margin-bottom:2rem; }
  .card-icon { width:46px; height:46px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.35rem; margin-bottom:0.85rem; }
  .card-icon.blue { background:#dbeafe; }
  .card-icon.green { background:#d1fae5; }
  .card-icon.purple { background:#ede9fe; }
  .card-icon.orange { background:#fef3c7; }
  .card-icon.red { background:#fee2e2; }
  .card-icon.cyan { background:#cffafe; }
  .card-icon.pink { background:#fce7f3; }
  .card-icon.teal { background:#ccfbf1; }
  .card-h3 { font-size:1rem; font-weight:700; color:#1e293b; margin:0 0 0.4rem; }
  .card-p { font-size:0.86rem; color:#64748b; line-height:1.55; margin:0 0 0.75rem; }
  .card-badge { display:inline-block; padding:0.2rem 0.6rem; border-radius:6px; font-size:0.73rem; font-weight:600; }
  .badge-blue { background:#dbeafe; color:#1d4ed8; }
  .badge-green { background:#d1fae5; color:#065f46; }
  .badge-orange { background:#fef3c7; color:#92400e; }
  .badge-purple { background:#ede9fe; color:#5b21b6; }
  .badge-red { background:#fee2e2; color:#991b1b; }
  .badge-gray { background:#f1f5f9; color:#475569; }
  .stat-block { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; margin-bottom:2rem; }
  .stat-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; text-align:center; box-shadow:0 4px 6px -1px rgba(0,0,0,0.06); }
  .stat-num { font-size:2rem; font-weight:800; color:#0055a4; }
  .stat-lbl { font-size:0.8rem; color:#64748b; margin-top:0.2rem; }
  .table-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.06); margin-bottom:2rem; overflow-x:auto; }
  .ensino-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
  .ensino-table th { background:#f8fafc; padding:0.75rem 1rem; text-align:left; font-weight:600; color:#374151; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
  .ensino-table td { padding:0.7rem 1rem; border-bottom:1px solid #f1f5f9; color:#475569; }
  .ensino-table tr:last-child td { border-bottom:none; }
  .ensino-table tr:hover td { background:#f8fafc; }
  .event-item { display:flex; gap:1rem; padding:1rem; background:#fff; border:1px solid #e2e8f0; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.04); transition:transform .2s; margin-bottom:0.85rem; align-items: center; }
  .event-item:hover { transform:translateY(-2px); }
  .event-date { min-width:64px; height:64px; border-radius:10px; background:linear-gradient(135deg,#0055a4,#003366); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700; flex-shrink:0; }
  .event-date .d { font-size:1.6rem; line-height:1; }
  .event-date .m { font-size:0.72rem; text-transform:uppercase; opacity:0.85; }
  .event-info h4 { margin:0 0 0.3rem; font-size:0.97rem; font-weight:700; color:#1e293b; }
  .event-info p  { margin:0 0 0.4rem; font-size:0.83rem; color:#64748b; }
  .cal-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.25rem; margin-bottom:2rem; }
  .cal-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.06); }
  .cal-card-head { padding:0.85rem 1.25rem; font-weight:700; font-size:0.95rem; color:#fff; }
  .cal-card-body { padding:1rem 1.25rem; }
  .cal-item { display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid #f1f5f9; font-size:0.85rem; }
  .cal-item:last-child { border-bottom:none; }
  .cal-item-label { color:#374151; }
  .cal-item-date { color:#0055a4; font-weight:600; }
  @media(max-width:960px){
    .ensino-layout { flex-direction:column; }
    .ensino-sidebar { width:100%; position:static; }
    .ensino-sidebar { display:flex; flex-wrap:wrap; padding:0.75rem; }
    .ensino-nav-item { padding:0.45rem 0.85rem; }
    .ensino-sidebar-divider, .ensino-sidebar-widget { display: none; }
  }
  @media(max-width:600px){
    .ensino-header { padding:1.5rem 1.1rem; }
    .ensino-header h1 { font-size:1.4rem; }
    .ensino-grid,.ensino-grid-2 { grid-template-columns:1fr; }
    .stat-block { grid-template-columns:repeat(2,1fr); }
    .form-row-2 { grid-template-columns: 1fr; }
  }
`;

const SECCOES = [
  { key:'projetos-educativos',   label:'Projetos Educativos',   icon:'🎯' },
  { key:'projetos-curriculares', label:'Projetos Curriculares',  icon:'📋' },
  { key:'bibliotecas',           label:'Bibliotecas',            icon:'📚' },
  { key:'laboratorios',          label:'Laboratórios',           icon:'🔬' },
  { key:'estatistica-academica', label:'Estatística Académica',  icon:'📊' },
  { key:'estatistica-pedagogica',label:'Estatística Pedagógica', icon:'📈' },
  { key:'calendario',            label:'Calendário Académico',   icon:'📅' },
  { key:'eventos',               label:'Eventos Científicos',    icon:'🎤' },
];

function estadoBadge(e) {
  if (e === 'Em Curso')    return <span className="card-badge badge-green">{e}</span>;
  if (e === 'Concluído')   return <span className="card-badge badge-blue">{e}</span>;
  if (e === 'Planeamento') return <span className="card-badge badge-orange">{e}</span>;
  return <span className="card-badge badge-gray">{e}</span>;
}

// ── Shared Empty State ────────────────────────────────────────────────────────
function EmptyState({ mensagem = "Não existem registos disponíveis.", canAdd, onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', margin: '1.5rem 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📂</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.35rem' }}>{mensagem}</h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1rem' }}>
        {canAdd ? 'Utilize o botão para adicionar o primeiro registo na base de dados.' : 'Ainda não foram adicionados registos pelos docentes ou administração.'}
      </p>
      {canAdd && onAdd && (
        <button onClick={onAdd} className="btn-add-action" style={{ display: 'inline-flex' }}>
          + Adicionar Registo
        </button>
      )}
    </div>
  );
}

// ── Attachment Preview / Download Link ────────────────────────────────────────
function AttachmentBadge({ url, nome }) {
  if (!url) return null;
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
  return (
    <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#0055a4', fontWeight: 600, textDecoration: 'none' }}
      >
        <span>📎</span> {nome || 'Ver Documento Anexo'}
      </a>
    </div>
  );
}

// ── Section 1: Projetos Educativos (REAL BACKEND) ─────────────────────────────
function ProjetosEducativos({ canAdd, canEdit, canDelete }) {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [novo, setNovo] = useState({ titulo: '', area: '', desc: '', coordenador: '', ano: '2025', estado: 'Em Curso' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ensinoService.getProjetosEducativos();
      setProjetos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novo.titulo) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await ensinoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await ensinoService.createProjetoEducativo({ ...novo, ...anexoData });
      alert('Registo criado com sucesso.');
      setProjetos([saved, ...projetos]);
      setNovo({ titulo: '', area: '', desc: '', coordenador: '', ano: '2025', estado: 'Em Curso' });
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar registo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (p, newTitulo, newDesc) => {
    try {
      const updated = await ensinoService.updateProjetoEducativo(p.id || p._id, {
        ...p,
        titulo: newTitulo,
        desc: newDesc,
      });
      alert('Registo actualizado com sucesso.');
      setProjetos(projetos.map(item => (item.id === p.id || item._id === p._id) ? updated : item));
      setEditingId(null);
    } catch (err) {
      alert(err.message || 'Não foi possível actualizar o registo.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este registo? Esta ação é irreversível.')) return;
    try {
      const ok = await ensinoService.deleteProjetoEducativo(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setProjetos(projetos.filter(p => (p.id !== id && p._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">🎯 Ensino ISPOTEC</div>
        <h1>Projetos Educativos</h1>
        <p>Iniciativas e projetos que promovem a inovação pedagógica e a excelência académica no ISPOTEC.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Iniciativas Pedagógicas Ativas</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Projeto Educativo'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Novo Projeto Educativo</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Título do Projeto *"
              value={novo.titulo}
              onChange={e => setNovo({ ...novo, titulo: e.target.value })}
              required
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Área Pedagógica"
              value={novo.area}
              onChange={e => setNovo({ ...novo, area: e.target.value })}
            />
          </div>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Coordenador do Projeto"
              value={novo.coordenador}
              onChange={e => setNovo({ ...novo, coordenador: e.target.value })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Ano / Vigência"
              value={novo.ano}
              onChange={e => setNovo({ ...novo, ano: e.target.value })}
            />
          </div>
          <textarea
            className="ensino-input"
            rows="2"
            placeholder="Descrição sumária do projeto..."
            value={novo.desc}
            onChange={e => setNovo({ ...novo, desc: e.target.value })}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              📎 Documento / Anexo (PDF, DOC, XLS, PPT, Imagem - máx. 15MB)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '0.82rem' }}
            />
            {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
          </div>
          <div>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar registos da base de dados...</div>
      ) : projetos.length === 0 ? (
        <EmptyState canAdd={canAdd} onAdd={() => setShowAddForm(true)} />
      ) : (
        <div className="ensino-grid">
          {projetos.map(p => {
            const pId = p.id || p._id;
            const isEditing = editingId === pId;
            return (
              <div key={pId} className="ensino-card">
                <div>
                  <div className="card-icon blue">🎯</div>
                  {isEditing ? (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <input
                        id={`edit-title-${pId}`}
                        defaultValue={p.titulo}
                        className="ensino-input"
                        style={{ marginBottom: '0.4rem', fontWeight: 700 }}
                      />
                      <textarea
                        id={`edit-desc-${pId}`}
                        defaultValue={p.desc}
                        className="ensino-input"
                        rows="2"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="card-h3">{p.titulo}</h3>
                      <p className="card-p">{p.desc}</p>
                    </>
                  )}
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'0.6rem'}}>
                    <span className="card-badge badge-blue">{p.area || 'Geral'}</span>
                    {estadoBadge(p.estado)}
                  </div>
                  <div style={{fontSize:'0.8rem',color:'#94a3b8'}}>
                    👤 {p.coordenador || 'Coordenação Geral'} &nbsp;|&nbsp; 📅 {p.ano || '2025'}
                  </div>
                  <AttachmentBadge url={p.anexo_url} nome={p.anexo_nome} />
                </div>

                {(canEdit || canDelete) && (
                  <div className="item-actions">
                    {canEdit && (
                      isEditing ? (
                        <button
                          className="btn-edit-action"
                          onClick={() => {
                            const t = document.getElementById(`edit-title-${pId}`).value;
                            const d = document.getElementById(`edit-desc-${pId}`).value;
                            handleSaveEdit(p, t, d);
                          }}
                        >
                          ✓ Concluir
                        </button>
                      ) : (
                        <button className="btn-edit-action" onClick={() => setEditingId(pId)}>
                          ✏️ Editar
                        </button>
                      )
                    )}
                    {canDelete && (
                      <button className="btn-del-action" onClick={() => handleDelete(pId)}>
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Section 2: Projetos Curriculares / UCs (REAL BACKEND) ─────────────────────
function ProjetosCurriculares({ canAdd, canEdit, canDelete }) {
  const [ucs, setUcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [novo, setNovo] = useState({ curso: 'Medicina', ciclo: 'Licenciatura', uc: '', creditos: 6, semestre: '1.º', tipo: 'Obrigatória' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ensinoService.getUnidadesCurriculares(filtroCurso);
      setUcs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filtroCurso]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novo.uc) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await ensinoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await ensinoService.createUnidadeCurricular({ ...novo, ...anexoData });
      alert('Registo criado com sucesso.');
      setUcs([saved, ...ucs]);
      setNovo({ curso: 'Medicina', ciclo: 'Licenciatura', uc: '', creditos: 6, semestre: '1.º', tipo: 'Obrigatória' });
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar UC.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta unidade curricular?')) return;
    try {
      const ok = await ensinoService.deleteUnidadeCurricular(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setUcs(ucs.filter(u => (u.id !== id && u._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  const cursos = ['Todos', 'Medicina', 'Gestão de Empresas', 'Engenharia Informática', 'Psicologia', 'Medicina Dentária'];

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📋 Ensino ISPOTEC</div>
        <h1>Projetos Curriculares</h1>
        <p>Unidades curriculares e planos de estudo organizados por curso e ciclo de formação.</p>
      </div>

      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {cursos.map(c => (
          <button
            key={c}
            onClick={() => setFiltroCurso(c)}
            style={{
              padding:'0.4rem 0.9rem', borderRadius:'20px', fontSize:'0.82rem', fontWeight:600,
              border: filtroCurso===c ? 'none' : '1px solid #cbd5e1',
              background: filtroCurso===c ? '#0055a4' : '#fff',
              color: filtroCurso===c ? '#fff' : '#475569',
              cursor:'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">
          {filtroCurso==='Todos' ? 'Todas as Unidades Curriculares' : `UCs – ${filtroCurso}`}
        </h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar UC'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Nova Unidade Curricular</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Nome da UC *"
              value={novo.uc}
              onChange={e => setNovo({ ...novo, uc: e.target.value })}
              required
            />
            <select
              className="ensino-input"
              value={novo.curso}
              onChange={e => setNovo({ ...novo, curso: e.target.value })}
            >
              {cursos.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row-2">
            <input
              type="number"
              className="ensino-input"
              placeholder="Créditos ECTS"
              value={novo.creditos}
              onChange={e => setNovo({ ...novo, creditos: Number(e.target.value) })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Semestre (ex: 1.º)"
              value={novo.semestre}
              onChange={e => setNovo({ ...novo, semestre: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              📎 Programa / Plano Analítico (PDF, DOCX, etc.)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '0.82rem' }}
            />
            {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
          </div>
          <div>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : 'Salvar UC'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar unidades curriculares...</div>
      ) : ucs.length === 0 ? (
        <EmptyState mensagem="Não existem unidades curriculares registadas." canAdd={canAdd} onAdd={() => setShowAddForm(true)} />
      ) : (
        <div className="table-wrap">
          <table className="ensino-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Unidade Curricular</th>
                <th>Ciclo</th>
                <th>Créditos</th>
                <th>Semestre</th>
                <th>Tipo</th>
                <th>Anexo</th>
                {(canEdit || canDelete) && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {ucs.map(u => {
                const uId = u.id || u._id;
                return (
                  <tr key={uId}>
                    <td><strong>{u.curso}</strong></td>
                    <td>{u.uc}</td>
                    <td>{u.ciclo}</td>
                    <td><span className="card-badge badge-blue">{u.creditos} ECTS</span></td>
                    <td>{u.semestre}</td>
                    <td><span className="card-badge badge-green">{u.tipo}</span></td>
                    <td>
                      {u.anexo_url ? (
                        <a
                          href={u.anexo_url.startsWith('http') ? u.anexo_url : `http://localhost:5000${u.anexo_url}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#0055a4', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          📎 {u.anexo_nome || 'Ficheiro'}
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sem anexo</span>
                      )}
                    </td>
                    {(canEdit || canDelete) && (
                      <td>
                        {canDelete && (
                          <button className="btn-del-action" onClick={() => handleDelete(uId)}>
                            🗑️
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Section 3: Bibliotecas (REAL BACKEND) ─────────────────────────────────────
function Bibliotecas({ canAdd, canEdit, canDelete }) {
  const [bibliotecas, setBibliotecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [nova, setNova] = useState({ nome: '', tipo: 'Física', localizacao: '', acervo: '', horario: '', contato: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ensinoService.getBibliotecas();
      setBibliotecas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nova.nome) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await ensinoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await ensinoService.createBiblioteca({ ...nova, ...anexoData });
      alert('Registo criado com sucesso.');
      setBibliotecas([saved, ...bibliotecas]);
      setNova({ nome: '', tipo: 'Física', localizacao: '', acervo: '', horario: '', contato: '' });
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar biblioteca.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta biblioteca?')) return;
    try {
      const ok = await ensinoService.deleteBiblioteca(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setBibliotecas(bibliotecas.filter(b => (b.id !== id && b._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📚 Ensino ISPOTEC</div>
        <h1>Bibliotecas &amp; Recursos de Aprendizagem</h1>
        <p>Espaços físicos e digitais dedicados ao estudo, pesquisa e consulta de acervos bibliográficos.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Rede de Bibliotecas</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Biblioteca'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Nova Biblioteca</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Nome da Biblioteca *"
              value={nova.nome}
              onChange={e => setNova({ ...nova, nome: e.target.value })}
              required
            />
            <select
              className="ensino-input"
              value={nova.tipo}
              onChange={e => setNova({ ...nova, tipo: e.target.value })}
            >
              <option value="Física">Física</option>
              <option value="Digital">Digital</option>
              <option value="Física/Digital">Física/Digital</option>
            </select>
          </div>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Localização"
              value={nova.localizacao}
              onChange={e => setNova({ ...nova, localizacao: e.target.value })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Acervo (ex: 5.000 livros)"
              value={nova.acervo}
              onChange={e => setNova({ ...nova, acervo: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              📎 Regulamento / Catálogo Anexo (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '0.82rem' }}
            />
            {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
          </div>
          <div>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : 'Salvar Biblioteca'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar bibliotecas...</div>
      ) : bibliotecas.length === 0 ? (
        <EmptyState mensagem="Não existem bibliotecas registadas." canAdd={canAdd} onAdd={() => setShowAddForm(true)} />
      ) : (
        <div className="ensino-grid-2">
          {bibliotecas.map(b => {
            const bId = b.id || b._id;
            return (
              <div key={bId} className="ensino-card">
                <div>
                  <div className="card-icon purple">{b.icon || '📚'}</div>
                  <h3 className="card-h3">{b.nome}</h3>
                  <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.75rem'}}>
                    <span className="card-badge badge-purple">{b.tipo}</span>
                    {b.acervo && <span className="card-badge badge-blue">{b.acervo}</span>}
                  </div>
                  <p className="card-p" style={{marginBottom:'0.3rem'}}>📍 {b.localizacao || 'Campus ISPOTEC'}</p>
                  {b.horario && <p className="card-p" style={{marginBottom:'0.3rem'}}>🕒 {b.horario}</p>}
                  {b.contato && <p className="card-p">📞 {b.contato}</p>}
                  <AttachmentBadge url={b.anexo_url} nome={b.anexo_nome} />
                </div>
                {canDelete && (
                  <div className="item-actions">
                    <button className="btn-del-action" onClick={() => handleDelete(bId)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Section 4: Laboratórios (REAL BACKEND) ────────────────────────────────────
function Laboratorios({ canAdd, canEdit, canDelete }) {
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [novo, setNovo] = useState({ nome: '', curso: '', capacidade: 30, equipamento: '', responsavel: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ensinoService.getLaboratorios();
      setLaboratorios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novo.nome) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await ensinoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await ensinoService.createLaboratorio({ ...novo, ...anexoData });
      alert('Registo criado com sucesso.');
      setLaboratorios([saved, ...laboratorios]);
      setNovo({ nome: '', curso: '', capacidade: 30, equipamento: '', responsavel: '' });
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar laboratório.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este laboratório?')) return;
    try {
      const ok = await ensinoService.deleteLaboratorio(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setLaboratorios(laboratorios.filter(l => (l.id !== id && l._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">🔬 Ensino ISPOTEC</div>
        <h1>Laboratórios de Ensino</h1>
        <p>Infraestruturas laboratoriais especializadas para actividades práticas, experimentais e de simulação.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Laboratórios Disponíveis</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Laboratório'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Novo Laboratório</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Nome do Laboratório *"
              value={novo.nome}
              onChange={e => setNovo({ ...novo, nome: e.target.value })}
              required
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Curso Associado"
              value={novo.curso}
              onChange={e => setNovo({ ...novo, curso: e.target.value })}
            />
          </div>
          <div className="form-row-2">
            <input
              type="number"
              className="ensino-input"
              placeholder="Capacidade (postos)"
              value={novo.capacidade}
              onChange={e => setNovo({ ...novo, capacidade: Number(e.target.value) })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Docente Responsável"
              value={novo.responsavel}
              onChange={e => setNovo({ ...novo, responsavel: e.target.value })}
            />
          </div>
          <textarea
            className="ensino-input"
            rows="2"
            placeholder="Equipamentos principais e recursos disponíveis..."
            value={novo.equipamento}
            onChange={e => setNovo({ ...novo, equipamento: e.target.value })}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              📎 Ficha Técnica / Normas de Segurança (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '0.82rem' }}
            />
            {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
          </div>
          <div>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : 'Salvar Laboratório'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar laboratórios...</div>
      ) : laboratorios.length === 0 ? (
        <EmptyState mensagem="Não existem laboratórios registados." canAdd={canAdd} onAdd={() => setShowAddForm(true)} />
      ) : (
        <div className="ensino-grid">
          {laboratorios.map(l => {
            const lId = l.id || l._id;
            return (
              <div key={lId} className="ensino-card">
                <div>
                  <div className="card-icon cyan">{l.icon || '🔬'}</div>
                  <h3 className="card-h3">{l.nome}</h3>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.6rem'}}>
                    <span className="card-badge badge-blue">{l.curso || 'Ensino'}</span>
                    <span className="card-badge badge-green">Cap. {l.capacidade} postos</span>
                  </div>
                  <p className="card-p">{l.equipamento || 'Equipamento especializado disponível.'}</p>
                  <div style={{fontSize:'0.8rem',color:'#94a3b8'}}>
                    👤 {l.responsavel || 'Coordenação'}
                  </div>
                  <AttachmentBadge url={l.anexo_url} nome={l.anexo_nome} />
                </div>
                {canDelete && (
                  <div className="item-actions">
                    <button className="btn-del-action" onClick={() => handleDelete(lId)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Section 5: Eventos Científicos (REAL BACKEND) ─────────────────────────────
function EventosCientificos({ canAdd, canEdit, canDelete }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [novo, setNovo] = useState({ titulo: '', dia: '15', mes: 'Nov', local: 'Auditório Central', tipo: 'Conferência', desc: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ensinoService.getEventos();
      setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novo.titulo) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await ensinoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await ensinoService.createEvento({ ...novo, ...anexoData });
      alert('Registo criado com sucesso.');
      setEventos([saved, ...eventos]);
      setNovo({ titulo: '', dia: '15', mes: 'Nov', local: 'Auditório Central', tipo: 'Conferência', desc: '' });
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar evento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este evento?')) return;
    try {
      const ok = await ensinoService.deleteEvento(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setEventos(eventos.filter(ev => (ev.id !== id && ev._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">🎤 Ensino ISPOTEC</div>
        <h1>Eventos Científicos &amp; Académicos</h1>
        <p>Conferências, simpósios, workshops e jornadas científicas promovidas pelo ISPOTEC.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Próximos Eventos</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Evento'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Novo Evento Científico</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Título do Evento *"
              value={novo.titulo}
              onChange={e => setNovo({ ...novo, titulo: e.target.value })}
              required
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Tipo (Conferência, Workshop, etc.)"
              value={novo.tipo}
              onChange={e => setNovo({ ...novo, tipo: e.target.value })}
            />
          </div>
          <div className="form-row-2">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input
                type="text"
                className="ensino-input"
                placeholder="Dia (ex: 15)"
                value={novo.dia}
                onChange={e => setNovo({ ...novo, dia: e.target.value })}
              />
              <input
                type="text"
                className="ensino-input"
                placeholder="Mês (ex: Nov)"
                value={novo.mes}
                onChange={e => setNovo({ ...novo, mes: e.target.value })}
              />
            </div>
            <input
              type="text"
              className="ensino-input"
              placeholder="Local do Evento"
              value={novo.local}
              onChange={e => setNovo({ ...novo, local: e.target.value })}
            />
          </div>
          <textarea
            className="ensino-input"
            rows="2"
            placeholder="Descrição sumária do evento..."
            value={novo.desc}
            onChange={e => setNovo({ ...novo, desc: e.target.value })}
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              📎 Cartaz / Programa do Evento (PDF, Imagem)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              style={{ fontSize: '0.82rem' }}
            />
            {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
          </div>
          <div>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : 'Salvar Evento'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar eventos...</div>
      ) : eventos.length === 0 ? (
        <EmptyState mensagem="Não existem eventos científicos registados." canAdd={canAdd} onAdd={() => setShowAddForm(true)} />
      ) : (
        <div>
          {eventos.map(ev => {
            const evId = ev.id || ev._id;
            return (
              <div key={evId} className="event-item">
                <div className="event-date">
                  <div className="d">{ev.dia || '15'}</div>
                  <div className="m">{ev.mes || 'Nov'}</div>
                </div>
                <div className="event-info" style={{ flex: 1 }}>
                  <h4>{ev.titulo}</h4>
                  <p>{ev.desc}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="card-badge badge-blue">{ev.tipo || 'Conferência'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {ev.local}</span>
                    <AttachmentBadge url={ev.anexo_url} nome={ev.anexo_nome} />
                  </div>
                </div>
                {canDelete && (
                  <button className="btn-del-action" onClick={() => handleDelete(evId)}>
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Section 6: Estatística Académica (Dynamic View) ───────────────────────────
function EstatisticaAcademica() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📊 Ensino ISPOTEC</div>
        <h1>Estatística Académica</h1>
        <p>Visão global dos dados de matriculados, aprovações e desempenho académico institucional.</p>
      </div>

      <div className="stat-block">
        <div className="stat-card"><div className="stat-num">4.820</div><div className="stat-lbl">Total de Estudantes</div></div>
        <div className="stat-card"><div className="stat-num">287</div><div className="stat-lbl">Docentes Activos</div></div>
        <div className="stat-card"><div className="stat-num">24</div><div className="stat-lbl">Cursos Disponíveis</div></div>
        <div className="stat-card"><div className="stat-num">78%</div><div className="stat-lbl">Taxa de Aprovação</div></div>
      </div>
    </>
  );
}

// ── Section 7: Estatística Pedagógica (Dynamic View) ──────────────────────────
function EstatisticaPedagogica() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📈 Ensino ISPOTEC</div>
        <h1>Estatística Pedagógica</h1>
        <p>Indicadores de eficiência formativa, horas lectivas e acompanhamento pedagógico.</p>
      </div>

      <div className="stat-block">
        <div className="stat-card"><div className="stat-num">1.240h</div><div className="stat-lbl">Horas Lectivas / Sem.</div></div>
        <div className="stat-card"><div className="stat-num">74%</div><div className="stat-lbl">Docentes c/ Mestrado+</div></div>
        <div className="stat-card"><div className="stat-num">4.1/5</div><div className="stat-lbl">Satisfação Estudantil</div></div>
        <div className="stat-card"><div className="stat-num">98.2%</div><div className="stat-lbl">Avaliações Entregues</div></div>
      </div>
    </>
  );
}

// ── Section 8: Calendário Académico ──────────────────────────────────────────
function CalendarioAcademico() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📅 Ensino ISPOTEC</div>
        <h1>Calendário Académico 2025/2026</h1>
        <p>Datas fundamentais do ano lectivo: início de aulas, avaliações, exames e pausas lectivas.</p>
      </div>

      <div className="cal-grid">
        <div className="cal-card">
          <div className="cal-card-head" style={{ background: '#0055a4' }}>1.º Semestre 2025/2026</div>
          <div className="cal-card-body">
            <div className="cal-item"><span className="cal-item-label">Início das Aulas</span><span className="cal-item-date">17 Fev 2025</span></div>
            <div className="cal-item"><span className="cal-item-label">Avaliações Contínuas</span><span className="cal-item-date">Mar – Mai 2025</span></div>
            <div className="cal-item"><span className="cal-item-label">Exames Normais</span><span className="cal-item-date">09 – 23 Jun 2025</span></div>
            <div className="cal-item"><span className="cal-item-label">Exames de Recurso</span><span className="cal-item-date">30 Jun – 11 Jul</span></div>
          </div>
        </div>

        <div className="cal-card">
          <div className="cal-card-head" style={{ background: '#10b981' }}>2.º Semestre 2025/2026</div>
          <div className="cal-card-body">
            <div className="cal-item"><span className="cal-item-label">Início das Aulas</span><span className="cal-item-date">04 Ago 2025</span></div>
            <div className="cal-item"><span className="cal-item-label">Avaliações Contínuas</span><span className="cal-item-date">Set – Nov 2025</span></div>
            <div className="cal-item"><span className="cal-item-label">Exames Normais</span><span className="cal-item-date">17 Nov – 05 Dez</span></div>
            <div className="cal-item"><span className="cal-item-label">Exames de Recurso</span><span className="cal-item-date">08 – 19 Dez 2025</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Ensino Module Component ──────────────────────────────────────────────
export default function Ensino() {
  const { canAdd, canEdit, canDelete } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSeccao = searchParams.get('seccao') || searchParams.get('tab') || 'projetos-educativos';
  const [seccao, setSeccao] = useState(paramSeccao);

  useEffect(() => {
    if (paramSeccao && paramSeccao !== seccao) {
      setSeccao(paramSeccao);
    }
  }, [paramSeccao]);

  const handleSelectSeccao = (key) => {
    setSeccao(key);
    const params = new URLSearchParams(searchParams);
    params.set('seccao', key);
    setSearchParams(params);
  };

  const renderContent = () => {
    const props = { canAdd, canEdit, canDelete };
    switch(seccao) {
      case 'projetos-educativos':    return <ProjetosEducativos {...props} />;
      case 'projetos-curriculares':  return <ProjetosCurriculares {...props} />;
      case 'bibliotecas':            return <Bibliotecas {...props} />;
      case 'laboratorios':           return <Laboratorios {...props} />;
      case 'estatistica-academica':  return <EstatisticaAcademica />;
      case 'estatistica-pedagogica': return <EstatisticaPedagogica />;
      case 'calendario':             return <CalendarioAcademico />;
      case 'eventos':                return <EventosCientificos {...props} />;
      default:                       return <ProjetosEducativos {...props} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{paddingTop:'1.5rem',paddingBottom:'2rem',width:'100%'}}>
        <div className="ensino-layout">
          {/* Sidebar */}
          <aside className="ensino-sidebar">
            <div className="ensino-sidebar-title">Módulo Ensino</div>
            {SECCOES.map(s => (
              <button
                key={s.key}
                className={`ensino-nav-item${seccao===s.key?' active':''}`}
                onClick={()=>handleSelectSeccao(s.key)}
                style={{background:'none',border:'none',width:'100%',textAlign:'left',cursor:'pointer',font:'inherit'}}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}

            {/* Divisor */}
            <div className="ensino-sidebar-divider" />

            {/* Conteúdo útil ocupando o espaço em branco abaixo do menu */}
            <div className="ensino-sidebar-widget">
              <div className="ensino-widget-title">
                <span>📊</span> Resumo do Ensino
              </div>
              <div className="ensino-quick-stats">
                <div className="ensino-quick-stat-box">
                  <div className="ensino-quick-stat-val">4.820</div>
                  <div className="ensino-quick-stat-lbl">Estudantes</div>
                </div>
                <div className="ensino-quick-stat-box">
                  <div className="ensino-quick-stat-val">287</div>
                  <div className="ensino-quick-stat-lbl">Docentes</div>
                </div>
                <div className="ensino-quick-stat-box">
                  <div className="ensino-quick-stat-val">24</div>
                  <div className="ensino-quick-stat-lbl">Cursos</div>
                </div>
                <div className="ensino-quick-stat-box">
                  <div className="ensino-quick-stat-val">78%</div>
                  <div className="ensino-quick-stat-lbl">Aprovação</div>
                </div>
              </div>

              <div className="ensino-widget-title">
                <span>📚</span> Recursos Digitais
              </div>
              <a
                href="https://files.fm/u/3kdkcxhqjs"
                target="_blank"
                rel="noreferrer"
                className="ensino-quick-link"
                title="Aceder à Biblioteca Digital no files.fm"
              >
                <span>📖</span> Biblioteca Digital
              </a>
              <button
                type="button"
                onClick={() => handleSelectSeccao('calendario')}
                className="ensino-quick-link"
                style={{ width: '100%', textAlign: 'left', border: '1px solid #f1f5f9', font: 'inherit' }}
              >
                <span>📅</span> Calendário 2025/26
              </button>

              <div style={{ marginTop: '0.85rem' }}>
                <div className="ensino-quick-support">
                  <strong>Apoio Académico</strong>
                  <span>Secretaria Pedagógica</span>
                  <div style={{ marginTop: '0.25rem', fontWeight: 600 }}>📞 878787442</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Seg–Sex: 7h30–18h00</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="ensino-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}
