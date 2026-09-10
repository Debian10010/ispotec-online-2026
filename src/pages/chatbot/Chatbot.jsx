import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatbotService } from '../../services/chatbotService';

export default function Chatbot() {
  const [searchParams, setSearchParams] = useSearchParams();
  const convParam = searchParams.get('conv');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversas, setConversas] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [pergunta, setPergunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatBoxRef = useRef(null);

  const loadConversations = async () => {
    if (!user) return;
    const userConvs = await chatbotService.getUserConversations(user.id);
    setConversas(userConvs);

    if (convParam && convParam !== '0') {
      const found = userConvs.find(c => String(c.id) === String(convParam));
      if (found) {
        setActiveConv(found);
        return;
      }
    }

    if (userConvs.length > 0 && (!convParam || convParam === '0')) {
      setActiveConv(userConvs[0]);
      setSearchParams({ conv: String(userConvs[0].id) }, { replace: true });
    } else if (userConvs.length === 0) {
      // Create first conversation
      const newC = await chatbotService.createConversation(user.id);
      setConversas([newC]);
      setActiveConv(newC);
      setSearchParams({ conv: String(newC.id) }, { replace: true });
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user, convParam]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [activeConv?.messages, loading]);

  const handleNewChat = async () => {
    setSidebarOpen(false);
    const newConv = await chatbotService.createConversation(user.id);
    setConversas(prev => [newConv, ...prev]);
    setActiveConv(newConv);
    setSearchParams({ conv: String(newConv.id) });
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || pergunta;
    if (!query.trim()) return;

    setLoading(true);
    setPergunta('');

    const convId = activeConv ? activeConv.id : null;
    const res = await chatbotService.sendMessage(convId, user.id, query);

    setActiveConv({ ...res.conversation });
    setLoading(false);

    // Refresh conversation list
    const updatedList = await chatbotService.getUserConversations(user.id);
    setConversas(updatedList);
  };

  const handleSuggestion = (question) => {
    handleSendMessage(question);
  };

  const formatMsgTime = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${horas}:${min}`;
    } catch {
      return '';
    }
  };

  return (
    <>
      <style>{`
        .chatbot-container {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 1rem;
            height: calc(100vh - 200px);
            min-height: 500px;
            max-width: 1100px;
            margin: 1.5rem auto 1rem;
            padding: 0 1rem;
        }
        
        /* Sidebar */
        .chatbot-sidebar {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }
        .sidebar-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        .new-chat-btn {
            display: block;
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, var(--accent-green), #059669);
            color: white;
            border: none;
            border-radius: var(--radius-sm);
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .new-chat-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .conv-list {
            flex: 1;
            overflow-y: auto;
            padding: 0.5rem;
        }
        .conv-item {
            display: block;
            padding: 0.75rem 1rem;
            margin-bottom: 0.25rem;
            border-radius: var(--radius-sm);
            text-decoration: none;
            color: var(--text-dark);
            font-size: 0.85rem;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
            width: 100%;
            text-align: left;
            background: transparent;
        }
        .conv-item:hover {
            background: var(--light-gray);
        }
        .conv-item.active {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: var(--secondary-blue);
            font-weight: 500;
        }
        .conv-item strong {
            display: block;
            font-size: 0.8rem;
            margin-bottom: 0.15rem;
        }
        .conv-item small {
            color: var(--text-muted);
            font-size: 0.75rem;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .conv-item.active small {
            color: var(--secondary-blue);
            opacity: 0.8;
        }
        
        /* Main Chat */
        .chatbot-main {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }
        .chat-header {
            padding: 1rem 1.25rem;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .chat-header .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }
        .chat-header h2 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
        }
        .chat-header p {
            margin: 0;
            font-size: 0.8rem;
            opacity: 0.85;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.25rem;
            background: linear-gradient(to bottom, #faf5ff, #f5f3ff);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .bubble {
            max-width: 80%;
            padding: 0.85rem 1.1rem;
            border-radius: 1.25rem;
            font-size: 0.9rem;
            line-height: 1.5;
            position: relative;
            animation: slideIn 0.3s ease;
            white-space: pre-line;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .bubble.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border-bottom-right-radius: 4px;
        }
        .bubble.bot {
            align-self: flex-start;
            background: white;
            color: var(--text-dark);
            border: 1px solid var(--border-color);
            border-bottom-left-radius: 4px;
            box-shadow: var(--shadow-sm);
        }
        .bubble .time {
            display: block;
            font-size: 0.65rem;
            margin-top: 0.4rem;
            opacity: 0.7;
            text-align: right;
        }
        
        .empty-chat {
            text-align: center;
            color: var(--text-muted);
            padding: 3rem 1.5rem;
        }
        .empty-chat .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .empty-chat h3 {
            margin: 0 0 0.5rem;
            color: var(--text-dark);
        }
        .suggestions {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
        .suggestion-btn {
            padding: 0.5rem 1rem;
            background: var(--light-gray);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 0.8rem;
            color: var(--text-dark);
            cursor: pointer;
            transition: all 0.2s;
        }
        .suggestion-btn:hover {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
        }
        
        .chat-input-area {
            padding: 1rem;
            background: white;
            border-top: 1px solid var(--border-color);
        }
        .loading-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            padding-left: 0.5rem;
        }
        .loading-indicator::before {
            content: '';
            width: 16px;
            height: 16px;
            border: 2px solid var(--border-color);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .input-row {
            display: flex;
            gap: 0.5rem;
        }
        .input-row input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 2px solid var(--border-color);
            border-radius: 25px;
            font-size: 0.95rem;
        }
        .input-row input:focus {
            outline: none;
            border-color: #6366f1;
        }
        .input-row button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .input-row button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .back-link {
            padding: 0.5rem 1rem;
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.85rem;
            display: inline-block;
        }
        
        /* Mobile Toggle */
        .toggle-sidebar-btn {
            display: none;
            position: fixed;
            bottom: 100px;
            left: 1rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #6366f1;
            color: white;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            z-index: 100;
        }
        
        @media (max-width: 768px) {
            .chatbot-container {
                grid-template-columns: 1fr;
                height: calc(100vh - 180px);
            }
            .chatbot-sidebar {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 280px;
                height: 100vh;
                z-index: 200;
                border-radius: 0;
            }
            .chatbot-sidebar.active {
                display: flex;
            }
            .toggle-sidebar-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bubble {
                max-width: 90%;
            }
        }
      `}</style>

      <div className="container">
        <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>

        <div className="chatbot-container">
          <aside className={`chatbot-sidebar ${sidebarOpen ? 'active' : ''}`} id="sidebar">
            <div className="sidebar-header">
              <button 
                type="button" 
                className="new-chat-btn" 
                onClick={handleNewChat}
              >
                + Novo Chat
              </button>
            </div>
            <div className="conv-list">
              {conversas.map(c => (
                <button 
                  key={c.id} 
                  type="button"
                  onClick={() => {
                    setActiveConv(c);
                    setSearchParams({ conv: String(c.id) });
                    setSidebarOpen(false);
                  }}
                  className={`conv-item ${activeConv?.id === c.id ? 'active' : ''}`}
                >
                  <strong>💬 Chat #{c.id}</strong>
                  <small>{c.ultima_pergunta || 'Nova conversa'}...</small>
                </button>
              ))}
            </div>
          </aside>

          <main className="chatbot-main">
            <div className="chat-header">
              <div className="avatar">🤖</div>
              <div>
                <h2>Assistente ISPOTEC</h2>
                <p>Tire suas dúvidas académicas</p>
              </div>
            </div>

            <div className="chat-messages" ref={chatBoxRef}>
              {(!activeConv?.messages || activeConv.messages.length === 0) ? (
                <div className="empty-chat">
                  <div className="icon">📚</div>
                  <h3>Olá! Sou o Assistente Académico de Estudos do ISPOTEC</h3>
                  <p>
                    Posso ajudar-te a compreender matérias, organizar os teus estudos,
                    aprender técnicas de estudo e apoiar em diferentes Áreas Académicas.
                  </p>

                  <div className="suggestions">
                    <button 
                      type="button" 
                      className="suggestion-btn" 
                      onClick={() => handleSuggestion('Ajuda-me a entender esta matéria')}
                    >
                      Entender a matéria
                    </button>

                    <button 
                      type="button" 
                      className="suggestion-btn" 
                      onClick={() => handleSuggestion('Quais são as melhores técnicas de estudo?')}
                    >
                      Técnicas de estudo
                    </button>

                    <button 
                      type="button" 
                      className="suggestion-btn" 
                      onClick={() => handleSuggestion('Como posso estudar melhor para exames?')}
                    >
                      Preparação para exames
                    </button>

                    <button 
                      type="button" 
                      className="suggestion-btn" 
                      onClick={() => handleSuggestion('Ajuda-me a criar um plano de estudo')}
                    >
                      Plano de estudo
                    </button>

                    <button 
                      type="button" 
                      className="suggestion-btn" 
                      onClick={() => handleSuggestion('Explica esta matéria de forma simples')}
                    >
                      Explicação simplificada
                    </button>
                  </div>
                </div>
              ) : (
                activeConv.messages.map(m => (
                  <div className={`bubble ${m.tipo === 'pergunta' ? 'user' : 'bot'}`} key={m.id}>
                    {m.conteudo}
                    <span className="time">{formatMsgTime(m.data_criacao)}</span>
                  </div>
                ))
              )}

              {loading && (
                <div className="loading-indicator">A pensar...</div>
              )}
            </div>

            <div className="chat-input-area">
              <form 
                className="input-row" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input 
                  type="text" 
                  placeholder="Escreva sua dúvida..." 
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  autoComplete="off"
                  required 
                />
                <button type="submit">Enviar</button>
              </form>
            </div>
          </main>
        </div>

        <button 
          type="button" 
          className="toggle-sidebar-btn" 
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          📋
        </button>

        <div className="container" style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '3rem' }}>
          <Link 
            to="/chatbot/ias-estudo" 
            className="btn btn-outline"
            style={{ textDecoration: 'none', padding: '0.5rem 1.5rem' }}
          >
            <i>🛠️</i> Explorar Mais Ferramentas IAs para Estudos
          </Link>
        </div>
      </div>
    </>
  );
}
