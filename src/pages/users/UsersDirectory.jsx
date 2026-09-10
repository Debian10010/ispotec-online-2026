import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const avatarColors = {
  A: '#ef4444', B: '#f97316', C: '#f59e0b', D: '#eab308',
  E: '#84cc16', F: '#22c55e', G: '#10b981', H: '#14b8a6',
  I: '#06b6d4', J: '#0ea5e9', K: '#3b82f6', L: '#6366f1',
  M: '#8b5cf6', N: '#a855f7', O: '#d946ef', P: '#ec4899',
  Q: '#f43f5e', R: '#ef4444', S: '#f97316', T: '#f59e0b',
  U: '#84cc16', V: '#22c55e', W: '#06b6d4', X: '#3b82f6',
  Y: '#8b5cf6', Z: '#ec4899'
};

export default function UsersDirectory() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = searchParams.get('q') || '';
  const tipoParam = searchParams.get('tipo') || '';

  const [q, setQ] = useState(qParam);
  const [tipo, setTipo] = useState(tipoParam);
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await userService.getAllUsers({
        status: 'aprovado',
        tipo: tipoParam,
        search: qParam
      });
      // Filter out current user from directory
      const filtered = all.filter(u => String(u.id) !== String(currentUser?.id));
      setUtilizadores(filtered);
      setLoading(false);
    }
    loadData();
  }, [qParam, tipoParam, currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (tipo) params.tipo = tipo;
    setSearchParams(params);
  };

  const getAvatarColor = (name) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    return avatarColors[initial] || '#6366f1';
  };

  const getBadgeStyle = (tipoRole) => {
    switch (tipoRole) {
      case 'estudante':
        return { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' };
      case 'docente':
        return { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' };
      case 'especialista':
      case 'admin':
        return { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' };
      default:
        return { background: '#64748b', color: '#fff' };
    }
  };

  return (
    <>
      <style>{`
        .users-page {
            padding: 2rem 0 4rem;
        }
        
        .users-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .users-header-left h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin: 0 0 0.25rem 0;
        }
        
        .users-header-left p {
            color: var(--text-muted);
            margin: 0;
            font-size: 0.95rem;
        }
        
        .users-counter {
            background: linear-gradient(135deg, var(--secondary-blue) 0%, #0066cc 100%);
            color: #fff;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: var(--shadow);
        }
        
        .users-counter-number {
            background: rgba(255,255,255,0.2);
            padding: 0.25rem 0.6rem;
            border-radius: 20px;
            font-weight: 700;
        }
        
        .search-card {
            background: var(--white);
            border-radius: var(--radius);
            padding: 1.25rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
            border: 1px solid var(--border-color);
        }
        
        .search-form {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            align-items: flex-end;
        }
        
        .search-field {
            flex: 1;
            min-width: 200px;
        }
        
        .search-field label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.4rem;
        }
        
        .search-field input,
        .search-field select {
            width: 100%;
            padding: 0.7rem 1rem;
            border: 2px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.95rem;
            transition: all 0.2s;
            background: var(--light-gray);
        }
        
        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .user-card {
            background: var(--white);
            border-radius: var(--radius);
            padding: 1.5rem;
            box-shadow: var(--shadow);
            transition: all 0.2s;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .user-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .user-avatar-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.75rem;
            font-weight: bold;
            margin-bottom: 1rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .user-name-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.25rem;
        }
        
        .user-email-text {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 0.75rem;
        }
        
        .user-role-badge {
            padding: 0.25rem 0.8rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 1rem;
        }
        
        .user-details-box {
            width: 100%;
            padding: 0.75rem 0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
      `}</style>

      <div className="container users-page">
        <div className="users-header">
          <div className="users-header-left">
            <h1>Diretório de Utilizadores</h1>
            <p>Conecte-se com estudantes, docentes e especialistas do ISPOTEC</p>
          </div>
          <div className="users-counter">
            <span>Membros Registados</span>
            <span className="users-counter-number">{utilizadores.length}</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="search-card">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-field">
              <label htmlFor="q">Pesquisar por Nome ou Email</label>
              <input 
                type="text" 
                id="q" 
                placeholder="Escreva para pesquisar..." 
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="search-field" style={{ maxWidth: '220px' }}>
              <label htmlFor="tipo">Tipo de Utilizador</label>
              <select 
                id="tipo" 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="estudante">Estudante</option>
                <option value="docente">Docente</option>
                <option value="especialista">Especialista</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              Pesquisar
            </button>
          </form>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>A carregar diretório...</div>
        ) : utilizadores.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Nenhum utilizador encontrado</h3>
            <p style={{ color: 'var(--text-muted)' }}>Tente ajustar os critérios de pesquisa ou limpar os filtros.</p>
          </div>
        ) : (
          <div className="users-grid">
            {utilizadores.map(u => (
              <div className="user-card" key={u.id}>
                <div 
                  className="user-avatar-circle"
                  style={{ background: getAvatarColor(u.nome) }}
                >
                  {u.nome ? u.nome.charAt(0).toUpperCase() : 'U'}
                </div>

                <div className="user-name-title">{u.nome}</div>
                <div className="user-email-text">{u.email}</div>

                <div className="user-role-badge" style={getBadgeStyle(u.tipo)}>
                  {u.tipo ? u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1) : ''}
                </div>

                <div className="user-details-box">
                  <div><strong>Curso:</strong> {u.curso || '-'}</div>
                  {u.nivel_academico && (
                    <div><strong>Nível:</strong> {u.nivel_academico.charAt(0).toUpperCase() + u.nivel_academico.slice(1)}</div>
                  )}
                </div>

                <Link 
                  to={`/profile/view?id=${u.id}`} 
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '0.9rem', padding: '0.6rem' }}
                >
                  Ver Perfil
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
