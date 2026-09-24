import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';

const QUICK_EMOJIS = ['👍', '👏', '💡', '📚', '📢', '🚀', '🎓', '✨', '🔥', '🤝'];

export default function ChatGlobal() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [texto, setTexto] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const isFirstLoad = useRef(true);

  const getFileUrl = (path) => {
    if (!path || path === '#') return '#';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
    let base = import.meta.env.VITE_API_URL;
    if (!base) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      base = isLocal ? 'http://localhost:5000/api' : 'https://back-end-ispotec-online-2026.vercel.app/api';
    }
    const backendBase = base.replace(/\/api\/?$/, '');
    return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const loadMessages = useCallback(async (isManual = false) => {
    try {
      const data = await chatService.getGlobalMessages();
      setMessages(prev => {
        // Only update state if data changed to avoid unnecessary re-renders
        if (JSON.stringify(prev) !== JSON.stringify(data)) {
          return data;
        }
        return prev;
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar mensagens globais:', err);
    } finally {
      if (isFirstLoad.current || isManual) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, []);

  // Initial load + Real-time polling every 3.5 seconds
  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 3500);

    return () => clearInterval(interval);
  }, [loadMessages]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio timer handler
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioTimer(prev => prev + 1);
      }, 1000);
    } else {
      setAudioTimer(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!texto.trim() && !selectedFile) || sending) return;

    setSending(true);
    let tipo_mensagem = 'texto';
    let ficheiro_path = null;
    let ficheiro_nome = null;
    let ficheiro_tamanho = null;

    if (selectedFile) {
      try {
        const uploadData = await chatService.uploadAttachment(selectedFile);
        ficheiro_path = uploadData.ficheiro_path;
        ficheiro_nome = uploadData.ficheiro_nome;
        ficheiro_tamanho = uploadData.ficheiro_tamanho;
        tipo_mensagem = uploadData.tipo_mensagem;
      } catch (err) {
        console.error('Erro no upload de ficheiro:', err);
      }
    }

    try {
      await chatService.sendGlobalMessage({
        conteudo: texto.trim(),
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
        user,
      });

      setTexto('');
      setSelectedFile(null);
      await loadMessages(true);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInsertEmoji = (emoji) => {
    setTexto(prev => prev + emoji);
  };

  const handleCameraCapture = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    setShowCameraModal(false);
  };

  const handleAudioSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    setShowAudioModal(false);
  };

  const formatMsgDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      
      const today = new Date();
      const isToday = today.getDate() === d.getDate() && today.getMonth() === d.getMonth() && today.getFullYear() === d.getFullYear();
      
      return isToday ? `${horas}:${min}` : `${day}/${month} ${horas}:${min}`;
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredMessages = messages.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.conteudo && m.conteudo.toLowerCase().includes(term)) ||
      (m.user_nome && m.user_nome.toLowerCase().includes(term)) ||
      (m.ficheiro_nome && m.ficheiro_nome.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <style>{`
        .chat-container-page {
            max-width: 1050px;
            margin: 1.5rem auto 3rem;
            padding: 0 1rem;
        }

        .chat-header-bar {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%);
            color: white;
            padding: 1.5rem 1.75rem;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }

        .chat-header-bar::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            pointer-events: none;
        }

        .chat-title-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .chat-header-bar h1 {
            margin: 0;
            font-size: 1.4rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            letter-spacing: -0.01em;
        }

        .chat-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid rgba(16, 185, 129, 0.4);
            color: #6ee7b7;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.65rem;
            border-radius: 20px;
            margin-left: 0.5rem;
        }

        .live-dot {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 8px #10b981;
            animation: pulse-live 1.8s infinite;
        }

        @keyframes pulse-live {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
        }

        .chat-header-bar p {
            margin: 0;
            font-size: 0.88rem;
            color: rgba(255, 255, 255, 0.85);
        }

        .chat-header-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .chat-btn-action {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.25);
            padding: 0.45rem 0.9rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .chat-btn-action:hover {
            background: rgba(255, 255, 255, 0.25);
            color: white;
            transform: translateY(-1px);
        }

        /* Banner de Informação */
        .chat-community-banner {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            border-right: 1px solid #dbeafe;
            padding: 0.75rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.84rem;
            color: #1e40af;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .chat-search-input {
            padding: 0.35rem 0.75rem;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            font-size: 0.82rem;
            background: white;
            color: #1e293b;
            min-width: 180px;
        }

        .chat-search-input:focus {
            outline: none;
            border-color: #3b82f6;
        }

        /* Main Chat Window */
        .chat-main-box {
            background: #ffffff;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            height: calc(100vh - 290px);
            min-height: 520px;
            border: 1px solid #e2e8f0;
            border-top: none;
            overflow: hidden;
        }

        .chat-messages-stream {
            flex: 1;
            overflow-y: auto;
            padding: 1.25rem;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            scroll-behavior: smooth;
        }

        .msg-row {
            display: flex;
            gap: 0.75rem;
            max-width: 80%;
            animation: slideMsg 0.25s ease-out;
        }

        @keyframes slideMsg {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .msg-row.msg-mine {
            align-self: flex-end;
            flex-direction: row-reverse;
        }

        .msg-row.msg-other {
            align-self: flex-start;
        }

        .user-avatar-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .avatar-estudante { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .avatar-docente { background: linear-gradient(135deg, #10b981, #047857); }
        .avatar-especialista, .avatar-admin { background: linear-gradient(135deg, #f59e0b, #b45309); }

        .msg-bubble {
            padding: 0.75rem 1rem;
            border-radius: 14px;
            position: relative;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            min-width: 140px;
        }

        .msg-mine .msg-bubble {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border-bottom-right-radius: 3px;
        }

        .msg-other .msg-bubble {
            background: #ffffff;
            color: #1e293b;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 3px;
        }

        .msg-header-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            margin-bottom: 0.35rem;
            font-size: 0.78rem;
        }

        .msg-author-name {
            font-weight: 700;
        }

        .msg-mine .msg-author-name {
            color: rgba(255, 255, 255, 0.95);
        }

        .msg-other .msg-author-name {
            color: #0f172a;
        }

        .role-tag {
            font-size: 0.65rem;
            padding: 0.1rem 0.45rem;
            border-radius: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .msg-mine .role-tag {
            background: rgba(255, 255, 255, 0.22);
            color: white;
        }

        .msg-other .role-tag-estudante { background: #dbeafe; color: #1e40af; }
        .msg-other .role-tag-docente { background: #d1fae5; color: #065f46; }
        .msg-other .role-tag-especialista, .msg-other .role-tag-admin { background: #fef3c7; color: #92400e; }

        .msg-body-text {
            font-size: 0.92rem;
            line-height: 1.45;
            word-break: break-word;
            white-space: pre-wrap;
        }

        .msg-footer-time {
            font-size: 0.68rem;
            margin-top: 0.35rem;
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.25rem;
        }

        .msg-mine .msg-footer-time { color: rgba(255, 255, 255, 0.75); }
        .msg-other .msg-footer-time { color: #94a3b8; }

        .msg-media-attachment {
            margin-top: 0.5rem;
            border-radius: 8px;
            overflow: hidden;
        }

        .msg-media-attachment img {
            max-width: 100%;
            max-height: 280px;
            object-fit: cover;
            border-radius: 8px;
            display: block;
        }

        .msg-file-download {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.85rem;
            border-radius: 8px;
            text-decoration: none;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            font-weight: 500;
            transition: opacity 0.2s;
        }

        .msg-mine .msg-file-download {
            background: rgba(255, 255, 255, 0.18);
            color: white;
        }

        .msg-other .msg-file-download {
            background: #f1f5f9;
            color: #2563eb;
            border: 1px solid #cbd5e1;
        }

        /* Emoji Quick Bar */
        .chat-emoji-quickbar {
            padding: 0.4rem 1rem;
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            overflow-x: auto;
        }

        .chat-emoji-quickbar span {
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            margin-right: 0.25rem;
            white-space: nowrap;
        }

        .emoji-quick-btn {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 0.2rem 0.45rem;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.15s;
        }

        .emoji-quick-btn:hover {
            transform: scale(1.2);
            background: #e0f2fe;
            border-color: #38bdf8;
        }

        /* Input area */
        .chat-compose-area {
            padding: 0.85rem 1.25rem;
            background: white;
            border-top: 1px solid #e2e8f0;
        }

        .chat-compose-form {
            display: flex;
            gap: 0.6rem;
            align-items: center;
        }

        .chat-text-input {
            flex: 1;
            padding: 0.75rem 1.15rem;
            border: 2px solid #e2e8f0;
            border-radius: 25px;
            font-size: 0.92rem;
            transition: border-color 0.2s;
            background: #f8fafc;
            color: #0f172a;
        }

        .chat-text-input:focus {
            border-color: #2563eb;
            background: white;
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .tool-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            cursor: pointer;
            font-size: 1.15rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            color: #475569;
            flex-shrink: 0;
        }

        .tool-btn:hover {
            background: #f1f5f9;
            transform: scale(1.05);
            border-color: #cbd5e1;
        }

        .tool-btn.btn-camera:hover { color: #10b981; }
        .tool-btn.btn-audio:hover { color: #ef4444; }
        .tool-btn.btn-file:hover { color: #2563eb; }

        .btn-submit-send {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.92rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
            flex-shrink: 0;
        }

        .btn-submit-send:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 15px rgba(37, 99, 235, 0.35);
        }

        .btn-submit-send:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .file-selected-chip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.45rem 0.85rem;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            margin-bottom: 0.6rem;
            font-size: 0.85rem;
            color: #1e40af;
        }

        .empty-chat-state {
            text-align: center;
            color: #64748b;
            padding: 4rem 1rem;
            margin: auto;
        }

        .empty-chat-icon {
            font-size: 3.5rem;
            margin-bottom: 0.75rem;
            opacity: 0.8;
        }

        /* Modal styling */
        .modal-overlay-chat {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.75);
            z-index: 1100;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            backdrop-filter: blur(4px);
        }

        .modal-card-chat {
            background: white;
            border-radius: 16px;
            padding: 1.75rem;
            max-width: 460px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
            animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .modal-card-chat h3 {
            margin: 0 0 0.5rem;
            color: #0f172a;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .modal-card-chat p {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 1.25rem;
            line-height: 1.4;
        }

        .modal-actions-grid {
            display: flex;
            gap: 0.75rem;
        }

        .modal-actions-grid button {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .modal-actions-grid button:hover {
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .chat-container-page {
                padding: 0 0.5rem;
                margin-top: 1rem;
            }
            .chat-header-bar {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
                padding: 1.25rem;
            }
            .chat-header-actions {
                width: 100%;
                justify-content: space-between;
            }
            .msg-row {
                max-width: 92%;
            }
            .chat-main-box {
                height: calc(100vh - 230px);
            }
            .chat-compose-form {
                flex-wrap: wrap;
            }
            .chat-text-input {
                order: 1;
                width: 100%;
                flex: 1 1 100%;
            }
            .btn-submit-send {
                order: 5;
                flex: 1;
            }
        }
      `}</style>

      <div className="chat-container-page">
        {/* Header Bar */}
        <div className="chat-header-bar">
          <div className="chat-title-group">
            <h1>
              💬 Chat Geral ISPOTEC
              <span className="chat-status-pill">
                <span className="live-dot"></span>
                Em Direto
              </span>
            </h1>
            <p>Espaço colaborativo de partilha e comunicação de todos os membros registados</p>
          </div>

          <div className="chat-header-actions">
            <button
              type="button"
              className="chat-btn-action"
              onClick={() => loadMessages(true)}
              title="Atualizar mensagens"
            >
              🔄 Atualizar
            </button>
            <Link to="/dashboard" className="chat-btn-action">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Community Info Banner */}
        <div className="chat-community-banner">
          <div>
            📢 <strong>Comunidade Aberta:</strong> Todos os estudantes, docentes e especialistas podem interagir neste canal.
          </div>
          <div>
            <input
              type="text"
              className="chat-search-input"
              placeholder="🔍 Filtrar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Box */}
        <div className="chat-main-box">
          {/* Message Stream */}
          <div className="chat-messages-stream">
            {loading ? (
              <div className="empty-chat-state">
                <div className="empty-chat-icon">⏳</div>
                <p>A carregar mensagens da comunidade...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="empty-chat-state">
                <div className="empty-chat-icon">💬</div>
                <h3>Nenhuma mensagem encontrada</h3>
                <p>{searchTerm ? 'Tente outra pesquisa.' : 'Seja o primeiro a partilhar uma mensagem com a comunidade ISPOTEC!'}</p>
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isMine = m.user_id === user?.id || m.user_id === user?._id;
                const roleType = m.user_tipo || 'estudante';

                return (
                  <div className={`msg-row ${isMine ? 'msg-mine' : 'msg-other'}`} key={m.id || m._id}>
                    <div className={`user-avatar-circle avatar-${roleType}`}>
                      {getInitials(m.user_nome)}
                    </div>

                    <div className="msg-bubble">
                      <div className="msg-header-meta">
                        <span className="msg-author-name">
                          {isMine ? 'Eu' : (m.user_nome || 'Utilizador')}
                        </span>
                        <span className={`role-tag role-tag-${roleType}`}>
                          {roleType === 'especialista' ? 'Especialista' : roleType === 'docente' ? 'Docente' : 'Estudante'}
                        </span>
                      </div>

                      {m.conteudo && <div className="msg-body-text">{m.conteudo}</div>}

                      {m.tipo_mensagem === 'imagem' && m.ficheiro_path && (
                        <div className="msg-media-attachment">
                          <img src={getFileUrl(m.ficheiro_path)} alt="Imagem partilhada" loading="lazy" />
                        </div>
                      )}

                      {m.tipo_mensagem === 'audio' && m.ficheiro_path && (
                        <div className="msg-media-attachment">
                          <audio controls style={{ width: '100%', minWidth: '220px' }}>
                            <source src={getFileUrl(m.ficheiro_path)} />
                            O seu navegador não suporta reprodução de áudio.
                          </audio>
                        </div>
                      )}

                      {m.tipo_mensagem === 'documento' && (
                        <a
                          href={getFileUrl(m.ficheiro_path)}
                          className="msg-file-download"
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          📄 {m.ficheiro_nome || 'Documento Anexo'}
                          {m.ficheiro_tamanho ? ` (${(m.ficheiro_tamanho / 1024).toFixed(0)} KB)` : ''} ↗
                        </a>
                      )}

                      <div className="msg-footer-time">
                        {formatMsgDate(m.data_criacao || m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Emoji Bar */}
          <div className="chat-emoji-quickbar">
            <span>Reagir rápido:</span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-quick-btn"
                onClick={() => handleInsertEmoji(emoji)}
                title={`Inserir ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Compose / Input Area */}
          <div className="chat-compose-area">
            {selectedFile && (
              <div className="file-selected-chip">
                <span>📎 Ficheiro selecionado: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
                >
                  ✕ Remover
                </button>
              </div>
            )}

            <form className="chat-compose-form" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-text-input"
                placeholder="Escreva uma mensagem para toda a comunidade ISPOTEC..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                disabled={sending}
              />

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />

              <button
                type="button"
                className="tool-btn btn-file"
                title="Anexar Ficheiro ou Documento"
                onClick={() => fileInputRef.current?.click()}
              >
                📎
              </button>

              <button
                type="button"
                className="tool-btn btn-camera"
                title="Tirar Foto / Carregar Imagem"
                onClick={() => setShowCameraModal(true)}
              >
                📷
              </button>

              <button
                type="button"
                className="tool-btn btn-audio"
                title="Gravar / Carregar Áudio"
                onClick={() => setShowAudioModal(true)}
              >
                🎤
              </button>

              <button type="submit" className="btn-submit-send" disabled={sending || (!texto.trim() && !selectedFile)}>
                {sending ? 'A enviar...' : 'Enviar ➤'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Captura Imagem */}
      {showCameraModal && (
        <div className="modal-overlay-chat" onClick={() => setShowCameraModal(false)}>
          <div className="modal-card-chat" onClick={(e) => e.stopPropagation()}>
            <h3>📷 Captura ou Envio de Imagem</h3>
            <p>Selecione uma foto da sua galeria ou use a câmara do seu dispositivo para partilhar com os colegas.</p>
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleCameraCapture}
            />
            <div className="modal-actions-grid">
              <button
                type="button"
                style={{ background: '#10b981', color: 'white' }}
                onClick={() => cameraInputRef.current?.click()}
              >
                Escolher / Tirar Foto
              </button>
              <button
                type="button"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => setShowCameraModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Áudio */}
      {showAudioModal && (
        <div className="modal-overlay-chat" onClick={() => setShowAudioModal(false)}>
          <div className="modal-card-chat" onClick={(e) => e.stopPropagation()}>
            <h3>🎤 Gravar ou Enviar Áudio</h3>
            <p>Grave uma mensagem de voz ou selecione um ficheiro de áudio para enviar para o Chat Geral.</p>
            <input
              type="file"
              ref={audioInputRef}
              accept="audio/*"
              capture
              style={{ display: 'none' }}
              onChange={handleAudioSelected}
            />
            <div className="modal-actions-grid">
              <button
                type="button"
                style={{ background: '#ef4444', color: 'white' }}
                onClick={() => audioInputRef.current?.click()}
              >
                Gravar / Selecionar Áudio
              </button>
              <button
                type="button"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => setShowAudioModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
