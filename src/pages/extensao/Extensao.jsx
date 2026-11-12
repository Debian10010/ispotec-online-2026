import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { extensaoService } from '../../services/extensaoService';
import { getFileUrl } from '../../services/api';
import AttachmentDisplay from '../../components/AttachmentDisplay';

// ── Fallback dos logótipos e cores dos centros ──────────────────────────────
const LOGOS_CENTROS = {
  CRC: '/assets/img/extensao/logo-crc.jpg',
  CPE: '/assets/img/extensao/logo-cpe.jpg',
  CETODEH: '/assets/img/extensao/logo-cetodeh.jpg',
  CTODH: '/assets/img/extensao/logo-cetodeh.jpg',
  'CUM-ISPOTEC': '/assets/img/extensao/logo-clinica-universitaria.jpg',
  CMU: '/assets/img/extensao/logo-clinica-universitaria.jpg',
  CUM: '/assets/img/extensao/logo-clinica-universitaria.jpg',
};

function resolveLogo(c) {
  if (c.logo_url) return c.logo_url;
  const sigla = (c.sigla || '').toUpperCase();
  if (LOGOS_CENTROS[sigla]) return LOGOS_CENTROS[sigla];
  const slug = (c.slug || '').toLowerCase();
  if (slug.includes('crc') || slug.includes('conflito')) return LOGOS_CENTROS.CRC;
  if (slug.includes('cpe') || slug.includes('empresarial')) return LOGOS_CENTROS.CPE;
  if (slug.includes('cetodeh') || slug.includes('terapia') || slug.includes('habilidade')) return LOGOS_CENTROS.CETODEH;
  if (slug.includes('clinica') || slug.includes('m-dico') || slug.includes('medico') || slug.includes('cmu')) return LOGOS_CENTROS['CUM-ISPOTEC'];
  return null;
}

// ── Cores por centro (fallback por sigla) ─────────────────────────────────────
const CENTRO_CORES = {
  CRC:    { cor: '#dc2626', corBg: '#fef2f2', corBorder: '#fecaca' },
  CUM:    { cor: '#dc2626', corBg: '#fef2f2', corBorder: '#fecaca' },
  'CUM-ISPOTEC': { cor: '#dc2626', corBg: '#fef2f2', corBorder: '#fecaca' },
  CMU:    { cor: '#dc2626', corBg: '#fef2f2', corBorder: '#fecaca' },
  CETODEH:{ cor: '#7c3aed', corBg: '#f5f3ff', corBorder: '#ddd6fe' },
  CTODH:  { cor: '#7c3aed', corBg: '#f5f3ff', corBorder: '#ddd6fe' },
  CPE:    { cor: '#0369a1', corBg: '#eff6ff', corBorder: '#bfdbfe' },
};

function getCentroColors(c) {
  const sigla = (c.sigla || '').toUpperCase();
  return CENTRO_CORES[sigla] || { cor: c.cor || '#059669', corBg: c.corBg || '#ecfdf5', corBorder: '#a7f3d0' };
}

// ── Shared Empty State ────────────────────────────────────────────────────────
function EmptyState({ mensagem = "Não existem registos disponíveis.", canAdd, onAdd, btnText = "+ Adicionar Registo" }) {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', margin: '1.5rem 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📂</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.35rem' }}>{mensagem}</h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1rem' }}>
        {canAdd ? 'Utilize o botão para adicionar o primeiro registo na base de dados.' : 'Ainda não foram registados dados pelos docentes ou administração.'}
      </p>
      {canAdd && onAdd && (
        <button onClick={onAdd} className="btn-add-action-green" style={{ display: 'inline-flex' }}>
          {btnText}
        </button>
      )}
    </div>
  );
}

// ── Attachment Badge ──────────────────────────────────────────────────────────
function AttachmentBadge({ url, nome }) {
  return <AttachmentDisplay url={url} nome={nome} primaryColor="#059669" />;
}

// ── Utilitário para estruturar a informação dos centros ────────────────────────
function parseCentroInfo(descricao = '') {
  if (!descricao) return { missao: '', visao: '', valores: [], iniciativas: [], servicosExtra: [], textoLivre: '' };

  const sections = {
    missao: '',
    visao: '',
    valores: [],
    iniciativas: [],
    servicosExtra: [],
    textoLivre: '',
  };

  // Seções por regex simples
  const lines = descricao.split(/\r?\n/).map(l => l.trim());
  let currentSec = 'inicio';
  let buffer = [];

  for (let line of lines) {
    if (!line) continue;
    const lower = line.toLowerCase();

    if (/^miss[ãa]o/i.test(line)) {
      if (currentSec === 'inicio' && buffer.length) sections.textoLivre = buffer.join(' ');
      currentSec = 'missao';
      buffer = [];
      const clean = line.replace(/^miss[ãa]o[:\s-]*/i, '').trim();
      if (clean) buffer.push(clean);
      continue;
    }
    if (/^vis[ãa]o/i.test(line)) {
      if (currentSec === 'missao') sections.missao = buffer.join(' ');
      currentSec = 'visao';
      buffer = [];
      const clean = line.replace(/^vis[ãa]o[:\s-]*/i, '').trim();
      if (clean) buffer.push(clean);
      continue;
    }
    if (/^valores/i.test(line)) {
      if (currentSec === 'visao') sections.visao = buffer.join(' ');
      if (currentSec === 'missao') sections.missao = buffer.join(' ');
      currentSec = 'valores';
      buffer = [];
      continue;
    }
    if (/^(principais iniciativas|iniciativas|principais actividades|actividades|objectivos|metodologia)/i.test(line)) {
      if (currentSec === 'visao') sections.visao = buffer.join(' ');
      if (currentSec === 'missao') sections.missao = buffer.join(' ');
      currentSec = 'iniciativas';
      buffer = [];
      continue;
    }
    if (/^(nossos servi[çc]os|servi[çc]os)/i.test(line)) {
      if (currentSec === 'visao') sections.visao = buffer.join(' ');
      if (currentSec === 'missao') sections.missao = buffer.join(' ');
      currentSec = 'servicos';
      buffer = [];
      continue;
    }

    if (currentSec === 'valores') {
      const val = line.replace(/^[•\-\*]\s*/, '').replace(/;$/, '').trim();
      if (val) sections.valores.push(val);
    } else if (currentSec === 'servicos') {
      const s = line.replace(/^[•\-\*]\s*/, '').trim();
      if (s) sections.servicosExtra.push(s);
    } else if (currentSec === 'iniciativas') {
      const ini = line.replace(/^[•\-\*]\s*/, '').trim();
      if (ini && ini.length > 5) sections.iniciativas.push(ini);
    } else {
      buffer.push(line);
    }
  }

  if (currentSec === 'missao' && !sections.missao) sections.missao = buffer.join(' ');
  if (currentSec === 'visao' && !sections.visao) sections.visao = buffer.join(' ');
  if (currentSec === 'inicio' && !sections.textoLivre) sections.textoLivre = buffer.join(' ');

  return sections;
}

// ── Centro Card Profissional ──────────────────────────────────────────────────
function CentroCard({ c, projetos, canEdit, canDelete, onViewProjects, onDelete, onEdit }) {
  const [expandido, setExpandido] = useState(false);
  const { cor, corBg, corBorder } = getCentroColors(c);
  const cId = c.slug || c.id || c._id;
  const cRealId = c.id || c._id;
  const logoUrl = resolveLogo(c);
  const projetosCount = projetos.filter(p => p.centro_id === cId || p.centro_id === cRealId).length;
  
  // Informação estruturada
  const info = parseCentroInfo(c.descricao);
  const servicos = (c.servicos && c.servicos.length > 0) ? c.servicos : info.servicosExtra;

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(0,0,0,0.06)', border: `1px solid ${corBorder}`,
      display: 'flex', flexDirection: 'column', transition: 'all 0.25s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.11)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.06)'; }}
    >
      {/* Header com Logotipo e Título */}
      <div style={{ background: `linear-gradient(135deg, ${corBg} 0%, #ffffff 100%)`, padding: '1.5rem', borderBottom: `1px solid ${corBorder}`, position: 'relative' }}>
        {/* Admin actions */}
        {(canEdit || canDelete) && (
          <div style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', display: 'flex', gap: '0.35rem' }}>
            {canEdit && (
              <button onClick={() => onEdit(c)} title="Editar" style={{ background: '#fff', border: `1px solid ${corBorder}`, borderRadius: '6px', padding: '0.3rem 0.55rem', fontSize: '0.74rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>✏️</button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(cRealId)} title="Eliminar" style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.55rem', fontSize: '0.74rem', fontWeight: 600, color: '#991b1b', cursor: 'pointer' }}>🗑️</button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{ width: '74px', height: '74px', borderRadius: '14px', overflow: 'hidden', background: '#fff', border: `2px solid ${corBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.07)' }}>
            {logoUrl ? (
              <img src={logoUrl} alt={c.sigla} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div style={{ display: logoUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem' }}>{c.icone || '🏢'}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: (canEdit || canDelete) ? '3.5rem' : '0' }}>
            {c.sigla && (
              <span style={{ display: 'inline-block', background: cor, color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '20px', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                {c.sigla}
              </span>
            )}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{c.nome}</h3>
            {c.curso && <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, margin: '0.2rem 0 0' }}>🎓 {c.curso}</p>}
          </div>
        </div>
      </div>

      {/* Body: Informações Organizadas */}
      <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Missão */}
        {info.missao && (
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', borderLeft: `3px solid ${cor}` }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: cor, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>
              🎯 Missão
            </span>
            <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
              {!expandido && info.missao.length > 220
                ? `${info.missao.slice(0, 210).trim()}...`
                : info.missao}
            </p>
          </div>
        )}

        {/* Visão (se expandido ou se não tiver missão) */}
        {info.visao && (expandido || !info.missao) && (
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', borderLeft: '3px solid #64748b' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>
              🔭 Visão
            </span>
            <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
              {info.visao}
            </p>
          </div>
        )}

        {/* Valores */}
        {info.valores.length > 0 && (
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
              ⭐ Valores Institucionais
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {info.valores.map((v, i) => (
                <span key={i} style={{ background: '#f1f5f9', color: '#334155', borderRadius: '6px', fontSize: '0.74rem', padding: '0.2rem 0.55rem', fontWeight: 500 }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Serviços / Áreas de Atuação */}
        {servicos && servicos.length > 0 && (
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
              🛠️ Serviços &amp; Práticas
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(expandido ? servicos : servicos.slice(0, 6)).map((s, i) => (
                <span key={i} style={{ background: corBg, color: cor, border: `1px solid ${corBorder}`, borderRadius: '20px', fontSize: '0.73rem', fontWeight: 600, padding: '0.2rem 0.65rem' }}>
                  ✓ {s}
                </span>
              ))}
              {!expandido && servicos.length > 6 && (
                <span onClick={() => setExpandido(true)} style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '0.72rem', padding: '0.2rem 0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  +{servicos.length - 6} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Iniciativas quando expandido */}
        {expandido && info.iniciativas.length > 0 && (
          <div style={{ background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
              🚀 Principais Ações &amp; Metodologia
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#14532d', lineHeight: 1.55 }}>
              {info.iniciativas.slice(0, 5).map((ini, i) => (
                <li key={i} style={{ marginBottom: '0.3rem' }}>{ini}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detalhes de Contacto e Coordenação */}
        <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: 'auto' }}>
          {c.coordenador && (
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              <strong>👤 Coordenação:</strong> {c.coordenador}
            </div>
          )}
          {c.contacto && (
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              <strong>📞 Contacto:</strong> {c.contacto}
            </div>
          )}
          {c.localizacao && (
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              <strong>📍 Localização:</strong> {c.localizacao}
            </div>
          )}
        </div>

        {/* Botão Ver Mais / Ver Menos */}
        {(info.visao || info.iniciativas.length > 0 || servicos.length > 6) && (
          <button
            onClick={() => setExpandido(!expandido)}
            style={{ background: 'transparent', border: 'none', color: cor, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', padding: '0.2rem 0', textAlign: 'center' }}
          >
            {expandido ? '▲ Recolher detalhes' : '▼ Ver estrutura completa (Visão, Metodologia e Iniciativas)'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.85rem 1.5rem', background: corBg, borderTop: `1px solid ${corBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
          📋 <strong style={{ color: '#0f172a' }}>{projetosCount}</strong> {projetosCount === 1 ? 'projeto comunitário' : 'projetos comunitários'}
        </span>
        <button
          onClick={() => onViewProjects(cId)}
          style={{ background: cor, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Ver Projetos →
        </button>
      </div>
    </div>
  );
}

export default function Extensao() {
  const { canAdd, canEdit, canDelete } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'centros';
  const selectedCenterId = searchParams.get('center') || 'all';

  const [centros, setCentros] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCentro, setEditCentro] = useState(null);

  const [showAddCentro, setShowAddCentro] = useState(false);
  const [showAddProjectFor, setShowAddProjectFor] = useState(null);
  const [showAddPartnerFor, setShowAddPartnerFor] = useState(null);

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [novoCentro, setNovoCentro] = useState({ slug: '', nome: '', sigla: '', curso: '', area: '', descricao: '', coordenador: '', logo_url: '', email: '', localizacao: '', servicos: '' });
  const [novoProjeto, setNovoProjeto] = useState({ titulo: '', descricao: '', impacto: '', estado: 'Em Curso', dataInicio: '2025' });
  const [novoParceiro, setNovoParceiro] = useState({ nome: '', tipo: '', contribuicao: '', logoIcon: '🤝' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, pData, parcData] = await Promise.all([
        extensaoService.getCentros(),
        extensaoService.getProjetos(selectedCenterId),
        extensaoService.getParceiros(selectedCenterId),
      ]);
      setCentros(cData);
      setProjetos(pData);
      setParceiros(parcData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCenterId]);

  const setTab = (tab, center = selectedCenterId) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (center && center !== 'all') {
      params.set('center', center);
    }
    setSearchParams(params);
  };

  const setCenterFilter = (centerId) => {
    const params = new URLSearchParams(searchParams);
    if (centerId === 'all') {
      params.delete('center');
    } else {
      params.set('center', centerId);
    }
    setSearchParams(params);
  };

  // ── CENTROS CRUD
  const handleAddCentro = async (e) => {
    e.preventDefault();
    if (!novoCentro.nome) return;
    setSubmitting(true);
    try {
      const slug = novoCentro.slug || (novoCentro.sigla ? novoCentro.sigla.toLowerCase() : novoCentro.nome.toLowerCase().replace(/[^a-z0-9]/g, '-'));
      const servicosArr = typeof novoCentro.servicos === 'string'
        ? novoCentro.servicos.split(',').map(s => s.trim()).filter(Boolean)
        : novoCentro.servicos;

      const saved = await extensaoService.createCentro({
        ...novoCentro,
        slug,
        servicos: servicosArr,
      });
      alert('Registo criado com sucesso.');
      setCentros([...centros, saved]);
      setNovoCentro({ slug: '', nome: '', sigla: '', curso: '', area: '', descricao: '', coordenador: '', logo_url: '', email: '', localizacao: '', servicos: '' });
      setShowAddCentro(false);
    } catch (err) {
      alert(err.message || 'Erro ao criar centro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCentro = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este centro de práticas?')) return;
    try {
      const ok = await extensaoService.deleteCentro(id);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setCentros(centros.filter(c => (c.id !== id && c._id !== id)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  // ── PROJETOS CRUD
  const handleAddProject = async (centroId, e) => {
    e.preventDefault();
    if (!novoProjeto.titulo) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await extensaoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await extensaoService.createProjeto({
        ...novoProjeto,
        centro_id: centroId,
        ...anexoData,
      });
      alert('Registo criado com sucesso.');
      setProjetos([saved, ...projetos]);
      setNovoProjeto({ titulo: '', descricao: '', impacto: '', estado: 'Em Curso', dataInicio: '2025' });
      setFile(null);
      setShowAddProjectFor(null);
    } catch (err) {
      alert(err.message || 'Erro ao criar projeto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (proj) => {
    const newTitle = window.prompt('Editar título do projeto:', proj.titulo);
    if (!newTitle) return;
    const newDesc = window.prompt('Editar descrição:', proj.descricao) || proj.descricao;
    try {
      const updated = await extensaoService.updateProjeto(proj.id || proj._id, {
        ...proj,
        titulo: newTitle,
        descricao: newDesc,
      });
      alert('Registo actualizado com sucesso.');
      setProjetos(projetos.map(p => (p.id === proj.id || p._id === proj._id) ? updated : p));
    } catch (err) {
      alert('Não foi possível actualizar o registo.');
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este projeto comunitário?')) return;
    try {
      const ok = await extensaoService.deleteProjeto(projId);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setProjetos(projetos.filter(p => (p.id !== projId && p._id !== projId)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  // ── PARCEIROS CRUD
  const handleAddPartner = async (centroId, e) => {
    e.preventDefault();
    if (!novoParceiro.nome) return;
    setSubmitting(true);
    try {
      let anexoData = {};
      if (file) {
        const uploaded = await extensaoService.uploadAnexo(file);
        anexoData = { anexo_url: uploaded.url, anexo_nome: uploaded.nome };
      }
      const saved = await extensaoService.createParceiro({
        ...novoParceiro,
        centro_id: centroId,
        ...anexoData,
      });
      alert('Registo criado com sucesso.');
      setParceiros([saved, ...parceiros]);
      setNovoParceiro({ nome: '', tipo: '', contribuicao: '', logoIcon: '🤝' });
      setFile(null);
      setShowAddPartnerFor(null);
    } catch (err) {
      alert(err.message || 'Erro ao adicionar parceiro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este parceiro?')) return;
    try {
      const ok = await extensaoService.deleteParceiro(partnerId);
      if (ok) {
        alert('Registo eliminado com sucesso.');
        setParceiros(parceiros.filter(p => (p.id !== partnerId && p._id !== partnerId)));
      } else {
        alert('Não foi possível eliminar o registo.');
      }
    } catch (err) {
      alert('Não foi possível eliminar o registo.');
    }
  };

  const filteredCentros = selectedCenterId === 'all'
    ? centros
    : centros.filter(c => (c.slug === selectedCenterId || c.id === selectedCenterId || c._id === selectedCenterId));

  return (
    <>
      <style>{`
        .ext-container { padding-top: 1.5rem; padding-bottom: 3rem; }
        .ext-hero {
          background: linear-gradient(135deg, #059669 0%, #064e3b 100%);
          color: #fff; padding: 2.5rem 1.75rem; border-radius: 14px;
          margin-bottom: 2rem; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.25);
          position: relative; overflow: hidden;
        }
        .ext-hero::after {
          content: ''; position: absolute; right: -40px; bottom: -40px;
          width: 200px; height: 200px; background: rgba(255, 255, 255, 0.06);
          border-radius: 50%; pointer-events: none;
        }
        .ext-badge-top {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(255, 255, 255, 0.2); color: #fff;
          padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.78rem;
          font-weight: 700; margin-bottom: 0.75rem; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .ext-hero h1 { font-size: 1.95rem; font-weight: 800; margin: 0 0 0.6rem; line-height: 1.25; }
        .ext-hero p { margin: 0; opacity: 0.93; font-size: 0.98rem; max-width: 860px; line-height: 1.6; }

        .ext-tabs {
          display: flex; gap: 0.5rem; border-bottom: 2px solid #e2e8f0;
          margin-bottom: 2rem; overflow-x: auto; padding-bottom: 2px;
        }
        .ext-tab-btn {
          padding: 0.75rem 1.25rem; font-size: 0.95rem; font-weight: 600;
          color: #64748b; border: none; background: none; cursor: pointer;
          border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap;
        }
        .ext-tab-btn:hover { color: #059669; }
        .ext-tab-btn.active { color: #059669; border-bottom-color: #059669; font-weight: 700; }

        .ext-filter-bar {
          display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.75rem;
          align-items: center; background: #ffffff; padding: 0.75rem 1rem;
          border-radius: 12px; border: 1px solid #e2e8f0;
        }
        .filter-btn-pill {
          padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.8rem;
          font-weight: 600; border: 1px solid #e2e8f0; background: #f8fafc;
          color: #475569; cursor: pointer; transition: all 0.15s;
        }
        .filter-btn-pill:hover { background: #e2e8f0; }
        .filter-btn-pill.active { background: #059669; color: #fff; border-color: #059669; }

        .btn-add-action-green {
          background: #059669; color: #fff; border: none; border-radius: 8px;
          padding: 0.45rem 0.95rem; font-size: 0.82rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.4rem; transition: background 0.15s;
        }
        .btn-add-action-green:hover { background: #047857; }
        .btn-edit-action {
          background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px;
          padding: 0.25rem 0.55rem; font-size: 0.76rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
        }
        .btn-edit-action:hover { background: #e2e8f0; color: #0f172a; }
        .btn-del-action {
          background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 6px;
          padding: 0.25rem 0.55rem; font-size: 0.76rem; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
        }
        .btn-del-action:hover { background: #fca5a5; }

        .ext-inline-form {
          background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 10px;
          padding: 1.25rem; margin-bottom: 1.25rem; display: grid; gap: 0.85rem;
        }
        .ext-input {
          width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1;
          border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;
        }

        .centros-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem; margin-bottom: 2.5rem;
        }
        .centro-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
          overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          display: flex; flex-direction: column; justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .centro-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px -3px rgba(0,0,0,0.08); }
        .centro-card-header { padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid #f1f5f9; }
        .centro-card-body { padding: 1.25rem 1.5rem; flex: 1; }
        .centro-card-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; }

        .projects-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .project-card {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;
        }
        .project-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 0.45rem; }
        .project-desc { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin-bottom: 0.85rem; }
        .project-impact {
          background: #ecfdf5; border: 1px solid #d1fae5; color: #065f46;
          border-radius: 6px; padding: 0.45rem 0.65rem; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.75rem;
        }

        .partners-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .partner-card {
          background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start;
        }
        .partner-logo-box {
          width: 48px; height: 48px; border-radius: 10px; background: #ecfdf5;
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;
        }
      `}</style>

      <div className="ext-container">
        {/* Hero Banner */}
        <div className="ext-hero">
          <div className="ext-badge-top">🤝 Extensão &amp; Responsabilidade Social ISPOTEC</div>
          <h1>Centros de Práticas &amp; Extensão Comunitária</h1>
          <p>
            Plataforma institucional de ligação entre a formação académica e a sociedade.
            Projetos comunitários, estágios práticos supervisionados e parcerias com o tecido social e produtivo.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="ext-tabs">
          <button className={`ext-tab-btn ${currentTab === 'centros' ? 'active' : ''}`} onClick={() => setTab('centros')}>
            🏢 Centros de Práticas
          </button>
          <button className={`ext-tab-btn ${currentTab === 'projetos' ? 'active' : ''}`} onClick={() => setTab('projetos')}>
            📋 Projetos Comunitários
          </button>
          <button className={`ext-tab-btn ${currentTab === 'parceiros' ? 'active' : ''}`} onClick={() => setTab('parceiros')}>
            🤝 Rede de Parceiros
          </button>
        </div>

        {/* Filter Bar */}
        <div className="ext-filter-bar">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Filtrar Centro:</span>
          <button
            className={`filter-btn-pill ${selectedCenterId === 'all' ? 'active' : ''}`}
            onClick={() => setCenterFilter('all')}
          >
            Todos os Centros
          </button>
          {centros.map(c => {
            const cId = c.slug || c.id || c._id;
            return (
              <button
                key={cId}
                className={`filter-btn-pill ${selectedCenterId === cId ? 'active' : ''}`}
                onClick={() => setCenterFilter(cId)}
              >
                {c.icone || '🏢'} {c.sigla || c.nome}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>A carregar dados da extensão universitária...</div>
        ) : currentTab === 'centros' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Centros de Práticas Registados</h2>
              {canAdd && (
                <button className="btn-add-action-green" onClick={() => setShowAddCentro(!showAddCentro)}>
                  {showAddCentro ? '✕ Cancelar' : '+ Adicionar Centro'}
                </button>
              )}
            </div>

            {canAdd && showAddCentro && (
              <form className="ext-inline-form" onSubmit={handleAddCentro}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#047857' }}>Novo Centro de Práticas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Nome do Centro *"
                    value={novoCentro.nome}
                    onChange={e => setNovoCentro({ ...novoCentro, nome: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Sigla (ex: CPM)"
                    value={novoCentro.sigla}
                    onChange={e => setNovoCentro({ ...novoCentro, sigla: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Curso Associado"
                    value={novoCentro.curso}
                    onChange={e => setNovoCentro({ ...novoCentro, curso: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Coordenador"
                    value={novoCentro.coordenador}
                    onChange={e => setNovoCentro({ ...novoCentro, coordenador: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="URL do Logótipo (ex: /assets/img/extensao/logo-crc.jpg)"
                    value={novoCentro.logo_url}
                    onChange={e => setNovoCentro({ ...novoCentro, logo_url: e.target.value })}
                  />
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Email de contacto"
                    value={novoCentro.email}
                    onChange={e => setNovoCentro({ ...novoCentro, email: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  className="ext-input"
                  placeholder="Serviços (separados por vírgula: Mediação, Arbitragem, Consultoria)"
                  value={novoCentro.servicos}
                  onChange={e => setNovoCentro({ ...novoCentro, servicos: e.target.value })}
                />
                <textarea
                  className="ext-input"
                  rows="2"
                  placeholder="Descrição das actividades do centro..."
                  value={novoCentro.descricao}
                  onChange={e => setNovoCentro({ ...novoCentro, descricao: e.target.value })}
                />
                <div>
                  <button type="submit" className="btn-add-action-green" disabled={submitting}>
                    {submitting ? 'A guardar...' : 'Salvar Centro'}
                  </button>
                </div>
              </form>
            )}

            {filteredCentros.length === 0 ? (
              <EmptyState canAdd={canAdd} onAdd={() => setShowAddCentro(true)} btnText="+ Adicionar Centro" />
            ) : (
              <div className="centros-grid">
                {filteredCentros.map(c => {
                  const cId = c.slug || c.id || c._id;
                  const cRealId = c.id || c._id;
                  return (
                    <CentroCard
                      key={cId}
                      c={c}
                      projetos={projetos}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onViewProjects={(id) => setTab('projetos', id)}
                      onDelete={handleDeleteCentro}
                      onEdit={(centro) => {
                        const novoNome = window.prompt('Editar nome do centro:', centro.nome);
                        if (!novoNome) return;
                        const novaDesc = window.prompt('Editar descrição:', centro.descricao) || centro.descricao;
                        extensaoService.updateCentro(cRealId, { ...centro, nome: novoNome, descricao: novaDesc })
                          .then(updated => {
                            setCentros(centros.map(item => (item.id === cRealId || item._id === cRealId) ? updated : item));
                            alert('Centro atualizado com sucesso.');
                          })
                          .catch(() => alert('Erro ao atualizar centro.'));
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : currentTab === 'projetos' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Projetos Comunitários de Extensão</h2>
              {canAdd && (
                <button className="btn-add-action-green" onClick={() => setShowAddProjectFor(selectedCenterId)}>
                  + Adicionar Projeto Comunitário
                </button>
              )}
            </div>

            {canAdd && showAddProjectFor && (
              <form className="ext-inline-form" onSubmit={(e) => handleAddProject(showAddProjectFor, e)}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#047857' }}>Novo Projeto Comunitário</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Título do Projeto *"
                    value={novoProjeto.titulo}
                    onChange={e => setNovoProjeto({ ...novoProjeto, titulo: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Impacto / Alcance (ex: 500 munícipes)"
                    value={novoProjeto.impacto}
                    onChange={e => setNovoProjeto({ ...novoProjeto, impacto: e.target.value })}
                  />
                </div>
                <textarea
                  className="ext-input"
                  rows="2"
                  placeholder="Descrição da ação comunitária..."
                  value={novoProjeto.descricao}
                  onChange={e => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    📎 Documento / Relatório do Projeto (PDF, DOCX, XLS, PPT)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ fontSize: '0.82rem' }}
                  />
                  {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-add-action-green" disabled={submitting}>
                    {submitting ? 'A guardar...' : 'Salvar Projeto'}
                  </button>
                  <button type="button" onClick={() => setShowAddProjectFor(null)} className="btn-edit-action">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {projetos.length === 0 ? (
              <EmptyState canAdd={canAdd} onAdd={() => setShowAddProjectFor(selectedCenterId)} btnText="+ Adicionar Projeto" />
            ) : (
              <div className="projects-grid">
                {projetos.map(p => {
                  const pId = p.id || p._id;
                  return (
                    <div key={pId} className="project-card">
                      <div>
                        <h4 className="project-title">{p.titulo}</h4>
                        <p className="project-desc">{p.descricao}</p>
                        {p.impacto && <div className="project-impact">🎯 {p.impacto}</div>}
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          📅 {p.dataInicio || '2025'} &nbsp;|&nbsp; 🟢 {p.estado || 'Em Curso'}
                        </div>
                        <AttachmentBadge url={p.anexo_url} nome={p.anexo_nome} />
                      </div>
                      {(canEdit || canDelete) && (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                          {canEdit && (
                            <button className="btn-edit-action" onClick={() => handleEditProject(p)}>
                              ✏️ Editar
                            </button>
                          )}
                          {canDelete && (
                            <button className="btn-del-action" onClick={() => handleDeleteProject(pId)}>
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
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Rede de Parceiros Institucionais</h2>
              {canAdd && (
                <button className="btn-add-action-green" onClick={() => setShowAddPartnerFor(selectedCenterId)}>
                  + Adicionar Parceiro
                </button>
              )}
            </div>

            {canAdd && showAddPartnerFor && (
              <form className="ext-inline-form" onSubmit={(e) => handleAddPartner(showAddPartnerFor, e)}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#047857' }}>Novo Parceiro</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Nome da Entidade Parceira *"
                    value={novoParceiro.nome}
                    onChange={e => setNovoParceiro({ ...novoParceiro, nome: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="ext-input"
                    placeholder="Tipo (Hospital, ONG, Empresa)"
                    value={novoParceiro.tipo}
                    onChange={e => setNovoParceiro({ ...novoParceiro, tipo: e.target.value })}
                  />
                </div>
                <textarea
                  className="ext-input"
                  rows="2"
                  placeholder="Contribuição / Cooperação institucional..."
                  value={novoParceiro.contribuicao}
                  onChange={e => setNovoParceiro({ ...novoParceiro, contribuicao: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    📎 Protocolo / Acordo de Parceria (PDF, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ fontSize: '0.82rem' }}
                  />
                  {file && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>✓ {file.name}</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-add-action-green" disabled={submitting}>
                    {submitting ? 'A guardar...' : 'Salvar Parceiro'}
                  </button>
                  <button type="button" onClick={() => setShowAddPartnerFor(null)} className="btn-edit-action">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {parceiros.length === 0 ? (
              <EmptyState canAdd={canAdd} onAdd={() => setShowAddPartnerFor(selectedCenterId)} btnText="+ Adicionar Parceiro" />
            ) : (
              <div className="partners-grid">
                {parceiros.map(parc => {
                  const parcId = parc.id || parc._id;
                  return (
                    <div key={parcId} className="partner-card">
                      <div className="partner-logo-box">{parc.logoIcon || '🤝'}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>{parc.nome}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>{parc.tipo}</span>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.4rem 0' }}>{parc.contribuicao}</p>
                        <AttachmentBadge url={parc.anexo_url} nome={parc.anexo_nome} />
                        {canDelete && (
                          <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                            <button className="btn-del-action" onClick={() => handleDeletePartner(parcId)}>
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
