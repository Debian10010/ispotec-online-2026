import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { investigacaoService } from '../../services/investigacaoService';

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
        <button onClick={onAdd} className="btn-add-action-blue" style={{ display: 'inline-flex' }}>
          {btnText}
        </button>
      )}
    </div>
  );
}

// ── Attachment Badge ──────────────────────────────────────────────────────────
function AttachmentBadge({ url, nome }) {
  if (!url) return null;
  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
  return (
    <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 600, textDecoration: 'none' }}
      >
        <span>📎</span> {nome || 'Ver Documento Anexo'}
      </a>
    </div>
  );
}

export default function Investigacao() {
  const { canAdd, canEdit, canDelete } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLabId = searchParams.get('lab');
  const [activeTab, setActiveTab] = useState('visao-geral');

  const [laboratorios, setLaboratorios] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [investigadores, setInvestigadores] = useState([]);
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Forms states
  const [showAddLab, setShowAddLab] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [novoLab, setNovoLab] = useState({
    nome: '', sigla: '', icone: '🔬', cor: '#1d4ed8', corBg: '#dbeafe',
    descricao: '', coordenador: '', contacto: '', email: '', localizacao: '', areasStr: '', atividadesStr: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [novoProj, setNovoProj] = useState({ titulo: '', financiamento: '', periodo: '2025 - 2027', estado: 'Em Curso', resumo: '' });

  const [editingInv, setEditingInv] = useState(null);
  const [novoInv, setNovoInv] = useState({ nome: '', cargo: '', titulacao: '', email: '' });

  const [editingPub, setEditingPub] = useState(null);
  const [novaPub, setNovaPub] = useState({ titulo: '', revista: '', autores: '', doi: '', ano: new Date().getFullYear().toString() });

  const showMsg = (message, type = 'sucesso') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const labs = await investigacaoService.getLabs();
      setLaboratorios(labs);

      if (selectedLabId) {
        const found = labs.find(l => (l._id || l.id) === selectedLabId || l.sigla?.toLowerCase() === selectedLabId?.toLowerCase());
        const labKey = found ? (found._id || found.id) : selectedLabId;
        const [pData, invData, pubData] = await Promise.all([
          investigacaoService.getProjetos(labKey),
          investigacaoService.getPesquisadores(labKey),
          investigacaoService.getPublicacoes(labKey)
        ]);
        setProjetos(pData);
        setInvestigadores(invData);
        setPublicacoes(pubData);
      }
    } catch (err) {
      console.error(err);
      showMsg('Erro ao carregar dados da base de dados.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLabId]);

  const selectedLab = laboratorios.find(l => (l._id || l.id) === selectedLabId || l.sigla?.toLowerCase() === selectedLabId?.toLowerCase());

  const selectLab = (labId) => {
    const params = new URLSearchParams();
    if (labId) {
      params.set('lab', labId);
    }
    setSearchParams(params);
    setActiveTab('visao-geral');
    setShowAddForm(false);
    setEditingProj(null);
    setEditingInv(null);
    setEditingPub(null);
    setFile(null);
  };

  // ── Laboratórios Handlers ──────────────────────────────────────────────────
  const handleSaveLab = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let anexo_url = editingLab ? editingLab.anexo_url : '';
      let anexo_nome = editingLab ? editingLab.anexo_nome : '';

      if (file) {
        const up = await investigacaoService.uploadAnexo(file);
        anexo_url = up.url;
        anexo_nome = up.nome;
      }

      const payload = {
        ...novoLab,
        areas: typeof novoLab.areasStr === 'string' ? novoLab.areasStr.split(',').map(s => s.trim()).filter(Boolean) : novoLab.areas || [],
        atividades: typeof novoLab.atividadesStr === 'string' ? novoLab.atividadesStr.split('\n').map(s => s.trim()).filter(Boolean) : novoLab.atividades || [],
        anexo_url,
        anexo_nome
      };

      if (editingLab) {
        await investigacaoService.updateLab(editingLab._id || editingLab.id, payload);
        showMsg('Laboratório atualizado com sucesso.');
      } else {
        await investigacaoService.createLab(payload);
        showMsg('Laboratório criado com sucesso.');
      }

      setShowAddLab(false);
      setEditingLab(null);
      setFile(null);
      setNovoLab({ nome: '', sigla: '', icone: '🔬', cor: '#1d4ed8', corBg: '#dbeafe', descricao: '', coordenador: '', contacto: '', email: '', localizacao: '', areasStr: '', atividadesStr: '' });
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível guardar o laboratório.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLab = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este laboratório científico e todos os seus registos associados?')) return;
    try {
      await investigacaoService.deleteLab(id);
      showMsg('Laboratório eliminado com sucesso.');
      selectLab(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível eliminar o laboratório.', 'erro');
    }
  };

  // ── Projetos Handlers ──────────────────────────────────────────────────────
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!selectedLab) return;
    setSubmitting(true);
    try {
      let anexo_url = editingProj ? editingProj.anexo_url : '';
      let anexo_nome = editingProj ? editingProj.anexo_nome : '';

      if (file) {
        const up = await investigacaoService.uploadAnexo(file);
        anexo_url = up.url;
        anexo_nome = up.nome;
      }

      const payload = {
        ...novoProj,
        lab_id: selectedLab._id || selectedLab.id,
        anexo_url,
        anexo_nome
      };

      if (editingProj) {
        await investigacaoService.updateProjeto(editingProj._id || editingProj.id, payload);
        showMsg('Projeto de investigação atualizado com sucesso.');
      } else {
        await investigacaoService.createProjeto(payload);
        showMsg('Projeto de investigação criado com sucesso.');
      }

      setShowAddForm(false);
      setEditingProj(null);
      setFile(null);
      setNovoProj({ titulo: '', financiamento: '', periodo: '2025 - 2027', estado: 'Em Curso', resumo: '' });
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível guardar o projeto.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este projeto de investigação?')) return;
    try {
      await investigacaoService.deleteProjeto(projId);
      showMsg('Projeto eliminado com sucesso.');
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível eliminar o projeto.', 'erro');
    }
  };

  // ── Investigadores Handlers ────────────────────────────────────────────────
  const handleSaveResearcher = async (e) => {
    e.preventDefault();
    if (!selectedLab) return;
    setSubmitting(true);
    try {
      let anexo_url = editingInv ? editingInv.anexo_url : '';
      let anexo_nome = editingInv ? editingInv.anexo_nome : '';

      if (file) {
        const up = await investigacaoService.uploadAnexo(file);
        anexo_url = up.url;
        anexo_nome = up.nome;
      }

      const payload = {
        ...novoInv,
        lab_id: selectedLab._id || selectedLab.id,
        anexo_url,
        anexo_nome
      };

      if (editingInv) {
        await investigacaoService.updatePesquisador(editingInv._id || editingInv.id, payload);
        showMsg('Investigador atualizado com sucesso.');
      } else {
        await investigacaoService.createPesquisador(payload);
        showMsg('Investigador registado com sucesso.');
      }

      setShowAddForm(false);
      setEditingInv(null);
      setFile(null);
      setNovoInv({ nome: '', cargo: '', titulacao: '', email: '' });
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível guardar o investigador.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResearcher = async (invId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este investigador?')) return;
    try {
      await investigacaoService.deletePesquisador(invId);
      showMsg('Investigador eliminado com sucesso.');
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível eliminar o investigador.', 'erro');
    }
  };

  // ── Publicações Handlers ───────────────────────────────────────────────────
  const handleSavePublication = async (e) => {
    e.preventDefault();
    if (!selectedLab) return;
    setSubmitting(true);
    try {
      let anexo_url = editingPub ? editingPub.anexo_url : '';
      let anexo_nome = editingPub ? editingPub.anexo_nome : '';

      if (file) {
        const up = await investigacaoService.uploadAnexo(file);
        anexo_url = up.url;
        anexo_nome = up.nome;
      }

      const payload = {
        ...novaPub,
        lab_id: selectedLab._id || selectedLab.id,
        anexo_url,
        anexo_nome
      };

      if (editingPub) {
        await investigacaoService.updatePublicacao(editingPub._id || editingPub.id, payload);
        showMsg('Publicação científica atualizada com sucesso.');
      } else {
        await investigacaoService.createPublicacao(payload);
        showMsg('Publicação científica registada com sucesso.');
      }

      setShowAddForm(false);
      setEditingPub(null);
      setFile(null);
      setNovaPub({ titulo: '', revista: '', autores: '', doi: '', ano: new Date().getFullYear().toString() });
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível guardar a publicação.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePublication = async (pubId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta publicação científica?')) return;
    try {
      await investigacaoService.deletePublicacao(pubId);
      showMsg('Publicação eliminada com sucesso.');
      await loadData();
    } catch (err) {
      console.error(err);
      showMsg('Não foi possível eliminar a publicação.', 'erro');
    }
  };

  return (
    <>
      <style>{`
        .inv-container {
          padding-top: 1.5rem;
          padding-bottom: 3rem;
        }
        .inv-hero {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e1b4b 100%);
          color: #fff;
          padding: 2.5rem 1.75rem;
          border-radius: 14px;
          margin-bottom: 2rem;
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.25);
          position: relative;
          overflow: hidden;
        }
        .inv-hero::after {
          content: '';
          position: absolute;
          right: -40px;
          bottom: -40px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          pointer-events: none;
        }
        .inv-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .inv-hero h1 {
          font-size: 1.95rem;
          font-weight: 800;
          margin: 0 0 0.6rem;
          line-height: 1.25;
        }
        .inv-hero p {
          margin: 0;
          opacity: 0.93;
          font-size: 0.98rem;
          max-width: 860px;
          line-height: 1.6;
        }

        .inv-summary-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .inv-stat-card {
          background: #fff;
          padding: 1.25rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          text-align: center;
        }
        .inv-stat-num {
          font-size: 1.9rem;
          font-weight: 800;
          color: #1d4ed8;
          line-height: 1;
          margin-bottom: 0.35rem;
        }
        .inv-stat-lbl {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .inv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }
        .inv-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .inv-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .inv-card-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        .inv-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .inv-card-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.35;
        }
        .inv-card-sigla {
          font-size: 0.72rem;
          font-weight: 800;
          background: #f1f5f9;
          color: #475569;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.2rem;
          letter-spacing: 0.5px;
        }
        .inv-card-desc {
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.55;
          margin: 0 0 1rem;
        }
        .inv-areas-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .area-tag {
          font-size: 0.72rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }
        .inv-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .inv-btn-detail {
          background: #1d4ed8;
          color: #fff;
          border: none;
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .detail-view {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.75rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        .detail-back-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .detail-header-block {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .detail-icon-large {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          flex-shrink: 0;
        }
        .detail-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.4rem;
        }
        .detail-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.75rem;
        }
        .detail-meta-item strong {
          display: block;
          font-size: 0.76rem;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }
        .detail-meta-item span {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
        }

        .detail-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .detail-tab-btn {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          padding: 0.65rem 1.1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          white-space: nowrap;
        }
        .detail-tab-btn.active {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }

        .detail-section-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .detail-section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .btn-add-action-blue {
          background: #1d4ed8;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-edit-action {
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          color: #0284c7;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-del-action {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
        }

        .inv-inline-form {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .inv-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.88rem;
          background: #fff;
        }
        .inv-input:focus {
          outline: none;
          border-color: #1d4ed8;
        }

        .researcher-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.1rem;
        }
        .researcher-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .researcher-card strong {
          display: block;
          font-size: 0.95rem;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }
        .researcher-card .role {
          font-size: 0.8rem;
          color: #1d4ed8;
          font-weight: 600;
          display: block;
          margin-bottom: 0.2rem;
        }
        .researcher-card .titulacao {
          font-size: 0.78rem;
          color: #64748b;
        }

        .pub-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          margin-bottom: 1rem;
        }
        .pub-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }
        .pub-meta {
          font-size: 0.82rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }
        .pub-doi {
          font-size: 0.76rem;
          color: #1d4ed8;
          font-family: monospace;
        }

        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          font-size: 0.88rem;
          color: #334155;
        }

        .alert-banner {
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .alert-sucesso {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .alert-erro {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        @media (max-width: 768px) {
          .inv-hero { padding: 1.75rem 1.25rem; }
          .inv-hero h1 { font-size: 1.5rem; }
          .inv-grid { grid-template-columns: 1fr; }
          .detail-header-block { flex-direction: column; }
        }
      `}</style>

      <div className="inv-container">
        {/* Header Investigação */}
        <div className="inv-hero">
          <div className="inv-badge-top">
            <span>🔬</span> Módulo Independente de Investigação Científica
          </div>
          <h1>Laboratórios de Investigação Científica ISPOTEC</h1>
          <p>
            O Módulo de Investigação reúne as unidades e laboratórios científicos dedicados à produção de conhecimento de fronteira, publicação de estudos biomédicos e tecnológicos, e desenvolvimento de soluções com rigor metodológico.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`alert-banner alert-${feedback.type}`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* Stats Summary Bar */}
        <div className="inv-summary-bar">
          <div className="inv-stat-card">
            <div className="inv-stat-num">{laboratorios.length}</div>
            <div className="inv-stat-lbl">Laboratórios Especializados</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">{investigadores.length || '—'}</div>
            <div className="inv-stat-lbl">Investigadores Registados</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">{projetos.length || '—'}</div>
            <div className="inv-stat-lbl">Projetos Científicos Ativos</div>
          </div>
          <div className="inv-stat-card">
            <div className="inv-stat-num">{publicacoes.length || '—'}</div>
            <div className="inv-stat-lbl">Artigos e Publicações</div>
          </div>
        </div>

        {/* SE UM LABORATÓRIO ESTIVER SELECIONADO: INTERFACE DETALHADA */}
        {selectedLab ? (
          <div className="detail-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                className="detail-back-btn"
                onClick={() => selectLab(null)}
                style={{ margin: 0 }}
              >
                ← Voltar à lista de todos os laboratórios
              </button>

              {(canEdit || canDelete) && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {canEdit && (
                    <button
                      className="btn-edit-action"
                      style={{ padding: '0.45rem 0.85rem' }}
                      onClick={() => {
                        setEditingLab(selectedLab);
                        setNovoLab({
                          nome: selectedLab.nome || '',
                          sigla: selectedLab.sigla || '',
                          icone: selectedLab.icone || '🔬',
                          cor: selectedLab.cor || '#1d4ed8',
                          corBg: selectedLab.corBg || '#dbeafe',
                          descricao: selectedLab.descricao || '',
                          coordenador: selectedLab.coordenador || '',
                          contacto: selectedLab.contacto || '',
                          email: selectedLab.email || '',
                          localizacao: selectedLab.localizacao || '',
                          areasStr: Array.isArray(selectedLab.areas) ? selectedLab.areas.join(', ') : '',
                          atividadesStr: Array.isArray(selectedLab.atividades) ? selectedLab.atividades.join('\n') : ''
                        });
                        setShowAddLab(true);
                      }}
                    >
                      ✏️ Editar Laboratório
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="btn-del-action"
                      style={{ padding: '0.45rem 0.85rem' }}
                      onClick={() => handleDeleteLab(selectedLab._id || selectedLab.id)}
                    >
                      🗑️ Eliminar Laboratório
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="detail-header-block">
              <div
                className="detail-icon-large"
                style={{ background: selectedLab.corBg || '#dbeafe', color: selectedLab.cor || '#1d4ed8' }}
              >
                {selectedLab.icone || '🔬'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="inv-card-sigla">{selectedLab.sigla}</span>
                  <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>ISPOTEC Investigação</span>
                </div>
                <h2 className="detail-title">{selectedLab.nome}</h2>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.94rem', lineHeight: 1.6 }}>
                  {selectedLab.descricao}
                </p>
                <AttachmentBadge url={selectedLab.anexo_url} nome={selectedLab.anexo_nome} />
              </div>
            </div>

            {/* Info and Contact Bar */}
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <strong>Coordenador Científico</strong>
                <span>{selectedLab.coordenador || '—'}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Localização</strong>
                <span>{selectedLab.localizacao || '—'}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Contactos Telefónicos</strong>
                <span>{selectedLab.contacto || '—'}</span>
              </div>
              <div className="detail-meta-item">
                <strong>Email Institucional</strong>
                <span>{selectedLab.email || '—'}</span>
              </div>
            </div>

            {/* Sub-tabs for Laboratory info */}
            <div className="detail-tabs">
              <button
                className={`detail-tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
                onClick={() => { setActiveTab('visao-geral'); setShowAddForm(false); }}
              >
                🔍 Linhas de Investigação ({(selectedLab.areas || []).length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'projetos' ? 'active' : ''}`}
                onClick={() => { setActiveTab('projetos'); setShowAddForm(false); }}
              >
                📋 Projetos Científicos ({projetos.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'investigadores' ? 'active' : ''}`}
                onClick={() => { setActiveTab('investigadores'); setShowAddForm(false); }}
              >
                👥 Investigadores ({investigadores.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'publicacoes' ? 'active' : ''}`}
                onClick={() => { setActiveTab('publicacoes'); setShowAddForm(false); }}
              >
                📚 Publicações ({publicacoes.length})
              </button>
              <button
                className={`detail-tab-btn ${activeTab === 'atividades' ? 'active' : ''}`}
                onClick={() => { setActiveTab('atividades'); setShowAddForm(false); }}
              >
                ⚡ Atividades e Serviços
              </button>
            </div>

            {/* TAB CONTENT: ÁREAS / VISÃO GERAL */}
            {activeTab === 'visao-geral' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Linhas e Áreas de Investigação</h3>
                </div>
                {(!selectedLab.areas || selectedLab.areas.length === 0) ? (
                  <EmptyState mensagem="Não existem linhas de investigação registadas." canAdd={canEdit} onAdd={() => {
                    setEditingLab(selectedLab);
                    setShowAddLab(true);
                  }} btnText="Configurar Áreas" />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {selectedLab.areas.map((area, i) => (
                      <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>🎯</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{area}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROJETOS */}
            {activeTab === 'projetos' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Projetos de Investigação em Curso</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => {
                        setEditingProj(null);
                        setNovoProj({ titulo: '', financiamento: '', periodo: '2025 - 2027', estado: 'Em Curso', resumo: '' });
                        setFile(null);
                        setShowAddForm(!showAddForm);
                      }}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Projeto Científico'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleSaveProject}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>{editingProj ? 'Editar Projeto Científico' : 'Novo Projeto Científico'}</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Título do Projeto *"
                      value={novoProj.titulo}
                      onChange={e => setNovoProj({ ...novoProj, titulo: e.target.value })}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Entidade Financiadora"
                        value={novoProj.financiamento}
                        onChange={e => setNovoProj({ ...novoProj, financiamento: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Período (ex: 2025 - 2027)"
                        value={novoProj.periodo}
                        onChange={e => setNovoProj({ ...novoProj, periodo: e.target.value })}
                      />
                    </div>
                    <textarea
                      className="inv-input"
                      rows="2"
                      placeholder="Resumo do projeto..."
                      value={novoProj.resumo}
                      onChange={e => setNovoProj({ ...novoProj, resumo: e.target.value })}
                    />
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        📎 Anexo / Documentação Científica (PDF, DOCX, XLSX, etc.):
                      </label>
                      <input
                        type="file"
                        className="inv-input"
                        onChange={e => setFile(e.target.files[0])}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn-add-action-blue" disabled={submitting}>
                        {submitting ? 'A guardar...' : editingProj ? 'Atualizar Projeto' : 'Salvar Projeto'}
                      </button>
                    </div>
                  </form>
                )}

                {projetos.length === 0 ? (
                  <EmptyState mensagem="Não existem projetos disponíveis." canAdd={canAdd} onAdd={() => setShowAddForm(true)} btnText="+ Adicionar Primeiro Projeto" />
                ) : (
                  <div style={{ display: 'grid', gap: '1.2rem' }}>
                    {projetos.map((proj) => (
                      <div key={proj._id || proj.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                            {proj.titulo}
                          </h4>
                          <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                            ● {proj.estado || 'Em Curso'}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.55 }}>
                          {proj.resumo}
                        </p>
                        <AttachmentBadge url={proj.anexo_url} nome={proj.anexo_nome} />
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                            <span>💰 <strong>Financiamento:</strong> {proj.financiamento || 'ISPOTEC'}</span>
                            <span>📅 <strong>Período:</strong> {proj.periodo || '—'}</span>
                          </div>
                          {(canEdit || canDelete) && (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {canEdit && (
                                <button
                                  className="btn-edit-action"
                                  onClick={() => {
                                    setEditingProj(proj);
                                    setNovoProj({
                                      titulo: proj.titulo || '',
                                      financiamento: proj.financiamento || '',
                                      periodo: proj.periodo || '',
                                      estado: proj.estado || 'Em Curso',
                                      resumo: proj.resumo || ''
                                    });
                                    setShowAddForm(true);
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn-del-action"
                                  onClick={() => handleDeleteProject(proj._id || proj.id)}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: INVESTIGADORES */}
            {activeTab === 'investigadores' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Corpo de Investigadores</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => {
                        setEditingInv(null);
                        setNovoInv({ nome: '', cargo: '', titulacao: '', email: '' });
                        setFile(null);
                        setShowAddForm(!showAddForm);
                      }}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Investigador'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleSaveResearcher}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>{editingInv ? 'Editar Investigador' : 'Novo Investigador'}</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Nome Completo *"
                      value={novoInv.nome}
                      onChange={e => setNovoInv({ ...novoInv, nome: e.target.value })}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Cargo / Posição"
                        value={novoInv.cargo}
                        onChange={e => setNovoInv({ ...novoInv, cargo: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Titulação Académica (ex: Mestre em...)"
                        value={novoInv.titulacao}
                        onChange={e => setNovoInv({ ...novoInv, titulacao: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        📎 CV / Perfil Académico (PDF, DOCX):
                      </label>
                      <input
                        type="file"
                        className="inv-input"
                        onChange={e => setFile(e.target.files[0])}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn-add-action-blue" disabled={submitting}>
                        {submitting ? 'A guardar...' : editingInv ? 'Atualizar Investigador' : 'Salvar Investigador'}
                      </button>
                    </div>
                  </form>
                )}

                {investigadores.length === 0 ? (
                  <EmptyState mensagem="Não existem investigadores registados." canAdd={canAdd} onAdd={() => setShowAddForm(true)} btnText="+ Adicionar Primeiro Investigador" />
                ) : (
                  <div className="researcher-grid">
                    {investigadores.map((inv) => (
                      <div key={inv._id || inv.id || inv.nome} className="researcher-card">
                        <div>
                          <strong>{inv.nome}</strong>
                          <span className="role">{inv.cargo}</span>
                          <span className="titulacao">🎓 {inv.titulacao}</span>
                          <AttachmentBadge url={inv.anexo_url} nome={inv.anexo_nome} />
                        </div>
                        {(canEdit || canDelete) && (
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                            {canEdit && (
                              <button
                                className="btn-edit-action"
                                onClick={() => {
                                  setEditingInv(inv);
                                  setNovoInv({
                                    nome: inv.nome || '',
                                    cargo: inv.cargo || '',
                                    titulacao: inv.titulacao || '',
                                    email: inv.email || ''
                                  });
                                  setShowAddForm(true);
                                }}
                              >
                                ✏️ Editar
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn-del-action"
                                onClick={() => handleDeleteResearcher(inv._id || inv.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PUBLICAÇÕES */}
            {activeTab === 'publicacoes' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Artigos e Publicações Científicas Recentes</h3>
                  {canAdd && (
                    <button
                      className="btn-add-action-blue"
                      onClick={() => {
                        setEditingPub(null);
                        setNovaPub({ titulo: '', revista: '', autores: '', doi: '', ano: new Date().getFullYear().toString() });
                        setFile(null);
                        setShowAddForm(!showAddForm);
                      }}
                    >
                      {showAddForm ? '✕ Cancelar' : '+ Adicionar Publicação'}
                    </button>
                  )}
                </div>

                {canAdd && showAddForm && (
                  <form className="inv-inline-form" onSubmit={handleSavePublication}>
                    <h4 style={{ margin: 0, color: '#1d4ed8' }}>{editingPub ? 'Editar Publicação' : 'Nova Publicação Científica'}</h4>
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Título do Artigo / Publicação *"
                      value={novaPub.titulo}
                      onChange={e => setNovaPub({ ...novaPub, titulo: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="inv-input"
                      placeholder="Revista / Periódico (ex: Revista Científica ISPOTEC, 2024)"
                      value={novaPub.revista}
                      onChange={e => setNovaPub({ ...novaPub, revista: e.target.value })}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="Autores"
                        value={novaPub.autores}
                        onChange={e => setNovaPub({ ...novaPub, autores: e.target.value })}
                      />
                      <input
                        type="text"
                        className="inv-input"
                        placeholder="DOI ou Link"
                        value={novaPub.doi}
                        onChange={e => setNovaPub({ ...novaPub, doi: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        📎 Ficheiro Completo do Artigo (PDF):
                      </label>
                      <input
                        type="file"
                        className="inv-input"
                        onChange={e => setFile(e.target.files[0])}
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn-add-action-blue" disabled={submitting}>
                        {submitting ? 'A guardar...' : editingPub ? 'Atualizar Publicação' : 'Salvar Publicação'}
                      </button>
                    </div>
                  </form>
                )}

                {publicacoes.length === 0 ? (
                  <EmptyState mensagem="Não existem publicações disponíveis." canAdd={canAdd} onAdd={() => setShowAddForm(true)} btnText="+ Adicionar Primeira Publicação" />
                ) : (
                  <div>
                    {publicacoes.map((pub) => (
                      <div key={pub._id || pub.id || pub.titulo} className="pub-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <div className="pub-title">{pub.titulo}</div>
                            <div className="pub-meta">
                              <span>📖 <strong>Revista:</strong> {pub.revista || 'ISPOTEC'}</span> &nbsp;|&nbsp; 
                              <span>👥 <strong>Autores:</strong> {pub.autores || '—'}</span>
                            </div>
                            {pub.doi && <div className="pub-doi">{pub.doi}</div>}
                            <AttachmentBadge url={pub.anexo_url} nome={pub.anexo_nome} />
                          </div>
                          {(canEdit || canDelete) && (
                            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                              {canEdit && (
                                <button
                                  className="btn-edit-action"
                                  onClick={() => {
                                    setEditingPub(pub);
                                    setNovaPub({
                                      titulo: pub.titulo || '',
                                      revista: pub.revista || '',
                                      autores: pub.autores || '',
                                      doi: pub.doi || '',
                                      ano: pub.ano || ''
                                    });
                                    setShowAddForm(true);
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn-del-action"
                                  onClick={() => handleDeletePublication(pub._id || pub.id)}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ATIVIDADES */}
            {activeTab === 'atividades' && (
              <div>
                <div className="detail-section-bar">
                  <h3 className="detail-section-title">Atividades e Serviços Científicos</h3>
                </div>
                {(!selectedLab.atividades || selectedLab.atividades.length === 0) ? (
                  <EmptyState mensagem="Não existem atividades ou serviços científicos registados." canAdd={canEdit} onAdd={() => {
                    setEditingLab(selectedLab);
                    setShowAddLab(true);
                  }} btnText="Configurar Atividades" />
                ) : (
                  <ul className="activity-list">
                    {selectedLab.atividades.map((act, i) => (
                      <li key={i} className="activity-item">
                        <span>🔬 {act}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          /* SE NÃO HOUVER SELEÇÃO: LISTA COMPLETA DOS LABORATÓRIOS */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🏛️</span> Laboratórios Científicos ISPOTEC ({laboratorios.length})
              </h2>
              {canAdd && (
                <button
                  className="btn-add-action-blue"
                  onClick={() => {
                    setEditingLab(null);
                    setNovoLab({ nome: '', sigla: '', icone: '🔬', cor: '#1d4ed8', corBg: '#dbeafe', descricao: '', coordenador: '', contacto: '', email: '', localizacao: '', areasStr: '', atividadesStr: '' });
                    setFile(null);
                    setShowAddLab(!showAddLab);
                  }}
                >
                  {showAddLab ? '✕ Cancelar' : '+ Novo Laboratório de Investigação'}
                </button>
              )}
            </div>

            {/* Form de Criação / Edição de Laboratório */}
            {canAdd && showAddLab && (
              <form className="inv-inline-form" onSubmit={handleSaveLab} style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                <h4 style={{ margin: 0, color: '#1d4ed8' }}>{editingLab ? 'Editar Laboratório Científico' : 'Novo Laboratório Científico'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Nome do Laboratório *"
                    value={novoLab.nome}
                    onChange={e => setNovoLab({ ...novoLab, nome: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Sigla (ex: LFAC) *"
                    value={novoLab.sigla}
                    onChange={e => setNovoLab({ ...novoLab, sigla: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Ícone (ex: 🔬)"
                    value={novoLab.icone}
                    onChange={e => setNovoLab({ ...novoLab, icone: e.target.value })}
                  />
                </div>
                <textarea
                  className="inv-input"
                  rows="2"
                  placeholder="Descrição da missão e competências do laboratório..."
                  value={novoLab.descricao}
                  onChange={e => setNovoLab({ ...novoLab, descricao: e.target.value })}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Coordenador Científico"
                    value={novoLab.coordenador}
                    onChange={e => setNovoLab({ ...novoLab, coordenador: e.target.value })}
                  />
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Localização (Edifício, Sala)"
                    value={novoLab.localizacao}
                    onChange={e => setNovoLab({ ...novoLab, localizacao: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="inv-input"
                    placeholder="Contacto telefónico"
                    value={novoLab.contacto}
                    onChange={e => setNovoLab({ ...novoLab, contacto: e.target.value })}
                  />
                  <input
                    type="email"
                    className="inv-input"
                    placeholder="Email institucional"
                    value={novoLab.email}
                    onChange={e => setNovoLab({ ...novoLab, email: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  className="inv-input"
                  placeholder="Linhas de Investigação (separadas por vírgula)"
                  value={novoLab.areasStr}
                  onChange={e => setNovoLab({ ...novoLab, areasStr: e.target.value })}
                />
                <textarea
                  className="inv-input"
                  rows="2"
                  placeholder="Atividades e serviços (um por linha)"
                  value={novoLab.atividadesStr}
                  onChange={e => setNovoLab({ ...novoLab, atividadesStr: e.target.value })}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    📎 Documento do Regulamento / Apresentação (PDF, DOCX):
                  </label>
                  <input
                    type="file"
                    className="inv-input"
                    onChange={e => setFile(e.target.files[0])}
                  />
                </div>
                <div>
                  <button type="submit" className="btn-add-action-blue" disabled={submitting}>
                    {submitting ? 'A guardar...' : editingLab ? 'Atualizar Laboratório' : 'Salvar Laboratório'}
                  </button>
                </div>
              </form>
            )}

            {laboratorios.length === 0 ? (
              <EmptyState mensagem="Não existem registos disponíveis." canAdd={canAdd} onAdd={() => setShowAddLab(true)} btnText="+ Criar Primeiro Laboratório" />
            ) : (
              <div className="inv-grid">
                {laboratorios.map(lab => (
                  <div
                    key={lab._id || lab.id}
                    className="inv-card"
                    style={{ '--lab-color': lab.cor || '#1d4ed8' }}
                    onClick={() => selectLab(lab._id || lab.id)}
                  >
                    <div>
                      <div className="inv-card-header">
                        <div
                          className="inv-card-icon"
                          style={{ background: lab.corBg || '#dbeafe', color: lab.cor || '#1d4ed8' }}
                        >
                          {lab.icone || '🔬'}
                        </div>
                        <div>
                          <h3 className="inv-card-name">{lab.nome}</h3>
                          <span className="inv-card-sigla">{lab.sigla}</span>
                        </div>
                      </div>

                      <p className="inv-card-desc">{lab.descricao}</p>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>
                        👤 <strong>Coordenação:</strong> {lab.coordenador || '—'}
                      </div>

                      {Array.isArray(lab.areas) && lab.areas.length > 0 && (
                        <div className="inv-areas-tags">
                          {lab.areas.slice(0, 3).map((area, i) => (
                            <span key={i} className="area-tag">{area}</span>
                          ))}
                          {lab.areas.length > 3 && (
                            <span className="area-tag" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                              +{lab.areas.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}

                      <AttachmentBadge url={lab.anexo_url} nome={lab.anexo_nome} />
                    </div>

                    <div className="inv-card-footer">
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {lab.localizacao || 'Campus ISPOTEC'}
                      </span>
                      <button
                        className="inv-btn-detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectLab(lab._id || lab.id);
                        }}
                      >
                        Ver Detalhes →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
