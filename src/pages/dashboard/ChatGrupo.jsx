import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { getFileUrl as resolveFileUrl } from '../../services/api';
import { isImageUrl, getCleanFileName } from '../../components/AttachmentDisplay';

export default function ChatGrupo() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const highlightMsgId = searchParams.get('highlightMsg');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grupo, setGrupo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [texto, setTexto] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);

  // Edit state
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm state
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mention autocomplete
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentions, setSelectedMentions] = useState([]);

  // Active actions menu (long press mobile)
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
  const longPressTimer = useRef(null);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const isAdmin = user && (['admin', 'especialista'].includes(String(user.tipo || '').toLowerCase().trim()));

  const getFileUrl = (path) => {
    if (!path || path === '#') return '#';
    return resolveFileUrl(path);
  };

  const isWithin30Mins = (dateStr) => {
    if (!dateStr) return false;
    try {
      const created = new Date(dateStr.replace(' ', 'T')).getTime();
      return (Date.now() - created) <= 30 * 60 * 1000;
    } catch {
      return false;
    }
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

    const isMember = g.membros && g.membros.some((m) => String(m.id || m._id || m) === String(user?.id));
    if (!isMember && !isAdmin) {
      navigate('/dashboard/my-groups');
      return;
    }

    const msgs = await chatService.getGroupMessages(groupId);
    setMessages(msgs);
  };

  const loadMessages = async () => {
    const msgs = await chatService.getGroupMessages(groupId);
    setMessages(msgs);
  };

  const loadUsersForMentions = async () => {
    try {
      const list = await userService.getAllUsers();
      setAllUsers(list || []);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
    loadUsersForMentions();
  }, [groupId, user]);

  // Poll messages every 4 seconds
  useEffect(() => {
    if (!groupId) return;
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [groupId]);

  // Auto scroll to bottom on new messages or handle highlight
  useEffect(() => {
    if (highlightMsgId && messages.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulsate-group');
          setTimeout(() => el.classList.remove('highlight-pulsate-group'), 4000);
        }
      }, 300);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, highlightMsgId]);

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulsate-group');
      setTimeout(() => el.classList.remove('highlight-pulsate-group'), 4000);
    }
  };

  // Mention detection while typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setTexto(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9À-ÿ_\s.-]*)$/);

    if (atMatch) {
      setShowMentionDropdown(true);
      setMentionFilter(atMatch[1].toLowerCase());
    } else {
      setShowMentionDropdown(false);
    }
  };

  const selectMentionUser = (targetUser) => {
    const cursorPos = chatInputRef.current?.selectionStart || texto.length;
    const textBeforeCursor = texto.slice(0, cursorPos);
    const textAfterCursor = texto.slice(cursorPos);

    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex !== -1) {
      const newTextBefore = textBeforeCursor.slice(0, atIndex) + `@${targetUser.nome} `;
      setTexto(newTextBefore + textAfterCursor);
      setSelectedMentions((prev) => [
        ...prev.filter((m) => m.user_id !== (targetUser.id || targetUser._id)),
        { user_id: targetUser.id || targetUser._id, user_nome: targetUser.nome },
      ]);
    }
    setShowMentionDropdown(false);
    chatInputRef.current?.focus();
  };

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
      conteudo: texto.trim(),
      tipo_mensagem,
      ficheiro_path,
      ficheiro_nome,
      ficheiro_tamanho,
      reply_to: replyingTo,
      mencoes: selectedMentions,
      user,
    });

    setTexto('');
    setSelectedFile(null);
    setReplyingTo(null);
    setSelectedMentions([]);
    await loadMessages();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reply trigger
  const handleStartReply = (m) => {
    setReplyingTo({
      message_id: m.id || m._id,
      user_nome: m.user_nome,
      conteudo: m.conteudo || (m.ficheiro_nome ? `[Ficheiro] ${m.ficheiro_nome}` : ''),
      tipo_mensagem: m.tipo_mensagem,
    });
    setActiveMenuMsgId(null);
    chatInputRef.current?.focus();
  };

  // Edit trigger
  const handleStartEdit = (m) => {
    setEditingMessage(m);
    setEditText(m.conteudo || '');
    setActiveMenuMsgId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await chatService.editMessage(editingMessage.id || editingMessage._id, editText.trim());
      setEditingMessage(null);
      setEditText('');
      await loadMessages();
    } catch (err) {
      alert(err.message || 'Erro ao guardar edição da mensagem.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMsgId || deleting) return;
    setDeleting(true);
    try {
      await chatService.deleteMessage(deletingMsgId);
      setDeletingMsgId(null);
      await loadMessages();
    } catch (err) {
      alert(err.message || 'Erro ao eliminar mensagem.');
    } finally {
      setDeleting(false);
    }
  };

  // Mobile long press handlers
  const handleTouchStart = (msgId) => {
    longPressTimer.current = setTimeout(() => {
      setActiveMenuMsgId(msgId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
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
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${horas}:${min}`;
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

  const renderMessageContent = (content) => {
    if (!content) return null;
    const mentionRegex = /(@[a-zA-Z0-9À-ÿ_\s.-]{2,35})/g;
    const parts = content.split(mentionRegex);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} style={{
            background: 'rgba(37,99,235,0.15)',
            color: '#1d4ed8',
            fontWeight: 600,
            padding: '0.05rem 0.3rem',
            borderRadius: 4,
            display: 'inline-block',
            margin: '0 1px',
          }}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const filteredMentionUsers = allUsers.filter((u) => {
    if (!mentionFilter) return true;
    const name = (u.nome || '').toLowerCase();
    return name.includes(mentionFilter);
  });

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
            position: relative;
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
            position: relative;
            overflow: hidden;
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
            max-width: 78%;
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
            white-space: pre-wrap;
        }
        .msg-time {
            font-size: 0.65rem;
            opacity: 0.7;
            margin-top: 0.25rem;
            text-align: right;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.3rem;
        }
        .msg-edited-badge {
            font-style: italic;
            opacity: 0.75;
            font-size: 0.6rem;
        }
        .msg-media { margin-top: 0.5rem; }
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

        /* Quoted reply box */
        .msg-quoted-box {
            background: rgba(0,0,0,0.08);
            border-left: 3px solid #60a5fa;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            margin-bottom: 0.45rem;
            cursor: pointer;
        }
        .msg-mine .msg-quoted-box {
            background: rgba(255,255,255,0.18);
            border-left-color: #93c5fd;
        }
        .msg-quoted-author {
            font-size: 0.7rem;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 2px;
        }
        .msg-mine .msg-quoted-author { color: #fde68a; }
        .msg-quoted-text {
            font-size: 0.73rem;
            opacity: 0.85;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Message action hover buttons */
        .msg-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
        }
        .msg-actions-bar {
            position: absolute;
            top: 2px;
            display: flex;
            gap: 2px;
            opacity: 0;
            transition: opacity 0.2s;
            background: white;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            padding: 2px 4px;
            border: 1px solid #e2e8f0;
            z-index: 10;
        }
        .msg-mine .msg-actions-bar { left: -90px; }
        .msg-other .msg-actions-bar { right: -90px; }
        .msg-wrapper:hover .msg-actions-bar,
        .msg-actions-bar.mobile-active { opacity: 1; }
        .msg-act-btn {
            background: none;
            border: none;
            font-size: 0.85rem;
            padding: 4px 6px;
            border-radius: 12px;
            cursor: pointer;
            color: #475569;
            transition: all 0.15s;
        }
        .msg-act-btn:hover { background: #f1f5f9; color: #0f172a; transform: scale(1.15); }
        .msg-act-btn.del:hover { color: #ef4444; background: #fee2e2; }

        .highlight-pulsate-group .msg {
            animation: pulseGlowGrp 1.5s ease-in-out 3;
            border: 2px solid #f59e0b !important;
        }
        @keyframes pulseGlowGrp {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(245,158,11,0.4); }
            100% { transform: scale(1); }
        }

        .chat-input-area {
            background: white;
            border-top: 1px solid var(--border-color);
        }
        .chat-input-row {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            padding: 0.75rem 1rem;
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

        /* Reply Banner */
        .reply-banner {
            background: #f1f5f9;
            border-left: 4px solid #2563eb;
            padding: 0.45rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
        }
        .reply-banner-author {
            font-size: 0.75rem;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 2px;
        }
        .reply-banner-snippet {
            font-size: 0.73rem;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
        .reply-close {
            background: none;
            border: none;
            color: #64748b;
            font-size: 1rem;
            cursor: pointer;
            padding: 4px 8px;
        }
        .reply-close:hover { color: #ef4444; }

        /* Mention Dropdown */
        .mention-popup {
            position: absolute;
            bottom: 70px;
            left: 15px;
            width: 250px;
            max-height: 180px;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            overflow-y: auto;
            z-index: 100;
        }
        .mention-popup-hdr {
            padding: 0.35rem 0.7rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.72rem;
            font-weight: 700;
            color: #64748b;
        }
        .mention-popup-row {
            padding: 0.45rem 0.7rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.82rem;
        }
        .mention-popup-row:hover { background: #eff6ff; }

        .file-preview {
            display: flex;
            padding: 0.5rem 0.75rem;
            background: var(--light-gray);
            border-radius: var(--radius-sm);
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            align-items: center;
            justify-content: space-between;
            margin: 0 1rem 0.5rem;
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

        /* Edit/Delete Modal */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15,23,42,0.7);
            z-index: 1200;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
        }
        .modal-box {
            background: white;
            border-radius: 14px;
            padding: 1.5rem;
            max-width: 440px;
            width: 100%;
            box-shadow: 0 20px 25px rgba(0,0,0,0.2);
        }
        .modal-box h3 {
            margin: 0 0 0.75rem;
            color: #0f172a;
        }
        .modal-box p {
            color: #64748b;
            font-size: 0.88rem;
            margin-bottom: 1rem;
        }
        .modal-btns {
            display: flex;
            gap: 0.65rem;
        }
        .modal-btns button {
            flex: 1;
            padding: 0.7rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 1.5rem;
            color: var(--secondary-blue);
            text-decoration: none;
        }
        
        /* ===== RESPONSIVE — TABLET (max 860px) ===== */
        @media (max-width: 860px) {
            .chat-container {
                padding: 0 0.5rem;
                margin-top: 0.75rem;
                margin-bottom: 2rem;
            }
            .chat-header-bar {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.6rem;
                padding: 1rem 1.25rem;
            }
            .chat-header-bar h1 {
                font-size: 1.1rem;
            }
            .chat-box {
                height: calc(100vh - 210px);
                min-height: 380px;
            }
            .msg {
                max-width: 88%;
            }
            /* Action menu repositioned above bubble on tablet */
            .msg-mine .msg-actions-bar { left: auto; right: 0; top: -30px; }
            .msg-other .msg-actions-bar { right: auto; left: 0; top: -30px; }
            .chat-input-row {
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 0.65rem 0.85rem;
            }
            .chat-input-row input[type="text"] {
                flex: 1 1 100%;
                order: 1;
                margin-bottom: 0;
            }
            .send-btn {
                order: 5;
                flex: 1;
            }
            /* Mention dropdown */
            .mention-popup {
                left: 0;
                right: 0;
                width: auto;
                margin: 0 0.5rem;
            }
        }

        /* ===== RESPONSIVE — MOBILE (max 480px) ===== */
        @media (max-width: 480px) {
            .chat-container {
                padding: 0 0.2rem;
                margin-top: 0.4rem;
            }
            .chat-header-bar {
                padding: 0.85rem 0.9rem;
                border-radius: 10px 10px 0 0;
                gap: 0.4rem;
            }
            .chat-header-bar h1 {
                font-size: 0.95rem;
            }
            .chat-header-bar p {
                font-size: 0.78rem;
            }
            .chat-header-bar a {
                font-size: 0.78rem;
            }
            .chat-box {
                height: calc(100vh - 185px);
                min-height: 320px;
                border-radius: 0 0 10px 10px;
            }
            .chat-messages {
                padding: 0.6rem 0.5rem;
                gap: 0.6rem;
            }
            .msg {
                max-width: 94%;
                padding: 0.6rem 0.75rem;
                border-radius: 12px;
            }
            .msg-text {
                font-size: 0.86rem;
            }
            .msg-author {
                font-size: 0.7rem;
            }
            /* Action buttons above bubble on mobile */
            .msg-actions-bar {
                top: -30px !important;
                left: 0 !important;
                right: auto !important;
            }
            .msg-mine .msg-actions-bar {
                left: auto !important;
                right: 0 !important;
            }
            .msg-act-btn {
                padding: 5px 7px;
                font-size: 0.9rem;
            }
            .chat-input-row {
                padding: 0.5rem 0.6rem;
                gap: 0.4rem;
            }
            .chat-input-row input[type="text"] {
                padding: 0.55rem 0.75rem;
                font-size: 0.86rem;
            }
            .media-btn {
                width: 34px;
                height: 34px;
                font-size: 0.95rem;
            }
            .send-btn {
                padding: 0.55rem 0.9rem;
                font-size: 0.84rem;
            }
            /* Reply banner compact */
            .reply-banner {
                padding: 0.35rem 0.75rem;
            }
            .reply-banner-snippet {
                max-width: 150px;
            }
            /* Mention popup full-width */
            .mention-popup {
                left: 0;
                right: 0;
                width: auto;
                margin: 0;
                bottom: 60px;
                border-radius: 10px 10px 0 0;
                max-height: 150px;
            }
            /* Modals */
            .modal-box {
                padding: 1.1rem;
                border-radius: 12px;
            }
            .modal-btns {
                flex-direction: column;
            }
            .capture-box {
                padding: 1.1rem;
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
          <div
            className="chat-messages"
            onClick={() => activeMenuMsgId && setActiveMenuMsgId(null)}
          >
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="icon">💬</div>
                <p>Nenhuma mensagem neste grupo ainda. Envie uma mensagem!</p>
              </div>
            ) : (
              messages.map((m) => {
                const msgId = m.id || m._id;
                const isMine = m.user_id === user?.id || m.user_id === user?._id;
                const canEdit = isAdmin || (isMine && isWithin30Mins(m.data_criacao));
                const canDelete = isAdmin || (isMine && isWithin30Mins(m.data_criacao));

                return (
                  <div
                    className={`msg-wrapper ${isMine ? 'msg-mine' : 'msg-other'}`}
                    key={msgId}
                    id={`msg-${msgId}`}
                    onTouchStart={() => handleTouchStart(msgId)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Action buttons */}
                    <div
                      className={`msg-actions-bar ${activeMenuMsgId === msgId ? 'mobile-active' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="msg-act-btn"
                        title="Responder"
                        onClick={() => handleStartReply(m)}
                      >
                        ↩️
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          className="msg-act-btn"
                          title="Editar"
                          onClick={() => handleStartEdit(m)}
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="msg-act-btn del"
                          title="Eliminar"
                          onClick={() => setDeletingMsgId(msgId)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div
                      className={`msg ${isMine ? 'msg-mine' : 'msg-other'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuMsgId((prev) => (prev === msgId ? null : msgId));
                      }}
                    >
                      <div className="msg-author">
                        <span>{m.user_nome}</span>
                        <span className="msg-badge">
                          {m.user_tipo ? m.user_tipo.charAt(0).toUpperCase() + m.user_tipo.slice(1) : ''}
                        </span>
                      </div>

                      {/* Quoted reply box */}
                      {m.reply_to && m.reply_to.message_id && (
                        <div
                          className="msg-quoted-box"
                          onClick={() => scrollToMessage(m.reply_to.message_id)}
                          title="Ir para mensagem original"
                        >
                          <div className="msg-quoted-author">↩ {m.reply_to.user_nome}</div>
                          <div className="msg-quoted-text">{m.reply_to.conteudo || '[Anexo]'}</div>
                        </div>
                      )}

                      {m.conteudo && (
                        <div className="msg-text">{renderMessageContent(m.conteudo)}</div>
                      )}

                      {m.ficheiro_path && (isImageUrl(m.ficheiro_path, m.ficheiro_nome) || m.tipo_mensagem === 'imagem') && (
                        <div className="msg-media" style={{ marginTop: '0.4rem', borderRadius: '8px', overflow: 'hidden' }}>
                          <img
                            src={getFileUrl(m.ficheiro_path)}
                            alt={getCleanFileName(m.ficheiro_path, m.ficheiro_nome)}
                            style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block', cursor: 'pointer', borderRadius: '8px' }}
                            onClick={() => window.open(getFileUrl(m.ficheiro_path), '_blank')}
                          />
                        </div>
                      )}

                      {m.tipo_mensagem === 'audio' && m.ficheiro_path && (
                        <div className="msg-media" style={{ marginTop: '0.4rem' }}>
                          <audio controls style={{ maxWidth: '100%' }}>
                            <source src={getFileUrl(m.ficheiro_path)} />
                            O seu navegador não suporta áudio.
                          </audio>
                        </div>
                      )}

                      {m.ficheiro_path && !isImageUrl(m.ficheiro_path, m.ficheiro_nome) && m.tipo_mensagem !== 'audio' && (
                        <a href={getFileUrl(m.ficheiro_path)} className="msg-file-link" download target="_blank" rel="noreferrer" style={{ marginTop: '0.4rem' }}>
                          📄 {getCleanFileName(m.ficheiro_path, m.ficheiro_nome)} ↗
                        </a>
                      )}

                      <div className="msg-time">
                        {m.editado && <span className="msg-edited-badge">(editada)</span>}
                        <span>{formatMsgDate(m.data_criacao)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mention autocomplete popup */}
          {showMentionDropdown && filteredMentionUsers.length > 0 && (
            <div className="mention-popup">
              <div className="mention-popup-hdr">Mencionar (@)</div>
              {filteredMentionUsers.slice(0, 6).map((u) => (
                <div
                  key={u.id || u._id}
                  className="mention-popup-row"
                  onClick={() => selectMentionUser(u)}
                >
                  <span>👤</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.nome}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.tipo}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

            {/* Reply Banner */}
            {replyingTo && (
              <div className="reply-banner">
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="reply-banner-author">↩ A responder a {replyingTo.user_nome}</div>
                  <div className="reply-banner-snippet">{replyingTo.conteudo}</div>
                </div>
                <button type="button" className="reply-close" onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}

            <form className="chat-input-row" onSubmit={handleSend}>
              <input
                ref={chatInputRef}
                type="text"
                placeholder={replyingTo ? `A responder a ${replyingTo.user_nome}...` : "Escreva uma mensagem para o grupo (@ para mencionar)..."}
                value={texto}
                onChange={handleInputChange}
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

              <button type="button" className="media-btn attach" title="Anexar Ficheiro" onClick={() => fileInputRef.current?.click()}>
                📎
              </button>

              <button type="button" className="media-btn camera" title="Tirar Foto" onClick={() => setShowCameraModal(true)}>
                📷
              </button>

              <button type="button" className="media-btn audio" title="Gravar Áudio" onClick={() => setShowAudioModal(true)}>
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

      {/* Edit Modal */}
      {editingMessage && (
        <div className="modal-overlay" onClick={() => setEditingMessage(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Editar Mensagem</h3>
            <p>{isAdmin && editingMessage.user_id !== (user?.id || user?._id) ? 'A editar como Administrador.' : 'Edite o texto da sua mensagem (dentro de 30 minutos).'}</p>
            <textarea
              style={{ width: '100%', minHeight: '80px', padding: '0.7rem', border: '2px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1rem', outline: 'none' }}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edite a mensagem..."
            />
            <div className="modal-btns">
              <button
                type="button"
                style={{ background: '#2563eb', color: 'white' }}
                onClick={handleSaveEdit}
                disabled={savingEdit || !editText.trim()}
              >
                {savingEdit ? 'A guardar...' : 'Guardar'}
              </button>
              <button
                type="button"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => setEditingMessage(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingMsgId && (
        <div className="modal-overlay" onClick={() => setDeletingMsgId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Eliminar Mensagem</h3>
            <p>Tem a certeza de que pretende eliminar esta mensagem permanentemente?</p>
            <div className="modal-btns">
              <button
                type="button"
                style={{ background: '#ef4444', color: 'white' }}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'A eliminar...' : 'Sim, Eliminar'}
              </button>
              <button
                type="button"
                style={{ background: '#e2e8f0', color: '#475569' }}
                onClick={() => setDeletingMsgId(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="capture-modal">
          <div className="capture-box">
            <h3>📷 Captura de Imagem</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Tire uma foto utilizando a câmara do seu dispositivo ou selecione um ficheiro de imagem para o grupo.
            </p>
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleCameraCapture} />
            <div className="capture-btns">
              <button type="button" style={{ background: '#10b981' }} onClick={() => cameraInputRef.current?.click()}>
                Tirar / Selecionar Foto
              </button>
              <button type="button" style={{ background: '#64748b' }} onClick={() => setShowCameraModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Modal */}
      {showAudioModal && (
        <div className="capture-modal">
          <div className="capture-box">
            <h3>🎤 Gravar Nota de Voz</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Grave uma mensagem de voz ou selecione um ficheiro de áudio para partilhar com o grupo.
            </p>
            <input type="file" ref={audioInputRef} accept="audio/*" capture style={{ display: 'none' }} onChange={handleAudioSelected} />
            <div className="capture-btns">
              <button type="button" style={{ background: '#ef4444' }} onClick={() => audioInputRef.current?.click()}>
                Gravar / Selecionar Áudio
              </button>
              <button type="button" style={{ background: '#64748b' }} onClick={() => setShowAudioModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
