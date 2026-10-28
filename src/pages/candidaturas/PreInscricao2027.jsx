import React, { useState, useId, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  candidaturaService,
  OFERTA_FORMATIVA_ISPOTEC_2027,
  NIVEIS_INGRESSO,
  PROVINCIAS_MOCAMBIQUE
} from '../../services/candidaturaService';
import FichaCandidatoPrint from '../../components/FichaCandidatoPrint';

export default function PreInscricao2027() {
  const navigate = useNavigate();

  // Estado do formulário
  const [etapa, setEtapa] = useState(1); // 1: Curso, 2: Dados Pessoais, 3: Documentos, 4: Confirmação
  const [cursoSelecionadoId, setCursoSelecionadoId] = useState('');
  const [grauFiltro, setGrauFiltro] = useState('Todos');

  // Dados Pessoais
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: '',
    dataNascimento: '',
    bi: '',
    morada: '',
    provincia: 'Maputo Província',
    distrito: '',
    bairro: '',
    telefonePrincipal: '',
    telefoneAdicional1: '',
    telefoneAdicional2: '',
    nomeEncarregado: '',
    contactoEncarregado: '',
    localTrabalho: '',
    fotoPreview: ''
  });

  // Dados Académicos
  const [dadosAcademicos, setDadosAcademicos] = useState({
    nivelIngresso: '12.ª Classe',
    instituicaoProveniencia: '',
    anoConclusao: new Date().getFullYear() - 1,
    regime: '',
    modalidade: ''
  });

  // Documentos
  const [documentos, setDocumentos] = useState({
    comprovativoPagamento: null,
    bi: null,
    certificado: null,
    outros: null
  });

  const [previews, setPreviews] = useState({
    comprovativo: null,
    bi: null,
    certificado: null
  });

  // Estados de controlo
  const [termoAceite, setTermoAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [candidaturaCriada, setCandidaturaCriada] = useState(null);
  const [imprimirAberto, setImprimirAberto] = useState(false);

  // Curso activo
  const cursoAtivo = OFERTA_FORMATIVA_ISPOTEC_2027.find(c => c.id === cursoSelecionadoId);

  // Atualizar regimes e modalidades quando curso muda
  useEffect(() => {
    if (cursoAtivo) {
      setDadosAcademicos(prev => ({
        ...prev,
        regime: cursoAtivo.regimes[0] || 'Laboral',
        modalidade: cursoAtivo.modalidades[0] || 'Presencial'
      }));
    }
  }, [cursoSelecionadoId]);

  // Handle Foto
  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A fotografia não pode exceder 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDadosPessoais(p => ({ ...p, fotoPreview: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Documentos
  const handleFileChange = (campo, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(`O ficheiro ${file.name} excede o limite máximo de 8MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocumentos(prev => ({
        ...prev,
        [campo]: {
          nomeFicheiro: file.name,
          tamanho: file.size,
          tipo: file.type,
          dataUpload: new Date().toISOString(),
          url: event.target.result
        }
      }));

      setPreviews(prev => ({
        ...prev,
        [campo]: file.type.startsWith('image/') ? event.target.result : null
      }));
    };
    reader.readAsDataURL(file);
  };

  // Validação da Etapa 1
  const validarEtapa1 = () => {
    if (!cursoAtivo) {
      setErro('Por favor, selecione o curso pretendido.');
      return false;
    }
    if (!dadosAcademicos.regime) {
      setErro('Por favor, escolha o regime de frequência (Laboral ou Pós-laboral).');
      return false;
    }
    if (!dadosAcademicos.modalidade) {
      setErro('Por favor, escolha a modalidade de ensino.');
      return false;
    }
    setErro('');
    return true;
  };

  // Validação da Etapa 2
  const validarEtapa2 = () => {
    if (!dadosPessoais.nome.trim()) {
      setErro('O nome completo do candidato é obrigatório.');
      return false;
    }
    if (!dadosPessoais.dataNascimento) {
      setErro('A data de nascimento é obrigatória.');
      return false;
    }
    if (!dadosPessoais.bi.trim()) {
      setErro('O número de Bilhete de Identidade (B.I.) é obrigatório.');
      return false;
    }
    if (!dadosPessoais.telefonePrincipal.trim()) {
      setErro('O número de telefone principal é obrigatório.');
      return false;
    }
    if (!dadosPessoais.nomeEncarregado.trim()) {
      setErro('O nome do encarregado de educação é obrigatório.');
      return false;
    }
    if (!dadosPessoais.contactoEncarregado.trim()) {
      setErro('O contacto telefónico do encarregado é obrigatório.');
      return false;
    }
    setErro('');
    return true;
  };

  // Validação da Etapa 3
  const validarEtapa3 = () => {
    if (!documentos.comprovativoPagamento) {
      setErro('É obrigatório anexar o comprovativo de pagamento da taxa de pré-inscrição.');
      return false;
    }
    if (!termoAceite) {
      setErro('Deve declarar a veracidade das informações e aceitar os termos da candidatura.');
      return false;
    }
    setErro('');
    return true;
  };

  // Submissão Final
  const handleSubmeter = async (e) => {
    e.preventDefault();
    if (!validarEtapa3()) return;

    setEnviando(true);
    setErro('');

    try {
      const payload = {
        dadosPessoais: {
          ...dadosPessoais
        },
        dadosAcademicos: {
          cursoId: cursoAtivo.id,
          cursoNome: cursoAtivo.nome,
          grau: cursoAtivo.grau,
          duracao: cursoAtivo.duracao,
          propinaMensal: cursoAtivo.propinaMensal,
          matricula: cursoAtivo.matricula,
          regime: dadosAcademicos.regime,
          modalidade: dadosAcademicos.modalidade,
          nivelIngresso: dadosAcademicos.nivelIngresso,
          instituicaoProveniencia: dadosAcademicos.instituicaoProveniencia,
          anoConclusao: dadosAcademicos.anoConclusao
        },
        documentos: {
          comprovativoPagamento: documentos.comprovativoPagamento,
          bi: documentos.bi,
          certificado: documentos.certificado,
          fotografia: dadosPessoais.fotoPreview ? { nomeFicheiro: 'foto-passe.jpg', url: dadosPessoais.fotoPreview } : null
        }
      };

      const resultado = await candidaturaService.submeterCandidatura(payload);
      setCandidaturaCriada(resultado);
      setEtapa(4); // Tela de Sucesso
    } catch (err) {
      setErro(err.message || 'Ocorreu um erro ao submeter a candidatura. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Cursos filtrados por categoria
  const cursosFiltrados = OFERTA_FORMATIVA_ISPOTEC_2027.filter(c => {
    if (grauFiltro === 'Todos') return true;
    return c.grau === grauFiltro;
  });

  return (
    <div className="pre-inscricao-container">
      <style>{`
        .pre-inscricao-container {
          max-width: 1040px;
          margin: 2rem auto;
          padding: 0 1.25rem 4rem 1.25rem;
          font-family: inherit;
        }

        .pi-hero {
          background: linear-gradient(135deg, #003366 0%, #0055a4 100%);
          border-radius: 14px;
          padding: 2.25rem 2rem;
          color: white;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 51, 102, 0.15);
          position: relative;
          overflow: hidden;
        }

        .pi-hero::after {
          content: '2027';
          position: absolute;
          right: -20px;
          bottom: -30px;
          font-size: 8rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }

        .pi-badge-ano {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
        }

        .pi-hero h1 {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .pi-hero p {
          font-size: 0.95rem;
          color: #e0f2fe;
          margin: 0;
          max-width: 650px;
          line-height: 1.5;
        }

        /* STEPPER */
        .pi-stepper {
          display: flex;
          justify-content: space-between;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .pi-step {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #94a3b8;
          transition: all 0.2s ease;
        }

        .pi-step.active {
          color: #003366;
        }

        .pi-step.completed {
          color: #16a34a;
        }

        .pi-step-num {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .pi-step.active .pi-step-num {
          background: #003366;
          color: white;
        }

        .pi-step.completed .pi-step-num {
          background: #dcfce7;
          color: #16a34a;
        }

        /* FORM CARD */
        .pi-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          margin-bottom: 1.5rem;
        }

        .pi-card-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pi-card-sub {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0 0 1.5rem 0;
        }

        .pi-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .pi-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .pi-grid-2, .pi-grid-3 {
            grid-template-columns: 1fr;
          }
          .pi-stepper {
            overflow-x: auto;
            gap: 1rem;
          }
        }

        .pi-form-group {
          margin-bottom: 1.25rem;
        }

        .pi-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .pi-input, .pi-select, .pi-textarea {
          width: 100%;
          padding: 0.7rem 0.9rem;
          font-size: 0.9rem;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .pi-input:focus, .pi-select:focus, .pi-textarea:focus {
          outline: none;
          border-color: #0055a4;
          background: white;
          box-shadow: 0 0 0 3px rgba(0, 85, 164, 0.12);
        }

        /* COURSE SELECTOR CARDS */
        .pi-course-item {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pi-course-item:hover {
          border-color: #0284c7;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.1);
        }

        .pi-course-item.selected {
          border-color: #003366;
          background: #f0f7ff;
          box-shadow: 0 0 0 2px #003366;
        }

        /* PHOTO UPLOADER */
        .pi-photo-upload-wrap {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          padding: 1.25rem;
          border-radius: 10px;
        }

        .pi-photo-thumb {
          width: 100px;
          height: 120px;
          border-radius: 8px;
          background: #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 2rem;
          border: 1px solid #cbd5e1;
          flex-shrink: 0;
        }

        .pi-photo-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* FILE DROPZONE */
        .pi-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          padding: 1.25rem;
          text-align: center;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pi-dropzone:hover {
          border-color: #0055a4;
          background: #f0f7ff;
        }

        .pi-btn-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
        }

        .pi-notice-box {
          background: #eff6ff;
          border-left: 4px solid #0284c7;
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          margin-bottom: 1.5rem;
          font-size: 0.86rem;
          color: #0369a1;
          line-height: 1.45;
        }
      `}</style>

      {/* MODAL DE IMPRESSÃO */}
      {imprimirAberto && candidaturaCriada && (
        <FichaCandidatoPrint
          candidatura={candidaturaCriada}
          onClose={() => setImprimirAberto(false)}
        />
      )}

      {/* HERO BANNER */}
      <div className="pi-hero">
        <div className="pi-badge-ano">📅 Ano Académico de 2027 • Inscrições Abertas</div>
        <h1>Pré-Inscrição Online — ISPOTEC</h1>
        <p>
          Instituto Superior Politécnico e de Tecnologias — Matola-Rio. Submeta os seus dados e documentos
          para iniciar o processo de admissão para o ano lectivo de 2027.
        </p>
      </div>

      {/* STEPPER */}
      {etapa < 4 && (
        <div className="pi-stepper">
          <div className={`pi-step ${etapa === 1 ? 'active' : etapa > 1 ? 'completed' : ''}`}>
            <span className="pi-step-num">{etapa > 1 ? '✓' : '1'}</span>
            <span>Escolha do Curso</span>
          </div>
          <div className={`pi-step ${etapa === 2 ? 'active' : etapa > 2 ? 'completed' : ''}`}>
            <span className="pi-step-num">{etapa > 2 ? '✓' : '2'}</span>
            <span>Dados do Candidato</span>
          </div>
          <div className={`pi-step ${etapa === 3 ? 'active' : etapa > 3 ? 'completed' : ''}`}>
            <span className="pi-step-num">{etapa > 3 ? '✓' : '3'}</span>
            <span>Comprovativo &amp; Docs</span>
          </div>
        </div>
      )}

      {/* NOTA INSTITUCIONAL SOBRE PRÉ-INSCRIÇÃO */}
      {etapa < 4 && (
        <div className="pi-notice-box">
          <strong>Aviso Importante:</strong> Esta funcionalidade corresponde à <strong>Pré-Inscrição</strong> oficial para o Ano Académico de 2027.
          A submissão do formulário não confere admissão nem matrícula definitiva automática. A candidatura será validada
          pelos Serviços Académicos e pelo Sector Financeiro após confirmação do comprovativo de pagamento.
        </div>
      )}

      {/* MENSAGEM DE ERRO */}
      {erro && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #f87171',
          color: '#991b1b',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.88rem'
        }}>
          ⚠️ {erro}
        </div>
      )}

      {/* ETAPA 1: ESCOLHA DO CURSO */}
      {etapa === 1 && (
        <div className="pi-card">
          <h2 className="pi-card-title">🎯 1. Oferta Formativa &amp; Curso Pretendido (2027)</h2>
          <p className="pi-card-sub">
            Selecione o grau académico e o curso pretendido. O sistema atualizará os regimes e modalidades autorizadas.
          </p>

          {/* Filtro por Grau */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['Todos', 'Mestrado', 'Licenciatura', 'Pós-graduação', 'Especialização', 'Curta Duração'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGrauFiltro(g)}
                className={`btn btn-sm ${grauFiltro === g ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Grade de Cursos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {cursosFiltrados.map(c => {
              const selecionado = cursoSelecionadoId === c.id;
              return (
                <div
                  key={c.id}
                  className={`pi-course-item ${selecionado ? 'selected' : ''}`}
                  onClick={() => {
                    setCursoSelecionadoId(c.id);
                    setErro('');
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{c.icone}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: selecionado ? '#003366' : '#e2e8f0',
                        color: selecionado ? 'white' : '#475569'
                      }}>
                        {c.grau}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                      {c.nome}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
                      ⏳ Duração: <strong>{c.duracao}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      🎓 Requisito Mínimo: <strong>{c.nivelMinimo}</strong>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Propina Mensal</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#003366' }}>
                        {c.propinaMensal.toLocaleString('pt-MZ')} MT
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Inscrição</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                        {c.matricula.toLocaleString('pt-MZ')} MT
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Se um curso estiver selecionado: Opções de Regime e Modalidade */}
          {cursoAtivo && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #0284c7',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '0.95rem', fontWeight: 800 }}>
                ⚙️ Configuração da Frequência para: {cursoAtivo.nome}
              </h4>

              <div className="pi-grid-2">
                <div className="pi-form-group">
                  <label className="pi-label">Regime de Frequência *</label>
                  <select
                    className="pi-select"
                    value={dadosAcademicos.regime}
                    onChange={(e) => setDadosAcademicos(p => ({ ...p, regime: e.target.value }))}
                  >
                    {cursoAtivo.regimes.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <small style={{ fontSize: '0.75rem', color: '#64748b' }}>Apenas regimes oficiais para este curso.</small>
                </div>

                <div className="pi-form-group">
                  <label className="pi-label">Modalidade de Ensino *</label>
                  <select
                    className="pi-select"
                    value={dadosAcademicos.modalidade}
                    onChange={(e) => setDadosAcademicos(p => ({ ...p, modalidade: e.target.value }))}
                  >
                    {cursoAtivo.modalidades.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <small style={{ fontSize: '0.75rem', color: '#64748b' }}>Conforme edital oficial do ISPOTEC.</small>
                </div>
              </div>
            </div>
          )}

          <div className="pi-btn-bar">
            <Link to="/" className="btn btn-outline-secondary">
              ← Cancelar
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 700, padding: '0.65rem 1.75rem' }}
              onClick={() => {
                if (validarEtapa1()) setEtapa(2);
              }}
            >
              Avançar: Dados Pessoais →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 2: DADOS PESSOAIS E ACADÉMICOS */}
      {etapa === 2 && (
        <div className="pi-card">
          <h2 className="pi-card-title">👤 2. Dados Pessoais e Habilitações de Ingresso</h2>
          <p className="pi-card-sub">
            Preencha rigorosamente os seus dados de identificação civil e antecedentes escolares.
          </p>

          {/* UPLOAD DA FOTO */}
          <div className="pi-photo-upload-wrap" style={{ marginBottom: '1.75rem' }}>
            <div className="pi-photo-thumb">
              {dadosPessoais.fotoPreview ? (
                <img src={dadosPessoais.fotoPreview} alt="Fotografia do Candidato" />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <label className="pi-label">Fotografia Pessoal (Tipo Passe)</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                Formato JPG, JPEG ou PNG (máx. 5MB). Foto com fundo neutro e rosto visível.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                id="foto-input"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
              />
              <label htmlFor="foto-input" className="btn btn-sm btn-outline-primary" style={{ cursor: 'pointer' }}>
                📸 {dadosPessoais.fotoPreview ? 'Substituir Foto' : 'Carregar Imagem'}
              </label>
            </div>
          </div>

          {/* DADOS PESSOAIS */}
          <div className="pi-grid-2">
            <div className="pi-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="pi-label">Nome Completo do Candidato *</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Ex: Albino Mateus Nhaca"
                value={dadosPessoais.nome}
                onChange={(e) => setDadosPessoais(p => ({ ...p, nome: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Data de Nascimento *</label>
              <input
                type="date"
                className="pi-input"
                value={dadosPessoais.dataNascimento}
                onChange={(e) => setDadosPessoais(p => ({ ...p, dataNascimento: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Número de B.I. / Passaporte *</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Ex: 110100234567M"
                value={dadosPessoais.bi}
                onChange={(e) => setDadosPessoais(p => ({ ...p, bi: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Província de Residência *</label>
              <select
                className="pi-select"
                value={dadosPessoais.provincia}
                onChange={(e) => setDadosPessoais(p => ({ ...p, provincia: e.target.value }))}
              >
                {PROVINCIAS_MOCAMBIQUE.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Distrito ou Município *</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Ex: Matola / Boane"
                value={dadosPessoais.distrito}
                onChange={(e) => setDadosPessoais(p => ({ ...p, distrito: e.target.value }))}
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Bairro / Localidade</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Ex: Matola-Rio, Belo Horizonte"
                value={dadosPessoais.bairro}
                onChange={(e) => setDadosPessoais(p => ({ ...p, bairro: e.target.value }))}
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Morada Completa</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Rua, Número da Casa, Referência"
                value={dadosPessoais.morada}
                onChange={(e) => setDadosPessoais(p => ({ ...p, morada: e.target.value }))}
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Telefone Principal (WhatsApp) *</label>
              <input
                type="tel"
                className="pi-input"
                placeholder="Ex: 841234567 ou 878787442"
                value={dadosPessoais.telefonePrincipal}
                onChange={(e) => setDadosPessoais(p => ({ ...p, telefonePrincipal: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Telefone Adicional 1 (Opcional)</label>
              <input
                type="tel"
                className="pi-input"
                placeholder="Contacto alternativo"
                value={dadosPessoais.telefoneAdicional1}
                onChange={(e) => setDadosPessoais(p => ({ ...p, telefoneAdicional1: e.target.value }))}
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Nome Completo do Encarregado *</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Pai, Mãe ou Tutor Responsável"
                value={dadosPessoais.nomeEncarregado}
                onChange={(e) => setDadosPessoais(p => ({ ...p, nomeEncarregado: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group">
              <label className="pi-label">Telefone do Encarregado *</label>
              <input
                type="tel"
                className="pi-input"
                placeholder="Contacto telefónico do encarregado"
                value={dadosPessoais.contactoEncarregado}
                onChange={(e) => setDadosPessoais(p => ({ ...p, contactoEncarregado: e.target.value }))}
                required
              />
            </div>

            <div className="pi-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="pi-label">Local de Trabalho / Ocupação Profissional (Opcional)</label>
              <input
                type="text"
                className="pi-input"
                placeholder="Ex: Empresa, Instituição Pública, Hospital, etc."
                value={dadosPessoais.localTrabalho}
                onChange={(e) => setDadosPessoais(p => ({ ...p, localTrabalho: e.target.value }))}
              />
            </div>
          </div>

          {/* DADOS ACADÉMICOS */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#003366', margin: '0 0 1rem 0' }}>
              📚 Habilitações Literárias de Ingresso
            </h3>

            <div className="pi-grid-3">
              <div className="pi-form-group">
                <label className="pi-label">Nível Académico de Ingresso *</label>
                <select
                  className="pi-select"
                  value={dadosAcademicos.nivelIngresso}
                  onChange={(e) => setDadosAcademicos(p => ({ ...p, nivelIngresso: e.target.value }))}
                >
                  {NIVEIS_INGRESSO.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="pi-form-group">
                <label className="pi-label">Instituição de Ensino de Proveniência</label>
                <input
                  type="text"
                  className="pi-input"
                  placeholder="Ex: Escola Secundária da Matola"
                  value={dadosAcademicos.instituicaoProveniencia}
                  onChange={(e) => setDadosAcademicos(p => ({ ...p, instituicaoProveniencia: e.target.value }))}
                />
              </div>

              <div className="pi-form-group">
                <label className="pi-label">Ano de Conclusão</label>
                <input
                  type="number"
                  className="pi-input"
                  value={dadosAcademicos.anoConclusao}
                  min={1975}
                  max={2026}
                  onChange={(e) => setDadosAcademicos(p => ({ ...p, anoConclusao: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pi-btn-bar">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setEtapa(1)}
            >
              ← Voltar ao Curso
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 700, padding: '0.65rem 1.75rem' }}
              onClick={() => {
                if (validarEtapa2()) setEtapa(3);
              }}
            >
              Avançar: Documentos &amp; Comprovativo →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: COMPROVATIVO & DOCUMENTOS */}
      {etapa === 3 && (
        <div className="pi-card">
          <h2 className="pi-card-title">📎 3. Comprovativo de Pagamento e Documentos</h2>
          <p className="pi-card-sub">
            Anexe os documentos necessários (JPG, PNG ou PDF, até 8MB por ficheiro).
          </p>

          {/* INSTRUÇÕES BANCÁRIAS DO ISPOTEC - EDITAL 2027 */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #003366',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 4px 14px rgba(0, 51, 102, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.6rem' }}>🏦</span>
                <div>
                  <h4 style={{ margin: 0, color: '#003366', fontSize: '1rem', fontWeight: 800 }}>
                    Contas Oficiais para Pagamento — BCI / ISPOTEC
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Instituto Superior Politécnico e de Tecnologias • Sujeito a IVA de 5%
                  </span>
                </div>
              </div>
              <div style={{ background: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                Taxa a Pagar: {cursoAtivo?.matricula ? Number(cursoAtivo.matricula).toLocaleString('pt-MZ') : '4.000'} MT
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
              Efectue o depósito ou transferência bancária no <strong>BCI (Banco Comercial e de Investimentos)</strong> para a conta correspondente ao seu nível de formação e anexe o comprovativo abaixo:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* CONTA 1: LICENCIATURAS */}
              <div style={{
                background: cursoAtivo?.grau === 'Licenciatura' ? '#f0fdf4' : '#ffffff',
                border: cursoAtivo?.grau === 'Licenciatura' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.9rem 1rem',
                position: 'relative'
              }}>
                {cursoAtivo?.grau === 'Licenciatura' && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#16a34a',
                    color: 'white',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase'
                  }}>
                    ✓ Sua Opção (Licenciatura)
                  </span>
                )}
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#003366', marginBottom: '4px' }}>
                  Para Cursos de Licenciatura
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                  Banco: <strong>BCI</strong> • Titular: <strong>ISPOTEC</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>N.º da Conta: </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    22076375610001
                  </code>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>NIB: </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                    0008 0000 20763756101 13
                  </code>
                </div>
              </div>

              {/* CONTA 2: MESTRADO, PÓS-GRADUAÇÃO E ESPECIALIZAÇÃO */}
              <div style={{
                background: (cursoAtivo?.grau === 'Mestrado' || cursoAtivo?.grau === 'Pós-graduação' || cursoAtivo?.grau === 'Especialização') ? '#f0fdf4' : '#ffffff',
                border: (cursoAtivo?.grau === 'Mestrado' || cursoAtivo?.grau === 'Pós-graduação' || cursoAtivo?.grau === 'Especialização') ? '2px solid #16a34a' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.9rem 1rem',
                position: 'relative'
              }}>
                {(cursoAtivo?.grau === 'Mestrado' || cursoAtivo?.grau === 'Pós-graduação' || cursoAtivo?.grau === 'Especialização') && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#16a34a',
                    color: 'white',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase'
                  }}>
                    ✓ Sua Opção ({cursoAtivo?.grau})
                  </span>
                )}
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#003366', marginBottom: '4px' }}>
                  Para Mestrado, Pós-graduação e Especialização
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                  Banco: <strong>BCI</strong> • Titular: <strong>ISPOTEC</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>N.º da Conta: </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                    22076375610002
                  </code>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>NIB: </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                    0008 0000 20763756102 10
                  </code>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.9rem', fontSize: '0.76rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem' }}>
              <span>📍 Rua da Mozal, 5354, Matola-Rio • Telefones: 878787442 / 879 6666 / 873045610</span>
              <span>Diretor Geral: Prof. Dr. Jacob Massuanganhe</span>
            </div>
          </div>

          <div className="pi-grid-2">
            {/* COMPROVATIVO DE PAGAMENTO (OBRIGATÓRIO) */}
            <div className="pi-form-group">
              <label className="pi-label">
                Comprovativo de Pagamento da Taxa *
                <span style={{ color: '#dc2626', marginLeft: '4px' }}>(Obrigatório)</span>
              </label>

              <div className="pi-dropzone">
                <input
                  type="file"
                  id="comp-input"
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('comprovativoPagamento', e.target.files?.[0])}
                />
                <label htmlFor="comp-input" style={{ cursor: 'pointer', display: 'block' }}>
                  {documentos.comprovativoPagamento ? (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#16a34a' }}>✅</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {documentos.comprovativoPagamento.nomeFicheiro}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clique para substituir</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#0055a4' }}>💳</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        Carregar Recibo / Comprovativo
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PDF, PNG, JPG (máx. 8MB)</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* CÓPIA DO BI */}
            <div className="pi-form-group">
              <label className="pi-label">Cópia do Bilhete de Identidade (B.I.)</label>
              <div className="pi-dropzone">
                <input
                  type="file"
                  id="bi-input"
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('bi', e.target.files?.[0])}
                />
                <label htmlFor="bi-input" style={{ cursor: 'pointer', display: 'block' }}>
                  {documentos.bi ? (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#16a34a' }}>✅</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {documentos.bi.nomeFicheiro}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clique para substituir</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#64748b' }}>📄</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        Carregar Cópia do B.I.
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PDF ou Imagem</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* CERTIFICADO DE HABILITAÇÕES */}
            <div className="pi-form-group">
              <label className="pi-label">Certificado de Habilitações Literárias</label>
              <div className="pi-dropzone">
                <input
                  type="file"
                  id="cert-input"
                  style={{ display: 'none' }}
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('certificado', e.target.files?.[0])}
                />
                <label htmlFor="cert-input" style={{ cursor: 'pointer', display: 'block' }}>
                  {documentos.certificado ? (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#16a34a' }}>✅</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        {documentos.certificado.nomeFicheiro}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clique para substituir</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.75rem', color: '#64748b' }}>📜</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                        Carregar Certificado
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>12ª Classe, Técnico ou Licenciatura</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* RESUMO DOS DADOS */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 700, color: '#003366', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Resumo da Candidatura:
              </div>
              <div><strong>Candidato:</strong> {dadosPessoais.nome || '—'}</div>
              <div><strong>B.I.:</strong> {dadosPessoais.bi || '—'}</div>
              <div><strong>Curso:</strong> {cursoAtivo?.nome}</div>
              <div><strong>Regime / Modalidade:</strong> {dadosAcademicos.regime} / {dadosAcademicos.modalidade}</div>
              <div><strong>Taxa a Pagar:</strong> {cursoAtivo?.matricula.toLocaleString('pt-MZ')} MT</div>
            </div>
          </div>

          {/* TERMO DE VERACIDADE */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px'
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termoAceite}
                onChange={(e) => setTermoAceite(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>
                Declaro, sob compromisso de honra, que todas as informações prestadas são autênticas e que
                os documentos anexados são legítimos. Estou ciente de que esta <strong>pré-inscrição</strong> só será
                efetivada após validação documental e do comprovativo financeiro pela administração do ISPOTEC.
              </span>
            </label>
          </div>

          <div className="pi-btn-bar">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setEtapa(2)}
            >
              ← Voltar aos Dados Pessoais
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '0.75rem 2rem', fontSize: '0.95rem' }}
              disabled={enviando}
              onClick={handleSubmeter}
            >
              {enviando ? 'A Processar Submissão...' : '🚀 Submeter Pré-Inscrição 2027'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: SUCESSO E COMPROVATIVO */}
      {etapa === 4 && candidaturaCriada && (
        <div className="pi-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            fontSize: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            ✓
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#003366', margin: '0 0 0.5rem 0' }}>
            Pré-Inscrição Submetida com Sucesso!
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            O seu pedido de pré-inscrição para o Ano Académico de 2027 foi registado no sistema integrado do ISPOTEC.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '2px dashed #003366',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'inline-block',
            margin: '0 auto 2rem auto',
            minWidth: '320px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Número Oficial da Candidatura
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#003366', fontFamily: 'monospace', margin: '0.25rem 0' }}>
              {candidaturaCriada.numeroCandidatura}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
              ● Estado: {candidaturaCriada.estado} • Pagamento: {candidaturaCriada.estadoPagamento}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 800, padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setImprimirAberto(true)}
            >
              🖨️ Imprimir Ficha de Candidatura (A4)
            </button>

            <Link
              to={`/consultar-candidatura?codigo=${encodeURIComponent(candidaturaCriada.numeroCandidatura)}`}
              className="btn btn-outline-primary"
              style={{ fontWeight: 700, padding: '0.75rem 1.5rem' }}
            >
              🔍 Acompanhar Estado do Processo
            </Link>

            <Link
              to="/"
              className="btn btn-outline-secondary"
              style={{ fontWeight: 600, padding: '0.75rem 1.5rem' }}
            >
              Ir para a Página Inicial
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
