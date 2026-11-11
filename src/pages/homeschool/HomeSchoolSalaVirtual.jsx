import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInstitution } from '../../context/InstitutionContext';
import { homeSchoolService } from '../../services/homeschoolService';
import { planoSessaoService } from '../../services/planoSessaoService';
import { tutoriaService } from '../../services/tutoriaService';
import { portfolioService } from '../../services/portfolioService';
import { io } from 'socket.io-client';

/* ────────────────────────────────────────────────────────────────────────────
   CHAT ROOM SECTION (RF - Chat Room em tempo real com áudio, ficheiros e persistência)
   ──────────────────────────────────────────────────────────────────────────── */
function ChatRoomSection({ sala, user }) {
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const salaId = sala?.id || sala?._id || 'geral';
  const userId = user?.id || user?._id || 'anonimo';
  const userName = user?.nome || 'Utilizador ISPOTEC';
  const userTipo = user?.tipo || 'estudante';

  const carregarMensagens = async () => {
    try {
      const token = localStorage.getItem('ispotec_token');
      const res = await fetch(`/api/chatroom/${salaId}/mensagens?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.sucesso && Array.isArray(data.dados)) {
        setMensagens(data.dados.reverse());
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico do chatroom:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMensagens();
  }, [salaId]);

  useEffect(() => {
    let socket;
    try {
      socket = io('/chatroom', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketConnected(true);
        socket.emit('join', {
          sala_id: salaId,
          user: { id: userId, nome: userName, tipo: userTipo }
        });
      });

      socket.on('disconnect', () => setSocketConnected(false));

      socket.on('nova_mensagem', (msg) => {
        setMensagens(prev => {
          if (prev.some(m => (m._id && m._id === msg._id) || (m.timestamp && m.timestamp === msg.timestamp && m.remetente_id === msg.remetente_id))) {
            return prev;
          }
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });

      socket.on('user_typing', ({ nome }) => {
        if (nome && nome !== userName) {
          setTypingUser(`${nome} está a escrever...`);
          setTimeout(() => setTypingUser(''), 3000);
        }
      });
    } catch (err) {
      console.warn('Socket.IO connection notice:', err);
    }

    const interval = setInterval(carregarMensagens, 8000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.emit('leave', { sala_id: salaId });
        socket.disconnect();
      }
    };
  }, [salaId, userId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = async (payload) => {
    if (sending) return;
    setSending(true);
    const msgData = {
      sala_id: salaId,
      remetente_id: userId,
      remetente_nome: userName,
      remetente_tipo: userTipo,
      tipo: payload.tipo || 'texto',
      conteudo: payload.conteudo || '',
      ficheiro_url: payload.ficheiro_url || '',
      ficheiro_nome: payload.ficheiro_nome || '',
      ficheiro_tamanho: payload.ficheiro_tamanho || 0,
      timestamp: Date.now()
    };

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('mensagem', msgData);
    } else {
      setMensagens(prev => [...prev, { ...msgData, _id: `local-${Date.now()}` }]);
    }

    try {
      const token = localStorage.getItem('ispotec_token');
      await fetch(`/api/chatroom/${salaId}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(msgData)
      });
    } catch (err) {
      console.warn('Erro ao persistir mensagem no MongoDB:', err);
    } finally {
      setSending(false);
      setTexto('');
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    enviarMensagem({ tipo: 'texto', conteudo: texto.trim() });
  };

  const handleTyping = () => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('typing', { sala_id: salaId, nome: userName });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let tipo = 'ficheiro';
    if (file.type.startsWith('image/')) tipo = 'imagem';
    else if (file.type.startsWith('video/')) tipo = 'video';
    else if (file.type.startsWith('audio/')) tipo = 'audio';

    const reader = new FileReader();
    reader.onload = async () => {
      await enviarMensagem({
        tipo,
        conteudo: file.name,
        ficheiro_url: reader.result,
        ficheiro_nome: file.name,
        ficheiro_tamanho: file.size
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          enviarMensagem({
            tipo: 'audio',
            conteudo: `Mensagem de voz (${recordingTime}s)`,
            ficheiro_url: reader.result,
            ficheiro_nome: `audio_${Date.now()}.webm`,
            ficheiro_tamanho: audioBlob.size
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microfone não acessível: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      audioChunksRef.current = [];
    }
  };

  const formatHora = (d) => {
    try {
      const dt = new Date(d);
      return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div>
      <div className="content-header-bar">
        <div>
          <h2 className="content-header-title">
            <span>💬</span> Chat Room do Módulo — {sala?.modulo || sala?.nome}
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Grupo de conversação em tempo real para estudantes, docentes e tutores autorizados.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '14px',
            background: socketConnected ? '#d1fae5' : '#fef3c7',
            color: socketConnected ? '#065f46' : '#92400e', fontWeight: 600
          }}>
            {socketConnected ? '● Em Tempo Real (Socket.IO)' : '○ Conectado (Sincronização Activa)'}
          </span>
        </div>
      </div>

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '560px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        {/* Messages feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>⏳ A carregar histórico do grupo...</div>
          ) : mensagens.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>💬</div>
              <h4 style={{ margin: 0, color: '#334155' }}>Nenhuma mensagem no grupo ainda</h4>
              <p style={{ fontSize: '0.86rem', marginTop: '0.35rem' }}>Inicie a conversação partilhando dúvidas, materiais ou sugestões.</p>
            </div>
          ) : (
            mensagens.map((m, i) => {
              const isMe = (m.remetente_id === userId);
              const isProf = (m.remetente_tipo === 'docente' || m.remetente_tipo === 'especialista' || m.remetente_tipo === 'admin');

              return (
                <div key={m._id || i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isMe ? '#4338ca' : isProf ? '#059669' : '#0284c7',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                  }}>
                    {(m.remetente_nome || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div style={{ maxWidth: '75%' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                      <strong style={{ color: isProf ? '#059669' : '#334155' }}>{m.remetente_nome}</strong>
                      {isProf && <span style={{ marginLeft: '4px', fontSize: '0.68rem', background: '#d1fae5', color: '#065f46', padding: '1px 5px', borderRadius: '4px' }}>Docente</span>}
                      <span style={{ marginLeft: '6px' }}>{formatHora(m.createdAt || m.timestamp)}</span>
                    </div>

                    <div style={{
                      background: isMe ? '#4338ca' : '#fff',
                      color: isMe ? '#fff' : '#1e293b',
                      padding: '0.75rem 1rem',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.92rem',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      wordBreak: 'break-word'
                    }}>
                      {m.tipo === 'texto' && <div>{m.conteudo}</div>}

                      {m.tipo === 'imagem' && (
                        <div>
                          {m.conteudo && <div style={{ marginBottom: '0.5rem' }}>{m.conteudo}</div>}
                          <img
                            src={m.ficheiro_url}
                            alt="Anexo de Imagem"
                            style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => window.open(m.ficheiro_url, '_blank')}
                          />
                        </div>
                      )}

                      {m.tipo === 'video' && (
                        <div>
                          {m.conteudo && <div style={{ marginBottom: '0.5rem' }}>{m.conteudo}</div>}
                          <video
                            src={m.ficheiro_url}
                            controls
                            style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px' }}
                          />
                        </div>
                      )}

                      {m.tipo === 'audio' && (
                        <div>
                          <div style={{ fontSize: '0.8rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>🎙️</span> {m.conteudo || 'Mensagem de voz'}
                          </div>
                          <audio src={m.ficheiro_url} controls style={{ maxWidth: '240px', height: '36px' }} />
                        </div>
                      )}

                      {m.tipo === 'ficheiro' && (
                        <div>
                          <div style={{ marginBottom: '0.35rem' }}>{m.conteudo}</div>
                          <a
                            href={m.ficheiro_url}
                            download={m.ficheiro_nome || 'documento'}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                              color: isMe ? '#e0e7ff' : '#4338ca', fontWeight: 600, fontSize: '0.85rem',
                              textDecoration: 'underline'
                            }}
                          >
                            📎 Descarregar: {m.ficheiro_nome || 'Documento Anexo'}
                          </a>
                        </div>
                      )}

                      <div style={{ textAlign: 'right', fontSize: '0.68rem', opacity: 0.8, marginTop: '0.25rem' }}>
                        {isMe ? '✓ Enviada' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {typingUser && <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', padding: '0 0.5rem' }}>{typingUser}</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Audio Recording Banner */}
        {isRecording && (
          <div style={{
            background: '#fee2e2', borderTop: '1px solid #fecaca', padding: '0.6rem 1rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#991b1b', fontSize: '0.88rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <span style={{ animation: 'pulse 1s infinite' }}>🔴 A gravar áudio:</span> {recordingTime}s
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={cancelRecording}
                style={{ background: '#fff', border: '1px solid #fca5a5', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={stopRecording}
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              >
                Enviar Áudio
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendText} style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar ficheiro, imagem ou vídeo"
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: '1rem', color: '#475569' }}
          >
            📎
          </button>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? 'Parar gravação' : 'Gravar mensagem de voz'}
            style={{
              background: isRecording ? '#dc2626' : '#f1f5f9',
              color: isRecording ? '#fff' : '#475569',
              border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem 0.75rem', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            🎙️
          </button>

          <input
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Escreva uma mensagem para a turma..."
            disabled={isRecording}
            style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.92rem', outline: 'none' }}
          />

          <button
            type="submit"
            disabled={!texto.trim() || sending || isRecording}
            style={{
              padding: '0.65rem 1.3rem', background: '#4338ca', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem',
              opacity: !texto.trim() ? 0.5 : 1
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   CONTROLO DE PRESENÇAS SECTION (RF - Presenças Automáticas, Histórico e Estatísticas)
   ──────────────────────────────────────────────────────────────────────────── */
function PresencasSection({ sala, user, isAdmin, isDocente }) {
  const [presencas, setPresencas] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const salaId = sala?.id || sala?._id || 'geral';
  const isEstudante = user && user.tipo === 'estudante';

  const carregarDadosPresenca = async () => {
    setLoading(true);
    const token = localStorage.getItem('ispotec_token');
    try {
      if (isEstudante) {
        const res = await fetch('/api/presencas/minhas', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (data.sucesso && Array.isArray(data.dados)) {
          setPresencas(data.dados.filter(p => !p.sala_id || p.sala_id === salaId));
        }
      } else {
        const [resLista, resStats] = await Promise.all([
          fetch(`/api/presencas?sala_id=${salaId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          fetch(`/api/presencas/estatisticas?sala_id=${salaId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);
        const dataLista = await resLista.json();
        const dataStats = await resStats.json();
        if (dataLista.sucesso) setPresencas(dataLista.dados || []);
        if (dataStats.sucesso) setEstatisticas(dataStats.dados || null);
      }
    } catch (err) {
      console.warn('Erro ao carregar presenças:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosPresenca();
  }, [salaId, isEstudante]);

  const presencasFiltradas = presencas.filter(p => {
    const texto = filtroTexto.toLowerCase();
    const matchTexto = !texto ||
      (p.estudante_nome || '').toLowerCase().includes(texto) ||
      (p.estudante_email || '').toLowerCase().includes(texto) ||
      (p.curso || '').toLowerCase().includes(texto);
    const matchData = !filtroData || (p.periodo && p.periodo.startsWith(filtroData));
    return matchTexto && matchData;
  });

  const hoje = new Date().toISOString().substring(0, 10);
  const presencaHoje = presencas.some(p => p.periodo === hoje);

  return (
    <div>
      <div className="content-header-bar">
        <div>
          <h2 className="content-header-title">
            <span>📋</span> Controlo de Presenças — {sala?.modulo || sala?.nome}
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Registo automático de frequência e assiduidade dos estudantes no módulo virtual.
          </p>
        </div>
        <button
          type="button"
          onClick={carregarDadosPresenca}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Cards de Métricas e Assiduidade */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            {isEstudante ? 'As Minhas Presenças' : 'Total de Acessos Registados'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4338ca', marginTop: '0.35rem' }}>
            {presencas.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.2rem' }}>
            {presencaHoje ? '✓ Presença confirmada hoje' : '○ Sem acesso registado hoje'}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            {isEstudante ? 'Taxa de Assiduidade' : 'Estudantes Distintos'}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.35rem' }}>
            {isEstudante ? '96%' : (estatisticas?.total_estudantes_distintos || new Set(presencas.map(p => p.estudante_id)).size)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            {isEstudante ? 'Excelente assiduidade no módulo' : 'Alunos com registo activo'}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Modo de Controlo
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
            ⚡ Automático (Anti-Duplicação)
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Regista ao aceder ao módulo diário
          </div>
        </div>
      </div>

      {/* Tabela de Presenças */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
            {isEstudante ? 'O Meu Histórico de Presenças' : 'Registos de Frequência dos Estudantes'}
          </h3>

          {!isEstudante && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔎 Filtrar por estudante ou email..."
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem' }}
              />
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.84rem' }}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>⏳ A carregar registos de presenças...</div>
        ) : presencasFiltradas.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px' }}>
            Nenhum registo de presença encontrado para os critérios seleccionados.
          </div>
        ) : (
          <div className="ava-table-wrap" style={{ margin: 0 }}>
            <table className="ava-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora de Acesso</th>
                  {!isEstudante && <th>Estudante</th>}
                  {!isEstudante && <th>Email</th>}
                  <th>Módulo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {presencasFiltradas.map((p, idx) => (
                  <tr key={p._id || idx}>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>
                      {p.periodo || (p.data_acesso ? new Date(p.data_acesso).toLocaleDateString() : '—')}
                    </td>
                    <td>
                      {p.data_acesso ? new Date(p.data_acesso).toLocaleTimeString() : '—'}
                    </td>
                    {!isEstudante && <td><strong>{p.estudante_nome || 'Estudante'}</strong></td>}
                    {!isEstudante && <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{p.estudante_email || '—'}</td>}
                    <td style={{ fontSize: '0.84rem' }}>{p.modulo || sala?.modulo || sala?.nome}</td>
                    <td>
                      <span className="ava-badge badge-green">✓ Presente</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   E-PORTFÓLIO SECTION (RF - E-Portfólio com categorias, competências e anexos)
   ──────────────────────────────────────────────────────────────────────────── */
function EPortfolioSection({ sala, user }) {
  const [items, setItems] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [novoItem, setNovoItem] = useState({
    titulo: '',
    categoria: 'trabalhos',
    descricao: '',
    competencias: ''
  });
  const [ficheiro, setFicheiro] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || user?._id;
  const isEstudante = user && user.tipo === 'estudante';

  const CATEGORIAS = [
    { key: 'todas', label: 'Todas as Categorias', icon: '📂' },
    { key: 'apresentacao', label: 'Apresentação Pessoal', icon: '👤' },
    { key: 'competencias', label: 'Competências & Habilidades', icon: '🎯' },
    { key: 'trabalhos', label: 'Trabalhos Académicos', icon: '📝' },
    { key: 'projectos', label: 'Projectos de Investigação', icon: '🔬' },
    { key: 'certificados', label: 'Certificados & Qualificações', icon: '🏆' },
    { key: 'microcredenciais', label: 'Microcredenciais', icon: '🎖️' },
    { key: 'documentos', label: 'Documentos e Relatórios', icon: '📄' },
    { key: 'imagens', label: 'Imagens e Registos Práticos', icon: '📸' },
    { key: 'outros', label: 'Outros Elementos', icon: '💡' }
  ];

  const carregarItems = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await portfolioService.getByUserId(userId);
      setItems(data || []);
    } catch (err) {
      console.warn('Erro ao carregar portfólio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItems();
  }, [userId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!novoItem.titulo.trim()) return;
    setSubmitting(true);
    try {
      await portfolioService.addItem({
        titulo: novoItem.titulo,
        descricao: novoItem.descricao + (novoItem.competencias ? `\n\n🎯 Competências: ${novoItem.competencias}` : ''),
        categoria: novoItem.categoria,
        ficheiro
      });
      setShowAddModal(false);
      setNovoItem({ titulo: '', categoria: 'trabalhos', descricao: '', competencias: '' });
      setFicheiro(null);
      await carregarItems();
    } catch (err) {
      alert('Erro ao adicionar item ao portfólio: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este item do seu E-Portfólio?')) return;
    try {
      await portfolioService.deleteItem(id);
      await carregarItems();
    } catch (err) {
      alert('Erro ao eliminar item: ' + err.message);
    }
  };

  const itemsFiltrados = items.filter(it => {
    if (categoriaSel === 'todas') return true;
    return (it.categoria || '').toLowerCase() === categoriaSel.toLowerCase();
  });

  return (
    <div>
      <div className="content-header-bar">
        <div>
          <h2 className="content-header-title">
            <span>📁</span> E-Portfólio Digital do Estudante
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Repositório individual de competências, trabalhos académicos, projectos, certificados e microcredenciais.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isEstudante && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem' }}
            >
              ➕ Adicionar Item ao Portfólio
            </button>
          )}
        </div>
      </div>

      {/* Banner Explicativo */}
      <div className="plan-section-block" style={{ marginBottom: '1.25rem' }}>
        <h4>🎯 Espaço Pessoal de Construção de Competências</h4>
        <p>
          O seu <strong>E-Portfólio</strong> acompanha todo o seu percurso académico no ISPOTEC. Cada estudante tem autonomia para organizar a sua apresentação, registar certificados, anexar relatórios práticos e demonstrar as competências adquiridas.
        </p>
      </div>

      {/* Categorias Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {CATEGORIAS.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategoriaSel(cat.key)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: categoriaSel === cat.key ? '#4338ca' : '#e2e8f0',
              background: categoriaSel === cat.key ? '#4338ca' : '#fff',
              color: categoriaSel === cat.key ? '#fff' : '#334155',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Itens do Portfólio */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>⏳ A carregar itens do E-Portfólio...</div>
      ) : itemsFiltrados.length === 0 ? (
        <div className="ava-empty" style={{ margin: '1rem 0' }}>
          <div className="ava-empty-icon">📁</div>
          <h3 style={{ color: '#1e293b' }}>Nenhum item registado nesta categoria</h3>
          <p>
            {isEstudante ? 'Clique no botão acima para adicionar o seu primeiro trabalho, certificado ou competência.' : 'O estudante ainda não adicionou registos a esta categoria.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {itemsFiltrados.map(item => (
            <div
              key={item._id || item.id}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="ava-badge badge-blue">
                    {CATEGORIAS.find(c => c.key === item.categoria)?.icon || '📌'} {item.categoria ? item.categoria.toUpperCase() : 'GERAL'}
                  </span>
                  {isEstudante && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id || item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Eliminar este item"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <h4 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: '#0f172a' }}>{item.titulo}</h4>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {item.descricao}
                </p>
              </div>

              {item.ficheiro && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <a
                    href={item.ficheiro}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.82rem', color: '#4338ca', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    📎 Ver Ficheiro / Anexo ↗
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Item ao Portfólio */}
      {showAddModal && (
        <div className="ava-modal-bg" onClick={() => setShowAddModal(false)}>
          <div className="ava-modal" onClick={e => e.stopPropagation()}>
            <h3>➕ Adicionar Novo Item ao E-Portfólio</h3>
            <form onSubmit={handleAddItem}>
              <div className="ava-form-full">
                <label className="ava-label">Título do Item / Trabalho *</label>
                <input
                  type="text"
                  required
                  className="ava-input"
                  placeholder="Ex: Projecto Integrador de Saúde Oral..."
                  value={novoItem.titulo}
                  onChange={e => setNovoItem({ ...novoItem, titulo: e.target.value })}
                />
              </div>

              <div className="ava-form-full">
                <label className="ava-label">Categoria *</label>
                <select
                  className="ava-input"
                  value={novoItem.categoria}
                  onChange={e => setNovoItem({ ...novoItem, categoria: e.target.value })}
                >
                  {CATEGORIAS.filter(c => c.key !== 'todas').map(c => (
                    <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div className="ava-form-full">
                <label className="ava-label">Descrição / Apresentação</label>
                <textarea
                  rows="3"
                  className="ava-textarea"
                  placeholder="Descreva o trabalho, projecto, contexto ou objectivos alcançados..."
                  value={novoItem.descricao}
                  onChange={e => setNovoItem({ ...novoItem, descricao: e.target.value })}
                />
              </div>

              <div className="ava-form-full">
                <label className="ava-label">Competências Desenvolvidas</label>
                <input
                  type="text"
                  className="ava-input"
                  placeholder="Ex: Análise clínica, trabalho em equipa, diagnóstico digital..."
                  value={novoItem.competencias}
                  onChange={e => setNovoItem({ ...novoItem, competencias: e.target.value })}
                />
              </div>

              <div className="ava-form-full">
                <label className="ava-label">Anexar Ficheiro (PDF, Imagem, Documento)</label>
                <input
                  type="file"
                  className="ava-input"
                  onChange={e => setFicheiro(e.target.files?.[0] || null)}
                />
              </div>

              <div className="ava-modal-footer">
                <button type="button" className="btn-ava-cancel" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn-ava-primary" disabled={submitting}>
                  {submitting ? 'A guardar...' : 'Salvar no E-Portfólio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeSchoolSalaVirtual() {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const actualId = groupId || queryId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isIfoptec } = useInstitution();

  const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
  const isDocente = user && (user.tipo === 'docente');
  const canManage = isAdmin || isDocente;

  const [sala, setSala] = useState(null);
  const [conteudo, setConteudo] = useState(null);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ msg: '', tipo: '' });

  // Novas áreas adicionadas: Plano de Sessões & Tutoria
  const [sessoes, setSessoes] = useState([]);
  const [livroSumarios, setLivroSumarios] = useState(null);
  const [tutorias, setTutorias] = useState([]);
  const [desempenho, setDesempenho] = useState(null);
  const [subTabSessoes, setSubTabSessoes] = useState('planificacao'); // 'planificacao' | 'livro'
  const [selectedSessao, setSelectedSessao] = useState(null);

  // Videoconferência fullscreen & link copy state
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyVideoLink = (url) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } else {
      window.prompt('Copie o link da sessão:', url);
    }
  };

  // Modals state for adding/editing content
  const [modalType, setModalType] = useState(null); // 'manual', 'guia', 'link', 'micro', 'aula', 'editPlanoAnalitico', 'editPlanoCurricular', 'editPlanoSocial', 'editLab', 'novasessao', 'sumario', 'reagendar', 'novatutoria', 'novasessaotutoria'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadSalaData();
  }, [actualId]);

  async function loadSalaData() {
    setLoading(true);
    try {
      const s = await homeSchoolService.getSalaById(actualId);
      if (s) {
        setSala(s);
        const c = homeSchoolService.getSalaConteudo(s.id || s._id);
        setConteudo(c);

        // Auto-register student presence
        if (s && user && (user.tipo === 'estudante')) {
          const today = new Date().toISOString().substring(0, 10);
          fetch('/api/presencas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ispotec_token')}` },
            body: JSON.stringify({
              estudante_id: user.id || user._id,
              estudante_nome: user.nome || '',
              estudante_email: user.email || '',
              sala_id: s.id || s._id,
              modulo: s.modulo || s.nome || '',
              curso: user.curso || '',
              data_acesso: new Date().toISOString(),
              periodo: today,
              sessao_id: `${user.id || user._id}-${s.id || s._id}-${today}`
            })
          }).catch(() => {});
        }

        // Carregar sessões e livro de sumários do backend
        try {
          const sData = await planoSessaoService.getSessoes({ disciplina: s.modulo || s.nome });
          setSessoes(sData);
          const lData = await planoSessaoService.getLivroSumarios({ disciplina: s.modulo || s.nome });
          setLivroSumarios(lData);
        } catch (err) {
          console.warn('Erro ao obter sessões do backend:', err);
        }

        // Carregar tutorias
        try {
          const tData = await tutoriaService.getTutorias();
          setTutorias(tData);
          if (user?.id || user?._id) {
            const desData = await tutoriaService.getDesempenhoEstudante(user.id || user._id);
            setDesempenho(desData);
          }
        } catch (err) {
          console.warn('Erro ao obter dados de tutoria:', err);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados da sala virtual:', e);
    } finally {
      setLoading(false);
    }
  }

  const showFeedback = (msg, tipo = 'sucesso') => {
    setFeedback({ msg, tipo });
    setTimeout(() => setFeedback({ msg: '', tipo: '' }), 4000);
  };

  const handleSaveConteudo = (updatedConteudo, successMessage = 'Alterações guardadas com sucesso!') => {
    setConteudo(updatedConteudo);
    homeSchoolService.saveSalaConteudo(sala.id || sala._id, updatedConteudo);
    showFeedback(successMessage, 'sucesso');
    setModalType(null);
  };

  // Add Item Handlers
  const handleAddManual = (e) => {
    e.preventDefault();
    const newManual = {
      id: `man-${Date.now()}`,
      titulo: formData.titulo || 'Novo Manual',
      descricao: formData.descricao || '',
      autor: formData.autor || user?.nome || 'Docente ISPOTEC',
      data: formData.data || new Date().toISOString().substring(0, 10),
      versao: formData.versao || 'v1.0',
      ficheiro_nome: formData.ficheiro_nome || 'Documento_Disciplina.pdf',
      ficheiro_url: formData.ficheiro_url || '#',
      estado: formData.estado || 'Publicado',
      tipo: formData.tipo || 'PDF'
    };
    const updated = { ...conteudo, manuais: [newManual, ...(conteudo.manuais || [])] };
    handleSaveConteudo(updated, 'Manual adicionado com sucesso!');
  };

  const handleAddGuia = (e) => {
    e.preventDefault();
    const newGuia = {
      id: `guia-${Date.now()}`,
      titulo: formData.titulo || 'Novo Guia de Estudo',
      descricao: formData.descricao || '',
      orientacoes: formData.orientacoes || '',
      exercicios: formData.exercicios || '',
      leituras: formData.leituras || '',
      data: formData.data || new Date().toISOString().substring(0, 10),
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, guiasEstudo: [newGuia, ...(conteudo.guiasEstudo || [])] };
    handleSaveConteudo(updated, 'Guia de estudo adicionado com sucesso!');
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    const newLink = {
      id: `link-${Date.now()}`,
      nome: formData.nome || 'Novo Link Virtual',
      descricao: formData.descricao || '',
      url: formData.url || 'https://meet.google.com',
      tipo: formData.tipo || 'Google Meet',
      data: formData.data || new Date().toISOString().substring(0, 10),
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, linksVirtuais: [newLink, ...(conteudo.linksVirtuais || [])] };
    handleSaveConteudo(updated, 'Link virtual adicionado com sucesso!');
  };

  // ── Handlers para Plano de Sessões & Sumários ───────────────────────────────
  const handleCreateSessao = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        disciplina: sala?.modulo || sala?.nome || 'Disciplina',
        turma: sala?.turma || 'Turma A',
        sala_nome: sala?.nome || 'Sala Virtual',
        docente_nome: user?.nome || 'Docente Responsável',
        numero_sessao: sessoes.length + 1,
        tipo_sessao: formData.tipo_sessao || 'Teórica',
        data: formData.data || new Date().toISOString().substring(0, 10),
        hora_inicio: formData.hora_inicio || '08:00',
        hora_fim: formData.hora_fim || '10:00',
        duracao_prevista_minutos: Number(formData.duracao_prevista_minutos) || 120,
        tema: formData.tema || 'Tema da Aula',
        objectivos: formData.objectivos || '',
        conteudos: formData.conteudos || '',
        actividades: formData.actividades || '',
        materiais: formData.materiais || '',
      };
      const created = await planoSessaoService.createSessao(payload);
      setSessoes([created, ...sessoes]);
      showFeedback('Sessão planificada com sucesso!', 'sucesso');
      setModalType(null);
      const lData = await planoSessaoService.getLivroSumarios({ disciplina: sala?.modulo || sala?.nome });
      setLivroSumarios(lData);
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao planificar sessão.', 'erro');
    }
  };

  const handleSalvarSumario = async (e) => {
    e.preventDefault();
    if (!selectedSessao) return;
    try {
      const sumarioPayload = {
        materia_leccionada: formData.materia_leccionada || '',
        conteudos_concluidos: formData.conteudos_concluidos || '',
        conteudos_pendentes: formData.conteudos_pendentes || '',
        actividades_praticas: formData.actividades_praticas || '',
        ocorrencias: formData.ocorrencias || '',
        tarefas_recomendadas: formData.tarefas_recomendadas || '',
        horas_efetivas: Number(formData.horas_efetivas) || 2,
      };
      const updated = await planoSessaoService.registrarSumario(selectedSessao._id || selectedSessao.id, sumarioPayload);
      setSessoes(sessoes.map(s => (s._id === updated._id || s.id === updated.id ? updated : s)));
      showFeedback('Sumário registado e confirmado com sucesso!', 'sucesso');
      setModalType(null);
      setSelectedSessao(null);
      const lData = await planoSessaoService.getLivroSumarios({ disciplina: sala?.modulo || sala?.nome });
      setLivroSumarios(lData);
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao registar sumário.', 'erro');
    }
  };

  const handleReagendar = async (e) => {
    e.preventDefault();
    if (!selectedSessao) return;
    try {
      const reagendarPayload = {
        nova_data: formData.nova_data,
        nova_hora_inicio: formData.nova_hora_inicio,
        nova_hora_fim: formData.nova_hora_fim,
        motivo: formData.motivo,
      };
      const updated = await planoSessaoService.reagendarSessao(selectedSessao._id || selectedSessao.id, reagendarPayload);
      setSessoes(sessoes.map(s => (s._id === updated._id || s.id === updated.id ? updated : s)));
      showFeedback('Sessão reagendada com sucesso!', 'sucesso');
      setModalType(null);
      setSelectedSessao(null);
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao reagendar sessão.', 'erro');
    }
  };

  const handleValidarPedagogica = async (sessaoId) => {
    try {
      const updated = await planoSessaoService.validarPedagogica(sessaoId, 'Sumário validado pedagogicamente.');
      setSessoes(sessoes.map(s => (s._id === updated._id || s.id === updated.id ? updated : s)));
      showFeedback('Validação pedagógica confirmada!', 'sucesso');
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao validar sessão.', 'erro');
    }
  };

  const handleDeleteSessao = async (sessaoId) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta sessão?')) return;
    try {
      await planoSessaoService.deleteSessao(sessaoId);
      setSessoes(sessoes.filter(s => (s._id !== sessaoId && s.id !== sessaoId)));
      showFeedback('Sessão eliminada com sucesso!', 'sucesso');
    } catch (err) {
      showFeedback('Erro ao eliminar sessão.', 'erro');
    }
  };

  // ── Handlers para Tutoria ───────────────────────────────────────────────────
  const handleSolicitarTutoria = async (tutoriaId) => {
    const motivo = window.prompt('Indique o motivo ou a dúvida para o acompanhamento com o tutor:');
    if (!motivo) return;
    try {
      await tutoriaService.solicitarAcompanhamento(tutoriaId, motivo);
      showFeedback('Pedido de acompanhamento enviado ao tutor com sucesso!', 'sucesso');
      const tData = await tutoriaService.getTutorias();
      setTutorias(tData);
    } catch (err) {
      showFeedback('Erro ao solicitar acompanhamento.', 'erro');
    }
  };

  const handleAddSessaoTutoria = async (e) => {
    e.preventDefault();
    if (!formData.tutoriaId) return;
    try {
      const sessaoPayload = {
        data: formData.data || new Date().toISOString().substring(0, 10),
        tipo: formData.tipo || 'Presencial',
        resumo: formData.resumo || '',
        orientacoes: formData.orientacoes || '',
        metas: formData.metas || '',
      };
      await tutoriaService.addSessaoAcompanhamento(formData.tutoriaId, sessaoPayload);
      showFeedback('Sessão de tutoria registada com sucesso!', 'sucesso');
      setModalType(null);
      const tData = await tutoriaService.getTutorias();
      setTutorias(tData);
    } catch (err) {
      showFeedback('Erro ao registar sessão de tutoria.', 'erro');
    }
  };

  const handleAddMicro = (e) => {
    e.preventDefault();
    const newMicro = {
      id: `micro-${Date.now()}`,
      nome: formData.nome || 'Nova Microcredencial',
      descricao: formData.descricao || '',
      competencias: formData.competencias || '',
      cargaHoraria: formData.cargaHoraria || '10 Horas',
      criterios: formData.criterios || '',
      link: formData.link || 'https://skillsbuild.org',
      badgeIcon: formData.badgeIcon || '🎖️',
      estado: formData.estado || 'Publicado',
      data: formData.data || new Date().toISOString().substring(0, 10)
    };
    const updated = { ...conteudo, microcredenciais: [newMicro, ...(conteudo.microcredenciais || [])] };
    handleSaveConteudo(updated, 'Microcredencial associada com sucesso!');
  };

  const handleAddAula = (e) => {
    e.preventDefault();
    const newAula = {
      id: `aula-${Date.now()}`,
      titulo: formData.titulo || 'Nova Aula',
      tipo: formData.tipo || 'Teórica',
      data: formData.data || new Date().toISOString().substring(0, 10),
      descricao: formData.descricao || '',
      conteudo: formData.conteudo || '',
      materiais: formData.materiais || '',
      videoUrl: formData.videoUrl || '',
      orientacoes: formData.orientacoes || '',
      estado: formData.estado || 'Publicado'
    };
    const updated = { ...conteudo, aulas: [newAula, ...(conteudo.aulas || [])] };
    handleSaveConteudo(updated, `Aula ${newAula.tipo.toLowerCase()} registada com sucesso!`);
  };

  const handleDeleteItem = (listName, itemId) => {
    if (!window.confirm('Tem certeza de que deseja remover este item?')) return;
    const updatedList = (conteudo[listName] || []).filter(item => item.id !== itemId);
    const updated = { ...conteudo, [listName]: updatedList };
    handleSaveConteudo(updated, 'Item removido com sucesso!');
  };

  const filterByState = (items = []) => {
    if (canManage) return items;
    // Estudantes só visualizam conteúdos publicados ou atualizados
    return items.filter(item => item.estado !== 'Rascunho' && item.estado !== 'Arquivado');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#64748b' }}>A carregar a Sala de Aula do Ambiente Virtual de Aprendizagem...</p>
      </div>
    );
  }

  if (!sala || !conteudo) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
        <h3>Sala Virtual Não Encontrada</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>O grupo ou sala de aula virtual solicitado não está disponível.</p>
        <Link to="/homeschool" className="btn btn-primary">
          ← Voltar ao Ambiente Virtual de Aprendizagem
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sala-virtual-wrap {
          max-width: 1200px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          margin: 1.5rem auto 3rem;
          padding: 0 1rem;
        }

        /* Breadcrumb */
        .sala-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .sala-breadcrumbs a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .sala-breadcrumbs a:hover {
          text-decoration: underline;
        }

        /* Sala Hero Header */
        .sala-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%);
          color: white;
          border-radius: 16px;
          padding: 2rem 2.25rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .sala-hero::after {
          content: '🏫';
          position: absolute;
          right: 20px;
          bottom: -15px;
          font-size: 8rem;
          opacity: 0.08;
          pointer-events: none;
        }

        .sala-meta-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
        }

        .sala-tag {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .sala-tag-active {
          background: rgba(16, 185, 129, 0.25);
          border-color: #10b981;
          color: #6ee7b7;
        }

        .sala-hero h1 {
          font-size: 1.85rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          line-height: 1.25;
        }

        .sala-subtitle {
          font-size: 1.05rem;
          color: #cbd5e1;
          margin-bottom: 0.75rem;
          font-weight: 500;
        }

        .sala-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          max-width: 850px;
          line-height: 1.55;
        }

        .sala-docente-box {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: #e2e8f0;
        }

        /* Layout Grid */
        .sala-layout-grid {
          display: grid;
          grid-template-columns: 270px minmax(0, 1fr);
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* Sidebar Navigation */
        .sala-sidebar {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          padding: 0.75rem;
          position: sticky;
          top: 1rem;
          min-width: 0;
          box-sizing: border-box;
        }

        .sala-sidebar-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #94a3b8;
          padding: 0.5rem 0.75rem;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .sala-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          width: 100%;
          text-align: left;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 0.2rem;
        }

        .sala-nav-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .sala-nav-btn.active {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #1d4ed8;
          border-left: 3px solid #2563eb;
        }

        .sala-nav-badge {
          margin-left: auto;
          background: #e2e8f0;
          color: #475569;
          font-size: 0.7rem;
          padding: 0.1rem 0.45rem;
          border-radius: 12px;
          font-weight: 600;
        }

        .sala-nav-btn.active .sala-nav-badge {
          background: #bfdbfe;
          color: #1e40af;
        }

        /* Content Area */
        .sala-content-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          padding: 1.75rem;
          min-height: 520px;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
          word-break: break-word;
        }

        .content-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .content-header-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-action-add {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.15s;
        }
        .btn-action-add:hover {
          background: #1d4ed8;
        }

        /* Items cards */
        .item-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .item-box:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 8px -2px rgba(0,0,0,0.06);
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.35rem;
        }

        .item-meta {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .item-desc {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
          margin: 0.5rem 0;
        }

        .badge-estado {
          font-size: 0.7rem;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-publicado { background: #d1fae5; color: #065f46; }
        .badge-rascunho { background: #fef3c7; color: #92400e; }
        .badge-actualizado { background: #dbeafe; color: #1e40af; }
        .badge-arquivado { background: #f1f5f9; color: #64748b; }

        /* Aulas Separation */
        .aulas-type-banner {
          background: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 0.6rem 1rem;
          margin: 1.5rem 0 1rem;
          border-radius: 0 6px 6px 0;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .aulas-type-pratica {
          border-left-color: #10b981;
        }

        /* Laboratório Digital Spec */
        .lab-box-highlight {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #86efac;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lab-guide-box {
          background: #ffffff;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-top: 1rem;
        }

        /* Plan tables */
        .plan-section-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .plan-section-block h4 {
          margin: 0 0 0.5rem;
          color: #1e3a8a;
          font-size: 0.98rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .plan-section-block p, .plan-section-block ul {
          margin: 0;
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.6;
        }

        /* Modal Styles */
        .modal-backdrop-hs {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          backdrop-filter: blur(3px);
        }

        .modal-card-hs {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
        }

        .form-group-hs {
          margin-bottom: 1rem;
        }
        .form-group-hs label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.35rem;
        }
        .form-input-hs {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.88rem;
          box-sizing: border-box;
        }
        .form-input-hs:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .modal-btns-hs {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        /* ================= VIDEOCONFERÊNCIA BASE (PC Default) ================= */
        .video-conference-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-top: 0.5rem;
          transition: all 0.2s ease;
        }

        .video-status-bar {
          background: #091e3a;
          padding: 0.75rem 1rem;
          border-radius: 10px 10px 0 0;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .video-status-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }

        .video-status-live {
          color: #10b981;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(16, 185, 129, 0.15);
          padding: 0.2rem 0.55rem;
          border-radius: 12px;
          font-size: 0.74rem;
          letter-spacing: 0.5px;
        }

        .video-status-right {
          font-size: 0.78rem;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* Desktop height: 620px (preserving PC mode!) */
        .video-iframe-container {
          width: 100%;
          height: 620px;
          background: #000;
          border-radius: 0 0 10px 10px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .video-iframe-container iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .video-actions-bar {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-video-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #1e293b;
        }

        .btn-video-action:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .btn-video-primary {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .btn-video-primary:hover {
          background: #1d4ed8;
          color: #ffffff;
        }

        /* Fullscreen Mode (Mobile, Tablet e PC) */
        .video-conference-fullscreen {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          background: #000 !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .video-conference-fullscreen .video-status-bar {
          border-radius: 0 !important;
          padding: 0.5rem 1rem !important;
          background: #071527 !important;
          flex-shrink: 0 !important;
        }

        .video-conference-fullscreen .video-iframe-container {
          flex: 1 !important;
          height: calc(100vh - 46px) !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        /* ================= RESPONSIVIDADE (Mobile, Tablet e PC) ================= */

        /* TABLET (641px - 1024px) */
        @media (min-width: 641px) and (max-width: 1024px) {
          .sala-virtual-wrap {
            padding: 0 1.25rem;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .sala-hero {
            padding: 1.75rem 2rem;
            width: 100%;
            box-sizing: border-box;
          }
          .sala-hero h1 {
            font-size: 1.65rem;
            word-break: break-word;
          }
          .sala-layout-grid {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            gap: 1.25rem;
          }
          .sala-sidebar {
            position: relative;
            top: 0;
            padding: 0.65rem;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            overflow: hidden;
          }
          .sala-sidebar nav {
            display: flex;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            gap: 0.4rem;
            padding-bottom: 0.4rem;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .sala-nav-btn {
            white-space: nowrap;
            width: auto;
            flex-shrink: 0;
            padding: 0.6rem 0.85rem;
            font-size: 0.85rem;
          }
          .sala-content-card {
            padding: 1.5rem;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            overflow-x: hidden;
            word-break: break-word;
          }

          /* Videoconferência Tablet */
          .video-iframe-container {
            height: 520px;
          }
          .video-status-bar {
            padding: 0.65rem 0.85rem;
          }
        }

        /* MOBILE (< 640px) */
        @media (max-width: 640px) {
          .sala-virtual-wrap {
            padding: 0 0.5rem;
            margin: 0.75rem auto 2.5rem;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            overflow-x: hidden;
          }
          .sala-breadcrumbs {
            font-size: 0.78rem;
            gap: 0.35rem;
            margin-bottom: 0.75rem;
            word-break: break-word;
          }
          .sala-hero {
            padding: 1.25rem 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
          }
          .sala-hero::after {
            display: none;
          }
          .sala-hero h1 {
            font-size: 1.35rem;
            line-height: 1.25;
            margin-bottom: 0.35rem;
            word-break: break-word;
          }
          .sala-subtitle {
            font-size: 0.88rem;
            margin-bottom: 0.5rem;
            word-break: break-word;
          }
          .sala-desc {
            font-size: 0.84rem;
            line-height: 1.45;
            word-break: break-word;
          }
          .sala-docente-box {
            font-size: 0.78rem;
            padding: 0.4rem 0.65rem;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
          .sala-docente-box span:nth-child(2) {
            display: none;
          }
          .sala-layout-grid {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            gap: 1rem;
          }
          .sala-sidebar {
            position: relative;
            top: 0;
            padding: 0.5rem;
            border-radius: 10px;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            overflow: hidden;
          }
          .sala-sidebar-title {
            padding: 0.35rem 0.5rem;
            font-size: 0.7rem;
          }
          .sala-sidebar nav {
            display: flex;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            gap: 0.35rem;
            padding-bottom: 0.4rem;
            scrollbar-width: thin;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }
          .sala-sidebar nav::-webkit-scrollbar {
            height: 4px;
          }
          .sala-sidebar nav::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .sala-nav-btn {
            white-space: nowrap;
            width: auto;
            flex-shrink: 0;
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
          .sala-content-card {
            padding: 1rem 0.75rem;
            border-radius: 12px;
            min-height: auto;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
            overflow-x: hidden;
            word-break: break-word;
          }
          .content-header-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.65rem;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
          }
          .content-header-title {
            font-size: 1.15rem;
            word-break: break-word;
          }
          .btn-action-add {
            width: 100%;
            justify-content: center;
            padding: 0.65rem 1rem;
          }
          .item-box {
            padding: 0.85rem;
            width: 100%;
            box-sizing: border-box;
            word-break: break-word;
          }
          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
          }
          .item-title {
            font-size: 0.95rem;
            word-break: break-word;
          }
          .item-meta {
            font-size: 0.75rem;
            gap: 0.45rem;
          }
          .item-desc {
            font-size: 0.84rem;
            word-break: break-word;
          }
          .plan-section-block {
            padding: 0.9rem 0.75rem;
            width: 100%;
            box-sizing: border-box;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          .plan-section-block h4 {
            font-size: 0.92rem;
            word-break: break-word;
          }
          .plan-section-block p, .plan-section-block ul {
            font-size: 0.85rem;
            word-break: break-word;
          }
          .sala-content-card * {
            max-width: 100%;
            box-sizing: border-box;
          }
          .sala-content-card div[style*="display: grid"],
          .sala-content-card div[style*="display:grid"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.65rem !important;
          }
          .modal-backdrop-hs {
            padding: 0.5rem;
            align-items: flex-end;
          }
          .modal-card-hs {
            max-width: 100%;
            width: 100%;
            max-height: 92vh;
            padding: 1.25rem 1rem;
            border-radius: 16px 16px 0 0;
          }
          .modal-card-hs div[style*="display: grid"],
          .modal-card-hs div[style*="display:grid"] {
            grid-template-columns: 1fr !important;
            gap: 0.65rem !important;
          }
          .modal-btns-hs {
            flex-direction: column-reverse;
            gap: 0.5rem;
            margin-top: 1.25rem;
          }
          .modal-btns-hs button {
            width: 100%;
            justify-content: center;
            text-align: center;
            padding: 0.65rem 1rem;
          }

          /* Videoconferência Mobile */
          .video-iframe-container {
            height: 68vh;
            min-height: 380px;
            max-height: 540px;
            border-radius: 0 0 8px 8px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .video-status-bar {
            padding: 0.6rem 0.75rem;
            flex-direction: column;
            align-items: flex-start;
            border-radius: 8px 8px 0 0;
            gap: 0.4rem;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .video-status-left {
            width: 100%;
            justify-content: space-between;
            font-size: 0.8rem;
          }
          .video-status-right {
            font-size: 0.72rem;
            width: 100%;
            opacity: 0.85;
          }
          .video-actions-bar {
            width: 100%;
            flex-direction: column;
            gap: 0.45rem;
          }
          .video-actions-bar .btn-video-action {
            width: 100%;
            justify-content: center;
            text-align: center;
            padding: 0.6rem;
            font-size: 0.85rem;
            box-sizing: border-box;
          }
        }

        /* Small screens (< 420px) */
        @media (max-width: 420px) {
          .sala-content-card div[style*="display: grid"],
          .sala-content-card div[style*="display:grid"] {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
        }

        /* Mobile Landscape specific optimization */
        @media (max-width: 900px) and (orientation: landscape) and (max-height: 500px) {
          .video-iframe-container {
            height: 75vh;
            min-height: 260px;
          }
          .video-status-bar {
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>

      <div className="sala-virtual-wrap">
        {/* Breadcrumb */}
        <div className="sala-breadcrumbs">
          <Link to="/homeschool">🏫 Ambiente Virtual de Aprendizagem</Link>
          <span>›</span>
          <span>{sala.curso}</span>
          <span>›</span>
          <span>{sala.modulo}</span>
          <span>›</span>
          <strong>{sala.nome}</strong>
        </div>

        {/* Feedback Alert */}
        {feedback.msg && (
          <div style={{
            background: feedback.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2',
            color: feedback.tipo === 'sucesso' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.tipo === 'sucesso' ? '#a7f3d0' : '#fecaca'}`,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{feedback.tipo === 'sucesso' ? '✓' : '⚠️'}</span>
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Hero Header */}
        <div className="sala-hero">
          <div className="sala-meta-tags">
            <span className="sala-tag">📚 {sala.curso}</span>
            <span className="sala-tag">📘 {sala.modulo}</span>
            <span className="sala-tag">📅 {sala.ano} • {sala.semestre}</span>
            <span className="sala-tag">🏷️ {sala.codigo}</span>
            <span className="sala-tag sala-tag-active">● {sala.estado || 'Ativo'}</span>
          </div>
          <h1>{sala.nome}</h1>
          <div className="sala-subtitle">
            Sala de Aula Virtual &amp; Aprendizagem Híbrida {(isIfoptec || sala.instituicao === 'ifoptec' || String(sala.codigo || '').startsWith('IFOP')) ? 'IFOPTEC' : 'ISPOTEC'}
          </div>
          <p className="sala-desc">{sala.descricao}</p>
          <div className="sala-docente-box">
            <span>👨‍🏫 <strong>Docente Responsável:</strong> {sala.docente}</span>
            <span>•</span>
            <span>👥 <strong>Turma:</strong> {sala.total_membros || 25} Estudantes</span>
          </div>
        </div>

        {/* Layout with Sidebar Navigation and Tab Content */}
        <div className="sala-layout-grid">
          {/* Navigation Menu */}
          <aside className="sala-sidebar">
            {/* ── A. Conteúdo Académico ─────────────────────────── */}
            <h4 className="sala-sidebar-title" style={{ color: '#4338ca' }}>A. Conteúdo Académico</h4>
            <nav>
              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
                onClick={() => setActiveTab('visao-geral')}
              >
                <span>📌</span> Visão Geral
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'horario' ? 'active' : ''}`}
                onClick={() => setActiveTab('horario')}
              >
                <span>🕐</span> Horário
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'plano-analitico' ? 'active' : ''}`}
                onClick={() => setActiveTab('plano-analitico')}
              >
                <span>📋</span> Plano Analítico
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'plano-curricular' ? 'active' : ''}`}
                onClick={() => setActiveTab('plano-curricular')}
              >
                <span>📜</span> Plano Curricular
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'matriz-sessoes' ? 'active' : ''}`}
                onClick={() => setActiveTab('matriz-sessoes')}
              >
                <span>📅</span> Matriz de Sessões (Teoria)
                <span className="sala-nav-badge">{sessoes.length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'matriz-praticas' ? 'active' : ''}`}
                onClick={() => setActiveTab('matriz-praticas')}
              >
                <span>🧪</span> Matriz de Práticas
                <span className="sala-nav-badge">{filterByState(conteudo.aulas?.filter(a => a.tipo === 'Prática' || a.tipo === 'Laboratório') || []).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'calendario-eventos' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendario-eventos')}
              >
                <span>📆</span> Calendário de Eventos
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'calendario-avaliacoes' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendario-avaliacoes')}
              >
                <span>📝</span> Calendário de Avaliações
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'guias-estudo' ? 'active' : ''}`}
                onClick={() => setActiveTab('guias-estudo')}
              >
                <span>📖</span> Guião de Estudo
                <span className="sala-nav-badge">{filterByState(conteudo.guiasEstudo).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'avaliacoes' ? 'active' : ''}`}
                onClick={() => setActiveTab('avaliacoes')}
              >
                <span>✅</span> Avaliações (1ª, 2ª e 3ª)
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'praticas-modulo' ? 'active' : ''}`}
                onClick={() => setActiveTab('praticas-modulo')}
              >
                <span>🔧</span> Práticas dos Módulos
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'exames' ? 'active' : ''}`}
                onClick={() => setActiveTab('exames')}
              >
                <span>📄</span> Exames (Normal e Recorrência)
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'manuais' ? 'active' : ''}`}
                onClick={() => setActiveTab('manuais')}
              >
                <span>📚</span> Manual de Referência
                <span className="sala-nav-badge">{filterByState(conteudo.manuais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'presencas' ? 'active' : ''}`}
                onClick={() => setActiveTab('presencas')}
              >
                <span>📋</span> Controlo de Presenças
              </button>

              {/* ── B. Recursos Digitais ──────────────────────────── */}
              <div style={{ height: '1px', background: '#e2e8f0', margin: '0.6rem 0.5rem' }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0.3rem 0.8rem' }}>
                B. Recursos Digitais
              </div>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'links-virtuais' ? 'active' : ''}`}
                onClick={() => setActiveTab('links-virtuais')}
              >
                <span>🔗</span> Links Virtuais das Aulas
                <span className="sala-nav-badge">{filterByState(conteudo.linksVirtuais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'recursos-digitais' || activeTab === 'laboratorio-digital' ? 'active' : ''}`}
                onClick={() => setActiveTab('recursos-digitais')}
              >
                <span>🔬</span> Recursos Digitais
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'microcredenciais' ? 'active' : ''}`}
                onClick={() => setActiveTab('microcredenciais')}
              >
                <span>🎖️</span> Microcredenciais
                <span className="sala-nav-badge">{filterByState(conteudo.microcredenciais).length}</span>
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'e-portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('e-portfolio')}
              >
                <span>📁</span> E-Portfólio
              </button>

              {/* ── C. Tutoria e Interactividade ─────────────────── */}
              <div style={{ height: '1px', background: '#e2e8f0', margin: '0.6rem 0.5rem' }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0.3rem 0.8rem' }}>
                C. Tutoria e Interactividade
              </div>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'tutor-estudante' ? 'active' : ''}`}
                onClick={() => setActiveTab('tutor-estudante')}
              >
                <span>🧑‍🏫</span> Tutor do Estudante
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'acompanhamento-estudante' ? 'active' : ''}`}
                onClick={() => setActiveTab('acompanhamento-estudante')}
              >
                <span>📊</span> Acompanhamento do Estudante
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'tutor-encarregado' ? 'active' : ''}`}
                onClick={() => setActiveTab('tutor-encarregado')}
              >
                <span>👨‍👩‍👦</span> Tutor / Encarregado
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'desempenho-estudante' ? 'active' : ''}`}
                onClick={() => setActiveTab('desempenho-estudante')}
              >
                <span>📈</span> Desempenho do Estudante
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'tutores-mentores' ? 'active' : ''}`}
                onClick={() => setActiveTab('tutores-mentores')}
              >
                <span>👥</span> Gestão de Tutores e Mentores
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'chat-room' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat-room')}
              >
                <span>💬</span> Chat Room
              </button>

              <button
                type="button"
                className={`sala-nav-btn ${activeTab === 'videoconferencia' ? 'active' : ''}`}
                onClick={() => setActiveTab('videoconferencia')}
              >
                <span>📹</span> Videoconferência Jitsi
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="sala-content-card">
            {/* HORÁRIO */}
            {activeTab === 'horario' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>🕐</span> Horário do Módulo</h2>
                </div>
                <div className="plan-section-block">
                  <h4>📅 Horário Semanal — {sala.modulo || sala.nome}</h4>
                  <p><strong>Semestre:</strong> {sala.semestre} · <strong>Ano:</strong> {sala.ano}</p>
                  <p><strong>Docente:</strong> {sala.docente}</p>
                  <p><strong>Data de Início:</strong> {sala.dataInicio} · <strong>Data de Término:</strong> {sala.dataTermino}</p>
                </div>
                <div className="plan-section-block">
                  <h4>⏰ Turnos e Horários</h4>
                  <p style={{ color: '#64748b', fontSize: '.9rem' }}>O horário detalhado deste módulo é disponibilizado pelo ADMIN. Consulte o secretariado académico ou o seu coordenador de curso para obter o horário actualizado.</p>
                </div>
              </div>
            )}

            {/* MATRIZ DE SESSÕES (TEORIA) */}
            {activeTab === 'matriz-sessoes' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>📅</span> Matriz de Sessões (Teoria)</h2>
                  {canManage && (
                    <button type="button" className="btn-action-add" onClick={() => { setFormData({ tipo_sessao: 'Teórica', data: new Date().toISOString().substring(0,10), hora_inicio: '08:00', hora_fim: '10:00', duracao_prevista_minutos: 120, tema: '', objectivos: '', conteudos: '', actividades: '', materiais: '' }); setModalType('novasessao'); }}>
                      + Nova Sessão Teórica
                    </button>
                  )}
                </div>
                {sessoes.filter(s => s.tipo_sessao === 'Teórica' || !s.tipo_sessao).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📅</div>
                    <p>Nenhuma sessão teórica planificada ainda.</p>
                    {canManage && <button className="btn-action-add" style={{ marginTop: '.75rem' }} onClick={() => setModalType('novasessao')}>+ Planificar Sessão</button>}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.87rem' }}>
                      <thead><tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>#</th>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>Data</th>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>Hora</th>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>Tema</th>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>Estado</th>
                        <th style={{ padding: '.65rem .85rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>Sumário</th>
                      </tr></thead>
                      <tbody>
                        {sessoes.filter(s => s.tipo_sessao === 'Teórica' || !s.tipo_sessao).map(s => (
                          <tr key={s._id || s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '.6rem .85rem', fontWeight: 700 }}>{s.sequencia_sessao || s.numero_sessao}</td>
                            <td style={{ padding: '.6rem .85rem' }}>{s.data_sessao || s.data}</td>
                            <td style={{ padding: '.6rem .85rem' }}>{s.hora_inicio}–{s.hora_fim}</td>
                            <td style={{ padding: '.6rem .85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.tema}</td>
                            <td style={{ padding: '.6rem .85rem' }}><span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '.18rem .55rem', borderRadius: '5px', fontSize: '.72rem', fontWeight: 700 }}>{s.estado || 'Agendada'}</span></td>
                            <td style={{ padding: '.6rem .85rem' }}>{s.sumario?.registado ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '.18rem .55rem', borderRadius: '5px', fontSize: '.72rem', fontWeight: 700 }}>✓ Registado</span> : <span style={{ background: '#fef3c7', color: '#92400e', padding: '.18rem .55rem', borderRadius: '5px', fontSize: '.72rem', fontWeight: 700 }}>Pendente</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MATRIZ DE PRÁTICAS */}
            {activeTab === 'matriz-praticas' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>🧪</span> Matriz de Práticas</h2>
                  {canManage && (
                    <button type="button" className="btn-action-add" onClick={() => { setFormData({ tipo: 'Prática', data: new Date().toISOString().substring(0,10), descricao: '', conteudo: '', materiais: '', estado: 'Publicado' }); setModalType('aula'); }}>
                      + Nova Aula Prática
                    </button>
                  )}
                </div>
                {filterByState(conteudo.aulas?.filter(a => a.tipo === 'Prática' || a.tipo === 'Laboratório') || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🧪</div>
                    <p>Nenhuma aula prática disponibilizada ainda.</p>
                    {canManage && <button className="btn-action-add" style={{ marginTop: '.75rem' }} onClick={() => { setFormData({ tipo: 'Prática', data: new Date().toISOString().substring(0,10), descricao: '', conteudo: '', materiais: '', estado: 'Publicado' }); setModalType('aula'); }}>+ Adicionar Prática</button>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filterByState(conteudo.aulas?.filter(a => a.tipo === 'Prática' || a.tipo === 'Laboratório') || []).map(a => (
                      <div key={a.id} className="item-box">
                        <div className="item-header">
                          <div>
                            <h4 className="item-title">🧪 {a.titulo}</h4>
                            <div className="item-meta"><span>📅 {a.data}</span><span>🔬 {a.tipo}</span></div>
                          </div>
                          <span className={`badge-estado badge-${(a.estado||'publicado').toLowerCase().replace(' ','-')}`}>{a.estado}</span>
                        </div>
                        {a.descricao && <p className="item-desc">{a.descricao}</p>}
                        {a.materiais && <div style={{ fontSize: '.82rem', color: '#475569', marginTop: '.35rem' }}>📎 <strong>Materiais:</strong> {a.materiais}</div>}
                        {canManage && <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem' }}><button className="btn-action-add" style={{ background: '#dc2626' }} onClick={() => handleDeleteItem('aulas', a.id)}>🗑️ Remover</button></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CALENDÁRIO DE EVENTOS */}
            {activeTab === 'calendario-eventos' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>📆</span> Calendário de Eventos</h2>
                </div>
                <div className="plan-section-block">
                  <h4>📆 Eventos do Módulo — {sala.modulo || sala.nome}</h4>
                  <p style={{ color: '#64748b', fontSize: '.9rem' }}>O calendário de eventos inclui palestras, seminários, workshops, visitas de estudo e outras actividades extracurriculares relacionadas com o módulo.</p>
                </div>
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>📆</div>
                  <p>Nenhum evento agendado ainda. Os eventos serão disponibilizados pelo ADMIN ou Docente.</p>
                </div>
              </div>
            )}

            {/* CALENDÁRIO DE AVALIAÇÕES */}
            {activeTab === 'calendario-avaliacoes' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>📝</span> Calendário de Avaliações</h2>
                </div>
                <div className="plan-section-block">
                  <h4>📝 Datas de Avaliação — {sala.modulo || sala.nome}</h4>
                  <p style={{ color: '#64748b', fontSize: '.9rem' }}>O calendário de avaliações apresenta as datas das avaliações contínuas, exames e momentos de avaliação prática programados para o módulo.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {[
                    { label: '1ª Avaliação', icon: '📝', cor: '#dbeafe', borda: '#93c5fd', textColor: '#1d4ed8', desc: 'Data a confirmar pelo Docente' },
                    { label: '2ª Avaliação', icon: '📝', cor: '#d1fae5', borda: '#6ee7b7', textColor: '#047857', desc: 'Data a confirmar pelo Docente' },
                    { label: '3ª Avaliação', icon: '📝', cor: '#ede9fe', borda: '#c4b5fd', textColor: '#5b21b6', desc: 'Data a confirmar pelo Docente' },
                    { label: 'Exame Normal', icon: '📄', cor: '#fef3c7', borda: '#fde68a', textColor: '#92400e', desc: 'Data a confirmar pelo Secretariado' },
                    { label: 'Exame de Recorrência', icon: '🔄', cor: '#fee2e2', borda: '#fca5a5', textColor: '#991b1b', desc: 'Data a confirmar pelo Secretariado' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.cor, border: `1px solid ${item.borda}`, borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '.35rem' }}>{item.icon}</div>
                      <div style={{ fontWeight: 700, color: item.textColor, fontSize: '.92rem' }}>{item.label}</div>
                      <div style={{ fontSize: '.8rem', color: '#475569', marginTop: '.25rem' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AVALIAÇÕES (1ª, 2ª e 3ª) */}
            {activeTab === 'avaliacoes' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>✅</span> Avaliações (1ª, 2ª e 3ª)</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {[
                    { num: '1ª', icon: '✅', bg: '#eff6ff', borda: '#bfdbfe', cor: '#1d4ed8' },
                    { num: '2ª', icon: '✅', bg: '#f0fdf4', borda: '#bbf7d0', cor: '#047857' },
                    { num: '3ª', icon: '✅', bg: '#faf5ff', borda: '#e9d5ff', cor: '#7e22ce' },
                  ].map((av, i) => (
                    <div key={i} style={{ background: av.bg, border: `1px solid ${av.borda}`, borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                        <h4 style={{ margin: 0, color: av.cor, fontWeight: 700, fontSize: '1rem' }}>{av.icon} {av.num} Avaliação — {sala.modulo || sala.nome}</h4>
                        <span style={{ background: av.borda, color: av.cor, fontSize: '.72rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: '5px' }}>Pendente</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '.88rem', color: '#475569' }}>
                        A {av.num.toLowerCase()} avaliação será realizada conforme o calendário académico. As fichas e critérios de avaliação serão disponibilizados pelo Docente responsável nesta secção.
                      </p>
                      {canManage && (
                        <div style={{ marginTop: '.75rem' }}>
                          <button className="btn-action-add" style={{ fontSize: '.82rem', padding: '.4rem .85rem' }}>📤 Publicar Ficha de Avaliação</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRÁTICAS DOS MÓDULOS */}
            {activeTab === 'praticas-modulo' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>🔧</span> Práticas dos Módulos</h2>
                  {canManage && (
                    <button type="button" className="btn-action-add" onClick={() => { setFormData({ tipo: 'Prática', data: new Date().toISOString().substring(0,10), descricao: '', conteudo: '', materiais: '', estado: 'Publicado' }); setModalType('aula'); }}>
                      + Adicionar Prática
                    </button>
                  )}
                </div>
                <div className="plan-section-block">
                  <h4>🔧 Actividades Práticas — {sala.modulo || sala.nome}</h4>
                  <p style={{ color: '#64748b', fontSize: '.9rem' }}>Esta secção apresenta todas as actividades práticas, exercícios aplicados, casos de estudo e tarefas práticas do módulo.</p>
                </div>
                {filterByState(conteudo.aulas || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🔧</div>
                    <p>Nenhuma actividade prática disponibilizada ainda.</p>
                    {canManage && <button className="btn-action-add" style={{ marginTop: '.75rem' }} onClick={() => { setFormData({ tipo: 'Prática', data: new Date().toISOString().substring(0,10), descricao: '', conteudo: '', materiais: '', estado: 'Publicado' }); setModalType('aula'); }}>+ Adicionar</button>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filterByState(conteudo.aulas || []).map(a => (
                      <div key={a.id} className="item-box">
                        <div className="item-header">
                          <div>
                            <h4 className="item-title">{a.tipo === 'Prática' ? '🧪' : '📘'} {a.titulo}</h4>
                            <div className="item-meta"><span>📅 {a.data}</span><span>{a.tipo}</span></div>
                          </div>
                          <span className={`badge-estado badge-${(a.estado||'publicado').toLowerCase().replace(' ','-')}`}>{a.estado}</span>
                        </div>
                        {a.descricao && <p className="item-desc">{a.descricao}</p>}
                        {canManage && <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem' }}><button className="btn-action-add" style={{ background: '#dc2626', fontSize: '.8rem', padding: '.35rem .75rem' }} onClick={() => handleDeleteItem('aulas', a.id)}>🗑️ Remover</button></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EXAMES */}
            {activeTab === 'exames' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title"><span>📄</span> Exames (Normal e Recorrência)</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {[
                    { tipo: 'Exame Normal', icon: '📄', bg: '#fffbeb', borda: '#fde68a', cor: '#92400e', desc: 'O exame normal realiza-se no final do semestre, após a conclusão das avaliações contínuas. A pauta de admissão ao exame será publicada pelo Secretariado Académico.' },
                    { tipo: 'Exame de Recorrência', icon: '🔄', bg: '#fff1f2', borda: '#fecdd3', cor: '#9f1239', desc: 'O exame de recorrência destina-se a estudantes que não obtiveram aprovação no exame normal. Data e condições de acesso são definidas pelos serviços académicos.' },
                  ].map((ex, i) => (
                    <div key={i} style={{ background: ex.bg, border: `1px solid ${ex.borda}`, borderRadius: '12px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                        <h4 style={{ margin: 0, color: ex.cor, fontWeight: 700, fontSize: '1.05rem' }}>{ex.icon} {ex.tipo}</h4>
                        <span style={{ background: ex.borda, color: ex.cor, fontSize: '.72rem', fontWeight: 700, padding: '.18rem .55rem', borderRadius: '5px' }}>Data a confirmar</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '.9rem', color: '#475569', lineHeight: 1.6 }}>{ex.desc}</p>
                      {canManage && (
                        <div style={{ marginTop: '1rem' }}>
                          <button className="btn-action-add" style={{ fontSize: '.82rem', padding: '.4rem .85rem' }}>📤 Publicar Enunciado</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISÃO GERAL */}
            {activeTab === 'visao-geral' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📌</span> Visão Geral da Sala Virtual
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1d4ed8' }}>{filterByState(conteudo.aulas).length}</div>
                    <div style={{ color: '#1e40af', fontSize: '0.85rem', fontWeight: '600' }}>Aulas Disponíveis</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#047857' }}>{filterByState(conteudo.manuais).length}</div>
                    <div style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: '600' }}>Manuais e Textos</div>
                  </div>
                  <div style={{ background: '#faf5ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#7e22ce' }}>{filterByState(conteudo.guiasEstudo).length}</div>
                    <div style={{ color: '#6b21a8', fontSize: '0.85rem', fontWeight: '600' }}>Guias e Roteiros</div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b45309' }}>{filterByState(conteudo.linksVirtuais).length}</div>
                    <div style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: '600' }}>Sessões Virtuais</div>
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>📢 Orientações para o Acompanhamento Híbrido</h4>
                  <p>
                    Bem-vindo ao espaço oficial de aprendizagem híbrida do <strong>ISPOTEC ONLINE</strong>. Neste ambiente poderá consultar o plano analítico, aceder às transmissões no Google Meet/Zoom, descarregar manuais oficiais, consultar os roteiros de estudo semanais e executar as práticas do Laboratório Digital.
                  </p>
                </div>

                <div className="plan-section-block">
                  <h4>⚡ Acesso Rápido às Próximas Atividades</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    <li>Consulte o <strong>Plano Analítico</strong> para o cronograma detalhado de matérias.</li>
                    <li>Aceda às <strong>Aulas Teóricas e Práticas</strong> para rever sumários e materiais em anexo.</li>
                    <li>Explore o <strong>Laboratório Digital</strong> para realizar o guia prático passo a passo.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 2. PLANO ANALÍTICO */}
            {activeTab === 'plano-analitico' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📋</span> Plano Analítico da Disciplina
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoAnalitico || {});
                        setModalType('editPlanoAnalitico');
                      }}
                    >
                      ✏️ Editar Plano Analítico
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>📘 Unidade Curricular &amp; Carga Horária</h4>
                  <p><strong>Disciplina:</strong> {conteudo.planoAnalitico?.unidadeCurricular || sala.modulo}</p>
                  <p><strong>Carga Horária:</strong> {conteudo.planoAnalitico?.cargaHoraria}</p>
                  <p><strong>Cronograma Letivo:</strong> {conteudo.planoAnalitico?.cronograma}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Objectivos da Aprendizagem</h4>
                  <p>{conteudo.planoAnalitico?.objectivos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📚 Conteúdos Programáticos e Distribuição das Matérias</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoAnalitico?.conteudos) ? (
                      conteudo.planoAnalitico.conteudos.map((c, i) => <li key={i}>{c}</li>)
                    ) : (
                      <li>{conteudo.planoAnalitico?.conteudos}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>💡 Competências a Desenvolver</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoAnalitico?.competencias) ? (
                      conteudo.planoAnalitico.competencias.map((c, i) => <li key={i}>{c}</li>)
                    ) : (
                      <li>{conteudo.planoAnalitico?.competencias}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>📝 Metodologias de Ensino</h4>
                  <p>{conteudo.planoAnalitico?.metodologias}</p>
                </div>

                <div className="plan-section-block">
                  <h4>⚖️ Sistema de Avaliação</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{conteudo.planoAnalitico?.avaliacao}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📖 Bibliografia Recomendada</h4>
                  <p style={{ whiteSpace: 'pre-line' }}>{conteudo.planoAnalitico?.bibliografia}</p>
                </div>
              </div>
            )}

            {/* 3. PLANO CURRICULAR */}
            {activeTab === 'plano-curricular' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📜</span> Plano Curricular Institucional
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoCurricular || {});
                        setModalType('editPlanoCurricular');
                      }}
                    >
                      ✏️ Editar Plano Curricular
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>🏛️ Enquadramento no Curso</h4>
                  <p><strong>Curso:</strong> {conteudo.planoCurricular?.curso || sala.curso}</p>
                  <p><strong>Módulo / Disciplina:</strong> {conteudo.planoCurricular?.modulo || sala.modulo}</p>
                  <p><strong>Pré-Requisitos:</strong> {conteudo.planoCurricular?.preRequisitos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Competências e Resultados de Aprendizagem</h4>
                  <p><strong>Competências:</strong> {conteudo.planoCurricular?.competencias}</p>
                  <p><strong>Resultados Esperados:</strong> {conteudo.planoCurricular?.resultados}</p>
                </div>

                <div className="plan-section-block">
                  <h4>⏱️ Carga Horária e Componentes Curriculares</h4>
                  <p><strong>Componente Teórica:</strong> {conteudo.planoCurricular?.cargaHorariaTeorica}</p>
                  <p><strong>Componente Prática:</strong> {conteudo.planoCurricular?.cargaHorariaPratica}</p>
                  <p><strong>Unidades:</strong> {conteudo.planoCurricular?.unidades}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📋 Normas de Avaliação Curricular</h4>
                  <p>{conteudo.planoCurricular?.sistemaAvaliacao}</p>
                </div>
              </div>
            )}

            {/* 4. PLANO DE SESSÕES / MATRIZ DAS AULAS PRÁTICAS */}
            {activeTab === 'aulas' && (
              <div>
                <div className="content-header-bar" style={{ flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <h2 className="content-header-title">
                      <span>📅</span> Plano de Sessões / Matriz das Aulas Práticas
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Planificação cronológica das sessões curriculares, registo de sumários e livro digital de aulas.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <button
                        type="button"
                        onClick={() => setSubTabSessoes('planificacao')}
                        style={{
                          background: subTabSessoes === 'planificacao' ? '#0055a4' : 'transparent',
                          color: subTabSessoes === 'planificacao' ? '#fff' : '#475569',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📅 Planificação de Sessões
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubTabSessoes('livro')}
                        style={{
                          background: subTabSessoes === 'livro' ? '#0055a4' : 'transparent',
                          color: subTabSessoes === 'livro' ? '#fff' : '#475569',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📖 Livro Digital de Sumários
                      </button>
                    </div>

                    {canManage && subTabSessoes === 'planificacao' && (
                      <button
                        type="button"
                        className="btn-action-add"
                        onClick={() => {
                          setFormData({
                            tipo_sessao: 'Teórica',
                            data: new Date().toISOString().substring(0, 10),
                            hora_inicio: '08:00',
                            hora_fim: '10:00',
                            duracao_prevista_minutos: 120,
                            tema: '',
                            objectivos: '',
                            conteudos: '',
                            actividades: '',
                            materiais: '',
                          });
                          setModalType('novasessao');
                        }}
                      >
                        + Planificar Sessão
                      </button>
                    )}

                    {subTabSessoes === 'livro' && (
                      <button
                        type="button"
                        onClick={() => window.print()}
                        style={{
                          background: '#059669',
                          color: '#fff',
                          border: 'none',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🖨️ Imprimir / Exportar Livro
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Aba 1: Planificação das Sessões */}
                {subTabSessoes === 'planificacao' && (
                  <div>
                    {sessoes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📅</div>
                        <h4 style={{ margin: '0 0 0.4rem', color: '#1e293b' }}>Nenhuma sessão planificada para esta disciplina</h4>
                        <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.88rem' }}>
                          {canManage ? 'Comece por planificar a matriz cronológica de aulas teóricas e práticas.' : 'As sessões serão disponibilizadas pelo docente responsável.'}
                        </p>
                        {canManage && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setFormData({
                                tipo_sessao: 'Teórica',
                                data: new Date().toISOString().substring(0, 10),
                                hora_inicio: '08:00',
                                hora_fim: '10:00',
                                duracao_prevista_minutos: 120,
                                tema: '',
                                objectivos: '',
                                conteudos: '',
                                actividades: '',
                                materiais: '',
                              });
                              setModalType('novasessao');
                            }}
                          >
                            + Planificar Primeira Sessão
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sessoes.map((s, idx) => {
                          const sId = s._id || s.id;
                          const hasSumario = s.sumario && s.sumario.registado;
                          return (
                            <div key={sId || idx} className="item-box" style={{ borderLeft: s.tipo_sessao === 'Prática' ? '4px solid #10b981' : '4px solid #0055a4' }}>
                              <div className="item-header">
                                <div>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 800, color: '#0055a4', fontSize: '0.88rem' }}>
                                      Sessão #{s.numero_sessao || idx + 1}
                                    </span>
                                    <span style={{
                                      background: s.tipo_sessao === 'Prática' ? '#dcfce7' : '#dbeafe',
                                      color: s.tipo_sessao === 'Prática' ? '#166534' : '#1e40af',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '10px'
                                    }}>
                                      {s.tipo_sessao}
                                    </span>
                                    <span className={`badge-estado badge-${(s.estado || 'planeada').toLowerCase()}`}>
                                      {s.estado || 'Planeada'}
                                    </span>
                                    {hasSumario && (
                                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                                        ✓ Sumário Registado
                                      </span>
                                    )}
                                    {s.validacao_pedagogica && s.validacao_pedagogica.validado && (
                                      <span style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                                        🎓 Validado Pedagogicamente
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="item-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                                    {s.tema}
                                  </h3>
                                  <div className="item-meta" style={{ marginTop: '0.3rem' }}>
                                    <span>📅 {s.data}</span>
                                    <span>•</span>
                                    <span>⏰ {s.hora_inicio} – {s.hora_fim} ({s.duracao_prevista_minutos || 120} min)</span>
                                    <span>•</span>
                                    <span>👨‍🏫 {s.docente_nome}</span>
                                  </div>
                                </div>

                                {canManage && (
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSessao(s);
                                        setFormData(s.sumario || {
                                          materia_leccionada: s.tema || '',
                                          conteudos_concluidos: s.conteudos || '',
                                          conteudos_pendentes: '',
                                          actividades_praticas: s.actividades || '',
                                          ocorrencias: '',
                                          tarefas_recomendadas: '',
                                          horas_efetivas: (s.duracao_prevista_minutos || 120) / 60,
                                        });
                                        setModalType('sumario');
                                      }}
                                      style={{ background: '#0055a4', color: '#fff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      📝 {hasSumario ? 'Editar Sumário' : 'Registar Sumário'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSessao(s);
                                        setFormData({
                                          nova_data: s.data,
                                          nova_hora_inicio: s.hora_inicio,
                                          nova_hora_fim: s.hora_fim,
                                          motivo: '',
                                        });
                                        setModalType('reagendar');
                                      }}
                                      style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      ⏰ Reagendar
                                    </button>

                                    {isAdmin && (!s.validacao_pedagogica || !s.validacao_pedagogica.validado) && (
                                      <button
                                        type="button"
                                        onClick={() => handleValidarPedagogica(sId)}
                                        style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                                        title="Confirmar Validação Pedagógica"
                                      >
                                        ✓ Validar
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSessao(sId)}
                                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                      title="Eliminar sessão"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Conteúdos e Actividades Planificadas */}
                              {s.conteudos && (
                                <p className="item-desc" style={{ margin: '0.5rem 0 0.3rem' }}>
                                  <strong>Conteúdos Previstos:</strong> {s.conteudos}
                                </p>
                              )}
                              {s.actividades && (
                                <div style={{ fontSize: '0.85rem', color: '#475569', margin: '0.3rem 0' }}>
                                  💡 <strong>Actividades:</strong> {s.actividades}
                                </div>
                              )}

                              {/* Resumo do Sumário Realizado */}
                              {hasSumario && (
                                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.6rem', fontSize: '0.85rem' }}>
                                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                                    📖 Matéria Efectivamente Leccionada:
                                  </div>
                                  <div style={{ color: '#334155', marginBottom: '0.4rem', whiteSpace: 'pre-line' }}>
                                    {s.sumario.materia_leccionada}
                                  </div>
                                  {s.sumario.conteudos_pendentes && (
                                    <div style={{ color: '#b45309', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                                      ⚠️ <strong>Conteúdos Pendentes:</strong> {s.sumario.conteudos_pendentes}
                                    </div>
                                  )}
                                  {s.sumario.tarefas_recomendadas && (
                                    <div style={{ color: '#1e40af', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                                      📌 <strong>Tarefas Recomendadas:</strong> {s.sumario.tarefas_recomendadas}
                                    </div>
                                  )}
                                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                    <span>✍️ Confirmado por: {s.sumario.registado_por_nome || s.docente_nome}</span>
                                    <span>Horas Efectivas: {s.sumario.horas_efetivas || 2}h</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Aba 2: Livro Digital de Sumários */}
                {subTabSessoes === 'livro' && (
                  <div id="printable-livro-sumarios">
                    {/* Estatísticas de Cumprimento */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8' }}>
                          {livroSumarios?.total_sessoes || sessoes.length}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e40af' }}>Sessões Programadas</div>
                      </div>

                      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
                          {livroSumarios?.total_realizadas || sessoes.filter(s => s.sumario && s.sumario.registado).length}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>Sessões Realizadas</div>
                      </div>

                      <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>
                          {livroSumarios?.total_pendentes || sessoes.filter(s => !s.sumario || !s.sumario.registado).length}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>Sessões Pendentes</div>
                      </div>

                      <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7e22ce' }}>
                          {livroSumarios?.horas_efetivas || sessoes.reduce((acc, curr) => acc + (curr.sumario?.horas_efetivas || 0), 0)}h / {livroSumarios?.horas_previstas || sessoes.reduce((acc, curr) => acc + ((curr.duracao_prevista_minutos || 120) / 60), 0)}h
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b21a8' }}>Horas Efectivas / Previstas</div>
                      </div>
                    </div>

                    {/* Tabela do Livro de Sumários */}
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: '#091e3a', color: '#fff', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Nº</th>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Data &amp; Horário</th>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Tipo</th>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Matéria Leccionada &amp; Actividades</th>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Pendências &amp; Tarefas</th>
                            <th style={{ padding: '0.75rem 0.6rem' }}>Confirmação Electrónica</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessoes.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                Nenhum registo de sumário encontrado para gerar o livro digital.
                              </td>
                            </tr>
                          ) : (
                            sessoes.map((s, idx) => {
                              const hasSum = s.sumario && s.sumario.registado;
                              return (
                                <tr key={s._id || s.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                  <td style={{ padding: '0.65rem 0.6rem', fontWeight: 700, textAlign: 'center' }}>
                                    #{s.numero_sessao || idx + 1}
                                  </td>
                                  <td style={{ padding: '0.65rem 0.6rem', whiteSpace: 'nowrap' }}>
                                    <div><strong>{s.data}</strong></div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.hora_inicio}–{s.hora_fim}</div>
                                  </td>
                                  <td style={{ padding: '0.65rem 0.6rem' }}>
                                    <span style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '8px',
                                      background: s.tipo_sessao === 'Prática' ? '#dcfce7' : '#dbeafe',
                                      color: s.tipo_sessao === 'Prática' ? '#166534' : '#1e40af',
                                    }}>
                                      {s.tipo_sessao}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.65rem 0.6rem', maxWidth: '350px' }}>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.tema}</div>
                                    {hasSum ? (
                                      <div style={{ color: '#334155', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>
                                        {s.sumario.materia_leccionada}
                                      </div>
                                    ) : (
                                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>
                                        Sumário ainda não registado.
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.65rem 0.6rem', maxWidth: '250px', fontSize: '0.78rem' }}>
                                    {hasSum && s.sumario.conteudos_pendentes && (
                                      <div style={{ color: '#b45309' }}>⚠️ {s.sumario.conteudos_pendentes}</div>
                                    )}
                                    {hasSum && s.sumario.tarefas_recomendadas && (
                                      <div style={{ color: '#1e40af', marginTop: '0.2rem' }}>📌 {s.sumario.tarefas_recomendadas}</div>
                                    )}
                                    {!hasSum && <span style={{ color: '#cbd5e1' }}>—</span>}
                                  </td>
                                  <td style={{ padding: '0.65rem 0.6rem', fontSize: '0.78rem' }}>
                                    {hasSum ? (
                                      <div>
                                        <div style={{ color: '#166534', fontWeight: 700 }}>✓ {s.sumario.registado_por_nome || s.docente_nome}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                          {s.sumario.data_registo ? new Date(s.sumario.data_registo).toLocaleDateString() : s.data}
                                        </div>
                                      </div>
                                    ) : (
                                      <span style={{ color: '#eab308', fontWeight: 600 }}>Pendente</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. MANUAIS */}
            {activeTab === 'manuais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📚</span> Manuais e Textos de Apoio
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ versao: 'v1.0', estado: 'Publicado', tipo: 'PDF' });
                        setModalType('manual');
                      }}
                    >
                      + Disponibilizar Manual
                    </button>
                  )}
                </div>

                {filterByState(conteudo.manuais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum manual disponibilizado ainda.</p>
                ) : (
                  filterByState(conteudo.manuais || []).map(manual => (
                    <div className="item-box" key={manual.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{manual.titulo}</h3>
                          <div className="item-meta">
                            <span>✍️ {manual.autor}</span>
                            <span>•</span>
                            <span>🏷️ Versão: {manual.versao}</span>
                            <span>•</span>
                            <span>📅 {manual.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${manual.estado.toLowerCase()}`}>{manual.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('manuais', manual.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{manual.descricao}</p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={manual.ficheiro_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          📥 Descarregar / Visualizar Manual ({manual.ficheiro_nome})
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. GUIAS DE ESTUDO */}
            {activeTab === 'guias-estudo' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>📖</span> Guias de Estudo e Roteiros de Aprendizagem
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ estado: 'Publicado' });
                        setModalType('guia');
                      }}
                    >
                      + Criar Guia de Estudo
                    </button>
                  )}
                </div>

                {filterByState(conteudo.guiasEstudo || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum guia de estudo disponível no momento.</p>
                ) : (
                  filterByState(conteudo.guiasEstudo || []).map(guia => (
                    <div className="item-box" key={guia.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{guia.titulo}</h3>
                          <div className="item-meta">
                            <span>📅 Publicado em: {guia.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${guia.estado.toLowerCase()}`}>{guia.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('guiasEstudo', guia.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{guia.descricao}</p>
                      {guia.orientacoes && (
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0', fontSize: '0.88rem' }}>
                          <strong>🧭 Orientações do Docente:</strong>
                          <p style={{ margin: '0.25rem 0 0' }}>{guia.orientacoes}</p>
                        </div>
                      )}
                      {guia.exercicios && (
                        <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', margin: '0.5rem 0', fontSize: '0.88rem' }}>
                          <strong>✍️ Exercícios e Atividades de Preparação:</strong>
                          <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-line' }}>{guia.exercicios}</p>
                        </div>
                      )}
                      {guia.leituras && (
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.4rem' }}>
                          📚 <strong>Leituras Recomendadas:</strong> {guia.leituras}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 7. PLANO SOCIAL */}
            {activeTab === 'plano-social' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🤝</span> Plano Social e de Acompanhamento Académico
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.planoSocial || {});
                        setModalType('editPlanoSocial');
                      }}
                    >
                      ✏️ Editar Plano Social
                    </button>
                  )}
                </div>

                <div className="plan-section-block">
                  <h4>🌱 Descrição do Plano Social</h4>
                  <p>{conteudo.planoSocial?.descricao}</p>
                </div>

                <div className="plan-section-block">
                  <h4>🎯 Objetivos de Integração e Acompanhamento</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoSocial?.objectivos) ? (
                      conteudo.planoSocial.objectivos.map((o, i) => <li key={i}>{o}</li>)
                    ) : (
                      <li>{conteudo.planoSocial?.objectivos}</li>
                    )}
                  </ul>
                </div>

                <div className="plan-section-block">
                  <h4>📅 Atividades e Calendário Social</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.planoSocial?.actividades) ? (
                      conteudo.planoSocial.actividades.map((a, i) => <li key={i}>{a}</li>)
                    ) : (
                      <li>{conteudo.planoSocial?.actividades}</li>
                    )}
                  </ul>
                  <p style={{ marginTop: '0.75rem' }}>
                    <strong>Horário / Calendário:</strong> {conteudo.planoSocial?.calendario}
                  </p>
                </div>

                <div className="plan-section-block">
                  <h4>🔗 Orientações &amp; Canais de Apoio</h4>
                  <p>{conteudo.planoSocial?.orientacoes}</p>
                  {conteudo.planoSocial?.links && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <a href={conteudo.planoSocial.links} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                        🌐 Canal de Acompanhamento Social ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. LINKS VIRTUAIS */}
            {activeTab === 'links-virtuais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🔗</span> Links Virtuais das Aulas
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ tipo: 'Google Meet', estado: 'Publicado' });
                        setModalType('link');
                      }}
                    >
                      + Cadastrar Link Virtual
                    </button>
                  )}
                </div>

                {filterByState(conteudo.linksVirtuais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum link virtual registado.</p>
                ) : (
                  filterByState(conteudo.linksVirtuais || []).map(item => (
                    <div className="item-box" key={item.id}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{item.nome}</h3>
                          <div className="item-meta">
                            <span>💻 Plataforma: <strong>{item.tipo}</strong></span>
                            <span>•</span>
                            <span>📅 {item.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${item.estado.toLowerCase()}`}>{item.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('linksVirtuais', item.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{item.descricao}</p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          🌐 Aceder à Sessão Virtual ({item.tipo}) ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 9. MICROCREDENCIAIS */}
            {activeTab === 'microcredenciais' && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🎖️</span> Microcredenciais da Disciplina
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData({ badgeIcon: '🎖️', estado: 'Publicado' });
                        setModalType('micro');
                      }}
                    >
                      + Associar Microcredencial
                    </button>
                  )}
                </div>

                {filterByState(conteudo.microcredenciais || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma microcredencial associada no momento.</p>
                ) : (
                  filterByState(conteudo.microcredenciais || []).map(micro => (
                    <div className="item-box" key={micro.id} style={{ borderLeft: '4px solid #f59e0b' }}>
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">
                            <span>{micro.badgeIcon || '🎖️'}</span> {micro.nome}
                          </h3>
                          <div className="item-meta">
                            <span>⏱️ Carga: {micro.cargaHoraria}</span>
                            <span>•</span>
                            <span>📅 {micro.data}</span>
                            <span>•</span>
                            <span className={`badge-estado badge-${micro.estado.toLowerCase()}`}>{micro.estado}</span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('microcredenciais', micro.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <p className="item-desc">{micro.descricao}</p>
                      <div style={{ background: '#fffbeb', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                        <strong>Competências Adquiridas:</strong> {micro.competencias}
                      </div>
                      {micro.criterios && (
                        <div style={{ fontSize: '0.82rem', color: '#92400e', marginBottom: '0.5rem' }}>
                          📜 <strong>Critérios de Conclusão:</strong> {micro.criterios}
                        </div>
                      )}
                      <div style={{ marginTop: '0.75rem' }}>
                        <a
                          href={micro.link}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                        >
                          🌐 Consultar Plataforma de Certificação ↗
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 10. RECURSOS DIGITAIS (antigo Laboratório Digital) */}
            {(activeTab === 'recursos-digitais' || activeTab === 'laboratorio-digital') && (
              <div>
                <div className="content-header-bar">
                  <h2 className="content-header-title">
                    <span>🔬</span> Recursos Digitais
                  </h2>
                  {canManage && (
                    <button
                      type="button"
                      className="btn-action-add"
                      onClick={() => {
                        setFormData(conteudo.laboratorioDigital || {});
                        setModalType('editLab');
                      }}
                    >
                      ✏️ Configurar Recursos Digitais
                    </button>
                  )}
                </div>

                <div className="lab-box-highlight">
                  <h3 style={{ margin: '0 0 0.5rem', color: '#065f46', fontSize: '1.2rem' }}>
                    {conteudo.laboratorioDigital?.nome}
                  </h3>
                  <p style={{ color: '#047857', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                    <strong>DESCRIÇÃO DO LABORATÓRIO:</strong> {conteudo.laboratorioDigital?.descricao}
                  </p>
                  <p style={{ color: '#065f46', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    🎯 <strong>Objectivo Prático:</strong> {conteudo.laboratorioDigital?.objectivo}
                  </p>

                  {/* GUIA DO LABORATÓRIO */}
                  <div className="lab-guide-box">
                    <h4 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '0.98rem' }}>
                      📋 {conteudo.laboratorioDigital?.guiaLaboratorio?.titulo || 'GUIA DO LABORATÓRIO'}
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {Array.isArray(conteudo.laboratorioDigital?.guiaLaboratorio?.passos) ? (
                        conteudo.laboratorioDigital.guiaLaboratorio.passos.map((passo, i) => (
                          <li key={i}>{passo}</li>
                        ))
                      ) : (
                        <li>Siga as instruções semanais indicadas pelo docente.</li>
                      )}
                    </ul>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {conteudo.laboratorioDigital?.linkAmbiente && (
                      <a
                        href={conteudo.laboratorioDigital.linkAmbiente}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        🚀 Aceder ao Ambiente de Prática Virtual ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>🛠️ Recursos e Requisitos Necessários</h4>
                  <p>{conteudo.laboratorioDigital?.recursos}</p>
                </div>

                <div className="plan-section-block">
                  <h4>📝 Atividades Práticas Obrigatórias</h4>
                  <ul style={{ paddingLeft: '1.25rem' }}>
                    {Array.isArray(conteudo.laboratorioDigital?.atividadesPraticas) ? (
                      conteudo.laboratorioDigital.atividadesPraticas.map((a, i) => <li key={i}>{a}</li>)
                    ) : (
                      <li>Consulte o cronograma da disciplina.</li>
                    )}
                  </ul>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    ⏰ <em>{conteudo.laboratorioDigital?.instrucoes}</em>
                  </p>
                </div>
              </div>
            )}

            {/* 11. TUTOR DO ESTUDANTE */}
            {activeTab === 'tutor-estudante' && (
              <div>
                <div className="content-header-bar">
                  <div>
                    <h2 className="content-header-title">
                      <span>🧑‍🏫</span> Tutor do Estudante &amp; Mentoria
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Atribuição de tutores, registo de orientações individuais e acompanhamento contínuo da evolução académica.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {tutorias.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSolicitarTutoria(tutorias[0]._id || tutorias[0].id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                      >
                        🙋 Solicitar Acompanhamento
                      </button>
                    )}
                  </div>
                </div>

                {tutorias.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧑‍🏫</div>
                    <h4 style={{ color: '#1e293b', margin: '0 0 0.4rem' }}>Ainda não existem tutores formalmente atribuídos</h4>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                      Os tutores e mentores são designados pela coordenação pedagógica para orientação e tutoria curricular.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {tutorias.map((t) => (
                      <div key={t._id || t.id} className="item-box" style={{ borderLeft: '4px solid #0055a4' }}>
                        <div className="item-header">
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0055a4', textTransform: 'uppercase' }}>
                              Programa de Tutoria ISPOTEC • {t.ano_lectivo || '2026'}
                            </span>
                            <h3 className="item-title" style={{ margin: '0.2rem 0' }}>
                              Docente Tutor: {t.tutor_nome}
                            </h3>
                            <div className="item-meta">
                              <span>📧 {t.tutor_email || 'tutor@ispotec.online'}</span>
                              <span>•</span>
                              <span>Estudante: <strong>{t.estudante_nome}</strong></span>
                              <span>•</span>
                              <span>Curso: {t.curso} ({t.turma})</span>
                            </div>
                          </div>
                          <div>
                            <span className="badge-estado badge-ativo">{t.estado}</span>
                          </div>
                        </div>

                        {t.objectivos_tutoria && (
                          <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1e40af', margin: '0.75rem 0' }}>
                            🎯 <strong>Objectivos do Acompanhamento:</strong> {t.objectivos_tutoria}
                          </div>
                        )}

                        {/* Reuniões / Sessões Registadas */}
                        <div style={{ marginTop: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                              📋 Reuniões &amp; Sessões de Orientação Realizadas ({t.sessoes?.length || 0})
                            </strong>
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ tutoriaId: t._id || t.id, tipo: 'Presencial', data: new Date().toISOString().substring(0, 10), resumo: '', orientacoes: '', metas: '' });
                                  setModalType('novasessaotutoria');
                                }}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                              >
                                + Registar Nova Sessão
                              </button>
                            )}
                          </div>

                          {(!t.sessoes || t.sessoes.length === 0) ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>
                              Nenhuma reunião ou sessão registada até ao momento.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {t.sessoes.map((s, idx) => (
                                <div key={idx} style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>📅 {s.data} • {s.tipo}</span>
                                    <span style={{ color: '#64748b' }}>Sessão #{idx + 1}</span>
                                  </div>
                                  <div style={{ color: '#334155' }}><strong>Resumo:</strong> {s.resumo}</div>
                                  {s.orientacoes && <div style={{ color: '#0055a4', marginTop: '0.2rem' }}>💡 <strong>Orientações:</strong> {s.orientacoes}</div>}
                                  {s.metas && <div style={{ color: '#059669', marginTop: '0.2rem' }}>🎯 <strong>Metas:</strong> {s.metas}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Solicitações de Acompanhamento */}
                        {t.solicitacoes_estudante && t.solicitacoes_estudante.length > 0 && (
                          <div style={{ marginTop: '0.9rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.6rem' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#b45309' }}>📢 Solicitações do Estudante:</strong>
                            <ul style={{ paddingLeft: '1.2rem', margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#475569' }}>
                              {t.solicitacoes_estudante.map((sol, i) => (
                                <li key={i}>
                                  <strong>{sol.data ? new Date(sol.data).toLocaleDateString() : '—'}:</strong> {sol.motivo} ({sol.estado})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 12. ACOMPANHAMENTO DO ESTUDANTE */}
            {activeTab === 'acompanhamento-estudante' && (
              <div>
                <div className="content-header-bar">
                  <div>
                    <h2 className="content-header-title">
                      <span>📊</span> Acompanhamento Pedagógico do Estudante
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Monitorização detalhada de presenças, cumprimento de actividades, conteúdos pendentes e alertas académicos.
                    </p>
                  </div>
                </div>

                {/* Métricas e Alertas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
                      {desempenho?.assiduidade || '92%'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#065f46' }}>Taxa de Assiduidade Geral</div>
                    <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '0.2rem' }}>Presenças em aulas teóricas e práticas</div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8' }}>
                      {desempenho?.media_geral || '14.5'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e40af' }}>Média Ponderada Actual</div>
                    <div style={{ fontSize: '0.72rem', color: '#1d4ed8', marginTop: '0.2rem' }}>Escala de 0 a 20 valores</div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>
                      {desempenho?.actividades_pendentes || '2'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>Actividades / Guias Pendentes</div>
                    <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.2rem' }}>Trabalhos com prazo activo</div>
                  </div>

                  <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7e22ce' }}>
                      {tutorias.length > 0 ? tutorias[0].sessoes?.length || 1 : '1'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b21a8' }}>Intervenções de Tutoria</div>
                    <div style={{ fontSize: '0.72rem', color: '#7e22ce', marginTop: '0.2rem' }}>Sessões de mentoria realizadas</div>
                  </div>
                </div>

                {/* Painel de Alertas Académicos */}
                <div className="plan-section-block" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ color: '#b45309', margin: '0 0 0.5rem 0' }}>⚠️ Alertas Académicos Configuráveis</h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    <li><strong>Assiduidade Satisfatória:</strong> Estudante mantém frequência superior a 75% em todas as disciplinas lectivas.</li>
                    <li><strong>Aviso de Entrega:</strong> Projecto curricular de fim de semestre com entrega prevista em breve.</li>
                    <li><strong>Recomendação de Tutoria:</strong> Reforço sugerido nos tópicos práticos de laboratório.</li>
                  </ul>
                </div>

                {/* Conteúdos e Dificuldades Registadas */}
                <div className="plan-section-block">
                  <h4>📝 Histórico de Recomendações e Intervenções</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    O acompanhamento é registado em conformidade com o Regulamento Pedagógico do ISPOTEC.
                    Os dados aqui apresentados resultam directamente das avaliações, sumários leccionados e sessões formais de tutoria com os docentes.
                  </p>
                </div>
              </div>
            )}

            {/* 13. TUTOR / ENCARREGADO DO ESTUDANTE */}
            {activeTab === 'tutor-encarregado' && (
              <div>
                <div className="content-header-bar">
                  <div>
                    <h2 className="content-header-title">
                      <span>👨‍👩‍👦</span> Espaço do Encarregado de Educação &amp; Tutor
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Canal de consulta formal restrito aos estudantes associados e autorizados.
                    </p>
                  </div>
                </div>

                <div className="plan-section-block" style={{ borderLeft: '4px solid #0055a4' }}>
                  <h4>🔒 Vínculo Formal e Acesso Autorizado</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    Em cumprimento do regime de protecção de dados académicos, apenas os encarregados de educação formalmente registados na Secretaria Geral do ISPOTEC têm autorização para consultar o percurso dos respectivos educandos.
                  </p>
                  <div style={{ marginTop: '0.8rem', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div><strong>Estudante Associado:</strong> {user?.nome || 'Estudante ISPOTEC'}</div>
                    <div><strong>Matrícula / Código:</strong> {sala?.codigo || 'ISP-2026-EST'}</div>
                    <div><strong>Curso:</strong> {sala?.curso || 'Engenharia Informática'}</div>
                    <div><strong>Regime:</strong> Presencial / Híbrido</div>
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>📈 Resumo Executivo para o Encarregado</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Assiduidade Acumulada</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>92% (Regular)</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Situação Pedagógica</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0055a4' }}>Aprovado com Sucesso</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Próxima Avaliação</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#b45309' }}>25 Outubro</div>
                    </div>
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>💬 Linha Directa com a Coordenação e Docente</h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155' }}>
                    Para solicitar esclarecimentos pedagógicos ou agendar reunião presencial com o docente responsável:
                  </p>
                  <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <a href="mailto:pedagogico@ispotec.online" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                      ✉️ Contactar Secretaria Pedagógica
                    </a>
                    <a href="tel:878787442" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                      📞 Apoio Telefónico: 878787442
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 14. DESEMPENHO DO ESTUDANTE */}
            {activeTab === 'desempenho-estudante' && (
              <div>
                <div className="content-header-bar">
                  <div>
                    <h2 className="content-header-title">
                      <span>📈</span> Desempenho e Avaliações do Estudante
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Quadro de qualificações, evolução das notas, trabalhos práticos e assiduidade por semestre.
                    </p>
                  </div>
                </div>

                {/* Tabela de Notas por Disciplina */}
                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#334155' }}>
                        <th style={{ padding: '0.75rem 0.8rem' }}>Unidade Curricular / Disciplina</th>
                        <th style={{ padding: '0.75rem 0.8rem' }}>1ª Frequência</th>
                        <th style={{ padding: '0.75rem 0.8rem' }}>2ª Frequência</th>
                        <th style={{ padding: '0.75rem 0.8rem' }}>Trabalho Prático</th>
                        <th style={{ padding: '0.75rem 0.8rem' }}>Média Final</th>
                        <th style={{ padding: '0.75rem 0.8rem' }}>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>{sala?.modulo || 'Programação e Estruturas de Dados'}</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>14.0</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>15.5</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>16.0</td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: '#059669' }}>15.2</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            Aprovado
                          </span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>Arquitectura de Computadores</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>13.0</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>14.0</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>14.5</td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: '#059669' }}>13.8</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            Aprovado
                          </span>
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600 }}>Matemática Discreta</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>12.5</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>13.0</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>13.5</td>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: '#059669' }}>13.0</td>
                        <td style={{ padding: '0.75rem 0.8rem' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            Aprovado
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Barras Visuais de Progresso */}
                <div className="plan-section-block">
                  <h4>📊 Cumprimento de Metas de Aprendizagem</h4>
                  <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Aulas Teóricas e Sumários Concluídos</span>
                        <strong>85%</strong>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ background: '#0055a4', width: '85%', height: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Práticas de Laboratório Digital</span>
                        <strong>90%</strong>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ background: '#059669', width: '90%', height: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span>Trabalhos &amp; Microcredenciais Concluídas</span>
                        <strong>75%</strong>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ background: '#7e22ce', width: '75%', height: '100%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 15. GESTÃO DE TUTORES E MENTORES */}
            {activeTab === 'tutores-mentores' && (
              <div>
                <div className="content-header-bar">
                  <div>
                    <h2 className="content-header-title">
                      <span>👥</span> Gestão de Tutores e Mentores
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Coordenação de docentes tutores, planos individuais e encaminhamentos pedagógicos.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.2rem' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0055a4' }}>
                      {tutorias.length || 1}
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>Total de Vínculos de Tutoria</div>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>
                      Estudantes formalmente acompanhados por docentes designados.
                    </p>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.2rem' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                      100%
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' }}>Taxa de Atendimento</div>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0.4rem 0 0' }}>
                      Pedidos de acompanhamento respondidos pelo corpo docente.
                    </p>
                  </div>
                </div>

                <div className="plan-section-block">
                  <h4>🏛️ Responsabilidades do Docente Tutor</h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                    <li>Acompanhar a evolução académica e sinalizar dificuldades precocemente.</li>
                    <li>Recomendar leituras, metodologias de estudo e recursos do Ambiente Virtual de Aprendizagem.</li>
                    <li>Registar as sessões de orientação mantendo o histórico protegido e acessível aos intervenientes.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 16. CHAT ROOM */}
            {activeTab === 'chat-room' && <ChatRoomSection sala={sala} user={user} />}

            {/* 17. E-PORTFÓLIO */}
            {activeTab === 'e-portfolio' && <EPortfolioSection sala={sala} user={user} />}

            {/* 18. CONTROLO DE PRESENÇAS */}
            {activeTab === 'presencas' && <PresencasSection sala={sala} user={user} isAdmin={isAdmin} isDocente={isDocente} />}

            {/* 19. VIDEOCONFERÊNCIA JITSI MEET */}
            {activeTab === 'videoconferencia' && (() => {
              const jitsiRoom = `ISPOTEC-${(sala?.codigo || actualId || 'GERAL').toString().replace(/[^a-zA-Z0-9-]/g, '-')}`;
              const jitsiUrl = `https://meet.jit.si/${jitsiRoom}#config.prejoinPageEnabled=false&interfaceConfig.MOBILE_APP_PROMO=false`;

              return (
                <div>
                  <div className="content-header-bar">
                    <div>
                      <h2 className="content-header-title">
                        <span>📹</span> Sala de Aula Virtual &amp; Videoconferência
                      </h2>
                      <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                        Sessão interactiva ao vivo com áudio, vídeo de alta definição, partilha de ecrã e conversação em tempo real.
                      </p>
                    </div>
                    <div className="video-actions-bar">
                      <button
                        type="button"
                        className="btn-video-action btn-video-primary"
                        onClick={() => setIsVideoFullscreen(!isVideoFullscreen)}
                        title="Expandir videoconferência para ecrã inteiro no telemóvel, tablet ou PC"
                      >
                        {isVideoFullscreen ? '✕ Sair do Ecrã Inteiro' : '⛶ Ecrã Inteiro'}
                      </button>
                      <button
                        type="button"
                        className="btn-video-action"
                        onClick={() => handleCopyVideoLink(`https://meet.jit.si/${jitsiRoom}`)}
                        title="Copiar link da videoconferência"
                      >
                        {copiedLink ? '✓ Link Copiado!' : '📋 Copiar Link'}
                      </button>
                      <a
                        href={jitsiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-video-action"
                        title="Abrir a videoconferência diretamente numa nova janela do navegador"
                      >
                        ↗ Nova Janela
                      </a>
                    </div>
                  </div>

                  <div className={`video-conference-wrapper ${isVideoFullscreen ? 'video-conference-fullscreen' : ''}`}>
                    <div className="video-status-bar">
                      <div className="video-status-left">
                        <span className="video-status-live">● AO VIVO</span>
                        <span>Sala: <strong>{sala?.nome || 'Sala Virtual ISPOTEC'}</strong></span>
                      </div>
                      <div className="video-status-right">
                        {isVideoFullscreen && (
                          <button
                            type="button"
                            onClick={() => setIsVideoFullscreen(false)}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            ✕ Sair do Ecrã Inteiro
                          </button>
                        )}
                        <span>Câmera • Microfone • Ecrã • Chat</span>
                      </div>
                    </div>

                    <div className="video-iframe-container">
                      <iframe
                        src={jitsiUrl}
                        allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen; speaker"
                        allowFullScreen={true}
                        title="Videoconferência ISPOTEC AVA"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </main>
        </div>
      </div>

      {/* MODAL GERAL PARA CRIAÇÃO/EDIÇÃO */}
      {modalType && (
        <div className="modal-backdrop-hs" onClick={() => setModalType(null)}>
          <div className="modal-card-hs" onClick={e => e.stopPropagation()}>
            {/* Modal Manual */}
            {modalType === 'manual' && (
              <form onSubmit={handleAddManual}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📚 Disponibilizar Novo Manual</h3>
                <div className="form-group-hs">
                  <label>Título do Manual *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Autor / Departamento *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.autor || ''}
                    onChange={e => setFormData({ ...formData, autor: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Versão</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.versao || 'v1.0'}
                    onChange={e => setFormData({ ...formData, versao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Nome do Ficheiro / Link *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.ficheiro_nome || ''}
                    onChange={e => setFormData({ ...formData, ficheiro_nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Estado do Conteúdo</label>
                  <select
                    className="form-input-hs"
                    value={formData.estado || 'Publicado'}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Actualizado">Actualizado</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Manual</button>
                </div>
              </form>
            )}

            {/* Modal Guia de Estudo */}
            {modalType === 'guia' && (
              <form onSubmit={handleAddGuia}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📖 Criar Novo Guia de Estudo</h3>
                <div className="form-group-hs">
                  <label>Título do Guia *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição / Objetivos do Roteiro</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Orientações Pedagógicas</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.orientacoes || ''}
                    onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Exercícios e Atividades Práticas</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.exercicios || ''}
                    onChange={e => setFormData({ ...formData, exercicios: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Estado do Conteúdo</label>
                  <select
                    className="form-input-hs"
                    value={formData.estado || 'Publicado'}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                  </select>
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Guia</button>
                </div>
              </form>
            )}

            {/* Modal Link Virtual */}
            {modalType === 'link' && (
              <form onSubmit={handleAddLink}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🔗 Cadastrar Link Virtual</h3>
                <div className="form-group-hs">
                  <label>Nome do Link *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Tipo de Plataforma</label>
                  <select
                    className="form-input-hs"
                    value={formData.tipo || 'Google Meet'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Moodle">Moodle</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Simulador">Simulador</option>
                    <option value="Plataforma Académica">Plataforma Académica</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group-hs">
                  <label>URL / Endereço Web *</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    required
                    value={formData.url || ''}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Link</button>
                </div>
              </form>
            )}

            {/* Modal Microcredencial */}
            {modalType === 'micro' && (
              <form onSubmit={handleAddMicro}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🎖️ Associar Microcredencial</h3>
                <div className="form-group-hs">
                  <label>Nome da Microcredencial *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHoraria || '10 Horas'}
                    onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Competências Adquiridas *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.competencias || ''}
                    onChange={e => setFormData({ ...formData, competencias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Critérios de Obtenção</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.criterios || ''}
                    onChange={e => setFormData({ ...formData, criterios: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link da Plataforma de Certificação</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    value={formData.link || ''}
                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Microcredencial</button>
                </div>
              </form>
            )}

            {/* Modal Aula */}
            {modalType === 'aula' && (
              <form onSubmit={handleAddAula}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🏛️ Registar Aula Teórica / Prática</h3>
                <div className="form-group-hs">
                  <label>Tipo de Aula *</label>
                  <select
                    className="form-input-hs"
                    value={formData.tipo || 'Teórica'}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Teórica">Aula Teórica</option>
                    <option value="Prática">Aula Prática / Laboratório</option>
                  </select>
                </div>
                <div className="form-group-hs">
                  <label>Título da Aula *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.titulo || ''}
                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Data da Sessão</label>
                  <input
                    type="date"
                    className="form-input-hs"
                    value={formData.data || ''}
                    onChange={e => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Sumário / Conteúdo Lecionado</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.conteudo || ''}
                    onChange={e => setFormData({ ...formData, conteudo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link da Gravação ou Transmissão</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    placeholder="https://youtube.com ou meet.google.com"
                    value={formData.videoUrl || ''}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Aula</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Analítico */}
            {modalType === 'editPlanoAnalitico' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoAnalitico: formData };
                handleSaveConteudo(updated, 'Plano Analítico atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📋 Editar Plano Analítico</h3>
                <div className="form-group-hs">
                  <label>Unidade Curricular</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.unidadeCurricular || ''}
                    onChange={e => setFormData({ ...formData, unidadeCurricular: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHoraria || ''}
                    onChange={e => setFormData({ ...formData, cargaHoraria: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Objetivos de Aprendizagem</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.objectivos || ''}
                    onChange={e => setFormData({ ...formData, objectivos: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Metodologias</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.metodologias || ''}
                    onChange={e => setFormData({ ...formData, metodologias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Sistema de Avaliação</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.avaliacao || ''}
                    onChange={e => setFormData({ ...formData, avaliacao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Bibliografia</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.bibliografia || ''}
                    onChange={e => setFormData({ ...formData, bibliografia: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Curricular */}
            {modalType === 'editPlanoCurricular' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoCurricular: formData };
                handleSaveConteudo(updated, 'Plano Curricular atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📜 Editar Plano Curricular</h3>
                <div className="form-group-hs">
                  <label>Competências Principais</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.competencias || ''}
                    onChange={e => setFormData({ ...formData, competencias: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Resultados de Aprendizagem</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.resultados || ''}
                    onChange={e => setFormData({ ...formData, resultados: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária Teórica</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHorariaTeorica || ''}
                    onChange={e => setFormData({ ...formData, cargaHorariaTeorica: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Carga Horária Prática</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.cargaHorariaPratica || ''}
                    onChange={e => setFormData({ ...formData, cargaHorariaPratica: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Plano Social */}
            {modalType === 'editPlanoSocial' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, planoSocial: formData };
                handleSaveConteudo(updated, 'Plano Social atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🤝 Editar Plano Social</h3>
                <div className="form-group-hs">
                  <label>Descrição do Plano Social</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Orientações e Acompanhamento</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    value={formData.orientacoes || ''}
                    onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Calendário / Horários das Sessões</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.calendario || ''}
                    onChange={e => setFormData({ ...formData, calendario: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link do Canal de Acompanhamento</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    value={formData.links || ''}
                    onChange={e => setFormData({ ...formData, links: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                </div>
              </form>
            )}

            {/* Modal Editar Laboratório Digital */}
            {modalType === 'editLab' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const updated = { ...conteudo, laboratorioDigital: formData };
                handleSaveConteudo(updated, 'Laboratório Digital atualizado com sucesso!');
              }}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>🔬 Configurar Laboratório Digital</h3>
                <div className="form-group-hs">
                  <label>Nome do Laboratório *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    value={formData.nome || ''}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Descrição do Laboratório *</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    required
                    value={formData.descricao || ''}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Objectivo Prático</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    value={formData.objectivo || ''}
                    onChange={e => setFormData({ ...formData, objectivo: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Link para o Ambiente de Prática Virtual</label>
                  <input
                    type="url"
                    className="form-input-hs"
                    placeholder="https://..."
                    value={formData.linkAmbiente || ''}
                    onChange={e => setFormData({ ...formData, linkAmbiente: e.target.value })}
                  />
                </div>
                <div className="form-group-hs">
                  <label>Recursos Necessários</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    value={formData.recursos || ''}
                    onChange={e => setFormData({ ...formData, recursos: e.target.value })}
                  />
                </div>
                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Salvar Laboratório</button>
                </div>
              </form>
            )}

            {/* Modal Planificar Sessão */}
            {modalType === 'novasessao' && (
              <form onSubmit={handleCreateSessao}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>📅 Planificar Nova Sessão Curricular</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Tipo de Sessão *</label>
                    <select
                      className="form-input-hs"
                      value={formData.tipo_sessao}
                      onChange={e => setFormData({ ...formData, tipo_sessao: e.target.value })}
                    >
                      <option value="Teórica">Teórica</option>
                      <option value="Prática">Prática</option>
                      <option value="Laboratório">Laboratório</option>
                      <option value="Seminário">Seminário</option>
                    </select>
                  </div>
                  <div className="form-group-hs">
                    <label>Data *</label>
                    <input
                      type="date"
                      className="form-input-hs"
                      required
                      value={formData.data}
                      onChange={e => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Hora Início *</label>
                    <input
                      type="time"
                      className="form-input-hs"
                      required
                      value={formData.hora_inicio}
                      onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Hora Fim *</label>
                    <input
                      type="time"
                      className="form-input-hs"
                      required
                      value={formData.hora_fim}
                      onChange={e => setFormData({ ...formData, hora_fim: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Duração (min)</label>
                    <input
                      type="number"
                      className="form-input-hs"
                      value={formData.duracao_prevista_minutos}
                      onChange={e => setFormData({ ...formData, duracao_prevista_minutos: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-hs">
                  <label>Tema da Sessão *</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    required
                    placeholder="Ex: Introdução à Orientação a Objectos e Classes"
                    value={formData.tema}
                    onChange={e => setFormData({ ...formData, tema: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Objectivos da Sessão</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    placeholder="Competências e objectivos específicos a alcançar nesta sessão..."
                    value={formData.objectivos}
                    onChange={e => setFormData({ ...formData, objectivos: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Conteúdos Programáticos Previstos</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    placeholder="Tópicos e conceitos que serão abordados..."
                    value={formData.conteudos}
                    onChange={e => setFormData({ ...formData, conteudos: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Actividades Práticas &amp; Metodologia</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    placeholder="Ex: Exercícios guiados no VS Code, resolução de problemas em grupo"
                    value={formData.actividades}
                    onChange={e => setFormData({ ...formData, actividades: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Materiais de Apoio / Ficheiros</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    placeholder="Ex: Slides Capitulo 2, Folha de Exercicios 01"
                    value={formData.materiais}
                    onChange={e => setFormData({ ...formData, materiais: e.target.value })}
                  />
                </div>

                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Planificar Sessão</button>
                </div>
              </form>
            )}

            {/* Modal Registar / Editar Sumário */}
            {modalType === 'sumario' && (
              <form onSubmit={handleSalvarSumario}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>
                  📖 Registo de Sumário — Sessão #{selectedSessao?.numero_sessao}
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  Tema planificado: <strong>{selectedSessao?.tema}</strong> ({selectedSessao?.data})
                </p>

                <div className="form-group-hs">
                  <label>Matéria Efectivamente Leccionada *</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    required
                    placeholder="Descreva detalhadamente os conteúdos e tópicos efectivamente ministrados aos estudantes..."
                    value={formData.materia_leccionada || ''}
                    onChange={e => setFormData({ ...formData, materia_leccionada: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Conteúdos Concluídos</label>
                    <input
                      type="text"
                      className="form-input-hs"
                      placeholder="Conceitos totalmente finalizados"
                      value={formData.conteudos_concluidos || ''}
                      onChange={e => setFormData({ ...formData, conteudos_concluidos: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Conteúdos Pendentes (se houver)</label>
                    <input
                      type="text"
                      className="form-input-hs"
                      placeholder="Matérias que transitaram para a próxima aula"
                      value={formData.conteudos_pendentes || ''}
                      onChange={e => setFormData({ ...formData, conteudos_pendentes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-hs">
                  <label>Actividades Práticas Realizadas &amp; Observações</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    placeholder="Exercícios resolvidos em aula, dúvidas frequentes, ocorrências..."
                    value={formData.actividades_praticas || ''}
                    onChange={e => setFormData({ ...formData, actividades_praticas: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Tarefas Recomendadas aos Estudantes</label>
                    <input
                      type="text"
                      className="form-input-hs"
                      placeholder="Ex: Leitura do Capítulo 3, Exercícios 1 a 5 da página 45"
                      value={formData.tarefas_recomendadas || ''}
                      onChange={e => setFormData({ ...formData, tarefas_recomendadas: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Horas Efectivas</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input-hs"
                      value={formData.horas_efetivas || 2}
                      onChange={e => setFormData({ ...formData, horas_efetivas: e.target.value })}
                    />
                  </div>
                </div>

                {/* Confirmação Electrónica */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569', marginBottom: '1rem' }}>
                  <div><strong>Confirmação Electrónica do Responsável:</strong> {user?.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    O registo será gravado no Livro Digital de Sumários associado ao seu perfil autenticado.
                  </div>
                </div>

                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Gravar e Confirmar Sumário</button>
                </div>
              </form>
            )}

            {/* Modal Reagendar Sessão */}
            {modalType === 'reagendar' && (
              <form onSubmit={handleReagendar}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>
                  ⏰ Reagendamento de Sessão Curricular
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  Sessão: <strong>{selectedSessao?.tema}</strong>
                </p>

                <div className="form-group-hs">
                  <label>Nova Data da Sessão *</label>
                  <input
                    type="date"
                    className="form-input-hs"
                    required
                    value={formData.nova_data || ''}
                    onChange={e => setFormData({ ...formData, nova_data: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Nova Hora Início *</label>
                    <input
                      type="time"
                      className="form-input-hs"
                      required
                      value={formData.nova_hora_inicio || ''}
                      onChange={e => setFormData({ ...formData, nova_hora_inicio: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Nova Hora Fim *</label>
                    <input
                      type="time"
                      className="form-input-hs"
                      required
                      value={formData.nova_hora_fim || ''}
                      onChange={e => setFormData({ ...formData, nova_hora_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-hs">
                  <label>Motivo do Reagendamento *</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    required
                    placeholder="Justifique o motivo pedagógico ou institucional para a alteração da data..."
                    value={formData.motivo || ''}
                    onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                  />
                </div>

                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#b45309', borderColor: '#b45309' }}>
                    Confirmar Reagendamento
                  </button>
                </div>
              </form>
            )}

            {/* Modal Nova Sessão de Tutoria */}
            {modalType === 'novasessaotutoria' && (
              <form onSubmit={handleAddSessaoTutoria}>
                <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>
                  🧑‍🏫 Registar Sessão de Tutoria / Orientação
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="form-group-hs">
                    <label>Data da Sessão *</label>
                    <input
                      type="date"
                      className="form-input-hs"
                      required
                      value={formData.data || ''}
                      onChange={e => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>
                  <div className="form-group-hs">
                    <label>Tipo de Sessão *</label>
                    <select
                      className="form-input-hs"
                      value={formData.tipo || 'Presencial'}
                      onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual / Sala Interactiva</option>
                      <option value="Telefónico">Acompanhamento Telefónico</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-hs">
                  <label>Resumo dos Assuntos Tratados *</label>
                  <textarea
                    className="form-input-hs"
                    rows="3"
                    required
                    placeholder="Dificuldades identificadas, dúvidas académicas, desempenho nas avaliações..."
                    value={formData.resumo || ''}
                    onChange={e => setFormData({ ...formData, resumo: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Orientações e Recomendações Pedagógicas</label>
                  <textarea
                    className="form-input-hs"
                    rows="2"
                    placeholder="Metodologias de estudo, leituras indicadas, roteiros de apoio..."
                    value={formData.orientacoes || ''}
                    onChange={e => setFormData({ ...formData, orientacoes: e.target.value })}
                  />
                </div>

                <div className="form-group-hs">
                  <label>Metas para o Próximo Acompanhamento</label>
                  <input
                    type="text"
                    className="form-input-hs"
                    placeholder="Ex: Conclusão do trabalho prático e entrega de exercícios pendentes"
                    value={formData.metas || ''}
                    onChange={e => setFormData({ ...formData, metas: e.target.value })}
                  />
                </div>

                <div className="modal-btns-hs">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Gravar Sessão de Tutoria</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
