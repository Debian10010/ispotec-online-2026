import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { portfolioService } from '../../services/portfolioService';

export default function Profile() {
  const { user, updateCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    nome: '',
    curso: '',
    nivel_academico: '',
    bio: ''
  });

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [modalFotoUrl, setModalFotoUrl] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const fullUser = await userService.getUserById(user.id);
        if (fullUser) {
          setFormData({
            nome: fullUser.nome || '',
            curso: fullUser.curso || '',
            nivel_academico: fullUser.nivel_academico || '',
            bio: fullUser.bio || ''
          });
        }
        const items = await portfolioService.getByUserId(user.id);
        setPortfolioItems(items);
      }
    }
    loadData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!formData.nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }

    try {
      const updated = await userService.updateProfile(user.id, formData);
      updateCurrentUser(updated);
      setMensagem('Dados actualizados com sucesso!');
    } catch {
      setErro('Erro ao atualizar dados.');
    }
  };

  const handleUploadFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      alert('A imagem é muito grande! Tente uma imagem com menos de 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    userService.updateAvatar(user.id, previewUrl);
    updateCurrentUser({ foto_perfil: previewUrl });
    setMensagem('Foto de perfil actualizada!');
  };

  const fotoUrl = user?.foto_perfil || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'User')}&background=4361ee&color=fff&size=256`;

  const openFoto = () => {
    if (user?.foto_perfil) {
      setModalFotoUrl(user.foto_perfil);
      setShowModal(true);
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
      return dateString || '-';
    }
  };

  return (
    <>
      <style>{`
        .profile-container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .profile-grid {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 2rem;
            align-items: start;
        }

        @media (max-width: 900px) {
            .profile-grid {
                grid-template-columns: 1fr;
            }
        }

        .profile-header {
            text-align: center;
            position: relative;
        }

        .avatar-wrapper {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 1.5rem;
        }

        .avatar-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 4px solid var(--white);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.2);
            cursor: zoom-in;
            transition: transform 0.3s ease;
        }

        .avatar-img:hover {
            transform: scale(1.02);
        }

        .btn-camera {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: var(--primary-blue);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 3px solid var(--white);
            transition: background 0.3s;
        }

        .btn-camera:hover {
            background: var(--secondary-blue);
        }

        .portfolio-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 0.8rem;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .portfolio-item:hover {
            background: white;
            border-color: var(--primary-blue);
            transform: translateX(5px);
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        }

        .modal-content-img {
            max-width: 90%;
            max-height: 90%;
            position: relative;
        }

        .modal-content-img img {
            max-width: 100%;
            max-height: 80vh;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .close-modal {
            position: absolute;
            top: 20px;
            right: 30px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        }
      `}</style>

      <div className="profile-container">
        {mensagem && <div className="alert alert-success">{mensagem}</div>}
        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="profile-grid">
          {/* Coluna Esquerda: Cartão de Perfil */}
          <div className="card">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <img 
                  src={fotoUrl} 
                  alt="Perfil" 
                  className="avatar-img" 
                  onClick={openFoto} 
                />

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleUploadFoto}
                />

                <button 
                  type="button" 
                  className="btn-camera" 
                  title="Alterar foto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷
                </button>
              </div>

              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-blue)' }}>
                {user?.nome}
              </h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                {user?.email}
              </p>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'left' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Tipo:</strong>{' '}
                  <span style={{ float: 'right' }}>
                    {user?.tipo ? user.tipo.charAt(0).toUpperCase() + user.tipo.slice(1) : '-'}
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Membro desde:</strong>{' '}
                  <span style={{ float: 'right' }}>
                    {formatDate(user?.data_registo)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Edição & Portfólio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Editar Informações */}
            <div className="card">
              <h3 style={{
                marginTop: 0,
                color: 'var(--primary-blue)',
                borderBottom: '2px solid var(--light-gray)',
                paddingBottom: '10px',
                marginBottom: '1.5rem'
              }}>
                Editar Informações
              </h3>

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo</label>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    value={formData.nome}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="curso">Curso / Área</label>
                    <input 
                      type="text" 
                      id="curso" 
                      name="curso" 
                      value={formData.curso}
                      onChange={handleChange}
                      placeholder="Ex: Engenharia Informática" 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nivel_academico">Nível Académico</label>
                    <select 
                      id="nivel_academico" 
                      name="nivel_academico"
                      value={formData.nivel_academico}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione...</option>
                      <option value="licenciatura">Licenciatura</option>
                      <option value="mestrado">Mestrado</option>
                      <option value="doutoramento">Doutoramento</option>
                      <option value="tecnico">Técnico</option>
                      <option value="bacharelato">Bacharelato</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Biografia Curta</label>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    rows="3" 
                    placeholder="Fale um pouco sobre seus objetivos..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Salvar Alterações
                </button>
              </form>
            </div>

            {/* Portfólio */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>Meu Portfólio</h3>
                <Link to="/profile/portfolio-add" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  + Adicionar
                </Link>
              </div>

              {portfolioItems.length > 0 ? (
                portfolioItems.map(item => (
                  <div className="portfolio-item" key={item.id}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-dark)' }}>{item.titulo}</strong>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {item.categoria ? item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1) : 'Geral'}
                      </small>
                    </div>
                    <a href={item.ficheiro || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}>
                      🔗
                    </a>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                  Nenhum item adicionado ainda.
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>

      {/* Modal Zoom Foto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <span className="close-modal">&times;</span>
          <div className="modal-content-img" onClick={(e) => e.stopPropagation()}>
            <img src={modalFotoUrl} alt="Foto Grande" />
          </div>
        </div>
      )}
    </>
  );
}
