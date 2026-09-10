import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { chatService } from '../../services/chatService';

export default function ChatGrupo() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grupo, setGrupo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [texto, setTexto] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);

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

  const loadData = async () => {
    if (!groupId) {
      navigate('/dashboard/my-groups');
      return;
    }
    const g = await groupService.getGroupById(groupId);
    if (!g) {
      navigate('/dashboard/my-groups');
      return;
    }
    setGrupo(g);

    const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
    const isMember = g.membros && g.membros.some(m => String(m.id || m._id || m) === String(user?.id));
    if (!isMember && !isAdmin) {
      navigate('/dashboard/my-groups');
      return;
    }

    const msgs = await chatService.getGroupMessages(groupId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadData();
  }, [groupId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!texto.trim() && !selectedFile) return;

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
        console.error('Erro no upload de anexo:', err);
      }
    }

    await chatService.sendGroupMessage({
      groupId,
      conteudo: texto,
      tipo_mensagem,
      ficheiro_path,
      ficheiro_nome,
      ficheiro_tamanho,
    });

    setTexto('');
    setSelectedFile(null);
    const msgs = await chatService.getGroupMessages(groupId);
    setMessages(msgs);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatMsgDate = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${horas}:${min}`;
    } catch {
      return dateString;
    }
  };

  if (!grupo) {
    return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>A carregar...</div>;
  }

  return (
    <>
      <style>{`
        .chat-page {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        .chat-header-bar {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: white;
            padding: 1.25rem 1.5rem;
            border-radius: var(--radius) var(--radius) 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-header-bar h1 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .chat-header-bar p {
            margin: 0.25rem 0 0;
            font-size: 0.85rem;
            opacity: 0.85;
        }
        .chat-header-bar a {
            color: white;
            text-decoration: none;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .chat-box {
            background: var(--white);
            border-radius: 0 0 var(--radius) var(--radius);
            box-shadow: var(--shadow);
            display: flex;
            flex-direction: column;
            height: calc(100vh - 280px);
            min-height: 450px;
            border: 1px solid var(--border-color);
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .msg {
            max-width: 75%;
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            position: relative;
            animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .msg-mine {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--secondary-blue), #0066cc);
            color: white;
            border-bottom-right-radius: 4px;
        }
        .msg-other {
            align-self: flex-start;
            background: white;
            color: var(--text-dark);
            border: 1px solid var(--border-color);
            border-bottom-left-radius: 4px;
            box-shadow: var(--shadow-sm);
        }
        .msg-author {
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .msg-mine .msg-author { color: rgba(255,255,255,0.85); }
        .msg-other .msg-author { color: var(--secondary-blue); }
        .msg-badge {
            font-size: 0.65rem;
            padding: 0.1rem 0.4rem;
            border-radius: 10px;
            font-weight: 500;
        }
        .msg-other .msg-badge {
            background: var(--light-gray);
            color: var(--text-muted);
        }
        .msg-mine .msg-badge {
            background: rgba(255,255,255,0.2);
        }
        .msg-text {
            font-size: 0.9rem;
            line-height: 1.4;
            word-break: break-word;
        }
        .msg-time {
            font-size: 0.65rem;
            opacity: 0.7;
            margin-top: 0.25rem;
            text-align: right;
        }
        .msg-media {
            margin-top: 0.5rem;
        }
        .msg-media img {
            max-width: 100%;
            max-height: 250px;
            border-radius: 0.5rem;
        }
        .msg-file-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: rgba(0,0,0,0.1);
            border-radius: 0.5rem;
            text-decoration: none;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }
        .msg-mine .msg-file-link { color: white; }
        .msg-other .msg-file-link { color: var(--secondary-blue); background: var(--light-gray); }
        
        .chat-input-area {
            padding: 0.75rem 1rem;
            background: white;
            border-top: 1px solid var(--border-color);
        }
        .chat-input-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        .chat-input-row input[type="text"] {
            flex: 1;
            padding: 0.7rem 1rem;
            border: 2px solid var(--border-color);
            border-radius: 25px;
            font-size: 0.9rem;
        }
        .chat-input-row input[type="text"]:focus {
            border-color: var(--secondary-blue);
            outline: none;
        }
        .media-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .media-btn:hover { transform: scale(1.1); }
        .media-btn.attach { background: var(--secondary-blue); color: white; }
        .media-btn.camera { background: #10b981; color: white; }
        .media-btn.audio { background: #ef4444; color: white; }
        .send-btn {
            padding: 0.7rem 1.25rem;
            background: linear-gradient(135deg, var(--secondary-blue), #0066cc);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
        }
        .file-preview {
            display: flex;
            padding: 0.5rem 0.75rem;
            background: var(--light-gray);
            border-radius: var(--radius-sm);
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            align-items: center;
            justify-content: space-between;
        }
        
        .empty-chat {
            text-align: center;
            color: var(--text-muted);
            padding: 3rem;
        }
        .empty-chat .icon { font-size: 3rem; margin-bottom: 1rem; }
        
        .capture-modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
        }
        .capture-box {
            background: white;
            border-radius: var(--radius);
            padding: 1.5rem;
            max-width: 450px;
            width: 100%;
        }
        .capture-box h3 {
            margin: 0 0 1rem;
            color: var(--primary-blue);
        }
        .capture-btns {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }
        .capture-btns button {
            flex: 1;
            min-width: 80px;
            padding: 0.6rem;
            border: none;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-weight: 600;
            color: white;
        }
        .audio-timer {
            font-size: 2rem;
            font-weight: bold;
            color: #ef4444;
            text-align: center;
            margin: 1rem 0;
        }
        
        .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: var(--secondary-blue);
            text-decoration: none;
        }
        
        @media (max-width: 768px) {
            .chat-box {
                height: calc(100vh - 220px);
            }
            .msg { max-width: 85%; }
            .chat-input-row { flex-wrap: wrap; }
            .chat-input-row input[type="text"] { 
                flex: 1 1 100%; 
                order: 1; 
                margin-bottom: 0.5rem; 
            }
            .send-btn { order: 5; flex: 1; }
            .chat-header-bar {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
        }
      `}</style>

      <div className="chat-page">
        <div className="chat-header-bar">
          <div>
            <h1>💬 {grupo.nome}</h1>
            <p>Chat exclusivo para membros da disciplina/grupo</p>
          </div>
          <Link to={`/dashboard/group-view?id=${groupId}`}>← Ver Grupo</Link>
        </div>

        <div className="chat-box">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="icon">💬</div>
                <p>Nenhuma mensagem neste grupo ainda. Envie uma mensagem!</p>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.user_id === user?.id;
                return (
                  <div className={`msg ${isMine ? 'msg-mine' : 'msg-other'}`} key={m.id}>
                    <div className="msg-author">
                      <span>{m.user_nome}</span>
                      <span className="msg-badge">
                        {m.user_tipo ? m.user_tipo.charAt(0).toUpperCase() + m.user_tipo.slice(1) : ''}
                      </span>
                    </div>

                    {m.conteudo && <div className="msg-text">{m.conteudo}</div>}

                    {m.tipo_mensagem === 'imagem' && m.ficheiro_path && (
                      <div className="msg-media">
                        <img src={getFileUrl(m.ficheiro_path)} alt="Anexo" />
                      </div>
                    )}

                    {m.tipo_mensagem === 'audio' && (
                      <div className="msg-media">
                        <audio controls style={{ maxWidth: '100%' }}>
                          <source src={getFileUrl(m.ficheiro_path)} />
                          O seu navegador não suporta áudio.
                        </audio>
                      </div>
                    )}

                    {m.tipo_mensagem === 'documento' && (
                      <a href={getFileUrl(m.ficheiro_path)} className="msg-file-link" download target="_blank" rel="noreferrer">
                        📎 {m.ficheiro_nome || 'Ficheiro anexo'}
                      </a>
                    )}

                    <div className="msg-time">{formatMsgDate(m.data_criacao)}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {selectedFile && (
              <div className="file-preview">
                <span>📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                >
                  ✕
                </button>
              </div>
            )}

            <form className="chat-input-row" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Escreva uma mensagem para o grupo..." 
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />

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
                className="media-btn attach" 
                title="Anexar Ficheiro"
                onClick={() => fileInputRef.current?.click()}
              >
                📎
              </button>

              <button 
                type="button" 
                className="media-btn camera" 
                title="Tirar Foto"
                onClick={() => setShowCameraModal(true)}
              >
                📷
              </button>

              <button 
                type="button" 
                className="media-btn audio" 
                title="Gravar Áudio"
                onClick={() => setShowAudioModal(true)}
              >
                🎤
              </button>

              <button type="submit" className="send-btn">
                Enviar
              </button>
            </form>
          </div>
        </div>

        <Link to={`/dashboard/group-view?id=${groupId}`} className="back-link">
          ← Voltar à Página do Grupo
        </Link>
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div className="capture-modal">
          <div className="capture-box">
            <h3>📷 Captura de Imagem</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Tire uma foto utilizando a câmara do seu dispositivo ou selecione um ficheiro de imagem para o grupo.
            </p>
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={handleCameraCapture} 
            />
            <div className="capture-btns">
              <button 
                type="button" 
                style={{ background: '#10b981' }} 
                onClick={() => cameraInputRef.current?.click()}
              >
                Tirar / Selecionar Foto
              </button>
              <button 
                type="button" 
                style={{ background: '#64748b' }} 
                onClick={() => setShowCameraModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Recording Modal */}
      {showAudioModal && (
        <div className="capture-modal">
          <div className="capture-box">
            <h3>🎤 Gravar Nota de Voz</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Grave uma mensagem de voz ou selecione um ficheiro de áudio para partilhar com o grupo.
            </p>
            <input 
              type="file" 
              ref={audioInputRef} 
              accept="audio/*" 
              capture 
              style={{ display: 'none' }} 
              onChange={handleAudioSelected} 
            />
            <div className="capture-btns">
              <button 
                type="button" 
                style={{ background: '#ef4444' }} 
                onClick={() => audioInputRef.current?.click()}
              >
                Gravar / Selecionar Áudio
              </button>
              <button 
                type="button" 
                style={{ background: '#64748b' }} 
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
