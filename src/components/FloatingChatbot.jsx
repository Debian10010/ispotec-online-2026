import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatbotService, askGroqDirect } from '../services/chatbotService';

export default function FloatingChatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      tipo: 'resposta',
      conteudo: 'Olá! Sou o Assistente Académico com IA do ISPOTEC.\n\nComo posso ajudar os seus estudos, trabalhos ou pesquisas hoje?',
      data_criacao: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = {
      id: 'msg_' + Date.now(),
      tipo: 'pergunta',
      conteudo: query.trim(),
      data_criacao: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotService.sendMessage(activeConvId, user?.id || 'guest', query.trim());
      if (res && res.botMsg) {
        setMessages(prev => [...prev, res.botMsg]);
        if (res.conversation) {
          setActiveConvId(res.conversation.id || res.conversation._id);
        }
      } else {
        const directReply = await askGroqDirect(query.trim(), messages);
        setMessages(prev => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            tipo: 'resposta',
            conteudo: directReply,
            data_criacao: new Date().toISOString()
          }
        ]);
      }
    } catch {
      const directReply = await askGroqDirect(query.trim(), messages);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_' + Date.now(),
          tipo: 'resposta',
          conteudo: directReply,
          data_criacao: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFullChat = () => {
    setIsOpen(false);
    navigate('/chatbot');
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <>
      <style>{`
        /* Floating Button next to WhatsApp */
        .floating-chatbot-btn {
          position: fixed;
          bottom: 20px;
          right: 80px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 1.45rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          z-index: 999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          cursor: pointer;
        }

        .floating-chatbot-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.55);
        }

        .floating-chatbot-btn .ai-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #10b981;
          color: white;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 10px;
          border: 2px solid white;
          line-height: 1;
        }

        /* Floating Window */
        .floating-chatbot-window {
          position: fixed;
          bottom: 85px;
          right: 20px;
          width: 380px;
          max-width: calc(100vw - 30px);
          height: 530px;
          max-height: calc(100vh - 120px);
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          animation: floatIn 0.25s ease-out;
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .floating-chat-header {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: white;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .floating-chat-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .floating-chat-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }

        .floating-chat-name {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .floating-chat-name small {
          font-size: 0.65rem;
          background: #10b981;
          padding: 1px 6px;
          border-radius: 8px;
          font-weight: 600;
        }

        .floating-chat-status {
          font-size: 0.75rem;
          opacity: 0.85;
          margin: 0;
        }

        .floating-chat-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .floating-chat-action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
        }

        .floating-chat-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Messages */
        .floating-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .floating-msg {
          max-width: 85%;
          padding: 0.75rem 0.95rem;
          border-radius: 14px;
          font-size: 0.875rem;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .floating-msg.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: white;
          border-bottom-right-radius: 3px;
        }

        .floating-msg.bot {
          align-self: flex-start;
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 3px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .floating-msg-time {
          display: block;
          font-size: 0.65rem;
          margin-top: 0.3rem;
          opacity: 0.7;
          text-align: right;
        }

        /* Suggestions */
        .floating-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 0.5rem;
        }

        .floating-sugg-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          font-size: 0.78rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .floating-sugg-btn:hover {
          background: #ede9fe;
          border-color: #8b5cf6;
          color: #5b21b6;
        }

        .floating-typing {
          align-self: flex-start;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.85rem;
          border-radius: 12px;
          font-size: 0.78rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .floating-typing-dots {
          display: inline-flex;
          gap: 3px;
        }

        .floating-typing-dots span {
          width: 5px;
          height: 5px;
          background: #6366f1;
          border-radius: 50%;
          animation: blink 1.2s infinite ease-in-out both;
        }

        .floating-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .floating-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }

        /* Footer Input */
        .floating-chat-footer {
          padding: 0.75rem;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .floating-input-form {
          display: flex;
          gap: 0.4rem;
        }

        .floating-input-form input {
          flex: 1;
          padding: 0.65rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          font-size: 0.875rem;
          outline: none;
          background: #f8fafc;
          transition: border-color 0.2s, background 0.2s;
        }

        .floating-input-form input:focus {
          border-color: #6366f1;
          background: white;
        }

        .floating-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background 0.2s, transform 0.1s;
          flex-shrink: 0;
        }

        .floating-send-btn:hover:not(:disabled) {
          background: #4338ca;
          transform: scale(1.05);
        }

        .floating-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .floating-chatbot-btn {
            bottom: 60px;
            right: 65px;
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }
          .floating-chatbot-window {
            bottom: 110px;
            right: 10px;
            left: 10px;
            width: auto;
            height: 480px;
          }
        }
      `}</style>

      {/* Floating Toggle Button next to WhatsApp */}
      <button
        type="button"
        className="floating-chatbot-btn"
        onClick={() => setIsOpen(prev => !prev)}
        title="Assistente Académico ISPOTEC (Groq IA)"
        aria-label="Abrir Assistente Académico IA"
      >
        <span>🤖</span>
        <span className="ai-badge">IA</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="floating-chatbot-window" role="dialog" aria-label="Assistente Académico ISPOTEC">
          {/* Header */}
          <div className="floating-chat-header">
            <div className="floating-chat-title-group">
              <div className="floating-chat-avatar">🤖</div>
              <div>
                <h3 className="floating-chat-name">
                  Assistente ISPOTEC <small>Groq IA</small>
                </h3>
                <p className="floating-chat-status">Apoio a Estudos e Pesquisas</p>
              </div>
            </div>

            <div className="floating-chat-actions">
              <button
                type="button"
                className="floating-chat-action-btn"
                onClick={handleOpenFullChat}
                title="Abrir página completa do Chatbot"
              >
                ↗
              </button>
              <button
                type="button"
                className="floating-chat-action-btn"
                onClick={() => setIsOpen(false)}
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="floating-chat-body">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`floating-msg ${m.tipo === 'pergunta' ? 'user' : 'bot'}`}
              >
                {m.conteudo}
                <span className="floating-msg-time">{formatTime(m.data_criacao)}</span>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="floating-suggestions">
                <button
                  type="button"
                  className="floating-sugg-btn"
                  onClick={() => handleSend('Ajuda-me a compreender esta matéria com um resumo')}
                >
                  💡 Resumo e explicação de matéria
                </button>
                <button
                  type="button"
                  className="floating-sugg-btn"
                  onClick={() => handleSend('Quais são as melhores técnicas de estudo e memorização?')}
                >
                  🧠 Técnicas de estudo e memorização
                </button>
                <button
                  type="button"
                  className="floating-sugg-btn"
                  onClick={() => handleSend('Como estruturar um trabalho ou monografia académica segundo normas APA?')}
                >
                  📄 Estrutura de trabalho académico (Normas APA)
                </button>
                <button
                  type="button"
                  className="floating-sugg-btn"
                  onClick={() => handleSend('Ajuda-me a montar um cronograma de estudos para testes e exames')}
                >
                  📅 Plano de estudo para exames
                </button>
              </div>
            )}

            {loading && (
              <div className="floating-typing">
                <span>A pensar com IA</span>
                <span className="floating-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="floating-chat-footer">
            <form
              className="floating-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Escreva a sua dúvida académica..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="floating-send-btn"
                disabled={loading || !input.trim()}
                title="Enviar mensagem"
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
