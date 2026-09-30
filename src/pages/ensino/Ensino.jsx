import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  .ensino-content { flex: 1; min-width: 0; }
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
  }
  @media(max-width:600px){
    .ensino-header { padding:1.5rem 1.1rem; }
    .ensino-header h1 { font-size:1.4rem; }
    .ensino-grid,.ensino-grid-2 { grid-template-columns:1fr; }
    .stat-block { grid-template-columns:repeat(2,1fr); }
    .form-row-2 { grid-template-columns: 1fr; }
  }
`;

// ── Initial Mock Data ─────────────────────────────────────────────────────────
const initialProjetosEducativos = [
  { id:1, titulo:'Ensino Digital Inclusivo', area:'TIC na Educação', estado:'Em Curso', ano:'2025', coordenador:'Prof. António Mussa', desc:'Integração de ferramentas digitais nas salas de aula para promover inclusão.' },
  { id:2, titulo:'Biblioteca de Recursos Pedagógicos', area:'Pedagogia', estado:'Concluído', ano:'2024', coordenador:'Prof.ª Maria Sitoe', desc:'Criação de repositório digital de materiais didáticos para docentes.' },
  { id:3, titulo:'Programa de Tutoria Académica', area:'Apoio ao Estudante', estado:'Em Curso', ano:'2025', coordenador:'Dr. Carlos Machava', desc:'Sistema de tutoria par-a-par entre estudantes veteranos e calouros.' },
  { id:4, titulo:'ISPOTEC Labs for Schools', area:'STEM', estado:'Planeamento', ano:'2026', coordenador:'Eng. Fátima Nhabinde', desc:'Extensão de laboratórios virtuais às escolas secundárias parceiras.' },
  { id:5, titulo:'Gamificação do Ensino Superior', area:'Inovação Pedagógica', estado:'Em Curso', ano:'2025', coordenador:'Prof. João Mahumane', desc:'Aplicação de mecânicas de jogo para aumentar o envolvimento estudantil.' },
  { id:6, titulo:'Programa EaD – Ensino a Distância', area:'EaD', estado:'Em Curso', ano:'2025', coordenador:'Prof.ª Sandra Cossa', desc:'Expansão de módulos em regime blended learning via Moodle e Google Classroom.' },
];

const initialProjetosCurriculares = [
  { id:1, curso:'Medicina', ciclo:'Licenciatura', uc:'Anatomia Humana I', creditos:6, semestre:'1.º', tipo:'Obrigatória' },
  { id:2, curso:'Medicina', ciclo:'Licenciatura', uc:'Fisiologia', creditos:6, semestre:'2.º', tipo:'Obrigatória' },
  { id:3, curso:'Gestão de Empresas', ciclo:'Licenciatura', uc:'Microeconomia', creditos:5, semestre:'1.º', tipo:'Obrigatória' },
  { id:4, curso:'Gestão de Empresas', ciclo:'Licenciatura', uc:'Contabilidade Geral', creditos:6, semestre:'2.º', tipo:'Obrigatória' },
  { id:5, curso:'Engenharia Informática', ciclo:'Licenciatura', uc:'Algoritmos e Estruturas de Dados', creditos:6, semestre:'2.º', tipo:'Obrigatória' },
  { id:6, curso:'Engenharia Informática', ciclo:'Licenciatura', uc:'Redes de Computadores', creditos:5, semestre:'3.º', tipo:'Obrigatória' },
  { id:7, curso:'Psicologia', ciclo:'Licenciatura', uc:'Psicologia do Desenvolvimento', creditos:5, semestre:'1.º', tipo:'Obrigatória' },
  { id:8, curso:'Medicina Dentária', ciclo:'Licenciatura', uc:'Odontologia Clínica I', creditos:7, semestre:'3.º', tipo:'Obrigatória' },
];

const initialBibliotecas = [
  { id:1, nome:'Biblioteca Central ISPOTEC', tipo:'Física', localizacao:'Edifício Principal – Piso 0', acervo:'12.500 obras', horario:'Seg-Sex: 7h30–18h00', contato:'biblioteca@ispotec.ac.mz', icon:'🏛️' },
  { id:2, nome:'Biblioteca Digital – Ensino Superior', tipo:'Digital', localizacao:'Online (files.fm)', acervo:'3.200 e-books', horario:'24/7', contato:'https://files.fm/u/3kdkcxhqjs', icon:'📚' },
  { id:3, nome:'Biblioteca Digital – Ensino Médio', tipo:'Digital', localizacao:'Online (files.fm)', acervo:'1.800 obras', horario:'24/7', contato:'https://files.fm/u/5ba9773fmx', icon:'📓' },
  { id:4, nome:'Mediateca Multimédia', tipo:'Física/Digital', localizacao:'Edifício B – Piso 1', acervo:'Vídeos, áudios e recursos multimédia', horario:'Seg-Sex: 8h–17h', contato:'mediateca@ispotec.ac.mz', icon:'🎬' },
];

const initialLaboratorios = [
  { id:1, nome:'Laboratório de Informática I', curso:'Eng. Informática / TI', capacidade:40, equipamento:'PCs Intel Core i7, software CISCO, IDEs', disponibilidade:'Seg-Sex 7h-18h', responsavel:'Eng. Pedro Machava', icon:'💻' },
  { id:2, nome:'Laboratório de Ciências da Saúde', curso:'Medicina / Enfermagem', capacidade:30, equipamento:'Microscópios, modelos anatómicos, simuladores clínicos', disponibilidade:'Seg-Sex 7h-18h', responsavel:'Dra. Isabel Nhantumbo', icon:'🏥' },
  { id:3, nome:'Laboratório de Química', curso:'Farmacologia / Análises Clínicas', capacidade:24, equipamento:'Bancadas de trabalho, reagentes, equipamento analítico', disponibilidade:'Seg-Sex 7h-17h', responsavel:'Dr. António Sitoe', icon:'🧪' },
  { id:4, nome:'Laboratório de Física', curso:'Engenharias', capacidade:28, equipamento:'Osciloscópio, geradores de sinal, multímetros', disponibilidade:'Seg-Sex 8h-17h', responsavel:'Eng. Carlos Mabunda', icon:'⚡' },
  { id:5, nome:'Laboratório de Gestão Simulada', curso:'Gestão / Negócios', capacidade:35, equipamento:'Software ERP, simuladores de mercado', disponibilidade:'Seg-Sex 8h-17h', responsavel:'Prof. Filomena Guambe', icon:'📊' },
  { id:6, nome:'Laboratório Odontológico', curso:'Medicina Dentária', capacidade:20, equipamento:'Cadeiras dentárias, equipamento de diagnóstico', disponibilidade:'Seg-Sex 7h-17h', responsavel:'Dr. Joaquim Cossa', icon:'🦷' },
];

const estatisticaAcademica = {
  resumo: [
    { label:'Total de Estudantes', valor:'4.820', icon:'🎓', cor:'#0055a4' },
    { label:'Docentes Activos', valor:'287', icon:'👨‍🏫', cor:'#10b981' },
    { label:'Cursos Disponíveis', valor:'24', icon:'📚', cor:'#8b5cf6' },
    { label:'Taxa de Aprovação', valor:'78%', icon:'✅', cor:'#f59e0b' },
    { label:'Diplomados 2024', valor:'612', icon:'🏆', cor:'#ec4899' },
    { label:'Departamentos', valor:'8', icon:'🏛️', cor:'#06b6d4' },
  ],
  porCurso: [
    { curso:'Medicina', matriculados:820, aprovados:640, reprovados:88, desistencias:92 },
    { curso:'Gestão de Empresas', matriculados:710, aprovados:565, reprovados:95, desistencias:50 },
    { curso:'Engenharia Informática', matriculados:650, aprovados:490, reprovados:110, desistencias:50 },
    { curso:'Psicologia', matriculados:480, aprovados:372, reprovados:68, desistencias:40 },
    { curso:'Medicina Dentária', matriculados:360, aprovados:290, reprovados:45, desistencias:25 },
    { curso:'Direito', matriculados:580, aprovados:440, reprovados:90, desistencias:50 },
    { curso:'Enfermagem', matriculados:520, aprovados:405, reprovados:72, desistencias:43 },
    { curso:'Farmácia', matriculados:290, aprovados:218, reprovados:45, desistencias:27 },
  ],
};

const estatisticaPedagogica = {
  indicadores: [
    { label:'Horas Lectivas por Semana', valor:'1.240h', icon:'⏱️' },
    { label:'Docentes c/ Mestrado+', valor:'74%', icon:'📖' },
    { label:'Satisfação Estudantil', valor:'4.1/5', icon:'⭐' },
    { label:'Avaliações Entregues', valor:'98.2%', icon:'📝' },
    { label:'Turmas Activas', valor:'186', icon:'🏫' },
    { label:'Planos Curriculares Actualizados', valor:'22/24', icon:'📋' },
  ],
  metodos: [
    { metodo:'Aula Expositiva', percentagem:35, cor:'#0055a4' },
    { metodo:'Aula Prática / Laboratório', percentagem:28, cor:'#10b981' },
    { metodo:'Seminário / Workshop', percentagem:15, cor:'#8b5cf6' },
    { metodo:'Estudo de Caso', percentagem:12, cor:'#f59e0b' },
    { metodo:'EaD / Blended Learning', percentagem:10, cor:'#ec4899' },
  ],
};

const calendarioAcademico = [
  { semestre:'1.º Semestre 2025/2026', bg:'#0055a4', items:[
    { label:'Início das Aulas', data:'17 Fev 2025' },
    { label:'Período de Avaliações Contínuas', data:'Mar – Mai 2025' },
    { label:'Exames Normais', data:'09 – 23 Jun 2025' },
    { label:'Exames de Recurso', data:'30 Jun – 11 Jul 2025' },
    { label:'Férias de Julho', data:'14 Jul – 01 Ago 2025' },
  ]},
  { semestre:'2.º Semestre 2025/2026', bg:'#10b981', items:[
    { label:'Início das Aulas', data:'04 Ago 2025' },
    { label:'Período de Avaliações Contínuas', data:'Set – Nov 2025' },
    { label:'Exames Normais', data:'17 Nov – 05 Dez 2025' },
    { label:'Exames de Recurso', data:'08 – 19 Dez 2025' },
    { label:'Férias de Fim de Ano', data:'22 Dez 2025 – 09 Jan 2026' },
  ]},
  { semestre:'Datas Importantes', bg:'#8b5cf6', items:[
    { label:'Matrículas Novas Inscrições', data:'Jan 2026' },
    { label:'Cerimónia de Graduação', data:'Março 2026' },
    { label:'Semana Académica ISPOTEC', data:'Outubro 2025' },
    { label:'Dia do ISPOTEC', data:'25 Novembro 2025' },
  ]},
];

const initialEventosCientificos = [
  { id:1, dia:'12', mes:'Nov', titulo:'I Conferência Internacional de Saúde Digital', local:'Auditório Central ISPOTEC', tipo:'Conferência', desc:'Debate sobre tecnologias digitais aplicadas à saúde em Moçambique.' },
  { id:2, dia:'28', mes:'Out', titulo:'Workshop de Inteligência Artificial na Medicina', local:'Laboratório de TI – Piso 2', tipo:'Workshop', desc:'Sessão prática sobre o uso de IA em diagnóstico clínico.' },
  { id:3, dia:'05', mes:'Dez', titulo:'Simpósio de Gestão e Inovação Empresarial', local:'Sala Magna ISPOTEC', tipo:'Simpósio', desc:'Apresentação de casos de sucesso e tendências do mercado moçambicano.' },
  { id:4, dia:'15', mes:'Jan', titulo:'Jornada de Investigação ISPOTEC 2026', local:'Campus Principal', tipo:'Jornada', desc:'Apresentação de resultados de investigação dos laboratórios ISPOTEC.' },
  { id:5, dia:'20', mes:'Fev', titulo:'Seminário de Psicologia Clínica e Comunitária', local:'Sala B-201', tipo:'Seminário', desc:'Abordagens actuais em saúde mental e intervenção comunitária.' },
  { id:6, dia:'08', mes:'Mar', titulo:'Feira de Ciência e Tecnologia ISPOTEC', local:'Campus – Área Exterior', tipo:'Feira', desc:'Exposição de projetos estudantis e protótipos inovadores.' },
];

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

// ── Section Components with Role Permissions ─────────────────────────────────
function ProjetosEducativos({ canAdd, canEdit, canDelete }) {
  const [projetos, setProjetos] = useState(initialProjetosEducativos);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [novo, setNovo] = useState({ titulo: '', area: '', desc: '', coordenador: '', ano: '2025', estado: 'Em Curso' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!novo.titulo) return;
    setProjetos([...projetos, { ...novo, id: Date.now() }]);
    setNovo({ titulo: '', area: '', desc: '', coordenador: '', ano: '2025', estado: 'Em Curso' });
    setShowAddForm(false);
  };

  const handleSaveEdit = (id, newTitulo, newDesc) => {
    setProjetos(projetos.map(p => p.id === id ? { ...p, titulo: newTitulo, desc: newDesc } : p));
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setProjetos(projetos.filter(p => p.id !== id));
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
            <button type="submit" className="btn-add-action">Salvar Projeto</button>
          </div>
        </form>
      )}

      <div className="ensino-grid">
        {projetos.map(p => {
          const isEditing = editingId === p.id;
          return (
            <div key={p.id} className="ensino-card">
              <div>
                <div className="card-icon blue">🎯</div>
                {isEditing ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      id={`edit-title-${p.id}`}
                      defaultValue={p.titulo}
                      className="ensino-input"
                      style={{ marginBottom: '0.4rem', fontWeight: 700 }}
                    />
                    <textarea
                      id={`edit-desc-${p.id}`}
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
                  <span className="card-badge badge-blue">{p.area}</span>
                  {estadoBadge(p.estado)}
                </div>
                <div style={{fontSize:'0.8rem',color:'#94a3b8'}}>
                  👤 {p.coordenador} &nbsp;|&nbsp; 📅 {p.ano}
                </div>
              </div>

              {(canEdit || canDelete) && (
                <div className="item-actions">
                  {canEdit && (
                    isEditing ? (
                      <button
                        className="btn-edit-action"
                        onClick={() => {
                          const t = document.getElementById(`edit-title-${p.id}`).value;
                          const d = document.getElementById(`edit-desc-${p.id}`).value;
                          handleSaveEdit(p.id, t, d);
                        }}
                      >
                        💾 Salvar
                      </button>
                    ) : (
                      <button
                        className="btn-edit-action"
                        onClick={() => setEditingId(p.id)}
                      >
                        ✏️ Editar
                      </button>
                    )
                  )}
                  {canDelete && (
                    <button
                      className="btn-del-action"
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ProjetosCurriculares({ canAdd, canEdit, canDelete }) {
  const [listaCurriculares, setListaCurriculares] = useState(initialProjetosCurriculares);
  const [filtro, setFiltro] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [novo, setNovo] = useState({ curso: 'Medicina', ciclo: 'Licenciatura', uc: '', creditos: 6, semestre: '1.º', tipo: 'Obrigatória' });

  const cursos = ['Todos', ...new Set(listaCurriculares.map(p => p.curso))];
  const lista = filtro === 'Todos' ? listaCurriculares : listaCurriculares.filter(p => p.curso === filtro);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!novo.uc) return;
    setListaCurriculares([...listaCurriculares, { ...novo, id: Date.now() }]);
    setNovo({ curso: 'Medicina', ciclo: 'Licenciatura', uc: '', creditos: 6, semestre: '1.º', tipo: 'Obrigatória' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setListaCurriculares(listaCurriculares.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📋 Ensino ISPOTEC</div>
        <h1>Projetos Curriculares</h1>
        <p>Unidades curriculares e planos de estudo organizados por curso e ciclo de formação.</p>
      </div>

      <div className="ensino-section-bar">
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
          {cursos.map(c => (
            <button key={c} onClick={()=>setFiltro(c)}
              style={{padding:'0.35rem 0.85rem',borderRadius:'8px',border:'1.5px solid #e2e8f0',background:filtro===c?'#0055a4':'#fff',color:filtro===c?'#fff':'#475569',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>
              {c}
            </button>
          ))}
        </div>
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
              placeholder="Nome da Unidade Curricular *"
              value={novo.uc}
              onChange={e => setNovo({ ...novo, uc: e.target.value })}
              required
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Curso *"
              value={novo.curso}
              onChange={e => setNovo({ ...novo, curso: e.target.value })}
              required
            />
          </div>
          <div className="form-row-2">
            <input
              type="number"
              className="ensino-input"
              placeholder="Créditos (ECTS)"
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
            <button type="submit" className="btn-add-action">Salvar UC</button>
          </div>
        </form>
      )}

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
              {(canEdit || canDelete) && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id}>
                <td><strong>{p.curso}</strong></td>
                <td>{p.uc}</td>
                <td>{p.ciclo}</td>
                <td><span className="card-badge badge-blue">{p.creditos} ECTS</span></td>
                <td>{p.semestre}</td>
                <td><span className="card-badge badge-green">{p.tipo}</span></td>
                {(canEdit || canDelete) && (
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {canEdit && (
                        <button
                          className="btn-edit-action"
                          onClick={() => {
                            const newUc = window.prompt('Editar Unidade Curricular:', p.uc);
                            if (newUc) {
                              setListaCurriculares(listaCurriculares.map(item => item.id === p.id ? { ...item, uc: newUc } : item));
                            }
                          }}
                        >
                          ✏️ Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-del-action"
                          onClick={() => handleDelete(p.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Bibliotecas({ canAdd, canEdit, canDelete }) {
  const [bibliotecas, setBibliotecas] = useState(initialBibliotecas);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novo, setNovo] = useState({ nome: '', tipo: 'Física', localizacao: '', acervo: '', horario: '', contato: '', icon: '📚' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!novo.nome) return;
    setBibliotecas([...bibliotecas, { ...novo, id: Date.now() }]);
    setNovo({ nome: '', tipo: 'Física', localizacao: '', acervo: '', horario: '', contato: '', icon: '📚' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setBibliotecas(bibliotecas.filter(b => b.id !== id));
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📚 Ensino ISPOTEC</div>
        <h1>Bibliotecas</h1>
        <p>Acesso às bibliotecas física e digital do ISPOTEC, com recursos académicos e científicos.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Espaços e Repositórios Bibliográficos</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Biblioteca'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Nova Biblioteca / Acervo</h3>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Nome da Biblioteca *"
              value={novo.nome}
              onChange={e => setNovo({ ...novo, nome: e.target.value })}
              required
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Tipo (Física / Digital)"
              value={novo.tipo}
              onChange={e => setNovo({ ...novo, tipo: e.target.value })}
            />
          </div>
          <div className="form-row-2">
            <input
              type="text"
              className="ensino-input"
              placeholder="Localização / Link"
              value={novo.localizacao}
              onChange={e => setNovo({ ...novo, localizacao: e.target.value })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Acervo (ex: 2.000 títulos)"
              value={novo.acervo}
              onChange={e => setNovo({ ...novo, acervo: e.target.value })}
            />
          </div>
          <div>
            <button type="submit" className="btn-add-action">Salvar Biblioteca</button>
          </div>
        </form>
      )}

      <div className="ensino-grid-2">
        {bibliotecas.map(b => (
          <div key={b.id} className="ensino-card">
            <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
              <div className="card-icon blue" style={{fontSize:'1.6rem',minWidth:50}}>{b.icon}</div>
              <div style={{flex:1}}>
                <h3 className="card-h3">{b.nome}</h3>
                <span className="card-badge badge-blue" style={{marginBottom:'0.6rem',display:'inline-block'}}>{b.tipo}</span>
                <div style={{fontSize:'0.83rem',color:'#64748b',display:'grid',gap:'0.25rem'}}>
                  <div>📍 {b.localizacao}</div>
                  <div>📖 Acervo: {b.acervo}</div>
                  <div>🕐 {b.horario}</div>
                  <div>✉️ {b.contato}</div>
                </div>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className="item-actions">
                {canEdit && (
                  <button
                    className="btn-edit-action"
                    onClick={() => {
                      const newNome = window.prompt('Editar nome da biblioteca:', b.nome);
                      if (newNome) {
                        setBibliotecas(bibliotecas.map(item => item.id === b.id ? { ...item, nome: newNome } : item));
                      }
                    }}
                  >
                    ✏️ Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn-del-action"
                    onClick={() => handleDelete(b.id)}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Laboratorios({ canAdd, canEdit, canDelete }) {
  const [laboratorios, setLaboratorios] = useState(initialLaboratorios);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novo, setNovo] = useState({ nome: '', curso: '', capacidade: 30, equipamento: '', disponibilidade: 'Seg-Sex 7h-18h', responsavel: '', icon: '🔬' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!novo.nome) return;
    setLaboratorios([...laboratorios, { ...novo, id: Date.now() }]);
    setNovo({ nome: '', curso: '', capacidade: 30, equipamento: '', disponibilidade: 'Seg-Sex 7h-18h', responsavel: '', icon: '🔬' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setLaboratorios(laboratorios.filter(l => l.id !== id));
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">🔬 Ensino ISPOTEC</div>
        <h1>Laboratórios de Ensino</h1>
        <p>Espaços equipados para aulas práticas, experiências e desenvolvimento de competências técnicas.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Laboratórios Didáticos e Aulas Práticas</h2>
        {canAdd && (
          <button className="btn-add-action" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancelar' : '+ Adicionar Laboratório'}
          </button>
        )}
      </div>

      {canAdd && showAddForm && (
        <form className="ensino-inline-form" onSubmit={handleAdd}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#0055a4' }}>Novo Laboratório de Ensino</h3>
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
              placeholder="Capacidade de Estudantes"
              value={novo.capacidade}
              onChange={e => setNovo({ ...novo, capacidade: Number(e.target.value) })}
            />
            <input
              type="text"
              className="ensino-input"
              placeholder="Docente / Responsável"
              value={novo.responsavel}
              onChange={e => setNovo({ ...novo, responsavel: e.target.value })}
            />
          </div>
          <input
            type="text"
            className="ensino-input"
            placeholder="Equipamentos principais"
            value={novo.equipamento}
            onChange={e => setNovo({ ...novo, equipamento: e.target.value })}
          />
          <div>
            <button type="submit" className="btn-add-action">Salvar Laboratório</button>
          </div>
        </form>
      )}

      <div className="ensino-grid">
        {laboratorios.map(l => (
          <div key={l.id} className="ensino-card">
            <div>
              <div className="card-icon green" style={{fontSize:'1.5rem'}}>{l.icon}</div>
              <h3 className="card-h3">{l.nome}</h3>
              <p className="card-p">📐 {l.equipamento}</p>
              <div style={{fontSize:'0.8rem',color:'#64748b',display:'grid',gap:'0.2rem'}}>
                <div>🎓 Curso: <strong>{l.curso}</strong></div>
                <div>👥 Capacidade: <strong>{l.capacidade} lugares</strong></div>
                <div>🕐 {l.disponibilidade}</div>
                <div>👤 {l.responsavel}</div>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className="item-actions">
                {canEdit && (
                  <button
                    className="btn-edit-action"
                    onClick={() => {
                      const newEquip = window.prompt('Editar equipamentos do laboratório:', l.equipamento);
                      if (newEquip) {
                        setLaboratorios(laboratorios.map(item => item.id === l.id ? { ...item, equipamento: newEquip } : item));
                      }
                    }}
                  >
                    ✏️ Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn-del-action"
                    onClick={() => handleDelete(l.id)}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function EstatisticaAcademica() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📊 Ensino ISPOTEC</div>
        <h1>Estatística Académica</h1>
        <p>Dados e indicadores académicos do ISPOTEC – ano lectivo 2024/2025.</p>
      </div>
      <div className="stat-block">
        {estatisticaAcademica.resumo.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{fontSize:'1.8rem',marginBottom:'0.3rem'}}>{s.icon}</div>
            <div className="stat-num" style={{color:s.cor}}>{s.valor}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <h2 className="ensino-section-title">📋 Dados por Curso</h2>
      <div className="table-wrap">
        <table className="ensino-table">
          <thead>
            <tr><th>Curso</th><th>Matriculados</th><th>Aprovados</th><th>Reprovados</th><th>Desistências</th><th>Taxa Aprovação</th></tr>
          </thead>
          <tbody>
            {estatisticaAcademica.porCurso.map(r => {
              const taxa = Math.round((r.aprovados / r.matriculados) * 100);
              return (
                <tr key={r.curso}>
                  <td><strong>{r.curso}</strong></td>
                  <td>{r.matriculados}</td>
                  <td style={{color:'#065f46',fontWeight:600}}>{r.aprovados}</td>
                  <td style={{color:'#991b1b'}}>{r.reprovados}</td>
                  <td style={{color:'#92400e'}}>{r.desistencias}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <div style={{flex:1,height:6,background:'#e2e8f0',borderRadius:3}}>
                        <div style={{width:`${taxa}%`,height:'100%',background:taxa>=75?'#10b981':taxa>=60?'#f59e0b':'#ef4444',borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:'0.8rem',fontWeight:700,color:taxa>=75?'#065f46':taxa>=60?'#92400e':'#991b1b'}}>{taxa}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EstatisticaPedagogica() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📈 Ensino ISPOTEC</div>
        <h1>Estatística Pedagógica</h1>
        <p>Indicadores de desempenho pedagógico e qualidade do processo de ensino-aprendizagem.</p>
      </div>
      <div className="stat-block">
        {estatisticaPedagogica.indicadores.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{fontSize:'1.6rem',marginBottom:'0.3rem'}}>{s.icon}</div>
            <div className="stat-num">{s.valor}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <h2 className="ensino-section-title">🧑‍🏫 Métodos de Ensino Utilizados</h2>
      <div className="ensino-card" style={{marginBottom:'2rem'}}>
        {estatisticaPedagogica.metodos.map(m => (
          <div key={m.metodo} style={{marginBottom:'1.1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.3rem'}}>
              <span style={{fontSize:'0.88rem',color:'#374151',fontWeight:500}}>{m.metodo}</span>
              <span style={{fontSize:'0.88rem',fontWeight:700,color:m.cor}}>{m.percentagem}%</span>
            </div>
            <div style={{height:8,background:'#f1f5f9',borderRadius:4}}>
              <div style={{width:`${m.percentagem}%`,height:'100%',background:m.cor,borderRadius:4,transition:'width .4s'}}/>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CalendarioAcademico() {
  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">📅 Ensino ISPOTEC</div>
        <h1>Calendário Académico 2025/2026</h1>
        <p>Datas e períodos do ano lectivo do Instituto Superior Politécnico e de Tecnologias.</p>
      </div>
      <div className="cal-grid">
        {calendarioAcademico.map(sem => (
          <div key={sem.semestre} className="cal-card">
            <div className="cal-card-head" style={{background:sem.bg}}>{sem.semestre}</div>
            <div className="cal-card-body">
              {sem.items.map(it => (
                <div key={it.label} className="cal-item">
                  <span className="cal-item-label">{it.label}</span>
                  <span className="cal-item-date">{it.data}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="ensino-card" style={{marginBottom:'2rem',background:'#fffbeb',borderColor:'#fde68a'}}>
        <h3 style={{fontSize:'0.95rem',fontWeight:700,color:'#92400e',margin:'0 0 0.5rem'}}>⚠️ Nota Importante</h3>
        <p style={{fontSize:'0.85rem',color:'#78350f',margin:0,lineHeight:1.6}}>
          As datas indicadas estão sujeitas a alteração por decisão do Conselho Científico ou determinação ministerial. 
          Consulte sempre o secretariado académico para confirmação oficial.
        </p>
      </div>
    </>
  );
}

function EventosCientificos({ canAdd, canEdit, canDelete }) {
  const [eventos, setEventos] = useState(initialEventosCientificos);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novo, setNovo] = useState({ dia: '15', mes: 'Mar', titulo: '', local: 'Auditório Central', tipo: 'Conferência', desc: '' });

  const tipos = { 'Conferência':'badge-blue', 'Workshop':'badge-green', 'Simpósio':'badge-purple', 'Jornada':'badge-orange', 'Seminário':'badge-red', 'Feira':'badge-gray' };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!novo.titulo) return;
    setEventos([...eventos, { ...novo, id: Date.now() }]);
    setNovo({ dia: '15', mes: 'Mar', titulo: '', local: 'Auditório Central', tipo: 'Conferência', desc: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setEventos(eventos.filter(e => e.id !== id));
  };

  return (
    <>
      <div className="ensino-header">
        <div className="ensino-badge">🎤 Ensino ISPOTEC</div>
        <h1>Eventos Científicos</h1>
        <p>Agenda de conferências, workshops, simpósios e jornadas científicas do ISPOTEC.</p>
      </div>

      <div className="ensino-section-bar">
        <h2 className="ensino-section-title">Calendário de Eventos</h2>
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
              placeholder="Localização (ex: Auditório Central)"
              value={novo.local}
              onChange={e => setNovo({ ...novo, local: e.target.value })}
            />
          </div>
          <div className="form-row-2">
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
              placeholder="Mês (ex: Mar)"
              value={novo.mes}
              onChange={e => setNovo({ ...novo, mes: e.target.value })}
            />
          </div>
          <textarea
            className="ensino-input"
            rows="2"
            placeholder="Descrição do evento..."
            value={novo.desc}
            onChange={e => setNovo({ ...novo, desc: e.target.value })}
          />
          <div>
            <button type="submit" className="btn-add-action">Salvar Evento</button>
          </div>
        </form>
      )}

      <div style={{marginBottom:'2rem'}}>
        {eventos.map((e) => (
          <div key={e.id || e.titulo} className="event-item">
            <div className="event-date">
              <span className="d">{e.dia}</span>
              <span className="m">{e.mes}</span>
            </div>
            <div className="event-info" style={{flex:1}}>
              <h4>{e.titulo}</h4>
              <p>{e.desc}</p>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',fontSize:'0.78rem',color:'#94a3b8',alignItems:'center'}}>
                <span>📍 {e.local}</span>
                <span className={`card-badge ${tipos[e.tipo]||'badge-gray'}`}>{e.tipo}</span>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                {canEdit && (
                  <button
                    className="btn-edit-action"
                    onClick={() => {
                      const newT = window.prompt('Editar título do evento:', e.titulo);
                      if (newT) {
                        setEventos(eventos.map(item => (item.id === e.id || item.titulo === e.titulo) ? { ...item, titulo: newT } : item));
                      }
                    }}
                  >
                    ✏️ Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn-del-action"
                    onClick={() => handleDelete(e.id)}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
