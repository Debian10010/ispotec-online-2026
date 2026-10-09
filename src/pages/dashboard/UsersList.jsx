import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { api, getFileUrl } from '../../services/api';

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroTipo = searchParams.get('tipo') || '';
  const filtroStatus = searchParams.get('status') || '';

  const [tipo, setTipo] = useState(filtroTipo);
  const [searchQuery, setSearchQuery] = useState('');
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
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
    status: 'aprovado',
    foto_perfil: '',
  });
  const [addAvatarFile, setAddAvatarFile] = useState(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit user profile form state (Editable fields: Photo and Email only)
  const [editForm, setEditForm] = useState({
    email: '',
    foto_perfil: '',
  });
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Reset password form state (Admin directly sets new password)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Delete submission state
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getAllUsers({
      tipo: filtroTipo,
      status: filtroStatus,
      search: searchQuery,
    });
    setUtilizadores(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [filtroTipo, filtroStatus]);

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (tipo) params.tipo = tipo;
    if (filtroStatus) params.status = filtroStatus;
    setSearchParams(params);
    loadUsers();
  };

  const showNotification = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  // Helper to handle avatar file upload
  const handleUploadImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('ficheiro', file);
    try {
      const res = await api.upload('/upload', formData);
      if (res.sucesso && res.dados?.url) {
        return res.dados.url;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 1. ADD NEW USER
  const handleOpenAdd = () => {
    setAddForm({
      nome: '',
      email: '',
      password: '',
      tipo: 'estudante',
      curso: '',
      nivel_academico: '',
      status: 'aprovado',
      foto_perfil: '',
    });
    setAddAvatarFile(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.nome.trim() || !addForm.email.trim() || !addForm.password) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (addForm.password.length < 8) {
      showNotification('error', 'A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    setSubmittingAdd(true);
    try {
      let finalFoto = addForm.foto_perfil;
      if (addAvatarFile) {
        const uploadedUrl = await handleUploadImage(addAvatarFile);
        if (uploadedUrl) {
          finalFoto = uploadedUrl;
        }
      }

      const res = await userService.createUser({
        ...addForm,
        foto_perfil: finalFoto,
      });

      if (res.sucesso) {
        showNotification('success', res.mensagem || 'Utilizador adicionado com sucesso!');
        setShowAddModal(false);
        loadUsers();
      } else {
        showNotification('error', res.mensagem || 'Não foi possível adicionar o utilizador.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao adicionar utilizador.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // 2. EDIT USER PROFILE (Email & Photo only)
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      foto_perfil: user.foto_perfil || '',
    });
    setEditAvatarFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.email.trim()) {
      showNotification('error', 'O endereço de email é obrigatório.');
      return;
    }

    setSubmittingEdit(true);
    try {
      let finalFoto = editForm.foto_perfil;
      if (editAvatarFile) {
        const uploadedUrl = await handleUploadImage(editAvatarFile);
        if (uploadedUrl) {
          finalFoto = uploadedUrl;
        }
      }

      const res = await userService.updateUserProfileByAdmin(editingUser.id, {
        email: editForm.email.trim(),
        foto_perfil: finalFoto,
      });

      if (res.sucesso) {
        showNotification('success', res.mensagem || 'Perfil do utilizador atualizado com sucesso!');
        setEditingUser(null);
        loadUsers();
      } else {
        showNotification('error', res.mensagem || 'Não foi possível atualizar o perfil.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao atualizar perfil.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // 3. CHANGE / RESET USER PASSWORD (Directly set new password)
  const handleOpenResetPassword = (user) => {
    setResetPasswordUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      showNotification('error', 'A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('error', 'As palavras-passe não coincidem.');
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await userService.resetPasswordByAdmin(
        resetPasswordUser.id,
        passwordForm.newPassword
      );

      if (res.sucesso) {
        showNotification('success', res.mensagem || 'Palavra-passe alterada com sucesso!');
        setResetPasswordUser(null);
      } else {
        showNotification('error', res.mensagem || 'Não foi possível alterar a palavra-passe.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Erro ao alterar palavra-passe.');
    } finally {
      setSubmittingPassword(false);
    }
  };

  // 4. DELETE USER (With confirmation)
  const handleOpenDelete = (user) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setSubmittingDelete(true);
    try {
      const res = await userService.deleteUser(deletingUser.id);
      if (res.sucesso) {
        showNotification('success', res.mensagem || 'Utilizador eliminado com sucesso!');
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
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dateString || '—';
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <style>{`
        .users-admin-header {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .users-filter-bar {
          margin-bottom: 1.5rem;
          padding: 1.25rem 1.5rem;
        }

        .users-filter-form {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .filter-field-search {
          flex: 1;
          min-width: 220px;
        }

        .filter-field-select {
          width: 220px;
        }

        /* ===== Desktop Table — always visible on large screens ===== */
        .users-desktop-table {
          display: block !important;
        }

        /* ===== Mobile / Tablet Cards — hidden by default ===== */
        .users-mobile-cards {
          display: none !important;
        }

        /* ===== Table action buttons ===== */
        .user-table-actions {
          display: flex;
          gap: 0.4rem;
          justify-content: flex-end;
          flex-wrap: nowrap;
          align-items: center;
        }

        .user-table-actions .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.7rem;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: var(--isp-radius-sm);
          border: 1px solid var(--isp-slate-200);
          background: var(--isp-white);
          color: var(--isp-slate-700);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .user-table-actions .btn-action:hover {
          background: var(--isp-slate-50);
          border-color: var(--isp-slate-300);
        }

        .user-table-actions .btn-action.btn-edit:hover {
          background: var(--isp-blue-50);
          border-color: var(--isp-blue-500);
          color: var(--isp-blue-700);
        }

        .user-table-actions .btn-action.btn-password:hover {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #92400e;
        }

        .user-table-actions .btn-action.btn-delete {
          color: #dc2626;
          border-color: #fca5a5;
        }

        .user-table-actions .btn-action.btn-delete:hover {
          background: #fee2e2;
          border-color: #dc2626;
        }

        /* Mobile card styles */
        .user-mobile-card {
          background: #ffffff;
          border-radius: var(--isp-radius-lg);
          border: 1px solid var(--isp-slate-200);
          box-shadow: var(--isp-shadow-sm);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .user-mobile-card-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .user-mobile-card-meta {
          flex: 1;
          min-width: 0;
        }

        .user-mobile-card-name {
          font-weight: 700;
          color: var(--isp-slate-900);
          font-size: 1rem;
          line-height: 1.3;
          margin-bottom: 0.2rem;
          word-break: break-word;
        }

        .user-mobile-card-email {
          color: var(--isp-slate-600);
          font-size: 0.85rem;
          word-break: break-all;
        }

        .user-mobile-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          align-items: center;
        }

        .user-mobile-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          background: var(--isp-slate-50);
          border: 1px solid var(--isp-slate-200);
          border-radius: var(--isp-radius-md);
          padding: 0.75rem;
          font-size: 0.82rem;
        }

        .user-mobile-detail-item {
          display: flex;
          flex-direction: column;
        }

        .user-mobile-detail-label {
          color: var(--isp-slate-500);
          font-size: 0.72rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .user-mobile-detail-value {
          color: var(--isp-slate-800);
          font-weight: 500;
          word-break: break-word;
        }

        .user-mobile-actions-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--isp-slate-100);
        }

        .user-mobile-actions-bar button,
        .user-mobile-actions-bar a {
          padding: 0.6rem 0.4rem;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border-radius: var(--isp-radius-md);
          border: 1px solid var(--isp-slate-200);
          background: var(--isp-white);
          color: var(--isp-slate-700);
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
        }

        /* ===== TABLET: switch to cards at 860px ===== */
        @media (max-width: 860px) {
          .users-desktop-table {
            display: none !important;
          }

          .users-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 1rem;
          }

          .users-admin-header {
            flex-direction: column;
            align-items: stretch;
          }

          .users-admin-header > div:last-child {
            width: 100%;
          }

          .users-admin-header > div:last-child .btn {
            width: 100%;
            justify-content: center;
          }

          .users-filter-form {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
          }

          .filter-field-search,
          .filter-field-select {
            width: 100% !important;
            min-width: 100% !important;
          }

          .users-filter-form button {
            width: 100%;
            justify-content: center;
          }
        }

        /* ===== SMALL MOBILE: stack action buttons ===== */
        @media (max-width: 400px) {
          .user-mobile-details-grid {
            grid-template-columns: 1fr;
          }

          .user-mobile-actions-bar {
            grid-template-columns: 1fr;
          }
        }

        /* ===== MODAL styles ===== */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 0.75rem;
        }

        .admin-modal-card {
          background: #ffffff;
          border-radius: var(--isp-radius-lg);
          max-width: 560px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--isp-shadow-xl);
          padding: 1.75rem;
          border: 1px solid var(--isp-slate-200);
        }

        .modal-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          border-top: 1px solid var(--isp-slate-200);
          padding-top: 1rem;
        }

        @media (max-width: 600px) {
          .admin-modal-card {
            padding: 1.25rem;
            max-height: 94vh;
          }

          .modal-grid-2col {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }

          .modal-footer-btns {
            flex-direction: column;
          }

          .modal-footer-btns button {
            width: 100%;
          }
        }
      `}</style>

      {/* Page Header with Action Button */}
      <div className="users-admin-header">
        <div>
          <h1 className="page-title">Gestão de Utilizadores</h1>
          <p className="page-description">Painel de administração para gestão de contas, perfis e credenciais</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 600 }}
          >
            <span>➕</span>
            <span>Adicionar Novo Utilizador</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {feedback && (
        <div
          style={{
            padding: '1rem 1.25rem',
            margin: '1.25rem 0',
            borderRadius: 'var(--isp-radius-md)',
            backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="card users-filter-bar">
        <form onSubmit={handleFilter} className="users-filter-form">
          <div className="filter-field-search">
            <label htmlFor="search-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--isp-slate-600)', marginBottom: '0.35rem', display: 'block' }}>
              Pesquisar por Nome ou Email
            </label>
            <input
              id="search-input"
              type="text"
              placeholder="Digite o nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="isp-input"
            />
          </div>

          <div className="filter-field-select">
            <label htmlFor="tipo-filter" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--isp-slate-600)', marginBottom: '0.35rem', display: 'block' }}>
              Filtrar por Perfil
            </label>
            <select
              id="tipo-filter"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="isp-select"
            >
              <option value="">Todos os perfis</option>
              <option value="estudante">Estudante</option>
              <option value="docente">Docente</option>
              <option value="especialista">Especialista (Admin)</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              <span>🔍</span>
              <span>Filtrar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading & Empty states */}
      {loading ? (
        <div className="card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--isp-slate-500)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
          A carregar utilizadores...
        </div>
      ) : utilizadores.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3.5rem 1rem' }}>
          <span className="empty-state-icon">👥</span>
          <h3 className="empty-state-title">Nenhum utilizador encontrado</h3>
          <p className="empty-state-desc">Não foram encontrados registos correspondentes aos filtros seleccionados.</p>
        </div>
      ) : (
        <>
          {/* 1. Desktop Table View */}
          <div className="table-responsive users-desktop-table" style={{ background: '#fff', borderRadius: 'var(--isp-radius-lg)', boxShadow: 'var(--isp-shadow-sm)', overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Foto</th>
                  <th>Nome Completo</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Curso / Especialidade</th>
                  <th>Estado</th>
                  <th>Data Registo</th>
                  <th style={{ textAlign: 'center', minWidth: '220px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {utilizadores.map((u) => {
                  const avatarSrc = u.foto_perfil ? getFileUrl(u.foto_perfil) : null;
                  const initial = (u.nome ? u.nome.charAt(0) : 'U').toUpperCase();

                  return (
                    <tr key={u.id}>
                      <td>
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={u.nome}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--isp-blue-600), var(--isp-purple-600))',
                            color: '#fff',
                            display: avatarSrc ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                          }}
                        >
                          {initial}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--isp-slate-900)' }}>{u.nome}</td>
                      <td style={{ color: 'var(--isp-slate-600)' }}>{u.email}</td>
                      <td>
                        <span className={`badge badge-info user-badge-${u.tipo}`}>
                          {u.tipo ? u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1) : '-'}
                        </span>
                      </td>
                      <td>{u.curso || '—'}</td>
                      <td>
                        <span className={`badge ${u.status === 'aprovado' ? 'badge-success' : 'badge-warning'}`}>
                          {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--isp-slate-500)' }}>{formatDate(u.data_registo)}</td>
                      <td style={{ textAlign: 'right', minWidth: '200px', paddingRight: '1rem' }}>
                        <div className="user-table-actions">
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => handleOpenEdit(u)}
                            title="Editar Email e Foto de Perfil"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className="btn-action btn-password"
                            onClick={() => handleOpenResetPassword(u)}
                            title="Alterar Palavra-passe"
                          >
                            <span>🔑</span>
                            <span>Password</span>
                          </button>

                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleOpenDelete(u)}
                            title="Eliminar Utilizador"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile & Tablet Card Layout */}
          <div className="users-mobile-cards">
            {utilizadores.map((u) => {
              const avatarSrc = u.foto_perfil ? getFileUrl(u.foto_perfil) : null;
              const initial = (u.nome ? u.nome.charAt(0) : 'U').toUpperCase();

              return (
                <div className="user-mobile-card" key={`mobile-${u.id}`}>
                  <div className="user-mobile-card-header">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={u.nome}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--isp-blue-600), var(--isp-purple-600))',
                        color: '#fff',
                        display: avatarSrc ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>

                    <div className="user-mobile-card-meta">
                      <div className="user-mobile-card-name">{u.nome}</div>
                      <div className="user-mobile-card-email">{u.email}</div>
                    </div>
                  </div>

                  <div className="user-mobile-badges">
                    <span className={`badge badge-info user-badge-${u.tipo}`}>
                      {u.tipo ? u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1) : '-'}
                    </span>
                    <span className={`badge ${u.status === 'aprovado' ? 'badge-success' : 'badge-warning'}`}>
                      {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : '-'}
                    </span>
                  </div>

                  <div className="user-mobile-details-grid">
                    <div className="user-mobile-detail-item">
                      <span className="user-mobile-detail-label">Curso / Especialidade</span>
                      <span className="user-mobile-detail-value">{u.curso || '—'}</span>
                    </div>
                    <div className="user-mobile-detail-item">
                      <span className="user-mobile-detail-label">Data de Registo</span>
                      <span className="user-mobile-detail-value">{formatDate(u.data_registo)}</span>
                    </div>
                  </div>

                  <div className="user-mobile-actions-bar">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleOpenEdit(u)}
                    >
                      <span>✏️</span>
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleOpenResetPassword(u)}
                    >
                      <span>🔑</span>
                      <span>Password</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleOpenDelete(u)}
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    >
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span>←</span>
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      {/* ========================================================
          MODAL 1: ADD NEW USER (Responsive)
          ======================================================== */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--isp-slate-900)' }}>
                ➕ Adicionar Novo Utilizador
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--isp-slate-500)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                    placeholder="Ex: João Manuel dos Santos"
                    className="isp-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Endereço de Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="Ex: joao.santos@ispotec.online"
                    className="isp-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Palavra-passe Inicial * (mínimo 8 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="isp-input"
                  />
                </div>

                <div className="modal-grid-2col">
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                      Perfil / Tipo
                    </label>
                    <select
                      value={addForm.tipo}
                      onChange={(e) => setAddForm({ ...addForm, tipo: e.target.value })}
                      className="isp-select"
                    >
                      <option value="estudante">Estudante</option>
                      <option value="docente">Docente</option>
                      <option value="especialista">Especialista (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                      Estado da Conta
                    </label>
                    <select
                      value={addForm.status}
                      onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                      className="isp-select"
                    >
                      <option value="aprovado">Aprovado (Ativo)</option>
                      <option value="pendente">Pendente</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>
                </div>

                <div className="modal-grid-2col">
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                      Curso / Departamento
                    </label>
                    <input
                      type="text"
                      value={addForm.curso}
                      onChange={(e) => setAddForm({ ...addForm, curso: e.target.value })}
                      placeholder="Ex: Engenharia Informática"
                      className="isp-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                      Nível Académico
                    </label>
                    <select
                      value={addForm.nivel_academico}
                      onChange={(e) => setAddForm({ ...addForm, nivel_academico: e.target.value })}
                      className="isp-select"
                    >
                      <option value="">Não aplicável / Outro</option>
                      <option value="licenciatura">Licenciatura</option>
                      <option value="mestrado">Mestrado</option>
                      <option value="doutoramento">Doutoramento</option>
                      <option value="tecnico">Técnico</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Foto de Perfil (Ficheiro de Imagem ou URL)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAddAvatarFile(e.target.files[0] || null)}
                    className="isp-input"
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <input
                    type="text"
                    value={addForm.foto_perfil}
                    onChange={(e) => setAddForm({ ...addForm, foto_perfil: e.target.value })}
                    placeholder="Ou cole o URL da imagem..."
                    className="isp-input"
                  />
                </div>
              </div>

              <div className="modal-footer-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
                  {submittingAdd ? 'A guardar...' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: EDIT USER PROFILE (Responsive)
          ======================================================== */}
      {editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--isp-slate-900)' }}>
                  ✏️ Editar Perfil do Utilizador
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--isp-slate-500)' }}>
                  {editingUser.nome} ({editingUser.tipo})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--isp-slate-500)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Endereço de Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="utilizador@ispotec.online"
                    className="isp-input"
                  />
                  <small style={{ color: 'var(--isp-slate-500)', fontSize: '0.78rem' }}>
                    O email é utilizado para autenticação no portal.
                  </small>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Foto de Perfil
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {editForm.foto_perfil ? (
                      <img
                        src={getFileUrl(editForm.foto_perfil)}
                        alt="Pré-visualização"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'var(--isp-slate-200)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--isp-slate-600)',
                          fontWeight: 'bold',
                        }}
                      >
                        👤
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setEditAvatarFile(file || null);
                          if (file) {
                            setEditForm({ ...editForm, foto_perfil: URL.createObjectURL(file) });
                          }
                        }}
                        className="isp-input"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editForm.foto_perfil.startsWith('blob:') ? '' : editForm.foto_perfil}
                    onChange={(e) => setEditForm({ ...editForm, foto_perfil: e.target.value })}
                    placeholder="Ou insira o URL da foto..."
                    className="isp-input"
                  />
                </div>
              </div>

              <div className="modal-footer-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
                  {submittingEdit ? 'A atualizar...' : 'Guardar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CHANGE / RESET PASSWORD (Responsive)
          ======================================================== */}
      {resetPasswordUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--isp-slate-900)' }}>
                  🔑 Definir Nova Palavra-passe
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--isp-slate-500)' }}>
                  Para: <strong>{resetPasswordUser.nome}</strong> ({resetPasswordUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--isp-slate-500)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Nova Palavra-passe * (mínimo 8 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Digite a nova palavra-passe..."
                    className="isp-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Confirmar Nova Palavra-passe *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repita a nova palavra-passe..."
                    className="isp-input"
                  />
                </div>
              </div>

              <div className="modal-footer-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
                  {submittingPassword ? 'A alterar...' : 'Atualizar Palavra-passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: DELETE CONFIRMATION (Responsive)
          ======================================================== */}
      {deletingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#991b1b' }}>
              Confirmar Eliminação
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--isp-slate-600)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Tem a certeza de que deseja eliminar permanentemente a conta de{' '}
              <strong>{deletingUser.nome}</strong> ({deletingUser.email})?
              <br />
              <span style={{ fontSize: '0.82rem', color: '#dc2626' }}>Esta ação não poderá ser revertida.</span>
            </p>

            <div className="modal-footer-btns" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
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
                style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 600 }}
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
