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
      {/* Page Header with Action Button */}
      <div className="page-header" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
            marginBottom: '1.5rem',
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
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
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

          <div style={{ width: '200px' }}>
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

          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              <span>🔍</span>
              <span>Filtrar</span>
            </button>
          </div>
        </form>
      </div>

      {/* Users Data Table */}
      <div className="table-responsive" style={{ background: '#fff', borderRadius: 'var(--isp-radius-lg)', boxShadow: 'var(--isp-shadow-sm)', overflow: 'hidden' }}>
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
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--isp-slate-500)' }}>
                  A carregar utilizadores...
                </td>
              </tr>
            ) : utilizadores.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state" style={{ border: 'none', padding: '2.5rem 1rem' }}>
                    <span className="empty-state-icon">👥</span>
                    <h3 className="empty-state-title">Nenhum utilizador encontrado</h3>
                    <p className="empty-state-desc">Não foram encontrados registos correspondentes aos filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              utilizadores.map((u) => {
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
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'center' }}>
                        {/* Edit Profile (Photo & Email only) */}
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Perfil (Email e Foto)"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>

                        {/* Reset Password */}
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleOpenResetPassword(u)}
                          title="Alterar Palavra-passe"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>🔑</span>
                          <span>Password</span>
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleOpenDelete(u)}
                          title="Eliminar Utilizador"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>🗑️</span>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span>←</span>
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>

      {/* ========================================================
          MODAL 1: ADD NEW USER
          ======================================================== */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--isp-radius-lg)',
              maxWidth: '550px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--isp-shadow-xl)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--isp-slate-900)' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
          MODAL 2: EDIT USER PROFILE (Email & Photo only)
          ======================================================== */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--isp-radius-lg)',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--isp-shadow-xl)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--isp-slate-900)' }}>
                  ✏️ Editar Perfil do Utilizador
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--isp-slate-500)' }}>
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
                {/* Email address field */}
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

                {/* Profile photo field */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--isp-slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                    Foto de Perfil
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
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
                    <div style={{ flex: 1 }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
          MODAL 3: CHANGE / RESET PASSWORD (Direct setting by Admin)
          ======================================================== */}
      {resetPasswordUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--isp-radius-lg)',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--isp-shadow-xl)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--isp-slate-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--isp-slate-900)' }}>
                  🔑 Definir Nova Palavra-passe
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--isp-slate-500)' }}>
                  Para o utilizador: <strong>{resetPasswordUser.nome}</strong> ({resetPasswordUser.email})
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--isp-slate-200)', paddingTop: '1rem' }}>
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
          MODAL 4: DELETE CONFIRMATION
          ======================================================== */}
      {deletingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--isp-radius-lg)',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--isp-shadow-xl)',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: '#991b1b' }}>
              Confirmar Eliminação
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--isp-slate-600)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Tem a certeza de que deseja eliminar permanentemente a conta de{' '}
              <strong>{deletingUser.nome}</strong> ({deletingUser.email})?
              <br />
              <span style={{ fontSize: '0.82rem', color: '#dc2626' }}>Esta ação não poderá ser revertida.</span>
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
                style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 600 }}
              >
                {submittingDelete ? 'A eliminar...' : 'Sim, Eliminar Utilizador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
