import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tecnologiaInovacaoService } from '../../services/tecnologiaInovacaoService';
import AttachmentDisplay from '../../components/AttachmentDisplay';

const SECTIONS = [
  { key: 'projectos_tecnologicos', label: 'Projectos Tecnológicos', icon: '💻', desc: 'Iniciativas tecnológicas, investigação aplicada e desenvolvimento de software/hardware.' },
  { key: 'laboratorio_inovacao', label: 'Laboratório de Inovação', icon: '🔬', desc: 'Espaço prático para prototipagem rápida, experimentação e demonstrações.' },
  { key: 'desenvolvimento_competencias', label: 'Desenvolvimento de Competências', icon: '🎯', desc: 'Workshops, formações práticas e aceleração de competências digitais.' },
  { key: 'exposicao_prototipos', label: 'Exposição de Protótipos', icon: '🚀', desc: 'Montra pública de soluções, protótipos e projectos de fim de curso dos estudantes.' },
  { key: 'parcerias_oportunidades', label: 'Parcerias & Oportunidades', icon: '🤝', desc: 'Bolsas de inovação, estágios técnicos, desafios e protocolos com o sector tecnológico.' },
];

export default function TecnologiaInovacao() {
  const { user } = useAuth();
  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && (user.tipo === 'docente');
  const canManage = isAdmin || isDocente;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'projectos_tecnologicos';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [feedback, setFeedback] = useState({ msg: '', tipo: '' });
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    descricao: '',
    categoria: 'Inovação e Tecnologia',
    departamento: 'Engenharia e Tecnologias',
    responsaveis: '',
    objectivos: '',
    prazos: '',
    estado: 'Ativo',
    // específico
    equipamentos_recursos: '',
    actividades_praticas: '',
    experiencias_demonstracoes: '',
    carga_horaria: '',
    formador: '',
    autores: '',
    orientadores: '',
    demo_url: '',
    repositorio_url: '',
    tipo_solucao: 'Web / Mobile / IoT',
    entidade_parceira: '',
    tipo_oportunidade: 'Concurso / Estágio / Financiamento',
    link_candidatura: '',
    data_limite: '',
    anexo_url: '',
    anexo_nome: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await tecnologiaInovacaoService.getItens({ tipo_area: activeTab });
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar dados de Tecnologia e Inovação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const showMsg = (msg, tipo = 'sucesso') => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback({ msg: '', tipo: '' }), 4000);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      titulo: '',
      subtitulo: '',
      descricao: '',
      categoria: 'Inovação e Tecnologia',
      departamento: 'Engenharia e Tecnologias',
      responsaveis: user?.nome || '',
      objectivos: '',
      prazos: '',
      estado: 'Ativo',
      equipamentos_recursos: '',
      actividades_praticas: '',
      experiencias_demonstracoes: '',
      carga_horaria: '',
      formador: user?.nome || '',
      autores: '',
      orientadores: '',
      demo_url: '',
      repositorio_url: '',
      tipo_solucao: 'Web / Mobile / IoT',
      entidade_parceira: '',
      tipo_oportunidade: 'Concurso / Estágio / Financiamento',
      link_candidatura: '',
      data_limite: '',
      anexo_url: '',
      anexo_nome: '',
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      equipamentos_recursos: Array.isArray(item.equipamentos_recursos) ? item.equipamentos_recursos.join(', ') : (item.equipamentos_recursos || ''),
      actividades_praticas: Array.isArray(item.actividades_praticas) ? item.actividades_praticas.join(', ') : (item.actividades_praticas || ''),
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este registo?')) return;
    try {
      await tecnologiaInovacaoService.deleteItem(id);
      showMsg('Registo eliminado com sucesso.');
      loadData();
    } catch (err) {
      showMsg('Erro ao eliminar registo.', 'erro');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let anexoUrl = formData.anexo_url;
      let anexoNome = formData.anexo_nome;

      if (selectedFile) {
        const uploadRes = await tecnologiaInovacaoService.uploadAnexo(selectedFile);
        if (uploadRes && uploadRes.url) {
          anexoUrl = uploadRes.url;
          anexoNome = uploadRes.nome || selectedFile.name;
        }
      }

      const payload = {
        ...formData,
        tipo_area: activeTab,
        anexo_url: anexoUrl,
        anexo_nome: anexoNome,
        equipamentos_recursos: typeof formData.equipamentos_recursos === 'string'
          ? formData.equipamentos_recursos.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.equipamentos_recursos,
        actividades_praticas: typeof formData.actividades_praticas === 'string'
          ? formData.actividades_praticas.split(',').map((s) => s.trim()).filter(Boolean)
          : formData.actividades_praticas,
      };

      if (editingItem) {
        await tecnologiaInovacaoService.updateItem(editingItem._id || editingItem.id, payload);
        showMsg('Registo actualizado com sucesso!');
      } else {
        await tecnologiaInovacaoService.createItem(payload);
        showMsg('Registo adicionado com sucesso!');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      showMsg('Erro ao guardar os dados.', 'erro');
    } finally {
      setSubmitting(false);
    }
  };

  const activeSectionInfo = SECTIONS.find((s) => s.key === activeTab) || SECTIONS[0];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <style>{`
        .tec-header {
          background: linear-gradient(135deg, #091e3a 0%, #0055a4 100%);
          border-radius: 16px;
          color: #fff;
          padding: 2.2rem 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px -5px rgba(0, 85, 164, 0.25);
        }
        .tec-header h1 {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .tec-header p {
          color: #cbd5e1;
          font-size: 0.95rem;
          max-width: 800px;
          margin: 0;
          line-height: 1.5;
        }
        .tec-layout {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .tec-sidebar {
          width: 270px;
          flex-shrink: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          position: sticky;
          top: 80px;
        }
        .tec-sidebar-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0 1.25rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 0.5rem;
        }
        .tec-nav-item {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          border-left: 3px solid transparent;
          background: none;
          border-top: none;
          border-right: none;
          border-bottom: none;
          width: 100%;
          text-align: left;
        }
        .tec-nav-item:hover {
          background: #f8fafc;
          color: #0055a4;
        }
        .tec-nav-item.active {
          background: #eff6ff;
          color: #0055a4;
          font-weight: 700;
          border-left-color: #0055a4;
        }
        .tec-content {
          flex: 1;
          min-width: 0;
        }
        .tec-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.4rem;
          margin-bottom: 1.2rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tec-card:hover {
          box-shadow: 0 8px 20px -4px rgba(0,0,0,0.08);
        }
        .tec-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tec-badge-green { background: #dcfce7; color: #166534; }
        .tec-badge-blue { background: #dbeafe; color: #1e40af; }
        .tec-badge-amber { background: #fef3c7; color: #92400e; }
        .tec-badge-purple { background: #f3e8ff; color: #6b21a8; }
        .tec-btn-primary {
          background: #0055a4;
          color: #fff;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.15s;
        }
        .tec-btn-primary:hover {
          background: #004080;
        }
        .tec-btn-secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .tec-btn-secondary:hover {
          background: #e2e8f0;
        }
        .tec-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .tec-modal {
          background: #fff;
          border-radius: 16px;
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }
        .tec-form-group {
          margin-bottom: 1.1rem;
        }
        .tec-form-group label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .tec-input, .tec-select, .tec-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          box-sizing: border-box;
          font-family: inherit;
        }
        .tec-input:focus, .tec-select:focus, .tec-textarea:focus {
          outline: none;
          border-color: #0055a4;
          box-shadow: 0 0 0 3px rgba(0, 85, 164, 0.15);
        }
        @media(max-width: 860px) {
          .tec-layout { flex-direction: column; }
          .tec-sidebar { width: 100%; position: static; display: flex; flex-wrap: wrap; padding: 0.5rem; }
          .tec-sidebar-title { width: 100%; }
          .tec-nav-item { width: auto; flex: 1 1 45%; border-left: none; border-bottom: 3px solid transparent; }
          .tec-nav-item.active { border-left-color: transparent; border-bottom-color: #0055a4; }
        }
        @media(max-width: 500px) {
          .tec-nav-item { flex: 1 1 100%; }
          .tec-header { padding: 1.5rem 1rem; }
          .tec-header h1 { font-size: 1.4rem; }
        }
      `}</style>

      {/* Header Banner */}
      <div className="tec-header">
        <h1>💡 Inovação & Tecnologia</h1>
        <p>
          Ecossistema do ISPOTEC dedicado à incubação tecnológica, desenvolvimento de competências digitais,
          pesquisa experimental aplicada e integração com o ecossistema empresarial e científico.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback.msg && (
        <div
          style={{
            background: feedback.tipo === 'erro' ? '#fee2e2' : '#dcfce7',
            color: feedback.tipo === 'erro' ? '#991b1b' : '#166534',
            border: `1px solid ${feedback.tipo === 'erro' ? '#fecaca' : '#bbf7d0'}`,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.2rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{feedback.tipo === 'erro' ? '⚠️' : '✓'}</span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="tec-layout">
        {/* Navigation Sidebar */}
        <aside className="tec-sidebar">
          <div className="tec-sidebar-title">Áreas de Inovação</div>
          <nav>
            {SECTIONS.map((sec) => (
              <button
                key={sec.key}
                type="button"
                className={`tec-nav-item ${activeTab === sec.key ? 'active' : ''}`}
                onClick={() => handleTabChange(sec.key)}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="tec-content">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                {activeSectionInfo.icon} {activeSectionInfo.label}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>{activeSectionInfo.desc}</p>
            </div>
            {canManage && (
              <button type="button" className="tec-btn-primary" onClick={openNewModal}>
                + Adicionar Registo
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              A carregar iniciativas de tecnologia e inovação...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                background: '#fff',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📂</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.35rem' }}>
                Nenhum registo disponível em {activeSectionInfo.label}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1rem' }}>
                {canManage
                  ? 'Utilize o botão acima para cadastrar a primeira iniciativa na base de dados.'
                  : 'Ainda não foram publicadas informações nesta área pelo corpo docente ou coordenação.'}
              </p>
              {canManage && (
                <button type="button" className="tec-btn-primary" onClick={openNewModal}>
                  + Adicionar Primeiro Registo
                </button>
              )}
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <div key={item._id || item.id} className="tec-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="tec-badge tec-badge-blue">{item.categoria || 'Geral'}</span>
                        <span className="tec-badge tec-badge-green">{item.estado || 'Ativo'}</span>
                        {item.tipo_solucao && <span className="tec-badge tec-badge-purple">{item.tipo_solucao}</span>}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                        {item.titulo}
                      </h3>
                      {item.subtitulo && (
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 500, color: '#475569', margin: '0 0 0.6rem 0' }}>
                          {item.subtitulo}
                        </h4>
                      )}
                      <p style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.8rem 0', whiteSpace: 'pre-line' }}>
                        {item.descricao}
                      </p>

                      {/* Metadados Específicos */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px' }}>
                        {item.responsaveis && <div>👤 <strong>Responsável:</strong> {item.responsaveis}</div>}
                        {item.departamento && <div>🏛️ <strong>Dep.:</strong> {item.departamento}</div>}
                        {item.prazos && <div>⏱️ <strong>Prazo:</strong> {item.prazos}</div>}
                        {item.formador && <div>👨‍🏫 <strong>Formador:</strong> {item.formador}</div>}
                        {item.carga_horaria && <div>⌛ <strong>Carga:</strong> {item.carga_horaria}</div>}
                        {item.autores && <div>👥 <strong>Autores:</strong> {item.autores}</div>}
                        {item.orientadores && <div>🧭 <strong>Orientador:</strong> {item.orientadores}</div>}
                        {item.entidade_parceira && <div>🏢 <strong>Parceiro:</strong> {item.entidade_parceira}</div>}
                        {item.data_limite && <div>📅 <strong>Data Limite:</strong> {item.data_limite}</div>}
                      </div>

                      {/* Links externos */}
                      {(item.demo_url || item.repositorio_url || item.link_candidatura) && (
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                          {item.demo_url && (
                            <a href={item.demo_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0055a4', fontWeight: 600, textDecoration: 'none' }}>
                              🌐 Ver Demonstração ↗
                            </a>
                          )}
                          {item.repositorio_url && (
                            <a href={item.repositorio_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, textDecoration: 'none' }}>
                              💻 Repositório / Código ↗
                            </a>
                          )}
                          {item.link_candidatura && (
                            <a href={item.link_candidatura} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                              📝 Candidatura / Edital ↗
                            </a>
                          )}
                        </div>
                      )}

                      {/* Anexo de Documento */}
                      {item.anexo_url && (
                        <div style={{ marginTop: '0.8rem' }}>
                          <AttachmentDisplay url={item.anexo_url} nome={item.anexo_nome || 'Documento Anexo'} primaryColor="#0055a4" />
                        </div>
                      )}
                    </div>

                    {canManage && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="tec-btn-secondary"
                          onClick={() => openEditModal(item)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          type="button"
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '0.45rem 0.8rem',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                          onClick={() => handleDelete(item._id || item.id)}
                          title="Eliminar"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="tec-modal-overlay">
          <div className="tec-modal">
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
              {editingItem ? 'Editar Iniciativa' : 'Nova Iniciativa'} — {activeSectionInfo.label}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="tec-form-group">
                <label>Título do Registo *</label>
                <input
                  type="text"
                  className="tec-input"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Protótipo de Sistema IoT para Automação"
                />
              </div>

              <div className="tec-form-group">
                <label>Subtítulo / Linha Curta</label>
                <input
                  type="text"
                  className="tec-input"
                  value={formData.subtitulo}
                  onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                  placeholder="Ex: Monitorização em tempo real de sensores ambientais"
                />
              </div>

              <div className="tec-form-group">
                <label>Descrição Detalhada *</label>
                <textarea
                  className="tec-textarea"
                  rows="4"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Apresente os objectivos, metodologia, relevância e funcionamento da iniciativa..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="tec-form-group">
                  <label>Categoria</label>
                  <input
                    type="text"
                    className="tec-input"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  />
                </div>
                <div className="tec-form-group">
                  <label>Estado</label>
                  <select
                    className="tec-select"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Em Planeamento">Em Planeamento</option>
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Piloto">Piloto</option>
                    <option value="Inscrições Abertas">Inscrições Abertas</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              </div>

              {/* Campos específicos por área */}
              {activeTab === 'projectos_tecnologicos' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tec-form-group">
                    <label>Responsáveis / Coordenador</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.responsaveis}
                      onChange={(e) => setFormData({ ...formData, responsaveis: e.target.value })}
                    />
                  </div>
                  <div className="tec-form-group">
                    <label>Cronograma / Prazos</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.prazos}
                      onChange={(e) => setFormData({ ...formData, prazos: e.target.value })}
                      placeholder="Ex: 2026 - 1º Semestre"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'laboratorio_inovacao' && (
                <>
                  <div className="tec-form-group">
                    <label>Equipamentos &amp; Recursos Disponíveis (separados por vírgula)</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.equipamentos_recursos}
                      onChange={(e) => setFormData({ ...formData, equipamentos_recursos: e.target.value })}
                      placeholder="Ex: Impressora 3D, Arduino, Kits IoT, Osciloscópio"
                    />
                  </div>
                  <div className="tec-form-group">
                    <label>Actividades Práticas Agendadas</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.actividades_praticas}
                      onChange={(e) => setFormData({ ...formData, actividades_praticas: e.target.value })}
                      placeholder="Ex: Oficina de Soldadura, Prototipagem com Raspberry Pi"
                    />
                  </div>
                </>
              )}

              {activeTab === 'desenvolvimento_competencias' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tec-form-group">
                    <label>Formador / Instrutor</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.formador}
                      onChange={(e) => setFormData({ ...formData, formador: e.target.value })}
                    />
                  </div>
                  <div className="tec-form-group">
                    <label>Carga Horária</label>
                    <input
                      type="text"
                      className="tec-input"
                      value={formData.carga_horaria}
                      onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                      placeholder="Ex: 20 Horas Práticas"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'exposicao_prototipos' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="tec-form-group">
                      <label>Autores (Estudantes / Criadores)</label>
                      <input
                        type="text"
                        className="tec-input"
                        value={formData.autores}
                        onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                      />
                    </div>
                    <div className="tec-form-group">
                      <label>Docente Orientador</label>
                      <input
                        type="text"
                        className="tec-input"
                        value={formData.orientadores}
                        onChange={(e) => setFormData({ ...formData, orientadores: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="tec-form-group">
                      <label>Link de Demonstração / Vídeo</label>
                      <input
                        type="url"
                        className="tec-input"
                        placeholder="https://..."
                        value={formData.demo_url}
                        onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                      />
                    </div>
                    <div className="tec-form-group">
                      <label>Link do Repositório (GitHub / GitLab)</label>
                      <input
                        type="url"
                        className="tec-input"
                        placeholder="https://github.com/..."
                        value={formData.repositorio_url}
                        onChange={(e) => setFormData({ ...formData, repositorio_url: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'parcerias_oportunidades' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="tec-form-group">
                      <label>Entidade Parceira / Empresa</label>
                      <input
                        type="text"
                        className="tec-input"
                        value={formData.entidade_parceira}
                        onChange={(e) => setFormData({ ...formData, entidade_parceira: e.target.value })}
                        placeholder="Ex: Unitel / Sonangol / BAI Tech"
                      />
                    </div>
                    <div className="tec-form-group">
                      <label>Data Limite para Candidatura</label>
                      <input
                        type="date"
                        className="tec-input"
                        value={formData.data_limite}
                        onChange={(e) => setFormData({ ...formData, data_limite: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="tec-form-group">
                    <label>Link de Inscrição / Edital Oficial</label>
                    <input
                      type="url"
                      className="tec-input"
                      placeholder="https://..."
                      value={formData.link_candidatura}
                      onChange={(e) => setFormData({ ...formData, link_candidatura: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Upload de Ficheiro / Anexo */}
              <div className="tec-form-group">
                <label>Anexar Documento Técnico / PDF / Imagem</label>
                <input
                  type="file"
                  className="tec-input"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                />
                {formData.anexo_url && !selectedFile && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#059669' }}>
                    Ficheiro actual: {formData.anexo_nome || formData.anexo_url}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="tec-btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tec-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'A guardar...' : editingItem ? 'Actualizar' : 'Guardar Registo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
