import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ensinoService } from '../../services/ensinoService';
import { planoAnaliticoService } from '../../services/planoAnaliticoService';
import { getFileUrl } from '../../services/api';
import AttachmentDisplay from '../../components/AttachmentDisplay';

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
  .curso-edital-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.35rem; margin-bottom: 2.5rem; }
  .curso-edital-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.4rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; }
  .curso-edital-card:hover { transform: translateY(-3px); box-shadow: 0 10px 18px -3px rgba(0,0,0,0.09); border-color: #93c5fd; }
  .curso-edital-header { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.85rem; }
  .curso-edital-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
  .curso-edital-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.85rem; }
  .curso-meta-tag { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.55rem; border-radius: 6px; font-size: 0.74rem; font-weight: 600; background: #f1f5f9; color: #475569; }
  .curso-section-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 0.9rem; margin-bottom: 0.65rem; }
  .curso-section-box h4 { margin: 0 0 0.3rem; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0055a4; display: flex; align-items: center; gap: 0.35rem; }
  .curso-section-box p { margin: 0; font-size: 0.85rem; color: #334155; line-height: 1.5; }
  .curso-aplicacao-list { margin: 0; padding-left: 1.15rem; font-size: 0.84rem; color: #334155; line-height: 1.55; }
  .curso-aplicacao-list li { margin-bottom: 0.25rem; }
  .curso-filter-btn { padding: 0.45rem 0.9rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; color: #475569; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .curso-filter-btn:hover { background: #f8fafc; border-color: #94a3b8; }
  .curso-filter-btn.active { background: #0055a4; color: #fff; border-color: #0055a4; box-shadow: 0 2px 6px rgba(0,85,164,0.3); }
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
    .ensino-grid,.ensino-grid-2,.curso-edital-grid { grid-template-columns:1fr; }
    .stat-block { grid-template-columns:repeat(2,1fr); }
    .form-row-2 { grid-template-columns: 1fr; }
  }
`;

const SECCOES = [
  { key:'cursos-oferta',         label:'Oferta de Cursos',      icon:'🎓' },
  { key:'projetos-educativos',   label:'Projetos Educativos',   icon:'🎯' },
  { key:'plano-analitico',       label:'Plano Analítico',       icon:'📋' },
  { key:'projetos-curriculares', label:'Projetos Curriculares',  icon:'📜' },
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

// ── Cursos Oficiais do Edital ISPOTEC (Sem informação de pagamento) ─────────
export const CURSOS_EDITAL_ISPOTEC = [
  // 1. Mestrado
  {
    id: 'mestrado-saude-publica',
    grau: 'Mestrado',
    categoria: 'Mestrado',
    nome: 'Mestrado em Saúde Pública',
    departamento: 'Departamento de Pós-Graduação e Pesquisa',
    duracao: '2 anos com Trabalho de Conclusão de Curso (TCC)',
    regime: 'Modular (Semi-Presencial e Online)',
    requisito: 'Licenciatura em Ciências de Saúde, Ciências Sociais, Ciências Biológicas ou áreas afins',
    icone: '🔬',
    corIcone: '#dbeafe',
    corTextoIcone: '#1d4ed8',
    badgeCor: 'badge-blue',
    descricao: 'Programa de formação científica e metodológica avançada orientado para a análise epidemiológica, sistemas de saúde pública e planeamento de intervenções sanitárias estratégicas.',
    objectivo: 'Capacitar profissionais da Saúde e áreas afins que se interessem pela Investigação em Saúde Pública, habilitando-os para a liderança técnica, formulação de políticas sanitárias e tomada de decisão fundamentada em evidências.',
    aplicacao: [
      'Epidemiologia e Vigilância Sanitária em órgãos governamentais e internacionais',
      'Saúde da Comunidade e Medicina Preventiva em contextos urbanos e rurais',
      'Políticas Públicas e Promoção em Saúde no planeamento nacional',
      'Planeamento e Gestão em Sistemas e Serviços de Saúde'
    ]
  },

  // 2. Licenciaturas - Ciências de Saúde e Biomédicas
  {
    id: 'lic-enfermagem-geral',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Enfermagem Geral',
    departamento: 'Departamento de Ciências de Saúde e Biomédicas',
    duracao: '4 anos com Estágios Práticos Semestrais desde o 1º semestre',
    regime: 'Laboral e Pós-laboral | Aulas Práticas todas as 3ª e 5ª feiras',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '💉',
    corIcone: '#ccfbf1',
    corTextoIcone: '#0f766e',
    badgeCor: 'badge-green',
    descricao: 'Formação superior em enfermagem com elevado rigor técnico-científico e compromisso humanista, capacitando para o cuidado holístico ao indivíduo, família e comunidade.',
    objectivo: 'Formar enfermeiros gerais aptos a prestar assistência clínica de excelência hospitalar e comunitária, actuar na reabilitação, prevenção de agravos e gestão de equipas de saúde.',
    aplicacao: [
      'Assistência hospitalar em medicina interna, urgências, cirurgia, pediatria e cuidados intensivos',
      'Centros de Saúde, saúde materno-infantil e programas de saúde comunitária',
      'Estágios práticos semestrais em hospitais parceiros desde o 1º semestre e práticas às 3ª e 5ª',
      'Direcção, coordenação e supervisão de serviços e unidades de enfermagem'
    ]
  },
  {
    id: 'lic-saude-publica',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Saúde Pública',
    departamento: 'Departamento de Ciências de Saúde e Biomédicas',
    duracao: '4 anos com Estágios Práticos Semestrais',
    regime: 'Laboral e Pós-laboral',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '🩺',
    corIcone: '#cffafe',
    corTextoIcone: '#0e7490',
    badgeCor: 'badge-green',
    descricao: 'Curso multidisciplinar centrado nos determinantes sociais e biológicos da saúde, monitoramento epidemiológico e gestão participativa de programas sanitários.',
    objectivo: 'Capacitar quadros aptos a conceber, monitorar e avaliar políticas e programas de saúde pública, prevenindo endemias e fortalecendo as redes sanitárias distritais e provinciais.',
    aplicacao: [
      'Vigilância epidemiológica e controlo sanitário a nível distrital, provincial e nacional',
      'Gestão de programas de combate a malária, HIV/SIDA, tuberculose e doenças emergentes',
      'Actuação em Organizações Não-Governamentais (ONGs) e agências internacionais de saúde',
      'Direcções Provinciais de Saúde (DPS) e Serviços Distritais (SDSMAS)'
    ]
  },
  {
    id: 'lic-psicologia-clinica',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Psicologia Clínica e Saúde no Trabalho',
    departamento: 'Departamento de Ciências de Saúde e Biomédicas',
    duracao: '4 anos com Estágios Práticos Curriculares',
    regime: 'Laboral e Pós-laboral',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '🧠',
    corIcone: '#ede9fe',
    corTextoIcone: '#6d28d9',
    badgeCor: 'badge-purple',
    descricao: 'Formação integradora que conjuga o diagnóstico e a intervenção psicoterapêutica clínica à prevenção de riscos psicossociais e gestão do bem-estar nas organizações de trabalho.',
    objectivo: 'Preparar psicólogos habilitados ao diagnóstico e tratamento de perturbações mentais e do comportamento, bem como ao desenho de planos de ergonomia psicossocial e prevenção do burnout.',
    aplicacao: [
      'Avaliação diagnóstica e psicoterapia em clínicas, hospitais e gabinetes especializados',
      'Saúde ocupacional, prevenção de estresse laboral e melhoria do clima nas empresas',
      'Consultoria em recursos humanos, avaliação de perfil e orientação profissional',
      'Programas de reinserção social, apoio comunitário e mediação psicossocial'
    ]
  },

  // 3. Licenciaturas - Administração e Ciências Jurídicas
  {
    id: 'lic-direito',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Direito',
    departamento: 'Departamento de Administração e Ciências Jurídicas',
    duracao: '4 anos com Estágios e Práticas Profissionais no CRC',
    regime: 'Regular, Semi-Presencial e Online',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '⚖️',
    corIcone: '#dbeafe',
    corTextoIcone: '#1e40af',
    badgeCor: 'badge-blue',
    descricao: 'Formação jurídica de referência nacional, estruturada no ordenamento moçambicano e internacional, associando a teoria doutrinária à prática forense e à mediação.',
    objectivo: 'Formar juristas éticos, reflexivos e tecnicamente qualificados para a defesa dos direitos dos cidadãos, actuação no contencioso judiciário e assessoria jurídica institucional.',
    aplicacao: [
      'Advocacia, magistratura judicial, ministério público e defensoria pública',
      'Assessoria jurídica corporativa, contratos mercantis e conformidade regulatória',
      'Práticas profissionais e mediação no Centro de Resolução de Conflitos (CRC)',
      'Contencioso civil, criminal, laboral, comercial, fiscal e administrativo'
    ]
  },
  {
    id: 'lic-administracao-rh',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Administração e Gestão de Recursos Humanos',
    departamento: 'Departamento de Administração e Ciências Jurídicas',
    duracao: '4 anos com Estágios Práticos Profissionais',
    regime: 'Laboral e Pós-laboral',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '📊',
    corIcone: '#d1fae5',
    corTextoIcone: '#065f46',
    badgeCor: 'badge-green',
    descricao: 'Curso focado na administração estratégica moderna, gestão de talentos, relações laborais, liderança de equipas e transformação digital das organizações.',
    objectivo: 'Capacitar gestores aptos a alinhar o capital humano aos objectivos estratégicos organizacionais, gerindo pessoas com metodologias ágeis e respeito à legislação de trabalho.',
    aplicacao: [
      'Direcção e coordenação de recursos humanos em empresas públicas e privadas',
      'Recrutamento, selecção, desenho de carreiras, remuneração e avaliação de desempenho',
      'Gestão de relações laborais, negociação com sindicatos e auditoria social',
      'Consultoria em organização, métodos e desenvolvimento institucional'
    ]
  },
  {
    id: 'lic-contabilidade-financas',
    grau: 'Licenciatura',
    categoria: 'Licenciatura',
    nome: 'Contabilidade e Finanças',
    departamento: 'Departamento de Administração e Ciências Jurídicas',
    duracao: '4 anos com Práticas Contabilísticas e Laboratório Financeiro',
    regime: 'Laboral e Pós-laboral',
    requisito: 'Nível Médio / 12ª Classe ou equivalente',
    icone: '💰',
    corIcone: '#fef3c7',
    corTextoIcone: '#b45309',
    badgeCor: 'badge-orange',
    descricao: 'Ensino aprofundado de contabilidade geral, contabilidade analítica, relato financeiro segundo as normas IFRS/PGC-NIRF, fiscalidade e auditoria.',
    objectivo: 'Formar especialistas capazes de assegurar a fiabilidade dos demonstrativos contabilísticos, planear estratégias fiscais e orientar investimentos financeiros corporativos.',
    aplicacao: [
      'Contabilidade empresarial e analítica em sectores bancários, comerciais e industriais',
      'Auditoria interna, auditoria externa e perícia contabilística oficial',
      'Consultoria e planeamento tributário perante a administração fiscal',
      'Análise económico-financeira de investimentos e gestão de tesouraria'
    ]
  },

  // 4. Pós-Graduações
  {
    id: 'pos-enfermagem-clinica-saude-integrativa',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Enfermagem Clínica e Saúde Integrativa',
    departamento: 'Ciências de Saúde e Clínicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Enfermagem ou Ciências de Saúde',
    icone: '🏥',
    corIcone: '#ccfbf1',
    corTextoIcone: '#0f766e',
    badgeCor: 'badge-teal',
    descricao: 'Aprofundamento de competências clínicas em cuidados intensivos e terapêuticas integrativas em saúde para suporte ao doente crítico e crónico.',
    objectivo: 'Capacitar enfermeiros para liderança clínica avançada, tomada de decisão fundamentada e implementação de protocolos humanizados.',
    aplicacao: [
      'Serviços hospitalares de alta dependência e internamento especializado',
      'Centros de reabilitação e acompanhamento de doentes crónicos',
      'Supervisão clínica e consultoria especializada em saúde integrativa'
    ]
  },
  {
    id: 'pos-governacao-inteligencia',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Governação e Inteligência Estratégica',
    departamento: 'Administração e Ciências Jurídicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Direito, Administração, Ciências Sociais ou afins',
    icone: '🌐',
    corIcone: '#dbeafe',
    corTextoIcone: '#1e40af',
    badgeCor: 'badge-blue',
    descricao: 'Especialização executiva em prospecção de cenários, segurança institucional, tomada de decisão em conjunturas complexas e integridade governamental.',
    objectivo: 'Qualificar decisores, assessores e quadros dirigentes com ferramentas analíticas e estratégicas para liderar instituições públicas e privadas.',
    aplicacao: [
      'Ministérios, autarquias e entidades da administração pública',
      'Conselhos de administração e direcções corporativas de grandes empresas',
      'Gestão de riscos institucionais, conformidade e planeamento prospectivo'
    ]
  },
  {
    id: 'pos-direito-trabalho',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Direito do Trabalho e Processo Laboral',
    departamento: 'Administração e Ciências Jurídicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Direito, Gestão de RH ou áreas afins',
    icone: '📜',
    corIcone: '#ede9fe',
    corTextoIcone: '#6d28d9',
    badgeCor: 'badge-purple',
    descricao: 'Análise aprofundada da Lei do Trabalho moçambicana, contratação laboral, segurança social, regimes de responsabilidade disciplinar e contencioso nos tribunais.',
    objectivo: 'Capacitar profissionais para a negociação de acordos colectivos de trabalho, instrução de processos disciplinares e patrocínio judiciário especializado.',
    aplicacao: [
      'Assessoria jurídica a empresas comerciais, industriais e agrícolas',
      'Patrocínio forense especializado em tribunais de trabalho',
      'Mediação de conflitos laborais e consultoria em recursos humanos'
    ]
  },
  {
    id: 'pos-direito-penal',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Direito Penal e Processual Penal',
    departamento: 'Administração e Ciências Jurídicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Direito',
    icone: '🛡️',
    corIcone: '#fee2e2',
    corTextoIcone: '#b91c1c',
    badgeCor: 'badge-red',
    descricao: 'Estudo aprofundado da teoria do crime, investigação criminal moderna, novas formas de criminalidade económica e cibernética e garantias do processo penal acusatório.',
    objectivo: 'Qualificar operadores judiciais para a aplicação rigorosa do direito penal material e adjectivo, assegurando a protecção de direitos fundamentais.',
    aplicacao: [
      'Advocacia forense criminal e defesa de garantias fundamentais',
      'Magistratura judicial, ministério público e assessoria a órgãos de investigação criminal',
      'Consultoria em compliance criminal e prevenção do branqueamento de capitais'
    ]
  },
  {
    id: 'pos-direito-civil',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Direito Civil e Processual Civil',
    departamento: 'Administração e Ciências Jurídicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Direito',
    icone: '📑',
    corIcone: '#dbeafe',
    corTextoIcone: '#1d4ed8',
    badgeCor: 'badge-blue',
    descricao: 'Aprofundamento dogmático e jurisprudencial em contratos civis complexos, responsabilidade civil contratual e extracontratual, e aceleração da tutela executiva.',
    objectivo: 'Preparar juristas para a redacção de contratos de alto valor e patrocínio célere de litígios cíveis nos tribunais judiciais.',
    aplicacao: [
      'Contencioso cível e comercial em escritórios de advocacia',
      'Estruturação de contratos mercantis e bancários',
      'Assessoria em litígios imobiliários, sucessórios e de família'
    ]
  },
  {
    id: 'pos-mediacao-arbitragem',
    grau: 'Pós-Graduação',
    categoria: 'Pós-Graduação',
    nome: 'Mediação, Conciliação e Arbitragem',
    departamento: 'Administração e Ciências Jurídicas',
    duracao: '7 meses + 1 mês de TCC (Monografia)',
    regime: 'Modular (Online) | Aulas 2 semanas por mês | Pós-laboral',
    requisito: 'Licenciatura em Direito ou áreas afins',
    icone: '🤝',
    corIcone: '#fef3c7',
    corTextoIcone: '#b45309',
    badgeCor: 'badge-orange',
    descricao: 'Especialização prática em meios extrajudiciais de resolução de disputas, técnicas de negociação colaborativa e condução de arbitragens confidenciais e expeditas.',
    objectivo: 'Formar mediadores e árbitros qualificados para intervir em litígios comerciais e civis, reduzindo a morosidade judiciária e promovendo a cultura de paz.',
    aplicacao: [
      'Actuação no Centro de Resolução de Conflitos (CRC) e centros de arbitragem',
      'Mediação de disputas contratuais, societárias e comunitárias',
      'Consultoria preventiva de gestão e desfecho amigável de litígios'
    ]
  },

  // 5. Cursos de Especialização
  {
    id: 'esp-primeiros-socorros',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Primeiros Socorros e Segurança no Trabalho',
    departamento: 'Ciências de Saúde & Ocupacional',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '🦺',
    corIcone: '#fee2e2',
    corTextoIcone: '#b91c1c',
    badgeCor: 'badge-red',
    descricao: 'Treinamento avançado em suporte básico de vida, socorrismo ocupacional, prevenção de acidentes e normas de Higiene e Segurança no Trabalho (HST).',
    objectivo: 'Capacitar profissionais para atuar prontamente em sinistros laborais e implantar programas preventivos de segurança física nos locais de trabalho.',
    aplicacao: ['Empresas industriais, mineiras, construção civil, brigadas de emergência e centros de saúde ocupacional']
  },
  {
    id: 'esp-saude-publica-cuidados-primarios',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Saúde Pública e Cuidados Primários em Saúde',
    departamento: 'Ciências de Saúde',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '🌿',
    corIcone: '#d1fae5',
    corTextoIcone: '#065f46',
    badgeCor: 'badge-green',
    descricao: 'Capacitação prática nos princípios da atenção primária sanitária, gestão de postos de saúde, imunização e campanhas preventivas comunitárias.',
    objectivo: 'Fortalecer a capacidade técnica de intervenção nos cuidados de saúde essenciais e na promoção do bem-estar das comunidades.',
    aplicacao: ['Unidades sanitárias básicas, organizações de desenvolvimento comunitário e centros de saúde distritais']
  },
  {
    id: 'esp-psicoterapia-saude-ocupacional',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Psicoterapia e Saúde Ocupacional',
    departamento: 'Psicologia & Saúde Mental',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '🧘',
    corIcone: '#ede9fe',
    corTextoIcone: '#6d28d9',
    badgeCor: 'badge-purple',
    descricao: 'Abordagens psicoterapêuticas focadas na gestão de transtornos de ansiedade, estresse ocupacional e promoção de saúde mental laboral.',
    objectivo: 'Habilitar profissionais para oferecer suporte psicológico e implementar programas corporativos de qualidade de vida no trabalho.',
    aplicacao: ['Gabinetes de apoio psicológico empresarial, clínicas privadas e programas de saúde do trabalhador']
  },
  {
    id: 'esp-direito-administracao-publica',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Direito e Administração Pública',
    departamento: 'Ciências Jurídicas e Governação',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '🏛️',
    corIcone: '#dbeafe',
    corTextoIcone: '#1e40af',
    badgeCor: 'badge-blue',
    descricao: 'Procedimento administrativo, contratação de bens e serviços públicos, responsabilidade funcional e probidade na administração.',
    objectivo: 'Formar técnicos e assessores da administração pública para conduzir os processos estatais com legalidade, eficiência e transparência.',
    aplicacao: ['Ministérios, municípios, autarquias locais, institutos públicos e gabinetes de fiscalização']
  },
  {
    id: 'esp-direito-laboral-rh',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Direito Laboral para Gestores de RH',
    departamento: 'Ciências Jurídicas & Recursos Humanos',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '👥',
    corIcone: '#ccfbf1',
    corTextoIcone: '#0f766e',
    badgeCor: 'badge-teal',
    descricao: 'Aplicação prática da Lei do Trabalho para directores e gestores: contratação, sanções disciplinares, licenças, despedimentos e segurança social.',
    objectivo: 'Garantir que a gestão do pessoal cumpra rigorosamente o ordenamento jurídico, prevenindo riscos de litígios laborais dispendiosos.',
    aplicacao: ['Departamentos de gestão de recursos humanos e chefias em organizações privadas e públicas']
  },
  {
    id: 'esp-pedagogia-ead',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Pedagogia, Didáctica e Ensino Virtual (EaD)',
    departamento: 'Educação e Tecnologias Pedagógicas',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '💻',
    corIcone: '#cffafe',
    corTextoIcone: '#0e7490',
    badgeCor: 'badge-cyan',
    descricao: 'Metodologias pedagógicas activas, desenho instrucional, concepção de materiais multimédia e tutoria online em ambientes virtuais de aprendizagem.',
    objectivo: 'Capacitar docentes e formadores para leccionar no ensino a distância com alto engajamento pedagógico e eficácia de aprendizagem.',
    aplicacao: ['Instituições de ensino superior e médio, centros de formação profissional e plataformas de ensino online']
  },
  {
    id: 'esp-ia-saude',
    grau: 'Especialização',
    categoria: 'Especialização',
    nome: 'Inteligência Artificial na Investigação em Saúde',
    departamento: 'Tecnologias em Saúde & Bioinformática',
    duracao: '5 meses + 1 TCC',
    regime: 'Modular | Aulas uma semana por mês',
    requisito: 'Licenciatura concluída',
    icone: '🤖',
    corIcone: '#ede9fe',
    corTextoIcone: '#6d28d9',
    badgeCor: 'badge-purple',
    descricao: 'Aplicações inovadoras de inteligência artificial, processamento de grandes volumes de dados epidemiológicos e ferramentas analíticas de investigação.',
    objectivo: 'Dotar investigadores da saúde de ferramentas de IA para aceleração do diagnóstico, análise de dados e publicação científica.',
    aplicacao: ['Centros de investigação biomédica, laboratórios de tecnologia sanitária e instituições de pesquisa']
  },

  // 6. Cursos de Curta Duração
  {
    id: 'curta-pedagogia-gestao-saude',
    grau: 'Curta Duração',
    categoria: 'Curta Duração',
    nome: 'Pedagogia e Gestão Académica no Ensino em Saúde',
    departamento: 'Ensino em Saúde',
    duracao: 'Formação Intensiva de Curta Duração',
    regime: 'Presencial / Online',
    requisito: 'Docentes, enfermeiros e profissionais de saúde',
    icone: '📚',
    corIcone: '#dbeafe',
    corTextoIcone: '#1e40af',
    badgeCor: 'badge-blue',
    descricao: 'Capacitação didáctica prática para profissionais da área biomédica que exercem funções docentes em instituições de formação sanitária.',
    objectivo: 'Aperfeiçoar as competências pedagógicas no ensino clínico, supervisão de estágios e avaliação de competências em saúde.',
    aplicacao: ['Institutos de formação em saúde, escolas de enfermagem e centros hospitalares formadores']
  },
  {
    id: 'curta-emergencias-medicas',
    grau: 'Curta Duração',
    categoria: 'Curta Duração',
    nome: 'Emergências Médicas e Primeiros Socorros',
    departamento: 'Saúde & Emergências',
    duracao: 'Formação Prática Intensiva',
    regime: 'Presencial',
    requisito: 'Aberto a profissionais, estudantes e cidadãos interessados',
    icone: '🚑',
    corIcone: '#fee2e2',
    corTextoIcone: '#b91c1c',
    badgeCor: 'badge-red',
    descricao: 'Práticas de Suporte Básico de Vida (SBV), reanimação cardiopulmonar, controlo de hemorragias externas, imobilização e triagem de urgência.',
    objectivo: 'Dotar os participantes de reflexos rápidos e seguros para actuar em emergências que ameacem a vida nos primeiros minutos de socorro.',
    aplicacao: ['Empresas de todos os sectores, escolas, brigadas de proteção civil e equipas comunitárias']
  },
  {
    id: 'curta-empreendedorismo-projectos',
    grau: 'Curta Duração',
    categoria: 'Curta Duração',
    nome: 'Empreendedorismo e Gestão de Projectos',
    departamento: 'Gestão & Negócios',
    duracao: 'Formação Prática Intensiva',
    regime: 'Presencial / Online',
    requisito: 'Empreendedores, gestores e profissionais de todas as áreas',
    icone: '🚀',
    corIcone: '#fef3c7',
    corTextoIcone: '#b45309',
    badgeCor: 'badge-orange',
    descricao: 'Concepção de modelos de negócio sustentáveis, gestão orçamental, planeamento de projectos com metodologias ágeis e mobilização de recursos.',
    objectivo: 'Capacitar empreendedores para estruturar planos de negócios sólidos e executar projectos dentro do prazo e custos previstos.',
    aplicacao: ['Startups, gestão de pequenas e médias empresas e liderança de projectos de desenvolvimento']
  },
  {
    id: 'curta-lideranca-rh',
    grau: 'Curta Duração',
    categoria: 'Curta Duração',
    nome: 'Liderança e Gestão de Recursos Humanos',
    departamento: 'Gestão de Pessoas',
    duracao: 'Formação Executiva Intensiva',
    regime: 'Presencial / Online',
    requisito: 'Supervisores, gestores de equipas e coordenadores',
    icone: '⭐',
    corIcone: '#d1fae5',
    corTextoIcone: '#065f46',
    badgeCor: 'badge-green',
    descricao: 'Liderança situacional, comunicação assertiva, feedback construtivo, gestão de conflitos e motivação de equipas para alta performance.',
    objectivo: 'Desenvolver gestores capazes de inspirar colaboradores, resolver tensões na equipa e manter um ambiente de cooperação e produtividade.',
    aplicacao: ['Chefias intermédias e de topo em organizações privadas e instituições públicas']
  }
];

function CursosOficiaisEdital() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');

  const categorias = ['Todos', 'Licenciatura', 'Mestrado', 'Pós-Graduação', 'Especialização', 'Curta Duração'];

  const cursosFiltrados = useMemo(() => {
    return CURSOS_EDITAL_ISPOTEC.filter(c => {
      const matchCat = categoriaAtiva === 'Todos' || c.categoria === categoriaAtiva;
      const b = busca.toLowerCase().trim();
      if (!b) return matchCat;
      const matchText = (
        c.nome.toLowerCase().includes(b) ||
        c.departamento.toLowerCase().includes(b) ||
        c.descricao.toLowerCase().includes(b) ||
        c.objectivo.toLowerCase().includes(b) ||
        c.aplicacao.some(a => a.toLowerCase().includes(b))
      );
      return matchCat && matchText;
    });
  }, [categoriaAtiva, busca]);

  return (
    <div>
      {/* Header Banner Oficial */}
      <div className="ensino-header" style={{ background: 'linear-gradient(135deg, #0055a4 0%, #003366 100%)' }}>
        <div className="ensino-badge">🎓 EDITAL OFICIAL ISPOTEC 2027</div>
        <h1>Oferta de Cursos &amp; Programas Académicos</h1>
        <p>
          Conheça a oferta formativa oficial do Instituto Superior Politécnico e de Tecnologias (ISPOTEC).
          Consulte a descrição dos programas, objectivos pedagógicos, áreas de aplicação prática e saídas profissionais de acordo com o Edital Oficial.
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem', boxShadow: '0 2px 5px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categorias.map(cat => (
              <button
                key={cat}
                type="button"
                className={`curso-filter-btn ${categoriaAtiva === cat ? 'active' : ''}`}
                onClick={() => setCategoriaAtiva(cat)}
              >
                {cat === 'Todos' ? '✨ Todos os Cursos' : cat}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            A exibir <strong>{cursosFiltrados.length}</strong> de {CURSOS_EDITAL_ISPOTEC.length} cursos
          </div>
        </div>

        {/* Input de Pesquisa */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="ensino-input"
            placeholder="🔍 Pesquisar por nome do curso, área científica, palavras-chave do objectivo ou saídas..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ paddingLeft: '2.5rem', background: '#f8fafc', fontSize: '0.9rem' }}
          />
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
            🔍
          </span>
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Grid de Cursos */}
      {cursosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Nenhum curso encontrado</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Tente ajustar os filtros ou o termo de pesquisa.</p>
          <button
            type="button"
            className="curso-filter-btn active"
            onClick={() => { setCategoriaAtiva('Todos'); setBusca(''); }}
            style={{ marginTop: '0.75rem' }}
          >
            Ver Todos os Cursos
          </button>
        </div>
      ) : (
        <div className="curso-edital-grid">
          {cursosFiltrados.map(curso => (
            <div key={curso.id} className="curso-edital-card">
              <div>
                {/* Header do Card */}
                <div className="curso-edital-header">
                  <div
                    className="curso-edital-icon"
                    style={{ background: curso.corIcone, color: curso.corTextoIcone }}
                  >
                    {curso.icone}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span className={`card-badge ${curso.badgeCor}`}>{curso.grau}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{curso.departamento}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.35 }}>
                      {curso.nome}
                    </h3>
                  </div>
                </div>

                {/* Metadados: Duração, Regime, Requisitos */}
                <div className="curso-edital-meta">
                  <span className="curso-meta-tag" title="Duração do Curso">
                    ⏱️ {curso.duracao}
                  </span>
                  <span className="curso-meta-tag" title="Regime de Aulas">
                    📅 {curso.regime}
                  </span>
                  <span className="curso-meta-tag" title="Requisito de Acesso">
                    📋 {curso.requisito}
                  </span>
                </div>

                {/* Descrição de acordo com o Edital */}
                <div className="curso-section-box">
                  <h4>📖 Descrição</h4>
                  <p>{curso.descricao}</p>
                </div>

                {/* Objectivo de acordo com o Edital */}
                <div className="curso-section-box">
                  <h4>🎯 Objectivo</h4>
                  <p>{curso.objectivo}</p>
                </div>

                {/* Aplicação & Saídas de acordo com o Edital */}
                <div className="curso-section-box" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
                  <h4 style={{ color: '#0369a1' }}>🚀 Aplicação &amp; Saídas Profissionais</h4>
                  <ul className="curso-aplicacao-list">
                    {curso.aplicacao.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão de Candidatura Online (Sem info de pagamentos) */}
              <div style={{ marginTop: '1.1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  to={`/pre-inscricao?curso=${encodeURIComponent(curso.nome)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#0055a4',
                    color: '#fff',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#003e7a'}
                  onMouseOut={e => e.currentTarget.style.background = '#0055a4'}
                >
                  <span>📝 Fazer Pré-Inscrição Online 2027</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Attachment Preview / Download Link ────────────────────────────────────────
function AttachmentBadge({ url, nome }) {
  return <AttachmentDisplay url={url} nome={nome} primaryColor="#0055a4" />;
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

// ── Section 1.5: Plano Analítico (REAL BACKEND) ─────────────────────────────
function PlanoAnaliticoSection({ canAdd, canEdit, canDelete }) {
  const { user } = useAuth();
  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && (user.tipo === 'docente');

  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingPlano, setViewingPlano] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState({ msg: '', tipo: '' });

  const [formData, setFormData] = useState({
    disciplina: '',
    codigo_disciplina: '',
    curso: 'Informática',
    turma: 'Turma A',
    ano_lectivo: '2026',
    semestre: '1º Semestre',
    docente_nome: user?.nome || '',
    carga_horaria_total: 60,
    objectivos_gerais: '',
    objectivos_especificos: '',
    competencias: '',
    conteudos_programaticos: '',
    metodologias_ensino: '',
    actividades_aprendizagem: '',
    estrategias_avaliacao: '',
    bibliografia_obrigatoria: '',
    bibliografia_complementar: '',
    unidades_tematicas: [
      { semana: 1, sessao: 1, tema: 'Introdução e Enquadramento', conteudos: '', metodologia: 'Expositiva / Interativa', actividades: 'Discussão inicial', horas_previstas: 2, tipo_sessao: 'Teórica' },
    ],
  });

  const loadPlanos = async () => {
    setLoading(true);
    try {
      const data = await planoAnaliticoService.getPlanos();
      setPlanos(data);
    } catch (err) {
      console.error('Erro ao carregar planos analíticos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanos();
  }, []);

  const showMsg = (msg, tipo = 'sucesso') => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback({ msg: '', tipo: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({
      disciplina: '',
      codigo_disciplina: '',
      curso: 'Informática',
      turma: 'Turma A',
      ano_lectivo: '2026',
      semestre: '1º Semestre',
      docente_nome: user?.nome || '',
      carga_horaria_total: 60,
      objectivos_gerais: '',
      objectivos_especificos: '',
      competencias: '',
      conteudos_programaticos: '',
      metodologias_ensino: '',
      actividades_aprendizagem: '',
      estrategias_avaliacao: '',
      bibliografia_obrigatoria: '',
      bibliografia_complementar: '',
      unidades_tematicas: [
        { semana: 1, sessao: 1, tema: 'Introdução e Enquadramento', conteudos: '', metodologia: 'Expositiva / Interativa', actividades: 'Discussão inicial', horas_previstas: 2, tipo_sessao: 'Teórica' },
      ],
    });
    setFile(null);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAddUnidadeRow = () => {
    const nextSem = formData.unidades_tematicas.length + 1;
    setFormData({
      ...formData,
      unidades_tematicas: [
        ...formData.unidades_tematicas,
        { semana: nextSem, sessao: nextSem, tema: '', conteudos: '', metodologia: 'Teórico-Prática', actividades: '', horas_previstas: 2, tipo_sessao: 'Teórica' },
      ],
    });
  };

  const handleRemoveUnidadeRow = (index) => {
    const updated = formData.unidades_tematicas.filter((_, idx) => idx !== index);
    setFormData({ ...formData, unidades_tematicas: updated });
  };

  const handleUnidadeChange = (index, field, value) => {
    const updated = [...formData.unidades_tematicas];
    updated[index][field] = value;
    setFormData({ ...formData, unidades_tematicas: updated });
  };

  const handleEditClick = (p) => {
    setEditingId(p._id || p.id);
    setFormData({
      disciplina: p.disciplina || '',
      codigo_disciplina: p.codigo_disciplina || '',
      curso: p.curso || 'Informática',
      turma: p.turma || 'Turma A',
      ano_lectivo: p.ano_lectivo || '2026',
      semestre: p.semestre || '1º Semestre',
      docente_nome: p.docente_nome || user?.nome || '',
      carga_horaria_total: p.carga_horaria_total || 60,
      objectivos_gerais: p.objectivos_gerais || '',
      objectivos_especificos: p.objectivos_especificos || '',
      competencias: p.competencias || '',
      conteudos_programaticos: p.conteudos_programaticos || '',
      metodologias_ensino: p.metodologias_ensino || '',
      actividades_aprendizagem: p.actividades_aprendizagem || '',
      estrategias_avaliacao: p.estrategias_avaliacao || '',
      bibliografia_obrigatoria: p.bibliografia_obrigatoria || '',
      bibliografia_complementar: p.bibliografia_complementar || '',
      unidades_tematicas: p.unidades_tematicas && p.unidades_tematicas.length > 0 ? p.unidades_tematicas : [
        { semana: 1, sessao: 1, tema: 'Introdução e Enquadramento', conteudos: '', metodologia: 'Expositiva / Interativa', actividades: 'Discussão inicial', horas_previstas: 2, tipo_sessao: 'Teórica' },
      ],
    });
    setShowAddForm(true);
    setViewingPlano(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let anexos = [];
      if (file) {
        const uploadRes = await planoAnaliticoService.uploadAnexo(file);
        if (uploadRes && uploadRes.url) {
          anexos.push({
            nome: uploadRes.nome || file.name,
            url: uploadRes.url,
            tamanho: uploadRes.tamanho || file.size,
          });
        }
      }

      const payload = {
        ...formData,
        ...(anexos.length > 0 ? { anexos } : {}),
      };

      if (editingId) {
        await planoAnaliticoService.updatePlano(editingId, payload);
        showMsg('Plano Analítico actualizado com sucesso!');
      } else {
        await planoAnaliticoService.createPlano(payload);
        showMsg('Plano Analítico criado com sucesso!');
      }

      resetForm();
      loadPlanos();
    } catch (err) {
      console.error(err);
      showMsg('Erro ao guardar o Plano Analítico.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEstadoChange = async (id, novoEstado, obs = '') => {
    try {
      await planoAnaliticoService.updateEstado(id, novoEstado, obs);
      showMsg(`Estado do Plano Analítico alterado para "${novoEstado}".`);
      loadPlanos();
      if (viewingPlano && (viewingPlano._id === id || viewingPlano.id === id)) {
        setViewingPlano(null);
      }
    } catch (err) {
      showMsg('Erro ao atualizar o estado do plano.', 'erro');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este Plano Analítico?')) return;
    try {
      await planoAnaliticoService.deletePlano(id);
      showMsg('Plano Analítico eliminado com sucesso.');
      loadPlanos();
      if (viewingPlano && (viewingPlano._id === id || viewingPlano.id === id)) {
        setViewingPlano(null);
      }
    } catch (err) {
      showMsg('Erro ao eliminar o plano.', 'erro');
    }
  };

  const renderBadgeEstado = (estado) => {
    switch (estado) {
      case 'aprovado':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Aprovado</span>;
      case 'validado':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Validado</span>;
      case 'submetido':
        return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Submetido</span>;
      case 'arquivado':
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Arquivado</span>;
      default:
        return <span style={{ background: '#e2e8f0', color: '#334155', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Rascunho</span>;
    }
  };

  const planosFiltrados = planos.filter((p) => {
    const matchCurso = filtroCurso === 'Todos' || p.curso === filtroCurso;
    const matchEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    return matchCurso && matchEstado;
  });

  return (
    <>
      <div className="ensino-header">
        <h1>📋 Plano Analítico</h1>
        <p>
          Registo oficial da programação temática, objectivos de aprendizagem, matriz de sessões teóricas e práticas,
          estratégias de avaliação e referências bibliográficas do ISPOTEC.
        </p>
      </div>

      {feedback.msg && (
        <div style={{
          background: feedback.tipo === 'erro' ? '#fee2e2' : '#dcfce7',
          color: feedback.tipo === 'erro' ? '#991b1b' : '#166534',
          border: `1px solid ${feedback.tipo === 'erro' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.2rem',
          fontWeight: 600,
        }}>
          {feedback.tipo === 'erro' ? '⚠️ ' : '✓ '}{feedback.msg}
        </div>
      )}

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filtroCurso}
            onChange={(e) => setFiltroCurso(e.target.value)}
            className="ensino-select"
            style={{ minWidth: '140px' }}
          >
            <option value="Todos">Todos os Cursos</option>
            <option value="Informática">Informática</option>
            <option value="Medicina">Medicina</option>
            <option value="Gestão">Gestão</option>
            <option value="Direito">Direito</option>
            <option value="Enfermagem">Enfermagem</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="ensino-select"
            style={{ minWidth: '130px' }}
          >
            <option value="Todos">Todos os Estados</option>
            <option value="rascunho">Rascunho</option>
            <option value="submetido">Submetido</option>
            <option value="validado">Validado</option>
            <option value="aprovado">Aprovado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>

        {(canAdd || isDocente || isAdmin) && (
          <button
            type="button"
            className="btn-add-action"
            onClick={() => {
              if (showAddForm) resetForm();
              else {
                resetForm();
                setShowAddForm(true);
              }
            }}
          >
            {showAddForm ? '✕ Fechar Formulário' : '+ Novo Plano Analítico'}
          </button>
        )}
      </div>

      {/* Form de Criação / Edição */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="ensino-form" style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            {editingId ? '✏️ Editar Plano Analítico' : '📋 Criar Novo Plano Analítico'}
          </h3>

          <div className="form-row-2">
            <div>
              <label className="form-label">Nome da Disciplina / Unidade Curricular *</label>
              <input
                type="text"
                required
                className="ensino-input"
                placeholder="Ex: Engenharia de Software"
                value={formData.disciplina}
                onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Código da Disciplina</label>
              <input
                type="text"
                className="ensino-input"
                placeholder="Ex: INF-302"
                value={formData.codigo_disciplina}
                onChange={(e) => setFormData({ ...formData, codigo_disciplina: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Curso *</label>
              <input
                type="text"
                required
                className="ensino-input"
                value={formData.curso}
                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Turma *</label>
              <input
                type="text"
                required
                className="ensino-input"
                value={formData.turma}
                onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Ano Lectivo *</label>
              <input
                type="text"
                required
                className="ensino-input"
                value={formData.ano_lectivo}
                onChange={(e) => setFormData({ ...formData, ano_lectivo: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Semestre *</label>
              <input
                type="text"
                required
                className="ensino-input"
                value={formData.semestre}
                onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label className="form-label">Docente Responsável *</label>
              <input
                type="text"
                required
                className="ensino-input"
                value={formData.docente_nome}
                onChange={(e) => setFormData({ ...formData, docente_nome: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Carga Horária Total (Horas) *</label>
              <input
                type="number"
                required
                className="ensino-input"
                value={formData.carga_horaria_total}
                onChange={(e) => setFormData({ ...formData, carga_horaria_total: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Objectivos Gerais da Disciplina</label>
            <textarea
              className="ensino-textarea"
              rows="2"
              value={formData.objectivos_gerais}
              onChange={(e) => setFormData({ ...formData, objectivos_gerais: e.target.value })}
              placeholder="Descreva as metas globais de formação e competências esperadas..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Objectivos Específicos &amp; Competências</label>
            <textarea
              className="ensino-textarea"
              rows="2"
              value={formData.objectivos_especificos}
              onChange={(e) => setFormData({ ...formData, objectivos_especificos: e.target.value })}
              placeholder="Competências cognitivas, práticas e atitudinais a serem adquiridas..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Conteúdos Programáticos (Síntese Geral)</label>
            <textarea
              className="ensino-textarea"
              rows="3"
              value={formData.conteudos_programaticos}
              onChange={(e) => setFormData({ ...formData, conteudos_programaticos: e.target.value })}
              placeholder="Unidades curriculares, temas principais e módulos lecionados..."
            />
          </div>

          <div className="form-row-2">
            <div>
              <label className="form-label">Metodologias de Ensino</label>
              <textarea
                className="ensino-textarea"
                rows="2"
                value={formData.metodologias_ensino}
                onChange={(e) => setFormData({ ...formData, metodologias_ensino: e.target.value })}
                placeholder="Expositiva, metodologias ativas, estudo de casos, aulas laboratoriais..."
              />
            </div>
            <div>
              <label className="form-label">Estratégias de Avaliação</label>
              <textarea
                className="ensino-textarea"
                rows="2"
                value={formData.estrategias_avaliacao}
                onChange={(e) => setFormData({ ...formData, estrategias_avaliacao: e.target.value })}
                placeholder="Frequências (50%), Trabalhos práticos (30%), Seminários (20%)..."
              />
            </div>
          </div>

          {/* Unidades Temáticas / Sessões */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                📅 Estrutura das Unidades Temáticas / Sessões
              </h4>
              <button
                type="button"
                onClick={handleAddUnidadeRow}
                style={{ background: '#0055a4', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                + Adicionar Sessão
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0', color: '#334155', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Semana</th>
                    <th style={{ padding: '0.5rem' }}>Tipo</th>
                    <th style={{ padding: '0.5rem' }}>Tema da Aula</th>
                    <th style={{ padding: '0.5rem' }}>Metodologia</th>
                    <th style={{ padding: '0.5rem' }}>Horas</th>
                    <th style={{ padding: '0.5rem' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.unidades_tematicas.map((u, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.4rem' }}>
                        <input
                          type="number"
                          style={{ width: '50px', padding: '0.3rem' }}
                          value={u.semana}
                          onChange={(e) => handleUnidadeChange(idx, 'semana', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <select
                          style={{ padding: '0.3rem' }}
                          value={u.tipo_sessao}
                          onChange={(e) => handleUnidadeChange(idx, 'tipo_sessao', e.target.value)}
                        >
                          <option value="Teórica">Teórica</option>
                          <option value="Prática">Prática</option>
                          <option value="Laboratório">Laboratório</option>
                          <option value="Seminário">Seminário</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.3rem' }}
                          value={u.tema}
                          onChange={(e) => handleUnidadeChange(idx, 'tema', e.target.value)}
                          placeholder="Tema da sessão"
                          required
                        />
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <input
                          type="text"
                          style={{ width: '100%', padding: '0.3rem' }}
                          value={u.metodologia}
                          onChange={(e) => handleUnidadeChange(idx, 'metodologia', e.target.value)}
                          placeholder="Expositiva / Prática"
                        />
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        <input
                          type="number"
                          style={{ width: '50px', padding: '0.3rem' }}
                          value={u.horas_previstas}
                          onChange={(e) => handleUnidadeChange(idx, 'horas_previstas', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '0.4rem' }}>
                        {formData.unidades_tematicas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnidadeRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label className="form-label">Bibliografia Obrigatória</label>
              <textarea
                className="ensino-textarea"
                rows="2"
                value={formData.bibliografia_obrigatoria}
                onChange={(e) => setFormData({ ...formData, bibliografia_obrigatoria: e.target.value })}
                placeholder="Livros e manuais fundamentais..."
              />
            </div>
            <div>
              <label className="form-label">Bibliografia Complementar</label>
              <textarea
                className="ensino-textarea"
                rows="2"
                value={formData.bibliografia_complementar}
                onChange={(e) => setFormData({ ...formData, bibliografia_complementar: e.target.value })}
                placeholder="Artigos, sites, referências adicionais..."
              />
            </div>
          </div>

          {/* Anexo */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label className="form-label">Anexar Documento do Plano Analítico (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="submit" className="btn-add-action" disabled={submitting}>
              {submitting ? 'A guardar...' : editingId ? 'Actualizar Plano' : 'Gravar Plano Analítico'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Planos Analíticos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>A carregar planos analíticos...</div>
      ) : planosFiltrados.length === 0 ? (
        <EmptyState
          mensagem="Nenhum Plano Analítico encontrado com os filtros actuais."
          canAdd={canAdd || isDocente || isAdmin}
          onAdd={() => setShowAddForm(true)}
        />
      ) : (
        <div className="ensino-grid">
          {planosFiltrados.map((p) => {
            const pId = p._id || p.id;
            return (
              <div key={pId} className="ensino-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div className="card-icon blue">📋</div>
                    {renderBadgeEstado(p.estado)}
                  </div>

                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                    {p.disciplina}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.8rem', lineHeight: 1.5 }}>
                    <div><strong>Curso:</strong> {p.curso} • <strong>Turma:</strong> {p.turma}</div>
                    <div><strong>Docente:</strong> {p.docente_nome}</div>
                    <div><strong>Ano/Semestre:</strong> {p.ano_lectivo} • {p.semestre}</div>
                    <div><strong>Carga:</strong> {p.carga_horaria_total} horas</div>
                  </div>

                  {p.objectivos_gerais && (
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 0.8rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.objectivos_gerais}
                    </p>
                  )}

                  {p.anexos && p.anexos.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <AttachmentBadge url={p.anexos[0].url} nome={p.anexos[0].nome || 'Plano Analítico Oficial'} />
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setViewingPlano(p)}
                      style={{ background: '#0055a4', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      👁️ Consultar / Imprimir
                    </button>

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {(canEdit || isDocente || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}

                      {/* Workflow buttons */}
                      {p.estado === 'rascunho' && (isDocente || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleEstadoChange(pId, 'submetido')}
                          style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                          title="Submeter para validação pedagógica"
                        >
                          Submeter ↗
                        </button>
                      )}

                      {p.estado === 'submetido' && isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEstadoChange(pId, 'aprovado')}
                            style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                            title="Aprovar Plano"
                          >
                            ✓ Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEstadoChange(pId, 'rascunho', 'Necessita de correções')}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                            title="Devolver para revisão"
                          >
                            ✕ Rejeitar
                          </button>
                        </>
                      )}

                      {(canDelete || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(pId)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Consulta e Impressão do Plano Analítico */}
      {viewingPlano && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            id="printable-plano"
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            {/* Action Bar (Top) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0055a4', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0055a4', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  INSTITUTO SUPERIOR POLITÉCNICO DE TECNOLOGIAS E CIÊNCIAS
                </span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800 }}>
                  Plano Analítico Oficial
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ background: '#0055a4', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🖨️ Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPlano(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cabeçalho de Dados da Disciplina */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', fontSize: '0.88rem' }}>
              <div><strong>Disciplina:</strong> {viewingPlano.disciplina}</div>
              <div><strong>Código:</strong> {viewingPlano.codigo_disciplina || '—'}</div>
              <div><strong>Curso:</strong> {viewingPlano.curso}</div>
              <div><strong>Turma:</strong> {viewingPlano.turma}</div>
              <div><strong>Ano Lectivo:</strong> {viewingPlano.ano_lectivo}</div>
              <div><strong>Semestre:</strong> {viewingPlano.semestre}</div>
              <div><strong>Docente Responsável:</strong> {viewingPlano.docente_nome}</div>
              <div><strong>Carga Horária:</strong> {viewingPlano.carga_horaria_total} Horas</div>
              <div><strong>Estado:</strong> {renderBadgeEstado(viewingPlano.estado)}</div>
            </div>

            {/* Objectivos Gerais */}
            {viewingPlano.objectivos_gerais && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  1. Objectivos Gerais
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {viewingPlano.objectivos_gerais}
                </p>
              </div>
            )}

            {/* Objectivos Específicos e Competências */}
            {viewingPlano.objectivos_especificos && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  2. Objectivos Específicos &amp; Competências
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {viewingPlano.objectivos_especificos}
                </p>
              </div>
            )}

            {/* Conteúdos Programáticos */}
            {viewingPlano.conteudos_programaticos && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  3. Conteúdos Programáticos
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {viewingPlano.conteudos_programaticos}
                </p>
              </div>
            )}

            {/* Matriz das Unidades Temáticas / Sessões */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                4. Matriz Cronológica de Unidades Temáticas e Sessões
              </h4>
              {viewingPlano.unidades_tematicas && viewingPlano.unidades_tematicas.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Sem.</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Tipo</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Tema da Sessão</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Metodologia</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Actividades</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingPlano.unidades_tematicas.map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>{u.semana}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{u.tipo_sessao}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0', fontWeight: 600 }}>{u.tema}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{u.metodologia}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0' }}>{u.actividades || '—'}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>{u.horas_previstas}h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Sem sessões discriminadas na matriz.
                </p>
              )}
            </div>

            {/* Metodologias & Avaliação */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
              {viewingPlano.metodologias_ensino && (
                <div>
                  <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                    5. Metodologias de Ensino
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                    {viewingPlano.metodologias_ensino}
                  </p>
                </div>
              )}
              {viewingPlano.estrategias_avaliacao && (
                <div>
                  <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                    6. Estratégias de Avaliação
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                    {viewingPlano.estrategias_avaliacao}
                  </p>
                </div>
              )}
            </div>

            {/* Bibliografia */}
            {(viewingPlano.bibliografia_obrigatoria || viewingPlano.bibliografia_complementar) && (
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <h4 style={{ color: '#0055a4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  7. Referências Bibliográficas
                </h4>
                {viewingPlano.bibliografia_obrigatoria && (
                  <div style={{ marginBottom: '0.6rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Obrigatória:</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-line' }}>
                      {viewingPlano.bibliografia_obrigatoria}
                    </div>
                  </div>
                )}
                {viewingPlano.bibliografia_complementar && (
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Complementar:</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-line' }}>
                      {viewingPlano.bibliografia_complementar}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Histórico de Validação / Assinaturas */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.82rem', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Confirmação Pedagógica:</strong> {viewingPlano.docente_nome} ({viewingPlano.estado.toUpperCase()})
                </div>
                <div>
                  ISPOTEC.ONLINE — Sistema Integrado de Gestão Académica
                </div>
              </div>
            </div>
          </div>
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
                        <AttachmentDisplay url={u.anexo_url} nome={u.anexo_nome} primaryColor="#0055a4" />
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
  const paramSeccao = searchParams.get('seccao') || searchParams.get('tab') || 'cursos-oferta';
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
      case 'cursos-oferta':          return <CursosOficiaisEdital />;
      case 'projetos-educativos':    return <ProjetosEducativos {...props} />;
      case 'plano-analitico':        return <PlanoAnaliticoSection {...props} />;
      case 'projetos-curriculares':  return <ProjetosCurriculares {...props} />;
      case 'bibliotecas':            return <Bibliotecas {...props} />;
      case 'laboratorios':           return <Laboratorios {...props} />;
      case 'estatistica-academica':  return <EstatisticaAcademica />;
      case 'estatistica-pedagogica': return <EstatisticaPedagogica />;
      case 'calendario':             return <CalendarioAcademico />;
      case 'eventos':                return <EventosCientificos {...props} />;
      default:                       return <CursosOficiaisEdital />;
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
