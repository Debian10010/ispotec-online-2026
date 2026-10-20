import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { homeSchoolService, CURSOS_ISPOTEC, MODULOS_POR_CURSO } from '../../services/homeschoolService';
import { planoSessaoService } from '../../services/planoSessaoService';
import { tutoriaService } from '../../services/tutoriaService';

/* ─── Shared styles ─────────────────────────────────────────────────────────── */
const CSS = `
  .ava-wrap { max-width: 1200px; margin: 1.5rem auto 4rem; padding: 0 1rem; width: 100%; box-sizing: border-box; }

  /* Hero */
  .ava-hero {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #0284c7 100%);
    color: #fff; border-radius: 16px; padding: 2.25rem 2.5rem;
    box-shadow: 0 10px 25px -5px rgba(49,46,129,.25);
    position: relative; overflow: hidden; margin-bottom: 1.75rem;
  }
  .ava-hero::after {
    content:'🎓'; position:absolute; right:25px; bottom:-20px;
    font-size:9rem; opacity:.07; pointer-events:none;
  }
  .ava-hero-badge {
    display:inline-flex; align-items:center; gap:.4rem;
    background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3);
    padding:.3rem .85rem; border-radius:20px; font-size:.8rem;
    font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin-bottom:.85rem;
  }
  .ava-hero h1 { font-size:2rem; font-weight:800; margin:0 0 .5rem; line-height:1.2; }
  .ava-hero p  { font-size:.95rem; color:rgba(255,255,255,.9); margin:0; line-height:1.6; max-width:800px; }

  /* Tab Nav */
  .ava-tabs {
    display:flex; flex-wrap:wrap; gap:.4rem;
    background:#fff; border:1px solid #e2e8f0; border-radius:12px;
    padding:.6rem; margin-bottom:1.75rem; box-shadow:0 2px 4px rgba(0,0,0,.03);
  }
  .ava-tab {
    display:flex; align-items:center; gap:.4rem;
    padding:.55rem 1rem; border-radius:8px; border:none;
    background:transparent; color:#64748b; font-size:.85rem;
    font-weight:600; cursor:pointer; transition:all .15s; white-space:nowrap;
  }
  .ava-tab:hover { background:#f1f5f9; color:#334155; }
  .ava-tab.active { background:linear-gradient(135deg,#4338ca,#3730a3); color:#fff; }

  /* Feedback */
  .ava-alert-ok  { background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; padding:.8rem 1.2rem; border-radius:10px; margin-bottom:1.25rem; font-weight:600; }
  .ava-alert-err { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:.8rem 1.2rem; border-radius:10px; margin-bottom:1.25rem; font-weight:600; }

  /* Stats row */
  .ava-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1.75rem; }
  .ava-stat { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.2rem 1.4rem;
    display:flex; align-items:center; gap:1rem; box-shadow:0 2px 4px rgba(0,0,0,.03); }
  .ava-stat-icon { width:46px; height:46px; border-radius:10px; display:flex; align-items:center;
    justify-content:center; font-size:1.5rem; flex-shrink:0; }
  .ava-stat-val  { font-size:1.7rem; font-weight:800; color:#0f172a; line-height:1.1; }
  .ava-stat-lbl  { font-size:.82rem; color:#64748b; margin-top:.15rem; }

  /* Cards grid */
  .ava-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.25rem; }
  .ava-card {
    background:#fff; border:1px solid #e2e8f0; border-radius:14px;
    padding:1.4rem; box-shadow:0 4px 6px -1px rgba(0,0,0,.04);
    transition:all .2s; display:flex; flex-direction:column;
    justify-content:space-between; border-top:4px solid #4338ca;
  }
  .ava-card:hover { transform:translateY(-3px); box-shadow:0 12px 20px -5px rgba(0,0,0,.08); }
  .ava-card-title { font-size:1.05rem; font-weight:700; color:#0f172a; margin:0 0 .3rem; }
  .ava-card-sub   { font-size:.87rem; color:#2563eb; font-weight:600; margin-bottom:.5rem; }
  .ava-card-meta  { background:#f8fafc; border-radius:8px; padding:.7rem; font-size:.82rem; color:#475569; margin-bottom:1rem; }
  .ava-card-meta div { margin-bottom:.2rem; }
  .ava-card-actions { display:flex; gap:.4rem; justify-content:flex-end; border-top:1px solid #f1f5f9; padding-top:.85rem; flex-wrap:wrap; }

  /* Buttons */
  .btn-ava-primary { background:linear-gradient(135deg,#4338ca,#3730a3); color:#fff; border:none;
    border-radius:8px; padding:.55rem 1.1rem; font-size:.88rem; font-weight:700;
    cursor:pointer; display:inline-flex; align-items:center; gap:.4rem; transition:all .15s;
    box-shadow:0 4px 10px rgba(67,56,202,.2); white-space:nowrap; }
  .btn-ava-primary:hover { transform:translateY(-1px); box-shadow:0 6px 14px rgba(67,56,202,.35); }
  .btn-ava-sm { background:#f1f5f9; border:1px solid #cbd5e1; color:#334155;
    padding:.32rem .65rem; border-radius:6px; font-size:.78rem; font-weight:600;
    cursor:pointer; transition:all .15s; }
  .btn-ava-sm:hover { background:#e2e8f0; }
  .btn-ava-del { color:#991b1b; border-color:#fca5a5; background:#fef2f2; }
  .btn-ava-del:hover { background:#fee2e2; }
  .btn-ava-enter { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff;
    text-decoration:none; padding:.5rem 1rem; border-radius:8px; font-size:.88rem;
    font-weight:700; display:inline-flex; align-items:center; gap:.4rem; transition:all .15s; }
  .btn-ava-enter:hover { background:linear-gradient(135deg,#1d4ed8,#1e40af); color:#fff; transform:translateX(2px); }

  /* Filter bar */
  .ava-filter-bar { background:#fff; border:1px solid #e2e8f0; border-radius:12px;
    padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap;
    gap:.85rem; align-items:center; justify-content:space-between; }
  .ava-search { position:relative; min-width:240px; flex:1; }
  .ava-search input { width:100%; padding:.55rem .85rem .55rem 2.1rem;
    border:1px solid #cbd5e1; border-radius:8px; font-size:.88rem; box-sizing:border-box; }
  .ava-search-icon { position:absolute; left:.7rem; top:50%; transform:translateY(-50%); color:#94a3b8; }
  .ava-select { padding:.55rem .85rem; border:1px solid #cbd5e1; border-radius:8px;
    font-size:.88rem; background:#fff; color:#334155; }

  /* Section bar */
  .ava-section-bar { display:flex; justify-content:space-between; align-items:center;
    margin-bottom:1.25rem; flex-wrap:wrap; gap:.75rem; }
  .ava-section-title { font-size:1.1rem; font-weight:700; color:#1e293b; margin:0;
    display:flex; align-items:center; gap:.5rem; }

  /* Table */
  .ava-table-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:12px;
    overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,.04); margin-bottom:1.75rem; overflow-x:auto; -webkit-overflow-scrolling: touch; }
  .ava-table { width:100%; border-collapse:collapse; font-size:.875rem; }
  .ava-table th { background:#f8fafc; padding:.75rem 1rem; text-align:left;
    font-weight:600; color:#374151; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
  .ava-table td { padding:.7rem 1rem; border-bottom:1px solid #f1f5f9; color:#475569; }
  .ava-table tr:last-child td { border-bottom:none; }
  .ava-table tr:hover td { background:#f8fafc; }

  /* Badge */
  .ava-badge { display:inline-block; padding:.2rem .6rem; border-radius:6px; font-size:.73rem; font-weight:600; }
  .badge-green  { background:#d1fae5; color:#065f46; }
  .badge-blue   { background:#dbeafe; color:#1d4ed8; }
  .badge-orange { background:#fef3c7; color:#92400e; }
  .badge-purple { background:#ede9fe; color:#5b21b6; }
  .badge-red    { background:#fee2e2; color:#991b1b; }
  .badge-gray   { background:#f1f5f9; color:#475569; }

  /* Modal */
  .ava-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,.75);
    z-index:1200; display:flex; align-items:center; justify-content:center;
    padding:1rem; backdrop-filter:blur(3px); }
  .ava-modal { background:#fff; border-radius:16px; padding:2rem; max-width:680px;
    width:100%; max-height:90vh; overflow-y:auto;
    box-shadow:0 20px 25px -5px rgba(0,0,0,.25); }
  .ava-modal h3 { margin:0 0 1.25rem; color:#0f172a; font-size:1.2rem; }
  .ava-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:.85rem; margin-bottom:.9rem; }
  .ava-form-full { margin-bottom:.9rem; }
  .ava-label { display:block; font-size:.84rem; font-weight:600; color:#334155; margin-bottom:.3rem; }
  .ava-input { width:100%; padding:.55rem .75rem; border:1px solid #cbd5e1;
    border-radius:8px; font-size:.87rem; box-sizing:border-box; }
  .ava-textarea { width:100%; padding:.55rem .75rem; border:1px solid #cbd5e1;
    border-radius:8px; font-size:.87rem; box-sizing:border-box; resize:vertical; }
  .ava-modal-footer { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1.25rem; }
  .btn-ava-cancel { padding:.55rem 1.1rem; border:1px solid #cbd5e1; border-radius:8px;
    background:#f8fafc; color:#475569; cursor:pointer; font-weight:600; }

  /* Sumário panel */
  .sumario-panel { background:#fffbeb; border:1px solid #fde68a; border-radius:10px;
    padding:1.1rem; margin-top:.75rem; }
  .sumario-panel h5 { margin:0 0 .75rem; font-size:.9rem; color:#92400e; }

  /* Empty */
  .ava-empty { text-align:center; padding:4rem 1rem; background:#fff;
    border:1px dashed #cbd5e1; border-radius:16px; color:#64748b; }
  .ava-empty-icon { font-size:3rem; margin-bottom:.75rem; }

  /* ================= RESPONSIVIDADE (Mobile, Tablet e PC) ================= */

  /* TABLET (641px - 1024px) */
  @media (min-width: 641px) and (max-width: 1024px) {
    .ava-wrap { padding: 0 1.25rem; }
    .ava-hero { padding: 1.75rem 2rem; }
    .ava-hero h1 { font-size: 1.75rem; }
    .ava-stats { grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
    .ava-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .ava-filter-bar { gap: 0.75rem; padding: 0.9rem 1rem; }
    .ava-search { min-width: 180px; }
  }

  /* MOBILE (< 640px) */
  @media (max-width: 640px) {
    .ava-wrap { padding: 0 0.75rem; margin: 1rem auto 3rem; }
    .ava-hero { padding: 1.35rem 1rem; border-radius: 12px; margin-bottom: 1.25rem; }
    .ava-hero::after { display: none; }
    .ava-hero-badge { font-size: 0.72rem; padding: 0.25rem 0.65rem; }
    .ava-hero h1 { font-size: 1.4rem; line-height: 1.25; margin-bottom: 0.4rem; }
    .ava-hero p { font-size: 0.88rem; line-height: 1.5; }

    /* Scrollable horizontal tabs */
    .ava-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      gap: 0.35rem;
      padding: 0.45rem;
      margin-bottom: 1.25rem;
      border-radius: 10px;
      scrollbar-width: none;
    }
    .ava-tabs::-webkit-scrollbar { display: none; }
    .ava-tab {
      flex-shrink: 0;
      padding: 0.45rem 0.8rem;
      font-size: 0.8rem;
    }

    /* 2-column or 1-column stats on small mobile */
    .ava-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.65rem;
      margin-bottom: 1.25rem;
    }
    .ava-stat {
      padding: 0.85rem 0.8rem;
      gap: 0.65rem;
      border-radius: 10px;
    }
    .ava-stat-icon {
      width: 38px;
      height: 38px;
      font-size: 1.2rem;
    }
    .ava-stat-val {
      font-size: 1.25rem;
    }
    .ava-stat-lbl {
      font-size: 0.72rem;
      line-height: 1.2;
    }

    /* Filter bar stacked */
    .ava-filter-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 0.85rem;
      gap: 0.65rem;
    }
    .ava-filter-bar > div {
      flex-direction: column !important;
      width: 100% !important;
      gap: 0.5rem !important;
    }
    .ava-search {
      width: 100%;
      min-width: 100%;
    }
    .ava-select {
      width: 100%;
    }
    .btn-ava-primary {
      width: 100%;
      justify-content: center;
      padding: 0.65rem 1rem;
    }

    /* Section bar stacked */
    .ava-section-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.65rem;
    }
    .ava-section-bar > div {
      flex-direction: column !important;
      width: 100% !important;
      gap: 0.5rem !important;
    }
    .ava-section-bar .ava-select {
      width: 100% !important;
      min-width: 100% !important;
    }

    /* Cards 1 column */
    .ava-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .ava-card {
      padding: 1.15rem;
      border-radius: 12px;
    }
    .ava-card-actions {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    .btn-ava-enter {
      width: 100%;
      justify-content: center;
      text-align: center;
    }

    /* Tables */
    .ava-table th, .ava-table td {
      padding: 0.55rem 0.65rem;
      font-size: 0.78rem;
    }

    /* Modals */
    .ava-modal-bg {
      padding: 0.5rem;
      align-items: flex-end;
    }
    .ava-modal {
      max-width: 100%;
      width: 100%;
      max-height: 92vh;
      padding: 1.25rem 1rem;
      border-radius: 16px 16px 0 0;
    }
    .ava-form-grid {
      grid-template-columns: 1fr;
      gap: 0.65rem;
    }
    .ava-modal-footer {
      flex-direction: column-reverse;
      gap: 0.5rem;
    }
    .ava-modal-footer button {
      width: 100%;
      justify-content: center;
      text-align: center;
      padding: 0.65rem 1rem;
    }
  }

  @media (max-width: 380px) {
    .ava-stats {
      grid-template-columns: 1fr;
    }
  }
`;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function estadoSessaoBadge(e) {
  const m = { agendada:'badge-blue', realizada:'badge-green', reagendada:'badge-orange', cancelada:'badge-red', pendente_sumario:'badge-purple' };
  return <span className={`ava-badge ${m[e] || 'badge-gray'}`}>{e}</span>;
}
function estadoTutoriaBadge(e) {
  const m = { activo:'badge-green', concluido:'badge-blue', suspenso:'badge-orange' };
  return <span className={`ava-badge ${m[e] || 'badge-gray'}`}>{e}</span>;
}

/* ────────────────────────────────────────────────────────────────────────────
   TAB A — Salas Virtuais (existente)
   ──────────────────────────────────────────────────────────────────────────── */
function TabSalasVirtuais({ user }) {
  const isAdmin  = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && user.tipo === 'docente';
  const canManage = isAdmin || isDocente;

  const [salas, setSalas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selCurso, setSelCurso]     = useState('Todos');
  const [selSem, setSelSem]         = useState('Todos');
  const [selEst, setSelEst]         = useState('Todos');
  const [showModal, setShowModal]   = useState(false);
  const [editingSala, setEditingSala] = useState(null);
  const [feedback, setFeedback]     = useState({ msg:'', tipo:'' });

  const emptyForm = () => ({
    nome:'', curso: CURSOS_ISPOTEC[0],
    modulo: MODULOS_POR_CURSO[CURSOS_ISPOTEC[0]]?.[0] || '',
    disciplina: MODULOS_POR_CURSO[CURSOS_ISPOTEC[0]]?.[0] || '',
    docente: user?.nome || '', ano:'2026', semestre:'1º Semestre',
    codigo:`HS-${Math.random().toString(36).substring(2,6).toUpperCase()}-2026`,
    descricao:'', estado:'Ativo', dataInicio:'2026-02-15', dataTermino:'2026-06-30'
  });
  const [formData, setFormData] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try { setSalas(await homeSchoolService.getSalas(user)); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const fb = (msg, tipo='sucesso') => { setFeedback({msg,tipo}); setTimeout(()=>setFeedback({msg:'',tipo:''}),4000); };

  const openCreate = () => { setEditingSala(null); setFormData(emptyForm()); setShowModal(true); };
  const openEdit   = (s)  => {
    setEditingSala(s);
    setFormData({ id:s.id||s._id, nome:s.nome||'', curso:s.curso||CURSOS_ISPOTEC[0],
      modulo:s.modulo||s.disciplina||'', disciplina:s.disciplina||s.modulo||'',
      docente:s.docente||'', ano:s.ano||'2026', semestre:s.semestre||'1º Semestre',
      codigo:s.codigo||'', descricao:s.descricao||'', estado:s.estado||'Ativo',
      dataInicio:s.dataInicio||'2026-02-15', dataTermino:s.dataTermino||'2026-06-30' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.modulo.trim()) { fb('Nome e Módulo são obrigatórios.','erro'); return; }
    try {
      await homeSchoolService.saveSala({ ...formData, disciplina: formData.modulo });
      fb(editingSala ? 'Sala actualizada!' : 'Sala criada!');
      setShowModal(false); load();
    } catch { fb('Erro ao guardar.','erro'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar esta sala virtual?')) return;
    try { await homeSchoolService.deleteSala(id); fb('Sala eliminada.'); load(); }
    catch { fb('Erro ao eliminar.','erro'); }
  };

  const filtered = salas.filter(s => {
    const q = searchTerm.toLowerCase();
    return (!q || [s.nome,s.modulo,s.curso,s.docente,s.codigo].some(v=>v&&v.toLowerCase().includes(q)))
      && (selCurso==='Todos' || s.curso===selCurso)
      && (selSem==='Todos'   || s.semestre===selSem)
      && (selEst==='Todos'   || s.estado===selEst);
  });

  return (
    <>
      {feedback.msg && <div className={feedback.tipo==='sucesso'?'ava-alert-ok':'ava-alert-err'}>
        {feedback.tipo==='sucesso'?'✓':'⚠️'} {feedback.msg}</div>}

      {/* Stats */}
      <div className="ava-stats">
        {[
          { icon:'🏫', bg:'#e0e7ff', col:'#4338ca', val:salas.length, lbl:'Salas Criadas' },
          { icon:'📚', bg:'#dbeafe', col:'#1d4ed8', val:new Set(salas.map(s=>s.curso)).size, lbl:'Cursos Abrangidos' },
          { icon:'🟢', bg:'#d1fae5', col:'#047857', val:salas.filter(s=>s.estado==='Ativo').length, lbl:'Salas Activas' },
          { icon:'👥', bg:'#fef3c7', col:'#b45309', val:salas.reduce((a,c)=>a+(c.total_membros||20),0), lbl:'Estudantes Inscritos' },
        ].map((s,i)=>(
          <div className="ava-stat" key={i}>
            <div className="ava-stat-icon" style={{background:s.bg,color:s.col}}>{s.icon}</div>
            <div><div className="ava-stat-val">{s.val}</div><div className="ava-stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ava-filter-bar">
        <div style={{display:'flex',flexWrap:'wrap',gap:'.75rem',flex:1}}>
          <div className="ava-search">
            <span className="ava-search-icon">🔍</span>
            <input placeholder="Pesquisar sala, módulo, docente..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <select className="ava-select" value={selCurso} onChange={e=>setSelCurso(e.target.value)}>
            <option value="Todos">Todos os Cursos</option>
            {CURSOS_ISPOTEC.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select className="ava-select" value={selSem} onChange={e=>setSelSem(e.target.value)}>
            <option value="Todos">Todos os Semestres</option>
            <option>1º Semestre</option><option>2º Semestre</option><option>Anual</option>
          </select>
          <select className="ava-select" value={selEst} onChange={e=>setSelEst(e.target.value)}>
            <option value="Todos">Todos os Estados</option>
            <option>Ativo</option><option>Inativo</option>
          </select>
        </div>
        {canManage && <button className="btn-ava-primary" onClick={openCreate}>+ Criar Sala</button>}
      </div>

      {/* Cards */}
      {loading ? <div className="ava-empty"><div className="ava-empty-icon">⏳</div><p>A carregar salas...</p></div> : (
        <div className="ava-grid">
          {filtered.length === 0 ? (
            <div className="ava-empty" style={{gridColumn:'1/-1'}}>
              <div className="ava-empty-icon">🏫</div>
              <h3 style={{color:'#1e293b'}}>Nenhuma sala encontrada</h3>
              <p>Ajuste os filtros ou crie uma nova sala.</p>
              {canManage && <button className="btn-ava-primary" style={{marginTop:'1rem'}} onClick={openCreate}>+ Criar Sala</button>}
            </div>
          ) : filtered.map(sala => {
            const sid = sala.id || sala._id;
            return (
              <div className="ava-card" key={sid}>
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'.75rem',color:'#64748b',marginBottom:'.55rem'}}>
                    <span style={{background:'#e0e7ff',color:'#3730a3',fontWeight:700,padding:'.2rem .55rem',borderRadius:'6px'}}>{sala.curso}</span>
                    <span>🏷️ {sala.codigo||'HS-2026'}</span>
                  </div>
                  <h3 className="ava-card-title">{sala.nome}</h3>
                  <div className="ava-card-sub">📘 {sala.modulo||sala.disciplina}</div>
                  <p style={{fontSize:'.87rem',color:'#64748b',marginBottom:'1rem',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{sala.descricao}</p>
                  <div className="ava-card-meta">
                    <div>👨‍🏫 <strong>Docente:</strong> {sala.docente||'Docente Responsável'}</div>
                    <div>📅 <strong>Semestre:</strong> {sala.semestre} • {sala.ano}</div>
                    <div>👥 <strong>Estudantes:</strong> {sala.total_membros||25} inscritos</div>
                  </div>
                </div>
                <div className="ava-card-actions">
                  <Link to={`/homeschool/sala/${sid}`} className="btn-ava-enter">🏫 Entrar →</Link>
                  {canManage && (
                    <div style={{display:'flex',gap:'.35rem'}}>
                      <button className="btn-ava-sm" onClick={()=>openEdit(sala)}>✏️</button>
                      <button className="btn-ava-sm btn-ava-del" onClick={()=>handleDelete(sid)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="ava-modal-bg" onClick={()=>setShowModal(false)}>
          <div className="ava-modal" onClick={e=>e.stopPropagation()}>
            <h3>{editingSala?'✏️ Editar Sala':'🏫 Criar Nova Sala Virtual'}</h3>
            <form onSubmit={handleSave}>
              <div className="ava-form-grid">
                <div>
                  <label className="ava-label">Curso *</label>
                  <select className="ava-input" value={formData.curso} onChange={e=>{
                    const c=e.target.value; const mods=MODULOS_POR_CURSO[c]||[];
                    setFormData({...formData,curso:c,modulo:mods[0]||formData.modulo});
                  }}>
                    {CURSOS_ISPOTEC.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ava-label">Módulo / Disciplina *</label>
                  <input className="ava-input" required placeholder="Ex: Programação Web"
                    value={formData.modulo} onChange={e=>setFormData({...formData,modulo:e.target.value,disciplina:e.target.value})} />
                </div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Nome da Sala *</label>
                <input className="ava-input" required placeholder="Ex: Programação Web — Grupo A — 2026"
                  value={formData.nome} onChange={e=>setFormData({...formData,nome:e.target.value})} />
              </div>
              <div className="ava-form-grid">
                <div><label className="ava-label">Docente *</label>
                  <input className="ava-input" required value={formData.docente} onChange={e=>setFormData({...formData,docente:e.target.value})} /></div>
                <div><label className="ava-label">Código</label>
                  <input className="ava-input" value={formData.codigo} onChange={e=>setFormData({...formData,codigo:e.target.value})} /></div>
                <div><label className="ava-label">Semestre</label>
                  <select className="ava-input" value={formData.semestre} onChange={e=>setFormData({...formData,semestre:e.target.value})}>
                    <option>1º Semestre</option><option>2º Semestre</option><option>Anual</option>
                  </select></div>
                <div><label className="ava-label">Estado</label>
                  <select className="ava-input" value={formData.estado} onChange={e=>setFormData({...formData,estado:e.target.value})}>
                    <option>Ativo</option><option>Inativo</option>
                  </select></div>
                <div><label className="ava-label">Data de Início</label>
                  <input type="date" className="ava-input" value={formData.dataInicio} onChange={e=>setFormData({...formData,dataInicio:e.target.value})} /></div>
                <div><label className="ava-label">Data de Término</label>
                  <input type="date" className="ava-input" value={formData.dataTermino} onChange={e=>setFormData({...formData,dataTermino:e.target.value})} /></div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Descrição</label>
                <textarea className="ava-textarea" rows="3" placeholder="Objetivos, horários e orientações gerais..."
                  value={formData.descricao} onChange={e=>setFormData({...formData,descricao:e.target.value})} />
              </div>
              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={()=>setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary">{editingSala?'Guardar':'Criar Sala'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TAB B — Plano de Sessões / Sumários
   ──────────────────────────────────────────────────────────────────────────── */
function TabPlanoSessoes({ user }) {
  const isAdmin   = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && user.tipo === 'docente';
  const canManage = isAdmin || isDocente;

  const [sessoes, setSessoes]         = useState([]);
  const [livro, setLivro]             = useState({ total_sessoes:0, total_realizadas:0, total_pendentes:0, horas_previstas:0, horas_efetivas:0 });
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState('sessoes'); // 'sessoes' | 'livro'
  const [showModal, setShowModal]     = useState(false);
  const [showSumModal, setShowSumModal] = useState(null);
  const [editingSessao, setEditingSessao] = useState(null);
  const [feedback, setFeedback]       = useState({ msg:'', tipo:'' });
  const [submitting, setSubmitting]   = useState(false);
  const [filtroDisciplina, setFiltroDisciplina] = useState('');

  const emptyForm = () => ({
    disciplina:'', turma:'', curso:'', sala:'', docente_nome: user?.nome||'',
    tipo_sessao:'Teórica', sequencia_sessao:1,
    data_sessao: new Date().toISOString().split('T')[0],
    hora_inicio:'08:00', hora_fim:'10:00', duracao_prevista_minutos:120,
    tema:'', objectivos:'', conteudos_previstos:'', actividades_previstas:'', materiais_necessarios:''
  });
  const emptySumario = () => ({
    materia_leccionada:'', conteudos_concluidos:'', conteudos_pendentes:'',
    actividades_praticas_realizadas:'', ocorrencias:'', observacoes:'',
    tarefas_recomendadas:'', duracao_efetiva_minutos:90
  });

  const [formData, setFormData]     = useState(emptyForm);
  const [sumData, setSumData]       = useState(emptySumario);

  const load = async () => {
    setLoading(true);
    try {
      const params = filtroDisciplina ? { disciplina: filtroDisciplina } : {};
      const [s, l] = await Promise.all([
        planoSessaoService.getSessoes(params),
        planoSessaoService.getLivroSumarios(params)
      ]);
      setSessoes(s); setLivro(l);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filtroDisciplina]);

  const fb = (msg, tipo='sucesso') => { setFeedback({msg,tipo}); setTimeout(()=>setFeedback({msg:'',tipo:''}),4000); };

  const handleSave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingSessao) {
        await planoSessaoService.updateSessao(editingSessao._id||editingSessao.id, formData);
        fb('Sessão actualizada!');
      } else {
        await planoSessaoService.createSessao(formData);
        fb('Sessão criada!');
      }
      setShowModal(false); setEditingSessao(null); load();
    } catch { fb('Erro ao guardar.','erro'); }
    finally { setSubmitting(false); }
  };

  const handleSaveSumario = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const sid = showSumModal._id || showSumModal.id;
      await planoSessaoService.registarSumario(sid, sumData);
      fb('Sumário registado com sucesso!');
      setShowSumModal(null); load();
    } catch { fb('Erro ao registar sumário.','erro'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (s) => {
    setEditingSessao(s);
    setFormData({
      disciplina:s.disciplina||'', turma:s.turma||'', curso:s.curso||'',
      sala:s.sala||'', docente_nome:s.docente_nome||user?.nome||'',
      tipo_sessao:s.tipo_sessao||'Teórica', sequencia_sessao:s.sequencia_sessao||1,
      data_sessao:s.data_sessao||'', hora_inicio:s.hora_inicio||'08:00',
      hora_fim:s.hora_fim||'10:00', duracao_prevista_minutos:s.duracao_prevista_minutos||120,
      tema:s.tema||'', objectivos:s.objectivos||'', conteudos_previstos:s.conteudos_previstos||'',
      actividades_previstas:s.actividades_previstas||'', materiais_necessarios:s.materiais_necessarios||''
    });
    setShowModal(true);
  };

  const openSumario = (s) => { setSumData(emptySumario()); setShowSumModal(s); };

  return (
    <>
      {feedback.msg && <div className={feedback.tipo==='sucesso'?'ava-alert-ok':'ava-alert-err'}>{feedback.tipo==='sucesso'?'✓':'⚠️'} {feedback.msg}</div>}

      {/* Stats livro */}
      <div className="ava-stats">
        {[
          { icon:'📋', bg:'#e0e7ff', col:'#4338ca', val:livro.total_sessoes||0, lbl:'Sessões Programadas' },
          { icon:'✅', bg:'#d1fae5', col:'#047857', val:livro.total_realizadas||0, lbl:'Sessões Realizadas' },
          { icon:'⏳', bg:'#fef3c7', col:'#b45309', val:livro.total_pendentes||0, lbl:'Pendentes / Sumário' },
          { icon:'⏱️', bg:'#dbeafe', col:'#1d4ed8', val:`${livro.horas_efetivas||0}h`, lbl:`de ${livro.horas_previstas||0}h previstas` },
        ].map((s,i)=>(
          <div className="ava-stat" key={i}>
            <div className="ava-stat-icon" style={{background:s.bg,color:s.col}}>{s.icon}</div>
            <div><div className="ava-stat-val">{s.val}</div><div className="ava-stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      {/* Sub-view toggle + actions */}
      <div className="ava-section-bar">
        <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
          <button className={`btn-ava-sm ${view==='sessoes'?'btn-ava-primary':''}`} onClick={()=>setView('sessoes')}>📋 Sessões</button>
          <button className={`btn-ava-sm ${view==='livro'?'btn-ava-primary':''}`} onClick={()=>setView('livro')}>📖 Livro de Sumários</button>
        </div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
          <input className="ava-select" placeholder="Filtrar por disciplina..." style={{minWidth:'200px'}}
            value={filtroDisciplina} onChange={e=>setFiltroDisciplina(e.target.value)} />
          {canManage && <button className="btn-ava-primary" onClick={()=>{setEditingSessao(null);setFormData(emptyForm());setShowModal(true);}}>+ Nova Sessão</button>}
        </div>
      </div>

      {loading ? <div className="ava-empty"><div className="ava-empty-icon">⏳</div><p>A carregar sessões...</p></div> : (
        view === 'sessoes' ? (
          /* Tabela de Sessões */
          sessoes.length === 0 ? (
            <div className="ava-empty">
              <div className="ava-empty-icon">📋</div>
              <h3 style={{color:'#1e293b'}}>Nenhuma sessão planificada</h3>
              <p>Crie a primeira sessão para começar a planificação.</p>
              {canManage && <button className="btn-ava-primary" style={{marginTop:'1rem'}} onClick={()=>{setEditingSessao(null);setFormData(emptyForm());setShowModal(true);}}>+ Criar Sessão</button>}
            </div>
          ) : (
            <div className="ava-table-wrap">
              <table className="ava-table">
                <thead>
                  <tr>
                    <th>#</th><th>Disciplina / Turma</th><th>Tipo</th><th>Data</th>
                    <th>Hora</th><th>Tema</th><th>Estado</th><th>Sumário</th>
                    {canManage && <th>Acções</th>}
                  </tr>
                </thead>
                <tbody>
                  {sessoes.map(s => (
                    <tr key={s._id||s.id}>
                      <td><strong>{s.sequencia_sessao}</strong></td>
                      <td><div style={{fontWeight:600,color:'#0f172a'}}>{s.disciplina}</div><div style={{fontSize:'.8rem',color:'#64748b'}}>{s.turma}</div></td>
                      <td><span className="ava-badge badge-blue">{s.tipo_sessao}</span></td>
                      <td>{s.data_sessao}</td>
                      <td>{s.hora_inicio}–{s.hora_fim}</td>
                      <td style={{maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.tema}</td>
                      <td>{estadoSessaoBadge(s.estado)}</td>
                      <td>
                        {s.sumario?.registado
                          ? <span className="ava-badge badge-green">✓ Registado</span>
                          : <span className="ava-badge badge-orange">Pendente</span>}
                      </td>
                      {canManage && (
                        <td>
                          <div style={{display:'flex',gap:'.3rem'}}>
                            <button className="btn-ava-sm" onClick={()=>openEdit(s)}>✏️</button>
                            {!s.sumario?.registado && <button className="btn-ava-sm" style={{background:'#ede9fe',color:'#5b21b6',borderColor:'#c4b5fd'}} onClick={()=>openSumario(s)}>📝</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Livro de Sumários */
          <div>
            {sessoes.filter(s=>s.sumario?.registado).length === 0 ? (
              <div className="ava-empty">
                <div className="ava-empty-icon">📖</div>
                <h3 style={{color:'#1e293b'}}>Livro de Sumários vazio</h3>
                <p>Nenhum sumário registado ainda. Após realizar uma sessão, registe o sumário.</p>
              </div>
            ) : sessoes.filter(s=>s.sumario?.registado).map(s=>(
              <div key={s._id||s.id} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem',boxShadow:'0 2px 4px rgba(0,0,0,.04)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.5rem',marginBottom:'.75rem'}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:'1rem',color:'#0f172a'}}>Sessão #{s.sequencia_sessao} — {s.disciplina}</div>
                    <div style={{fontSize:'.85rem',color:'#64748b'}}>{s.turma} • {s.data_sessao} • {s.hora_inicio}–{s.hora_fim}</div>
                  </div>
                  <span className="ava-badge badge-green">✓ Sumário Registado</span>
                </div>
                <div style={{background:'#f8fafc',borderRadius:'8px',padding:'.85rem',fontSize:'.86rem',color:'#334155'}}>
                  <div><strong>Tema:</strong> {s.tema}</div>
                  {s.sumario.materia_leccionada && <div style={{marginTop:'.4rem'}}><strong>Matéria leccionada:</strong> {s.sumario.materia_leccionada}</div>}
                  {s.sumario.conteudos_concluidos && <div style={{marginTop:'.4rem'}}><strong>Conteúdos concluídos:</strong> {s.sumario.conteudos_concluidos}</div>}
                  {s.sumario.conteudos_pendentes && <div style={{marginTop:'.4rem'}}><strong>Conteúdos pendentes:</strong> {s.sumario.conteudos_pendentes}</div>}
                  {s.sumario.tarefas_recomendadas && <div style={{marginTop:'.4rem'}}><strong>Tarefas recomendadas:</strong> {s.sumario.tarefas_recomendadas}</div>}
                  {s.sumario.observacoes && <div style={{marginTop:'.4rem'}}><strong>Observações:</strong> {s.sumario.observacoes}</div>}
                  <div style={{marginTop:'.55rem',fontSize:'.78rem',color:'#94a3b8'}}>
                    Registado por {s.sumario.registado_por_nome||'—'} · {s.sumario.confirmacao_eletronica?.confirmado ? '✓ Confirmado electronicamente' : 'Pendente confirmação'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Sessão */}
      {showModal && (
        <div className="ava-modal-bg" onClick={()=>setShowModal(false)}>
          <div className="ava-modal" onClick={e=>e.stopPropagation()}>
            <h3>{editingSessao?'✏️ Editar Sessão':'📋 Nova Sessão / Aula'}</h3>
            <form onSubmit={handleSave}>
              <div className="ava-form-grid">
                <div><label className="ava-label">Disciplina *</label>
                  <input className="ava-input" required value={formData.disciplina} onChange={e=>setFormData({...formData,disciplina:e.target.value})} /></div>
                <div><label className="ava-label">Turma *</label>
                  <input className="ava-input" required value={formData.turma} onChange={e=>setFormData({...formData,turma:e.target.value})} /></div>
                <div><label className="ava-label">Curso</label>
                  <input className="ava-input" value={formData.curso} onChange={e=>setFormData({...formData,curso:e.target.value})} /></div>
                <div><label className="ava-label">Sala</label>
                  <input className="ava-input" value={formData.sala} onChange={e=>setFormData({...formData,sala:e.target.value})} /></div>
                <div><label className="ava-label">Docente</label>
                  <input className="ava-input" value={formData.docente_nome} onChange={e=>setFormData({...formData,docente_nome:e.target.value})} /></div>
                <div><label className="ava-label">Tipo</label>
                  <select className="ava-input" value={formData.tipo_sessao} onChange={e=>setFormData({...formData,tipo_sessao:e.target.value})}>
                    <option>Teórica</option><option>Prática</option><option>Laboratório</option><option>Seminário</option>
                  </select></div>
                <div><label className="ava-label">Data *</label>
                  <input type="date" className="ava-input" required value={formData.data_sessao} onChange={e=>setFormData({...formData,data_sessao:e.target.value})} /></div>
                <div><label className="ava-label">Hora Início</label>
                  <input type="time" className="ava-input" value={formData.hora_inicio} onChange={e=>setFormData({...formData,hora_inicio:e.target.value})} /></div>
                <div><label className="ava-label">Hora Fim</label>
                  <input type="time" className="ava-input" value={formData.hora_fim} onChange={e=>setFormData({...formData,hora_fim:e.target.value})} /></div>
                <div><label className="ava-label">Nº da Sessão</label>
                  <input type="number" className="ava-input" min="1" value={formData.sequencia_sessao} onChange={e=>setFormData({...formData,sequencia_sessao:Number(e.target.value)})} /></div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Tema da Sessão *</label>
                <input className="ava-input" required value={formData.tema} onChange={e=>setFormData({...formData,tema:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Objectivos</label>
                <textarea className="ava-textarea" rows="2" value={formData.objectivos} onChange={e=>setFormData({...formData,objectivos:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Conteúdos Previstos</label>
                <textarea className="ava-textarea" rows="2" value={formData.conteudos_previstos} onChange={e=>setFormData({...formData,conteudos_previstos:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Actividades Previstas</label>
                <textarea className="ava-textarea" rows="2" value={formData.actividades_previstas} onChange={e=>setFormData({...formData,actividades_previstas:e.target.value})} />
              </div>
              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={()=>setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary" disabled={submitting}>{submitting?'A guardar...': editingSessao?'Guardar':'Criar Sessão'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sumário */}
      {showSumModal && (
        <div className="ava-modal-bg" onClick={()=>setShowSumModal(null)}>
          <div className="ava-modal" onClick={e=>e.stopPropagation()}>
            <h3>📝 Registar Sumário — Sessão #{showSumModal.sequencia_sessao}</h3>
            <div style={{background:'#f8fafc',borderRadius:'8px',padding:'.75rem',marginBottom:'1rem',fontSize:'.86rem',color:'#475569'}}>
              <strong>{showSumModal.disciplina}</strong> · {showSumModal.turma} · {showSumModal.data_sessao} · {showSumModal.hora_inicio}–{showSumModal.hora_fim}
            </div>
            <form onSubmit={handleSaveSumario}>
              <div className="ava-form-full">
                <label className="ava-label">Matéria Efectivamente Leccionada *</label>
                <textarea className="ava-textarea" rows="3" required value={sumData.materia_leccionada} onChange={e=>setSumData({...sumData,materia_leccionada:e.target.value})} />
              </div>
              <div className="ava-form-grid">
                <div><label className="ava-label">Conteúdos Concluídos</label>
                  <textarea className="ava-textarea" rows="2" value={sumData.conteudos_concluidos} onChange={e=>setSumData({...sumData,conteudos_concluidos:e.target.value})} /></div>
                <div><label className="ava-label">Conteúdos Pendentes</label>
                  <textarea className="ava-textarea" rows="2" value={sumData.conteudos_pendentes} onChange={e=>setSumData({...sumData,conteudos_pendentes:e.target.value})} /></div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Actividades Práticas Realizadas</label>
                <textarea className="ava-textarea" rows="2" value={sumData.actividades_praticas_realizadas} onChange={e=>setSumData({...sumData,actividades_praticas_realizadas:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Tarefas Recomendadas aos Estudantes</label>
                <textarea className="ava-textarea" rows="2" value={sumData.tarefas_recomendadas} onChange={e=>setSumData({...sumData,tarefas_recomendadas:e.target.value})} />
              </div>
              <div className="ava-form-grid">
                <div><label className="ava-label">Ocorrências / Observações</label>
                  <textarea className="ava-textarea" rows="2" value={sumData.observacoes} onChange={e=>setSumData({...sumData,observacoes:e.target.value})} /></div>
                <div><label className="ava-label">Duração Efectiva (min)</label>
                  <input type="number" className="ava-input" min="0" value={sumData.duracao_efetiva_minutos} onChange={e=>setSumData({...sumData,duracao_efetiva_minutos:Number(e.target.value)})} /></div>
              </div>
              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={()=>setShowSumModal(null)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary" disabled={submitting}>{submitting?'A guardar...':'Registar Sumário'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TAB C — Tutoria e Acompanhamento
   ──────────────────────────────────────────────────────────────────────────── */
function TabTutoria({ user }) {
  const isAdmin   = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && user.tipo === 'docente';
  const canManage = isAdmin || isDocente;

  const [tutorias, setTutorias]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showSessModal, setShowSessModal] = useState(null);
  const [editingT, setEditingT]     = useState(null);
  const [feedback, setFeedback]     = useState({ msg:'', tipo:'' });
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = () => ({
    tutor_nome: user?.nome||'', tutor_email: user?.email||'',
    estudante_nome:'', estudante_email:'',
    encarregado_nome:'', encarregado_email:'', encarregado_telefone:'',
    curso:'', turma:'', ano_lectivo:'2026', observacoes_gerais:''
  });
  const emptySess = () => ({
    tipo:'Individual', objectivos:'', orientacoes:'', recomendacoes:'',
    dificuldades_apontadas:'', evolucao_observada:'', proximos_passos:'',
    registado_por: user?.nome||''
  });

  const [formData, setFormData] = useState(emptyForm);
  const [sessData, setSessData] = useState(emptySess);

  const load = async () => {
    setLoading(true);
    try { setTutorias(await tutoriaService.getTutorias()); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const fb = (msg, tipo='sucesso') => { setFeedback({msg,tipo}); setTimeout(()=>setFeedback({msg:'',tipo:''}),4000); };

  const handleSave = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...formData, tutor_id: user?.id||'', estudante_id: formData.estudante_email||formData.estudante_nome };
      if (editingT) { await tutoriaService.updateTutoria(editingT._id||editingT.id, payload); fb('Tutoria actualizada!'); }
      else { await tutoriaService.createTutoria(payload); fb('Tutoria criada!'); }
      setShowModal(false); load();
    } catch { fb('Erro ao guardar.','erro'); }
    finally { setSubmitting(false); }
  };

  const handleSaveSessao = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await tutoriaService.addSessaoAcompanhamento(showSessModal._id||showSessModal.id, sessData);
      fb('Sessão de acompanhamento registada!');
      setShowSessModal(null); load();
    } catch { fb('Erro ao registar sessão.','erro'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {feedback.msg && <div className={feedback.tipo==='sucesso'?'ava-alert-ok':'ava-alert-err'}>{feedback.tipo==='sucesso'?'✓':'⚠️'} {feedback.msg}</div>}

      <div className="ava-stats">
        {[
          { icon:'🤝', bg:'#ede9fe', col:'#5b21b6', val:tutorias.length, lbl:'Tutorias Activas' },
          { icon:'📋', bg:'#d1fae5', col:'#047857', val:tutorias.filter(t=>t.estado==='activo').length, lbl:'Em Acompanhamento' },
          { icon:'⚠️', bg:'#fee2e2', col:'#991b1b', val:tutorias.reduce((a,t)=>a+(t.alertas?.filter(al=>!al.resolvido).length||0),0), lbl:'Alertas Pendentes' },
          { icon:'📅', bg:'#fef3c7', col:'#b45309', val:tutorias.reduce((a,t)=>a+(t.sessoes_acompanhamento?.length||0),0), lbl:'Sessões Registadas' },
        ].map((s,i)=>(
          <div className="ava-stat" key={i}>
            <div className="ava-stat-icon" style={{background:s.bg,color:s.col}}>{s.icon}</div>
            <div><div className="ava-stat-val">{s.val}</div><div className="ava-stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      <div className="ava-section-bar">
        <h2 className="ava-section-title">🤝 Tutoria e Acompanhamento do Estudante</h2>
        {canManage && <button className="btn-ava-primary" onClick={()=>{setEditingT(null);setFormData(emptyForm());setShowModal(true);}}>+ Nova Tutoria</button>}
      </div>

      {loading ? <div className="ava-empty"><div className="ava-empty-icon">⏳</div><p>A carregar...</p></div> : (
        tutorias.length === 0 ? (
          <div className="ava-empty">
            <div className="ava-empty-icon">🤝</div>
            <h3 style={{color:'#1e293b'}}>Nenhuma tutoria registada</h3>
            <p>Atribua um tutor a um estudante para iniciar o acompanhamento.</p>
            {canManage && <button className="btn-ava-primary" style={{marginTop:'1rem'}} onClick={()=>{setEditingT(null);setFormData(emptyForm());setShowModal(true);}}>+ Criar Tutoria</button>}
          </div>
        ) : (
          <div className="ava-grid">
            {tutorias.map(t => {
              const tid = t._id||t.id;
              const alertasActivos = (t.alertas||[]).filter(a=>!a.resolvido);
              return (
                <div className="ava-card" key={tid} style={{borderTopColor: alertasActivos.length>0?'#ef4444':'#4338ca'}}>
                  <div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.5rem'}}>
                      {estadoTutoriaBadge(t.estado)}
                      {alertasActivos.length>0 && <span className="ava-badge badge-red">⚠️ {alertasActivos.length} alerta{alertasActivos.length>1?'s':''}</span>}
                    </div>
                    <h3 className="ava-card-title">👤 {t.estudante_nome}</h3>
                    <div className="ava-card-sub">Tutor: {t.tutor_nome}</div>
                    <div className="ava-card-meta">
                      <div>📚 <strong>Curso:</strong> {t.curso||'—'} · {t.turma||'—'}</div>
                      <div>📅 <strong>Ano:</strong> {t.ano_lectivo}</div>
                      <div>📋 <strong>Sessões:</strong> {t.sessoes_acompanhamento?.length||0} registadas</div>
                      {t.encarregado_nome && <div>👪 <strong>Encarregado:</strong> {t.encarregado_nome}</div>}
                    </div>
                    {/* Últimos alertas */}
                    {alertasActivos.length>0 && (
                      <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'.6rem',fontSize:'.82rem',color:'#991b1b',marginBottom:'.75rem'}}>
                        {alertasActivos.slice(0,2).map((a,i)=><div key={i}>⚠️ {a.mensagem}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="ava-card-actions">
                    {canManage && <>
                      <button className="btn-ava-sm" onClick={()=>{
                        setEditingT(t);
                        setFormData({ tutor_nome:t.tutor_nome||'', tutor_email:t.tutor_email||'',
                          estudante_nome:t.estudante_nome||'', estudante_email:t.estudante_email||'',
                          encarregado_nome:t.encarregado_nome||'', encarregado_email:t.encarregado_email||'',
                          encarregado_telefone:t.encarregado_telefone||'',
                          curso:t.curso||'', turma:t.turma||'', ano_lectivo:t.ano_lectivo||'2026',
                          observacoes_gerais:t.observacoes_gerais||'' });
                        setShowModal(true);
                      }}>✏️ Editar</button>
                      <button className="btn-ava-sm" style={{background:'#ede9fe',color:'#5b21b6',borderColor:'#c4b5fd'}}
                        onClick={()=>{setSessData(emptySess());setShowSessModal(t);}}>📝 Sessão</button>
                    </>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Modal Tutoria */}
      {showModal && (
        <div className="ava-modal-bg" onClick={()=>setShowModal(false)}>
          <div className="ava-modal" onClick={e=>e.stopPropagation()}>
            <h3>{editingT?'✏️ Editar Tutoria':'🤝 Criar Tutoria'}</h3>
            <form onSubmit={handleSave}>
              <div className="ava-form-grid">
                <div><label className="ava-label">Nome do Tutor</label>
                  <input className="ava-input" value={formData.tutor_nome} onChange={e=>setFormData({...formData,tutor_nome:e.target.value})} /></div>
                <div><label className="ava-label">Email do Tutor</label>
                  <input type="email" className="ava-input" value={formData.tutor_email} onChange={e=>setFormData({...formData,tutor_email:e.target.value})} /></div>
                <div><label className="ava-label">Nome do Estudante *</label>
                  <input className="ava-input" required value={formData.estudante_nome} onChange={e=>setFormData({...formData,estudante_nome:e.target.value})} /></div>
                <div><label className="ava-label">Email do Estudante</label>
                  <input type="email" className="ava-input" value={formData.estudante_email} onChange={e=>setFormData({...formData,estudante_email:e.target.value})} /></div>
                <div><label className="ava-label">Curso</label>
                  <input className="ava-input" value={formData.curso} onChange={e=>setFormData({...formData,curso:e.target.value})} /></div>
                <div><label className="ava-label">Turma</label>
                  <input className="ava-input" value={formData.turma} onChange={e=>setFormData({...formData,turma:e.target.value})} /></div>
                <div><label className="ava-label">Nome do Encarregado</label>
                  <input className="ava-input" value={formData.encarregado_nome} onChange={e=>setFormData({...formData,encarregado_nome:e.target.value})} /></div>
                <div><label className="ava-label">Email do Encarregado</label>
                  <input type="email" className="ava-input" value={formData.encarregado_email} onChange={e=>setFormData({...formData,encarregado_email:e.target.value})} /></div>
                <div><label className="ava-label">Telefone do Encarregado</label>
                  <input className="ava-input" value={formData.encarregado_telefone} onChange={e=>setFormData({...formData,encarregado_telefone:e.target.value})} /></div>
                <div><label className="ava-label">Ano Lectivo</label>
                  <input className="ava-input" value={formData.ano_lectivo} onChange={e=>setFormData({...formData,ano_lectivo:e.target.value})} /></div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Observações Gerais</label>
                <textarea className="ava-textarea" rows="3" value={formData.observacoes_gerais} onChange={e=>setFormData({...formData,observacoes_gerais:e.target.value})} />
              </div>
              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={()=>setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary" disabled={submitting}>{submitting?'A guardar...':editingT?'Guardar':'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sessão de Acompanhamento */}
      {showSessModal && (
        <div className="ava-modal-bg" onClick={()=>setShowSessModal(null)}>
          <div className="ava-modal" onClick={e=>e.stopPropagation()}>
            <h3>📝 Sessão de Acompanhamento — {showSessModal.estudante_nome}</h3>
            <form onSubmit={handleSaveSessao}>
              <div className="ava-form-grid">
                <div><label className="ava-label">Tipo de Sessão</label>
                  <select className="ava-input" value={sessData.tipo} onChange={e=>setSessData({...sessData,tipo:e.target.value})}>
                    <option>Individual</option><option>Grupo</option><option>Encarregado</option><option>Urgente</option>
                  </select></div>
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Objectivos</label>
                <textarea className="ava-textarea" rows="2" value={sessData.objectivos} onChange={e=>setSessData({...sessData,objectivos:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Orientações e Recomendações</label>
                <textarea className="ava-textarea" rows="2" value={sessData.recomendacoes} onChange={e=>setSessData({...sessData,recomendacoes:e.target.value})} />
              </div>
              <div className="ava-form-full">
                <label className="ava-label">Dificuldades Identificadas</label>
                <textarea className="ava-textarea" rows="2" value={sessData.dificuldades_apontadas} onChange={e=>setSessData({...sessData,dificuldades_apontadas:e.target.value})} />
              </div>
              <div className="ava-form-grid">
                <div><label className="ava-label">Evolução Observada</label>
                  <textarea className="ava-textarea" rows="2" value={sessData.evolucao_observada} onChange={e=>setSessData({...sessData,evolucao_observada:e.target.value})} /></div>
                <div><label className="ava-label">Próximos Passos</label>
                  <textarea className="ava-textarea" rows="2" value={sessData.proximos_passos} onChange={e=>setSessData({...sessData,proximos_passos:e.target.value})} /></div>
              </div>
              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={()=>setShowSessModal(null)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary" disabled={submitting}>{submitting?'A guardar...':'Registar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   TAB D — Desempenho do Estudante
   ──────────────────────────────────────────────────────────────────────────── */
function TabDesempenho({ user }) {
  const [tutorias, setTutorias] = useState([]);
  const [sessoes, setSessoes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      tutoriaService.getTutorias().catch(()=>[]),
      planoSessaoService.getSessoes().catch(()=>[])
    ]).then(([t,s])=>{ setTutorias(t); setSessoes(s); setLoading(false); });
  }, []);

  if (loading) return <div className="ava-empty"><div className="ava-empty-icon">⏳</div><p>A carregar dados de desempenho...</p></div>;

  const minhasTutorias = tutorias.filter(t => user?.tipo === 'estudante' ? t.estudante_email === user?.email : true);

  if (minhasTutorias.length === 0 && user?.tipo === 'estudante') {
    return (
      <div className="ava-empty">
        <div className="ava-empty-icon">📊</div>
        <h3 style={{color:'#1e293b'}}>Sem dados de acompanhamento</h3>
        <p>O seu tutor ainda não registou dados de acompanhamento ou não lhe foi atribuído tutor.</p>
      </div>
    );
  }

  const totalSessoes      = sessoes.length;
  const sessoesRealizadas = sessoes.filter(s=>s.estado==='realizada').length;
  const sessoesPendentes  = sessoes.filter(s=>s.sumario&&!s.sumario.registado).length;
  const taxaExecucao      = totalSessoes>0 ? Math.round((sessoesRealizadas/totalSessoes)*100) : 0;

  return (
    <>
      <div className="ava-stats">
        {[
          { icon:'📊', bg:'#dbeafe', col:'#1d4ed8', val:`${taxaExecucao}%`, lbl:'Taxa de Execução Lectiva' },
          { icon:'✅', bg:'#d1fae5', col:'#047857', val:sessoesRealizadas, lbl:'Sessões Realizadas' },
          { icon:'📋', bg:'#fef3c7', col:'#b45309', val:totalSessoes, lbl:'Sessões Programadas' },
          { icon:'🤝', bg:'#ede9fe', col:'#5b21b6', val:tutorias.filter(t=>t.estado==='activo').length, lbl:'Estudantes em Tutoria' },
        ].map((s,i)=>(
          <div className="ava-stat" key={i}>
            <div className="ava-stat-icon" style={{background:s.bg,color:s.col}}>{s.icon}</div>
            <div><div className="ava-stat-val">{s.val}</div><div className="ava-stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      {/* Barra de progresso geral */}
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.5rem'}}>
          <span style={{fontWeight:600,color:'#334155'}}>Execução Lectiva</span>
          <span style={{fontWeight:700,color:'#4338ca'}}>{taxaExecucao}%</span>
        </div>
        <div style={{background:'#e2e8f0',borderRadius:'999px',height:'10px',overflow:'hidden'}}>
          <div style={{width:`${taxaExecucao}%`,background:'linear-gradient(90deg,#4338ca,#2563eb)',height:'100%',borderRadius:'999px',transition:'width .5s'}} />
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.78rem',color:'#94a3b8',marginTop:'.4rem'}}>
          <span>{sessoesRealizadas} realizadas</span><span>{totalSessoes} programadas</span>
        </div>
      </div>

      {/* Lista de estudantes em tutoria */}
      <h2 className="ava-section-title" style={{marginBottom:'1rem'}}>👤 Estudantes em Acompanhamento</h2>
      {tutorias.length === 0 ? (
        <div className="ava-empty">
          <div className="ava-empty-icon">👤</div>
          <p>Nenhum estudante em acompanhamento registado.</p>
        </div>
      ) : (
        <div className="ava-table-wrap">
          <table className="ava-table">
            <thead>
              <tr><th>Estudante</th><th>Tutor</th><th>Curso / Turma</th><th>Sessões</th><th>Alertas</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {tutorias.map(t=>(
                <tr key={t._id||t.id} style={{cursor:'pointer'}} onClick={()=>setSelected(selected === (t._id || t.id) ? null : (t._id || t.id))}>
                  <td><strong>{t.estudante_nome}</strong><div style={{fontSize:'.78rem',color:'#94a3b8'}}>{t.estudante_email}</div></td>
                  <td>{t.tutor_nome}</td>
                  <td>{t.curso||'—'} · {t.turma||'—'}</td>
                  <td><span className="ava-badge badge-blue">{t.sessoes_acompanhamento?.length||0}</span></td>
                  <td>{(t.alertas||[]).filter(a=>!a.resolvido).length>0
                    ? <span className="ava-badge badge-red">⚠️ {(t.alertas||[]).filter(a=>!a.resolvido).length}</span>
                    : <span className="ava-badge badge-green">✓</span>}</td>
                  <td>{estadoTutoriaBadge(t.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────────────────────── */
const TABS = [
  { key:'salas',   label:'Sala de Aula Virtual', icon:'🏫' },
  { key:'sessoes', label:'Plano de Sessões / Sumários', icon:'📋' },
  { key:'tutoria', label:'Tutoria e Mentoria', icon:'🤝' },
  { key:'desempenho', label:'Desempenho do Estudante', icon:'📊' },
];

export default function HomeSchool() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'salas';

  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });

  return (
    <>
      <style>{CSS}</style>
      <div className="ava-wrap">
        {/* Hero */}
        <div className="ava-hero">
          <div className="ava-hero-badge">🏫 ISPOTEC — AMBIENTE VIRTUAL E APRENDIZAGEM</div>
          <h1>Ambiente Virtual e Aprendizagem</h1>
          <p>
            Espaço digital integrado de ensino, aprendizagem, comunicação e acompanhamento dos estudantes.
            Planifique sessões, registe sumários, acompanhe estudantes e gerencie tutorias num único portal institucional.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="ava-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`ava-tab ${activeTab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'salas'      && <TabSalasVirtuais user={user} />}
        {activeTab === 'sessoes'    && <TabPlanoSessoes user={user} />}
        {activeTab === 'tutoria'    && <TabTutoria user={user} />}
        {activeTab === 'desempenho' && <TabDesempenho user={user} />}
      </div>
    </>
  );
}
