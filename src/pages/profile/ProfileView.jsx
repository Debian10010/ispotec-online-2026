import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { portfolioService } from '../../services/portfolioService';

export default function ProfileView() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [userData, setUserData] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!userId) {
        navigate('/dashboard');
        return;
      }

      // If viewing own profile, redirect to /profile
      if (currentUser && String(userId) === String(currentUser.id)) {
        navigate('/profile');
        return;
      }

      setLoading(true);
      const targetUser = await userService.getUserById(userId);
      if (!targetUser) {
        navigate('/dashboard');
        return;
      }

      setUserData(targetUser);
      const items = await portfolioService.getByUserId(userId);
      setPortfolioItems(items);
      setLoading(false);
    }
    loadData();
  }, [userId, currentUser, navigate]);

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

  if (loading) {
    return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>A carregar...</div>;
  }

  if (!userData) return null;

  return (
    <>
      <style>{`
        .container-profile {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 600;
            margin-bottom: 1.5rem;
            transition: color 0.2s;
        }
        .btn-back:hover { color: var(--secondary-blue); }

        .profile-layout {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 2rem;
            align-items: start;
        }

        @media (max-width: 900px) {
            .profile-layout {
                grid-template-columns: 1fr;
            }
        }

        .profile-avatar {
            width: 150px;
            height: 150px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid var(--white);
            box-shadow: 0 5px 15px rgba(67, 97, 238, 0.2);
            transition: transform 0.3s;
        }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .avatar-placeholder {
            width: 100%; height: 100%;
            background: var(--secondary-blue);
            color: white;
            display: flex; align-items: center; justify-content: center;
            font-size: 3.5rem; font-weight: bold;
        }

        .info-list p {
            margin-bottom: 0.8rem;
            font-size: 0.95rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
        }
        .info-list strong { color: var(--secondary-blue); display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; }

        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .portfolio-card {
            background: var(--light-gray);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border-color);
            padding: 1.25rem;
            transition: transform 0.2s;
        }
        .portfolio-card:hover {
            transform: translateY(-3px);
            border-color: var(--secondary-blue);
        }
      `}</style>

      <div className="container-profile">
        <Link to="/users" className="btn-back">
          ← Voltar à Lista de Utilizadores
        </Link>

        <div className="profile-layout">
          {/* Coluna Esquerda */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="profile-avatar">
              {userData.foto_perfil ? (
                <img src={userData.foto_perfil} alt={userData.nome} />
              ) : (
                <div className="avatar-placeholder">
                  {userData.nome.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-dark)', fontSize: '1.4rem' }}>
              {userData.nome}
            </h2>

            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              marginBottom: '1.5rem'
            }}>
              {userData.tipo ? userData.tipo.charAt(0).toUpperCase() + userData.tipo.slice(1) : ''}
            </span>

            <div className="info-list" style={{ textAlign: 'left' }}>
              <p>
                <strong>Email</strong>
                {userData.email}
              </p>
              {userData.curso && (
                <p>
                  <strong>Curso / Área</strong>
                  {userData.curso}
                </p>
              )}
              {userData.nivel_academico && (
                <p>
                  <strong>Nível Académico</strong>
                  {userData.nivel_academico.charAt(0).toUpperCase() + userData.nivel_academico.slice(1)}
                </p>
              )}
              <p>
                <strong>Membro desde</strong>
                {formatDate(userData.data_registo)}
              </p>
            </div>
          </div>

          {/* Coluna Direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Biografia */}
            <div className="card">
              <h3 style={{ marginTop: 0, color: 'var(--secondary-blue)', borderBottom: '2px solid var(--light-gray)', paddingBottom: '10px', marginBottom: '1rem' }}>
                Biografia
              </h3>
              <p style={{ color: userData.bio ? 'var(--text-dark)' : 'var(--text-muted)', fontStyle: userData.bio ? 'normal' : 'italic', lineHeight: 1.6 }}>
                {userData.bio || 'Este utilizador ainda não adicionou uma biografia.'}
              </p>
            </div>

            {/* Portfólio */}
            <div className="card">
              <h3 style={{ marginTop: 0, color: 'var(--secondary-blue)', borderBottom: '2px solid var(--light-gray)', paddingBottom: '10px', marginBottom: '1.5rem' }}>
                Portfólio e Trabalhos Académicos
              </h3>

              {portfolioItems.length > 0 ? (
                <div className="portfolio-grid">
                  {portfolioItems.map(item => (
                    <div className="portfolio-card" key={item.id}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {item.categoria ? item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1) : 'Trabalho'}
                      </span>
                      <h4 style={{ margin: '0.5rem 0', fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                        {item.titulo}
                      </h4>
                      {item.descricao && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                          {item.descricao}
                        </p>
                      )}
                      <a 
                        href={item.ficheiro || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                      >
                        Ver Documento ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', margin: '1rem 0' }}>
                  Nenhum trabalho partilhado no portfólio ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
