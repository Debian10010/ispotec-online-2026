import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { getFileUrl as resolveFileUrl } from '../../services/api';
import { isImageUrl, getCleanFileName } from '../../components/AttachmentDisplay';

const QUICK_EMOJIS = ['👍', '👏', '💡', '📚', '📢', '🚀', '🎓', '✨', '🔥', '🤝'];

export default function ChatGlobal() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightMsgId = searchParams.get('highlightMsg');

  const [messages, setMessages] = useState([]);
  const [texto, setTexto] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [, setLastUpdated] = useState(new Date());

  // Reply state
  const [replyingTo, setReplyingTo] = useState(null);

  // Edit message state
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm modal
  const [deletingMsgId, setDeletingMsgId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Mention system state
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentions, setSelectedMentions] = useState([]);

  // Active message actions menu (for mobile long press / tap)
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
  const longPressTimer = useRef(null);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const isFirstLoad = useRef(true);
  const highlightedRef = useRef(false);

  const isAdmin = user && (['admin', 'especialista'].includes(String(user.tipo || '').toLowerCase().trim()));

  const getFileUrl = (path) => {
    if (!path || path === '#') return '#';
    return resolveFileUrl(path);
  };

  // Check 30 min limit for regular users
  const isWithin30Mins = (dateStr) => {
    if (!dateStr) return false;
    try {
      const created = new Date(dateStr.replace(' ', 'T')).getTime();
      return (Date.now() - created) <= 30 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const loadUsersForMentions = async () => {
    try {
      const list = await userService.getAllUsers();
      setAllUsers(list || []);
    } catch (_) {}
  };

  const loadMessages = useCallback(async (isManual = false) => {
    try {
      const data = await chatService.getGlobalMessages();
      setMessages((prev) => {
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

  // Initial load
  useEffect(() => {
    loadMessages();
    loadUsersForMentions();
    const interval = setInterval(() => {
      loadMessages();
    }, 3500);

    return () => clearInterval(interval);
  }, [loadMessages]);

  // Handle message highlight from URL parameter
  useEffect(() => {
    if (highlightMsgId && messages.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulsate');
          setTimeout(() => el.classList.remove('highlight-pulsate'), 4000);
        }
      }, 300);
    } else if (!highlightedRef.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, highlightMsgId]);

  // Scroll to target message
  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulsate');
      setTimeout(() => el.classList.remove('highlight-pulsate'), 4000);
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
        reply_to: replyingTo,
        mencoes: selectedMentions,
        user,
      });

      setTexto('');
      setSelectedFile(null);
      setReplyingTo(null);
      setSelectedMentions([]);
      await loadMessages(true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
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
      await loadMessages(true);
    } catch (err) {
      alert(err.message || 'Erro ao guardar edição da mensagem.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete trigger
  const handleConfirmDelete = async () => {
    if (!deletingMsgId || deleting) return;
    setDeleting(true);
    try {
      await chatService.deleteMessage(deletingMsgId);
      setDeletingMsgId(null);
      await loadMessages(true);
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

  const handleInsertEmoji = (emoji) => {
    setTexto((prev) => prev + emoji);
    chatInputRef.current?.focus();
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
      const isToday =
        today.getDate() === d.getDate() &&
        today.getMonth() === d.getMonth() &&
        today.getFullYear() === d.getFullYear();

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

  // Render message text with styled mention highlights
  const renderMessageContent = (content) => {
    if (!content) return null;
    const mentionRegex = /(@[a-zA-Z0-9À-ÿ_\s.-]{2,35})/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="chat-mention-tag">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const filteredMessages = messages.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.conteudo && m.conteudo.toLowerCase().includes(term)) ||
      (m.user_nome && m.user_nome.toLowerCase().includes(term)) ||
      (m.ficheiro_nome && m.ficheiro_nome.toLowerCase().includes(term))
    );
  });

  const filteredMentionUsers = allUsers.filter((u) => {
    if (!mentionFilter) return true;
    const name = (u.nome || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(mentionFilter) || email.includes(mentionFilter);
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
            position: relative;
            overflow: hidden;
        }

        .chat-messages-stream {
            flex: 1;
            overflow-y: auto;
            padding: 1.25rem;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 1.1rem;
            scroll-behavior: smooth;
        }

        .msg-row {
            display: flex;
            gap: 0.75rem;
            max-width: 82%;
            position: relative;
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

        .msg-row.highlight-pulsate .msg-bubble {
            animation: pulseGlow 1.5s ease-in-out infinite;
            border: 2px solid #f59e0b !important;
            box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
        }

        @keyframes pulseGlow {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
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

        .msg-bubble-container {
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .msg-bubble {
            padding: 0.75rem 1rem;
            border-radius: 14px;
            position: relative;
            box-shadow: 0 2px 4px rgba(0,0,0,0.04);
            min-width: 150px;
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

        /* Quoted message box inside bubble (WhatsApp style) */
        .msg-quoted-box {
            background: rgba(0, 0, 0, 0.08);
            border-left: 3px solid #60a5fa;
            padding: 0.35rem 0.6rem;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: background 0.15s;
        }

        .msg-mine .msg-quoted-box {
            background: rgba(255, 255, 255, 0.18);
            border-left-color: #93c5fd;
        }

        .msg-quoted-author {
            font-size: 0.72rem;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 0.15rem;
        }

        .msg-mine .msg-quoted-author {
            color: #fed7aa;
        }

        .msg-quoted-text {
            font-size: 0.75rem;
            opacity: 0.85;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .msg-body-text {
            font-size: 0.92rem;
            line-height: 1.45;
            word-break: break-word;
            white-space: pre-wrap;
        }

        .chat-mention-tag {
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 600;
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            display: inline-block;
            margin: 0 1px;
        }

        .msg-mine .chat-mention-tag {
            background: rgba(255, 255, 255, 0.28);
            color: #ffffff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .msg-footer-time {
            font-size: 0.68rem;
            margin-top: 0.35rem;
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.35rem;
        }

        .msg-mine .msg-footer-time { color: rgba(255, 255, 255, 0.75); }
        .msg-other .msg-footer-time { color: #94a3b8; }

        .msg-edited-indicator {
            font-style: italic;
            opacity: 0.8;
            font-size: 0.65rem;
        }

        /* Action Menu Hover / Long-press (Reply, Edit, Delete) */
        .msg-actions-trigger {
            position: absolute;
            top: 2px;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            display: flex;
            gap: 0.25rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            padding: 2px 4px;
            border: 1px solid #e2e8f0;
            z-index: 10;
        }

        .msg-mine .msg-actions-trigger {
            left: -85px;
        }

        .msg-other .msg-actions-trigger {
            right: -85px;
        }

        .msg-row:hover .msg-actions-trigger,
        .msg-actions-trigger.mobile-active {
            opacity: 1;
            transform: scale(1);
        }

        .msg-action-icon-btn {
            background: none;
            border: none;
            font-size: 0.85rem;
            padding: 4px 6px;
            border-radius: 12px;
            cursor: pointer;
            color: #475569;
            transition: all 0.15s;
        }

        .msg-action-icon-btn:hover {
            background: #f1f5f9;
            color: #0f172a;
            transform: scale(1.15);
        }

        .msg-action-icon-btn.btn-delete:hover {
            color: #ef4444;
            background: #fee2e2;
        }

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

        /* Reply Banner above Input Area */
        .chat-reply-banner {
            background: #f1f5f9;
            border-left: 4px solid #2563eb;
            padding: 0.5rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            animation: slideUp 0.18s ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .reply-banner-content {
            flex: 1;
            font-size: 0.82rem;
            overflow: hidden;
        }

        .reply-banner-author {
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 2px;
        }

        .reply-banner-snippet {
            color: #475569;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .reply-close-btn {
            background: none;
            border: none;
            font-size: 1.1rem;
            color: #64748b;
            cursor: pointer;
            padding: 4px 8px;
        }

        .reply-close-btn:hover {
            color: #ef4444;
        }

        /* Mention Floating Dropdown */
        .mention-dropdown-popup {
            position: absolute;
            bottom: 70px;
            left: 20px;
            width: 280px;
            max-height: 200px;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            overflow-y: auto;
            z-index: 100;
        }

        .mention-dropdown-header {
            padding: 0.4rem 0.75rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
        }

        .mention-user-row {
            padding: 0.5rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
        }

        .mention-user-row:hover {
            background: #eff6ff;
        }

        .mention-user-row-name {
            font-size: 0.84rem;
            font-weight: 600;
            color: #0f172a;
        }

        .mention-user-row-role {
            font-size: 0.68rem;
            color: #64748b;
        }

        /* Emoji Quick Bar */
        .chat-emoji-quickbar {
            padding: 0.4rem 1rem;
            background: #f8fafc;
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

        /* ===== RESPONSIVE — TABLET (max 860px) ===== */
        @media (max-width: 860px) {
            .chat-container-page {
                padding: 0 0.5rem;
                margin-top: 0.75rem;
                margin-bottom: 2rem;
            }
            .chat-header-bar {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.65rem;
                padding: 1.1rem 1.25rem;
                border-radius: 12px 12px 0 0;
            }
            .chat-header-bar h1 {
                font-size: 1.15rem;
            }
            .chat-header-actions {
                width: 100%;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            .chat-btn-action {
                padding: 0.4rem 0.75rem;
                font-size: 0.8rem;
            }
            .chat-community-banner {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.6rem;
                padding: 0.65rem 1rem;
            }
            .chat-search-input {
                width: 100%;
                min-width: unset;
            }
            .chat-main-box {
                height: calc(100vh - 210px);
                min-height: 400px;
            }
            .msg-row {
                max-width: 90%;
            }
            /* Action menu repositioned above the bubble on tablet */
            .msg-mine .msg-actions-trigger {
                left: auto;
                right: 0;
                top: -30px;
            }
            .msg-other .msg-actions-trigger {
                right: auto;
                left: 0;
                top: -30px;
            }
            /* Input area wraps on tablet */
            .chat-compose-form {
                flex-wrap: wrap;
                gap: 0.5rem;
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
            /* Mention dropdown full width on tablet */
            .mention-dropdown-popup {
                left: 0;
                right: 0;
                width: auto;
                margin: 0 0.5rem;
            }
        }

        /* ===== RESPONSIVE — MOBILE (max 480px) ===== */
        @media (max-width: 480px) {
            .chat-container-page {
                padding: 0 0.25rem;
                margin-top: 0.5rem;
            }
            .chat-header-bar {
                padding: 0.85rem 1rem;
                border-radius: 10px 10px 0 0;
                gap: 0.5rem;
            }
            .chat-header-bar h1 {
                font-size: 1rem;
                gap: 0.4rem;
            }
            .chat-status-pill {
                font-size: 0.68rem;
                padding: 0.15rem 0.5rem;
                margin-left: 0.25rem;
            }
            .chat-header-bar p {
                font-size: 0.78rem;
            }
            .chat-header-actions {
                gap: 0.4rem;
            }
            .chat-btn-action {
                padding: 0.35rem 0.6rem;
                font-size: 0.75rem;
            }
            .chat-main-box {
                height: calc(100vh - 190px);
                min-height: 340px;
                border-radius: 0 0 10px 10px;
            }
            .chat-messages-stream {
                padding: 0.75rem 0.6rem;
                gap: 0.75rem;
            }
            .msg-row {
                max-width: 95%;
                gap: 0.5rem;
            }
            .user-avatar-circle {
                width: 28px;
                height: 28px;
                font-size: 0.7rem;
            }
            .msg-bubble {
                padding: 0.6rem 0.75rem;
                min-width: 100px;
                border-radius: 12px;
            }
            .msg-body-text {
                font-size: 0.88rem;
            }
            .msg-header-meta {
                font-size: 0.72rem;
                flex-wrap: wrap;
            }
            /* Action buttons float above bubble on mobile */
            .msg-actions-trigger {
                top: -30px !important;
                left: 0 !important;
                right: auto !important;
                border-radius: 14px;
            }
            .msg-mine .msg-actions-trigger {
                left: auto !important;
                right: 0 !important;
            }
            .msg-action-icon-btn {
                padding: 5px 7px;
                font-size: 0.9rem;
            }
            .chat-emoji-quickbar {
                padding: 0.3rem 0.6rem;
            }
            .emoji-quick-btn {
                font-size: 0.9rem;
                padding: 0.15rem 0.35rem;
            }
            .chat-compose-area {
                padding: 0.65rem 0.75rem;
            }
            .chat-text-input {
                padding: 0.6rem 0.85rem;
                font-size: 0.86rem;
            }
            .btn-submit-send {
                padding: 0.6rem 1rem;
                font-size: 0.84rem;
            }
            .tool-btn {
                width: 36px;
                height: 36px;
                font-size: 1rem;
            }
            /* Reply banner compact */
            .chat-reply-banner {
                padding: 0.4rem 0.75rem;
            }
            .reply-banner-content {
                font-size: 0.78rem;
            }
            /* Mention popup full-width on mobile */
            .mention-dropdown-popup {
                left: 0;
                right: 0;
                width: auto;
                margin: 0;
                bottom: 60px;
                border-radius: 10px 10px 0 0;
                max-height: 160px;
            }
            /* Modals full-width on mobile */
            .modal-card-chat {
                padding: 1.25rem;
                border-radius: 12px;
                max-height: 90vh;
            }
            .modal-actions-grid {
                flex-direction: column;
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
            <p>Espaço colaborativo de partilha e comunicação de toda a comunidade ISPOTEC</p>
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
            📢 <strong>Comunidade Aberta:</strong> Todos os estudantes, docentes e especialistas podem interagir neste canal. Use <code>@</code> para mencionar colegas.
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
          <div
            className="chat-messages-stream"
            onClick={() => activeMenuMsgId && setActiveMenuMsgId(null)}
          >
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
                const msgId = m.id || m._id;
                const isMine = m.user_id === user?.id || m.user_id === user?._id;
                const roleType = m.user_tipo || 'estudante';

                const canEdit = isAdmin || (isMine && isWithin30Mins(m.data_criacao || m.createdAt));
                const canDelete = isAdmin || (isMine && isWithin30Mins(m.data_criacao || m.createdAt));

                return (
                  <div
                    className={`msg-row ${isMine ? 'msg-mine' : 'msg-other'}`}
                    key={msgId}
                    id={`msg-${msgId}`}
                    onTouchStart={() => handleTouchStart(msgId)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className={`user-avatar-circle avatar-${roleType}`}>
                      {getInitials(m.user_nome)}
                    </div>

                    <div className="msg-bubble-container">
                      {/* Action Menu (Reply, Edit, Delete) */}
                      <div
                        className={`msg-actions-trigger ${activeMenuMsgId === msgId ? 'mobile-active' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Reply available for all users */}
                        <button
                          type="button"
                          className="msg-action-icon-btn"
                          title="Responder à mensagem"
                          onClick={() => handleStartReply(m)}
                        >
                          ↩️
                        </button>

                        {/* Edit available for Admin anytime, or Author within 30 mins */}
                        {canEdit && (
                          <button
                            type="button"
                            className="msg-action-icon-btn"
                            title={isAdmin && !isMine ? 'Editar (Administrador)' : 'Editar mensagem'}
                            onClick={() => handleStartEdit(m)}
                          >
                            ✏️
                          </button>
                        )}

                        {/* Delete available for Admin anytime, or Author within 30 mins */}
                        {canDelete && (
                          <button
                            type="button"
                            className="msg-action-icon-btn btn-delete"
                            title={isAdmin && !isMine ? 'Eliminar (Administrador)' : 'Eliminar mensagem'}
                            onClick={() => setDeletingMsgId(msgId)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div
                        className="msg-bubble"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuMsgId((prev) => (prev === msgId ? null : msgId));
                        }}
                      >
                        <div className="msg-header-meta">
                          <span className="msg-author-name">
                            {isMine ? 'Eu' : (m.user_nome || 'Utilizador')}
                          </span>
                          <span className={`role-tag role-tag-${roleType}`}>
                            {roleType === 'especialista' ? 'Especialista' : roleType === 'docente' ? 'Docente' : 'Estudante'}
                          </span>
                        </div>

                        {/* Quoted Message (WhatsApp Style) */}
                        {m.reply_to && m.reply_to.message_id && (
                          <div
                            className="msg-quoted-box"
                            onClick={() => scrollToMessage(m.reply_to.message_id)}
                            title="Clique para ir para a mensagem original"
                          >
                            <div className="msg-quoted-author">
                              ↩ {m.reply_to.user_nome || 'Utilizador'}
                            </div>
                            <div className="msg-quoted-text">
                              {m.reply_to.conteudo || '[Anexo]'}
                            </div>
                          </div>
                        )}

                        {m.conteudo && (
                          <div className="msg-body-text">{renderMessageContent(m.conteudo)}</div>
                        )}

                        {m.ficheiro_path && (isImageUrl(m.ficheiro_path, m.ficheiro_nome) || m.tipo_mensagem === 'imagem') && (
                          <div
                            className="msg-media-attachment"
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.open(getFileUrl(m.ficheiro_path), '_blank')}
                          >
                            <img
                              src={getFileUrl(m.ficheiro_path)}
                              alt={getCleanFileName(m.ficheiro_path, m.ficheiro_nome)}
                              loading="lazy"
                            />
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

                        {m.ficheiro_path && !isImageUrl(m.ficheiro_path, m.ficheiro_nome) && m.tipo_mensagem !== 'audio' && (
                          <a
                            href={getFileUrl(m.ficheiro_path)}
                            className="msg-file-download"
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            📄 {getCleanFileName(m.ficheiro_path, m.ficheiro_nome)}
                            {m.ficheiro_tamanho ? ` (${(m.ficheiro_tamanho / 1024).toFixed(0)} KB)` : ''} ↗
                          </a>
                        )}

                        <div className="msg-footer-time">
                          {m.editado && <span className="msg-edited-indicator">(editada)</span>}
                          <span>{formatMsgDate(m.data_criacao || m.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mention Autocomplete Dropdown Popup */}
          {showMentionDropdown && filteredMentionUsers.length > 0 && (
            <div className="mention-dropdown-popup">
              <div className="mention-dropdown-header">Mencionar utilizador (@)</div>
              {filteredMentionUsers.slice(0, 6).map((u) => (
                <div
                  key={u.id || u._id}
                  className="mention-user-row"
                  onClick={() => selectMentionUser(u)}
                >
                  <div className={`user-avatar-circle avatar-${u.tipo || 'estudante'}`} style={{ width: 26, height: 26, fontSize: '0.7rem' }}>
                    {getInitials(u.nome)}
                  </div>
                  <div>
                    <div className="mention-user-row-name">{u.nome}</div>
                    <div className="mention-user-row-role">{u.tipo} {u.curso ? `• ${u.curso}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {/* Reply Banner */}
          {replyingTo && (
            <div className="chat-reply-banner">
              <div className="reply-banner-content">
                <div className="reply-banner-author">↩ A responder a {replyingTo.user_nome}</div>
                <div className="reply-banner-snippet">{replyingTo.conteudo}</div>
              </div>
              <button
                type="button"
                className="reply-close-btn"
                onClick={() => setReplyingTo(null)}
                title="Cancelar resposta"
              >
                ✕
              </button>
            </div>
          )}

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
                ref={chatInputRef}
                type="text"
                className="chat-text-input"
                placeholder={replyingTo ? `A responder a ${replyingTo.user_nome}...` : "Escreva uma mensagem para a comunidade (@ para mencionar)..."}
                value={texto}
                onChange={handleInputChange}
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

      {/* Modal Editar Mensagem */}
      {editingMessage && (
        <div className="modal-overlay-chat" onClick={() => setEditingMessage(null)}>
          <div className="modal-card-chat" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Editar Mensagem</h3>
            <p style={{ marginBottom: '0.75rem' }}>
              {isAdmin && editingMessage.user_id !== (user?.id || user?._id)
                ? 'A editar mensagem como Administrador.'
                : 'Pode editar o texto da sua mensagem (limite de 30 minutos).'}
            </p>
            <textarea
              style={{
                width: '100%',
                minHeight: '90px',
                padding: '0.75rem',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontSize: '0.92rem',
                marginBottom: '1rem',
                outline: 'none',
              }}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edite a mensagem..."
            />
            <div className="modal-actions-grid">
              <button
                type="button"
                style={{ background: '#2563eb', color: 'white' }}
                onClick={handleSaveEdit}
                disabled={savingEdit || !editText.trim()}
              >
                {savingEdit ? 'A guardar...' : 'Guardar Alterações'}
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

      {/* Modal Confirmar Eliminação */}
      {deletingMsgId && (
        <div className="modal-overlay-chat" onClick={() => setDeletingMsgId(null)}>
          <div className="modal-card-chat" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Eliminar Mensagem</h3>
            <p>
              Tem a certeza de que pretende eliminar esta mensagem permanentemente? Esta ação não pode ser anulada.
            </p>
            <div className="modal-actions-grid">
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
