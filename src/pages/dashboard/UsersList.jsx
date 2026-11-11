import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { auditLogService } from '../../services/auditLogService';
import { api, getFileUrl } from '../../services/api';
import { CURSOS_ISPOTEC, CURSOS_TECNICOS_MEDIOS_IFOPTEC } from '../../services/homeschoolService';

export default function UsersList() {
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtroTipoUrl = searchParams.get('tipo') || '';
  const filtroStatusUrl = searchParams.get('status') || '';

  const [activeTab, setActiveTab] = useState('utilizadores'); // 'utilizadores' | 'logs'
  const [tipo, setTipo] = useState(filtroTipoUrl);
  const [statusFiltro, setStatusFiltro] = useState(filtroStatusUrl);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [utilizadores, setUtilizadores] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchLogs, setSearchLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Add user form state
  const [addForm, setAddForm] = useState({
    nome: '',
    email: '',
    password: '',
    tipo: 'estudante',
    curso: '',
    nivel_academico: '',
    telefone: '',
    numero_estudante: '',
    status: 'aprovado',
    must_change_password: true,
  });
  const [showAddPass, setShowAddPass] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit user profile form state (RF01 — Editar Tipo, Curso, Nome, etc.)
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    tipo: 'estudante',
    curso: '',
    nivel_academico: '',
    telefone: '',
    numero_estudante: '',
    status: 'aprovado',
    foto_perfil: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Reset password form state (RF02 — Senha temporária, validações, obrigar troca)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    mustChange: true,
  });
  const [showResetPass, setShowResetPass] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Delete submission state
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Validação de senha forte (mínimo 8 caracteres, 1 número, 1 maiúscula)
  const validatePasswordStrength = (pass) => {
    if (!pass || pass.length < 8) return 'A palavra-passe deve ter pelo menos 8 caracteres.';
    if (!/\d/.test(pass)) return 'A palavra-passe deve conter pelo menos 1 número.';
    if (!/[A-Z]/.test(pass)) return 'A palavra-passe deve conter pelo menos 1 letra maiúscula.';
    return null;
  };

  // Gerador de senha temporária segura
  const generateSecurePassword = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const specials = '!@#$%&*';
    const randomL = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomN = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    const randomS = specials[Math.floor(Math.random() * specials.length)];
    return `ISP${randomL}${randomN}${randomS}`;
  };

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers({
        tipo: tipo || undefined,
        status: statusFiltro || undefined,
        search: searchQuery || undefined,
        curso: cursoFiltro || undefined,
      });
      setUtilizadores(data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Erro ao carregar utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await auditLogService.getLogs({ search: searchLogs });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [tipo, statusFiltro, cursoFiltro]);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, searchLogs]);

  // Se não for admin, bloquear acesso (RF03)
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Acesso Restrito ao Administrador</h2>
        <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Não tem permissões para aceder à Gestão de Utilizadores. Esta secção é exclusiva para a Administração do ISPOTEC Online.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          ← Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  // 1. ADICIONAR NOVO UTILIZADOR (RF05)
  const handleOpenAdd = () => {
    const generated = generateSecurePassword();
    setAddForm({
      nome: '',
      email: '',
      password: generated,
      tipo: 'estudante',
      curso: CURSOS_ISPOTEC[0] || '',
      nivel_academico: 'licenciatura',
      telefone: '',
      numero_estudante: `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'aprovado',
      must_change_password: true,
    });
    setShowAddPass(true);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.nome.trim() || !addForm.email.trim() || !addForm.password) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (addForm.tipo === 'estudante' && !addForm.curso.trim()) {
      showNotification('error', 'O curso é obrigatório para utilizadores do tipo Estudante.');
      return;
    }

    const passErr = validatePasswordStrength(addForm.password);
    if (passErr) {
      showNotification('error', passErr);
      return;
    }

    if (!window.confirm(`Tem a certeza que deseja criar o utilizador "${addForm.nome}" com o perfil [${addForm.tipo.toUpperCase()}]?`)) {
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await userService.createUser(addForm);
      if (res.sucesso) {
        await auditLogService.addLog({
          autor: currentUser,
          acao: 'Criação de Utilizador',
          detalhes: `Criado utilizador [${addForm.tipo}] - Email: ${addForm.email}`,
          utilizadorAfetado: { nome: addForm.nome, email: addForm.email },
        });

        showNotification('success', `Utilizador criado com sucesso! Palavra-passe temporária atribuída: ${addForm.password}`);
        setShowAddModal(false);
        loadUsers();
      } else {
        showNotification('error', res.mensagem || 'Não foi possível criar o utilizador.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao criar utilizador.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // 2. EDITAR TIPO E PERFIL DO UTILIZADOR (RF01)
  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      nome: u.nome || '',
      email: u.email || '',
      tipo: u.tipo || 'estudante',
      curso: u.curso || '',
      nivel_academico: u.nivel_academico || '',
      telefone: u.telefone || '',
      numero_estudante: u.numero_estudante || '',
      status: u.status || 'aprovado',
      foto_perfil: u.foto_perfil || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.nome.trim() || !editForm.email.trim()) {
      showNotification('error', 'Nome completo e Email são obrigatórios.');
      return;
    }

    if (editForm.tipo === 'estudante' && !editForm.curso.trim()) {
      showNotification('error', 'O curso é obrigatório para utilizadores do tipo Estudante.');
      return;
    }

    const tipoMudou = editForm.tipo !== editingUser.tipo;
    if (tipoMudou) {
      const confirmTipo = window.confirm(
        `ATENÇÃO: Tem a certeza que deseja alterar o tipo de utilizador de "${editingUser.tipo}" para "${editForm.tipo}"?\n\nOs acessos, salas e inscrições antigas serão reconfigurados automaticamente.`
      );
      if (!confirmTipo) return;
    } else {
      if (!window.confirm(`Tem a certeza que deseja guardar as alterações no perfil de "${editingUser.nome}"?`)) {
        return;
      }
    }

    setSubmittingEdit(true);
    try {
      const res = await userService.updateUserProfileByAdmin(editingUser.id, editForm);
      if (res.sucesso) {
        if (tipoMudou) {
          await auditLogService.addLog({
            autor: currentUser,
            acao: 'Alteração de Tipo de Utilizador',
            detalhes: `Alterou tipo de "${editingUser.tipo}" para "${editForm.tipo}"`,
            utilizadorAfetado: editingUser,
          });
        } else {
          await auditLogService.addLog({
            autor: currentUser,
            acao: 'Edição de Perfil de Utilizador',
            detalhes: `Actualizados dados de cadastro`,
            utilizadorAfetado: editingUser,
          });
        }

        showNotification('success', 'Perfil e permissões do utilizador actualizados com sucesso!');
        setEditingUser(null);
        loadUsers();
      } else {
        showNotification('error', res.mensagem || 'Não foi possível actualizar o perfil.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao actualizar perfil.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // 3. REDEFINIR SENHA (RF02)
  const handleOpenResetPassword = (u) => {
    setResetPasswordUser(u);
    const tempPass = generateSecurePassword();
    setPasswordForm({
      newPassword: tempPass,
      confirmPassword: tempPass,
      mustChange: true,
    });
    setShowResetPass(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordUser) return;

    const passErr = validatePasswordStrength(passwordForm.newPassword);
    if (passErr) {
      showNotification('error', passErr);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'A confirmação da palavra-passe não coincide.');
      return;
    }

    if (!window.confirm(`Tem a certeza que deseja redefinir a palavra-passe de "${resetPasswordUser.nome}"?`)) {
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await userService.resetPasswordByAdmin(
        resetPasswordUser.id,
        passwordForm.newPassword,
        passwordForm.mustChange
      );

      if (res.sucesso) {
        await auditLogService.addLog({
          autor: currentUser,
          acao: 'Redefinição de Senha',
          detalhes: `Senha redefinida pelo Administrador (Obriga troca no 1º login: ${passwordForm.mustChange ? 'Sim' : 'Não'})`,
          utilizadorAfetado: resetPasswordUser,
        });

        showNotification(
          'success',
          `Palavra-passe de ${resetPasswordUser.nome} redefinida com sucesso para: "${passwordForm.newPassword}". O utilizador terá de trocá-la no primeiro acesso.`
        );
        setResetPasswordUser(null);
      } else {
        showNotification('error', res.mensagem || 'Não foi possível redefinir a palavra-passe.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao redefinir palavra-passe.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // 4. ELIMINAR UTILIZADOR
  const handleOpenDelete = (u) => {
    setDeletingUser(u);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setSubmittingDelete(true);
    try {
      const res = await userService.deleteUser(deletingUser.id);
      if (res.sucesso) {
        await auditLogService.addLog({
          autor: currentUser,
          acao: 'Eliminação de Utilizador',
          detalhes: `Utilizador ${deletingUser.email} removido do sistema`,
          utilizadorAfetado: deletingUser,
        });

        showNotification('success', 'Utilizador eliminado com sucesso!');
        setDeletingUser(null);
        loadUsers();
      } else {
        showNotification('error', res.mensagem || 'Não foi possível eliminar o utilizador.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao eliminar utilizador.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateString || '—';
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${hora}:${min}`;
    } catch {
      return dateString || '—';
    }
  };

  const getTipoLabel = (t) => {
    switch (t) {
      case 'admin':
      case 'especialista':
        return 'Administrador';
      case 'docente':
        return 'Docente';
      case 'secretaria':
      case 'apoio':
        return 'Secretaria / Apoio';
      case 'estudante':
      default:
        return 'Estudante';
    }
  };

  const getTipoBadgeClass = (t) => {
    switch (t) {
      case 'admin':
      case 'especialista':
        return 'badge-purple';
      case 'docente':
        return 'badge-blue';
      case 'secretaria':
      case 'apoio':
        return 'badge-orange';
      case 'estudante':
      default:
        return 'badge-green';
    }
  };

  // Contagens
  const totalUsers = utilizadores.length;
  const countEstudantes = utilizadores.filter(u => u.tipo === 'estudante').length;
  const countDocentes = utilizadores.filter(u => u.tipo === 'docente').length;
  const countAdmins = utilizadores.filter(u => u.tipo === 'admin' || u.tipo === 'especialista').length;

  return (
    <div className="container" style={{ paddingBottom: '3.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      <style>{`
        .users-admin-header {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tabs-header-bar {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .tab-btn-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: none;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-btn-pill:hover { background: #e2e8f0; color: #1e293b; }
        .tab-btn-pill.active {
          background: #0055a4;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0, 85, 164, 0.25);
        }

        .users-filter-bar {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .users-filter-form {
          display: flex;
          gap: 0.85rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .filter-field label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .users-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card-clean {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .stat-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .stat-card-val { font-size: 1.5rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
        .stat-card-lbl { font-size: 0.78rem; color: #64748b; font-weight: 600; margin-top: 0.15rem; }

        /* Desktop Table */
        .users-desktop-table {
          width: 100%;
          overflow-x: auto;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          margin-bottom: 1.5rem;
        }
        .users-desktop-table table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }
        .users-desktop-table th {
          background: #f8fafc;
          padding: 0.85rem 1rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        .users-desktop-table td {
          padding: 0.85rem 1rem;
          font-size: 0.87rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          vertical-align: middle;
        }
        .users-desktop-table tr:hover td {
          background: #f8fafc;
        }

        .badge-pill {
          display: inline-block;
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .badge-green { background: #d1fae5; color: #065f46; }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-purple { background: #ede9fe; color: #5b21b6; }
        .badge-orange { background: #fef3c7; color: #92400e; }
        .badge-red { background: #fee2e2; color: #991b1b; }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.38rem 0.65rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-action:hover { background: #f1f5f9; }
        .btn-action-edit:hover { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
        .btn-action-pass:hover { background: #fef3c7; border-color: #fde68a; color: #92400e; }
        .btn-action-del:hover { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }

        /* Modal */
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(3px);
          z-index: 1300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .admin-modal-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 1.75rem;
          max-width: 620px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25);
        }
      `}</style>

      {/* Header */}
      <div className="users-admin-header">
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0055a4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🔒 Painel de Controlo Exclusivo do Administrador
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Gestão de Utilizadores &amp; Permissões
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Controlo restrito de perfis, edição de tipos de utilizador, redefinição segura de palavras-passe e auditoria.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
        >
          <span>➕</span>
          <span>Criar Utilizador</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div style={{
          background: feedback.type === 'success' ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedback.type === 'success' ? '#065f46' : '#991b1b',
          borderRadius: '10px',
          padding: '0.85rem 1.25rem',
          margin: '1.25rem 0',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs: Utilizadores / Logs */}
      <div className="tabs-header-bar">
        <button
          type="button"
          className={`tab-btn-pill ${activeTab === 'utilizadores' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilizadores')}
        >
          <span>👥</span> Utilizadores Registados ({totalUsers})
        </button>

        <button
          type="button"
          className={`tab-btn-pill ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <span>📋</span> Registos de Auditoria / Logs
        </button>
      </div>

      {activeTab === 'utilizadores' && (
        <>
          {/* Stats Bar */}
          <div className="users-stats-grid">
            <div className="stat-card-clean">
              <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>👥</div>
              <div><div className="stat-card-val">{totalUsers}</div><div className="stat-card-lbl">Total de Utilizadores</div></div>
            </div>
            <div className="stat-card-clean">
              <div className="stat-card-icon" style={{ background: '#f0fdf4', color: '#047857' }}>🎓</div>
              <div><div className="stat-card-val">{countEstudantes}</div><div className="stat-card-lbl">Estudantes</div></div>
            </div>
            <div className="stat-card-clean">
              <div className="stat-card-icon" style={{ background: '#faf5ff', color: '#7e22ce' }}>👨‍🏫</div>
              <div><div className="stat-card-val">{countDocentes}</div><div className="stat-card-lbl">Docentes</div></div>
            </div>
            <div className="stat-card-clean">
              <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>🛡️</div>
              <div><div className="stat-card-val">{countAdmins}</div><div className="stat-card-lbl">Administradores</div></div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="users-filter-bar">
            <form onSubmit={handleFilterSubmit} className="users-filter-form">
              <div className="filter-field" style={{ flex: 1, minWidth: '220px' }}>
                <label>Pesquisar (Nome, Nº Estudante, Email, Curso)</label>
                <input
                  type="text"
                  className="isp-input"
                  placeholder="Ex: João, EST-2026, joao@ispotec..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-field" style={{ width: '180px' }}>
                <label>Tipo de Perfil</label>
                <select
                  className="isp-select"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="">Todos os Tipos</option>
                  <option value="estudante">Estudante</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Administrador</option>
                  <option value="secretaria">Secretaria / Apoio</option>
                </select>
              </div>

              <div className="filter-field" style={{ width: '160px' }}>
                <label>Estado da Conta</label>
                <select
                  className="isp-select"
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                >
                  <option value="">Todos os Estados</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="pendente">Pendente</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>

              <div className="filter-field" style={{ width: '200px' }}>
                <label>Filtrar por Curso</label>
                <select
                  className="isp-select"
                  value={cursoFiltro}
                  onChange={(e) => setCursoFiltro(e.target.value)}
                >
                  <option value="">Todos os Cursos</option>
                  <optgroup label="Licenciaturas ISPOTEC">
                    {CURSOS_ISPOTEC.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Técnicos Médios IFOPTEC">
                    {CURSOS_TECNICOS_MEDIOS_IFOPTEC.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ padding: '0.6rem 1rem' }}>
                🔍 Filtrar
              </button>
            </form>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p>A carregar utilizadores...</p>
            </div>
          ) : utilizadores.length === 0 ? (
            <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
              <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem' }}>Nenhum utilizador encontrado</h3>
              <p>Tente ajustar os filtros de pesquisa ou crie um novo utilizador.</p>
            </div>
          ) : (
            <div className="users-desktop-table">
              <table>
                <thead>
                  <tr>
                    <th>Utilizador</th>
                    <th>Contacto / Email</th>
                    <th>Perfil (Tipo)</th>
                    <th>Curso Associado</th>
                    <th>Estado</th>
                    <th>Data Registo</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizadores.map((u) => {
                    const avatarSrc = u.foto_perfil ? getFileUrl(u.foto_perfil) : null;
                    const initial = (u.nome ? u.nome.charAt(0) : 'U').toUpperCase();

                    return (
                      <tr key={u.id || u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {avatarSrc ? (
                              <img
                                src={avatarSrc}
                                alt={u.nome}
                                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0055a4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                {initial}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.nome}</div>
                              {u.numero_estudante && (
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Nº {u.numero_estudante}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{u.email}</div>
                          {u.telefone && <div style={{ fontSize: '0.74rem', color: '#64748b' }}>📞 {u.telefone}</div>}
                        </td>
                        <td>
                          <span className={`badge-pill ${getTipoBadgeClass(u.tipo)}`}>
                            {getTipoLabel(u.tipo)}
                          </span>
                        </td>
                        <td>
                          {u.curso ? (
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e3a8a' }}>
                              {u.curso}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge-pill ${u.status === 'aprovado' ? 'badge-green' : u.status === 'bloqueado' ? 'badge-red' : 'badge-orange'}`}>
                            {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Pendente'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {formatDate(u.data_registo)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn-action btn-action-edit"
                              onClick={() => handleOpenEdit(u)}
                              title="Editar Perfil, Tipo e Curso"
                            >
                              <span>✏️</span> Editar
                            </button>

                            <button
                              type="button"
                              className="btn-action btn-action-pass"
                              onClick={() => handleOpenResetPassword(u)}
                              title="Redefinir Senha do Utilizador"
                            >
                              <span>🔑</span> Senha
                            </button>

                            <button
                              type="button"
                              className="btn-action btn-action-del"
                              onClick={() => handleOpenDelete(u)}
                              title="Eliminar Utilizador"
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ABA DE AUDITORIA / LOGS (RF06) */}
      {activeTab === 'logs' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0f172a' }}>
                📋 Tabela de Auditoria &amp; Logs de Ações Administrativas
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Registo cronológico e inviolável de todas as alterações efectuadas pelo Administrador.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="isp-input"
                placeholder="Pesquisar nos registos..."
                style={{ width: '220px' }}
                value={searchLogs}
                onChange={(e) => setSearchLogs(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" onClick={loadLogs}>
                🔄 Actualizar
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p>A carregar registos de auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
              <p>Nenhum registo de auditoria encontrado.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Data / Hora</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Quem Fez (Admin)</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Acção</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Detalhes</th>
                    <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Utilizador Afectado</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={log.id || log._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {formatDate(log.data_hora)}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        🛡️ {log.autor_nome || 'Admin'}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.78rem' }}>
                          {log.acao}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: '#475569' }}>
                        {log.detalhes || '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {log.utilizador_afetado_nome ? (
                          <div>
                            <div>{log.utilizador_afetado_nome}</div>
                            {log.utilizador_afetado_email && (
                              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}>{log.utilizador_afetado_email}</div>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL 1: ADICIONAR NOVO UTILIZADOR (RF05)
          ======================================================== */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                ➕ Criar Novo Utilizador (Administrador)
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="isp-input"
                    placeholder="Ex: Manuel dos Santos Macamo"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Endereço de Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="isp-input"
                      placeholder="utilizador@ispotec.online"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Telefone de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      className="isp-input"
                      placeholder="Ex: (+258) 84 000 0000"
                      value={addForm.telefone}
                      onChange={(e) => setAddForm({ ...addForm, telefone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Tipo de Perfil *
                    </label>
                    <select
                      className="isp-select"
                      value={addForm.tipo}
                      onChange={(e) => setAddForm({ ...addForm, tipo: e.target.value })}
                    >
                      <option value="estudante">Estudante</option>
                      <option value="docente">Docente</option>
                      <option value="admin">Administrador</option>
                      <option value="secretaria">Secretaria / Apoio</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Estado da Conta
                    </label>
                    <select
                      className="isp-select"
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    >
                      <option value="aprovado">Aprovado (Ativo)</option>
                      <option value="pendente">Pendente</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>
                </div>

                {addForm.tipo === 'estudante' && (
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>
                          Curso Obrigatório (Estudante) *
                        </label>
                        <select
                          className="isp-select"
                          required
                          value={addForm.curso}
                          onChange={(e) => setAddForm({ ...addForm, curso: e.target.value })}
                        >
                          <option value="">-- Seleccione o Curso --</option>
                          <optgroup label="Licenciaturas ISPOTEC">
                            {CURSOS_ISPOTEC.map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                          <optgroup label="Técnicos Médios IFOPTEC">
                            {CURSOS_TECNICOS_MEDIOS_IFOPTEC.map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>
                          Nº de Estudante (Opcional)
                        </label>
                        <input
                          type="text"
                          className="isp-input"
                          value={addForm.numero_estudante}
                          onChange={(e) => setAddForm({ ...addForm, numero_estudante: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                      Palavra-passe Inicial * (mínimo 8 caracteres, 1 número, 1 maiúscula)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAddForm({ ...addForm, password: generateSecurePassword() })}
                      style={{ background: 'none', border: 'none', color: '#0055a4', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⚡ Gerar Senha Segura
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type={showAddPass ? 'text' : 'password'}
                      required
                      className="isp-input"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddPass(!showAddPass)}
                      title="Mostrar / Ocultar"
                    >
                      {showAddPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="mustChangeAdd"
                    checked={addForm.must_change_password}
                    onChange={(e) => setAddForm({ ...addForm, must_change_password: e.target.checked })}
                  />
                  <label htmlFor="mustChangeAdd" style={{ fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                    Obrigar o utilizador a alterar a palavra-passe no primeiro login
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={submittingAdd}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingAdd}
                >
                  {submittingAdd ? 'A criar...' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDITAR UTILIZADOR & PERFIL (RF01)
          ======================================================== */}
      {editingUser && (
        <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  ✏️ Editar Utilizador &amp; Perfil
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Utilizador: <strong>{editingUser.nome}</strong> ({editingUser.email})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="isp-input"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Endereço de Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="isp-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                      Telefone
                    </label>
                    <input
                      type="text"
                      className="isp-input"
                      placeholder="(+258) ..."
                      value={editForm.telefone}
                      onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                    />
                  </div>
                </div>

                {/* RF01: EDITAR TIPO DE UTILIZADOR */}
                <div style={{ background: '#f0fdf4', padding: '0.9rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '0.25rem' }}>
                        Tipo de Utilizador (Perfil) *
                      </label>
                      <select
                        className="isp-select"
                        value={editForm.tipo}
                        onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                      >
                        <option value="estudante">Estudante</option>
                        <option value="docente">Docente</option>
                        <option value="admin">Administrador</option>
                        <option value="secretaria">Secretaria / Apoio</option>
                      </select>
                      <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '0.25rem' }}>
                        {editForm.tipo !== editingUser.tipo ? (
                          <strong>⚠️ Mudança de perfil detectada! O sistema reconfigurará os acessos.</strong>
                        ) : 'Perfil atual do utilizador'}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                        Estado da Conta
                      </label>
                      <select
                        className="isp-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="aprovado">Aprovado (Ativo)</option>
                        <option value="pendente">Pendente</option>
                        <option value="bloqueado">Bloqueado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {editForm.tipo === 'estudante' && (
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>
                          Curso Obrigatório (Estudante) *
                        </label>
                        <select
                          className="isp-select"
                          required
                          value={editForm.curso}
                          onChange={(e) => setEditForm({ ...editForm, curso: e.target.value })}
                        >
                          <option value="">-- Seleccione o Curso --</option>
                          <optgroup label="Licenciaturas ISPOTEC">
                            {CURSOS_ISPOTEC.map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                          <optgroup label="Técnicos Médios IFOPTEC">
                            {CURSOS_TECNICOS_MEDIOS_IFOPTEC.map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '0.25rem' }}>
                          Nº de Estudante
                        </label>
                        <input
                          type="text"
                          className="isp-input"
                          value={editForm.numero_estudante}
                          onChange={(e) => setEditForm({ ...editForm, numero_estudante: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={submittingEdit}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: REDEFINIR SENHA DO UTILIZADOR (RF02)
          ======================================================== */}
      {resetPasswordUser && (
        <div className="admin-modal-overlay" onClick={() => setResetPasswordUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  🔑 Redefinir Palavra-passe
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Utilizador: <strong>{resetPasswordUser.nome}</strong> ({resetPasswordUser.email})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e' }}>
                  <strong>Regra de Segurança:</strong> A nova palavra-passe deve ter pelo menos 8 caracteres, com pelo menos 1 número e 1 letra maiúscula.
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                      Nova Palavra-passe *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const pass = generateSecurePassword();
                        setPasswordForm({ ...passwordForm, newPassword: pass, confirmPassword: pass });
                      }}
                      style={{ background: 'none', border: 'none', color: '#0055a4', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ⚡ Gerar Senha Segura
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type={showResetPass ? 'text' : 'password'}
                      required
                      minLength={8}
                      className="isp-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowResetPass(!showResetPass)}
                      title="Mostrar / Ocultar"
                    >
                      {showResetPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.25rem' }}>
                    Confirmar Nova Palavra-passe *
                  </label>
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    className="isp-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    id="mustChangeReset"
                    checked={passwordForm.mustChange}
                    onChange={(e) => setPasswordForm({ ...passwordForm, mustChange: e.target.checked })}
                  />
                  <label htmlFor="mustChangeReset" style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                    Obrigar utilizador a alterar a palavra-passe no primeiro login
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetPasswordUser(null)}
                  disabled={submittingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPassword}
                >
                  {submittingPassword ? 'A actualizar...' : 'Confirmar & Redefinir Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: ELIMINAR UTILIZADOR
          ======================================================== */}
      {deletingUser && (
        <div className="admin-modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#991b1b' }}>
              Confirmar Eliminação
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
              Tem a certeza de que deseja eliminar permanentemente a conta de{' '}
              <strong>{deletingUser.nome}</strong> ({deletingUser.email})?
              <br />
              <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Esta acção será gravada nos registos de auditoria e não poderá ser revertida.</span>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingUser(null)}
                disabled={submittingDelete}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleDeleteConfirm}
                disabled={submittingDelete}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', fontWeight: 700 }}
              >
                {submittingDelete ? 'A eliminar...' : 'Sim, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
