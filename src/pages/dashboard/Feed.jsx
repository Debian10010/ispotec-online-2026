import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postService } from '../../services/postService';

const tipoCores = {
  discussao: { bg: '#dbeafe', color: '#1e40af' },
  material: { bg: '#d1fae5', color: '#065f46' },
  artigo: { bg: '#ede9fe', color: '#5b21b6' },
  projeto: { bg: '#fef3c7', color: '#92400e' }
};

const tipoIcons = {
  discussao: '💬',
  material: '📚',
  artigo: '📄',
  projeto: '🚀'
};

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pagina = parseInt(searchParams.get('pagina') || '1', 10);
  const limit = 10;
  const offset = (pagina - 1) * limit;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const data = await postService.getGlobalFeed(limit, offset);
      setPosts(data);
      setLoading(false);
    }
    loadPosts();
  }, [pagina]);

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} às ${horas}:${min}`;
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <style>{`
        .feed-header {
            text-align: center;
            padding: 2rem 1rem;
            margin-bottom: 1.5rem;
        }
        .feed-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin: 0 0 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .feed-subtitle {
            color: var(--text-muted);
            font-size: 1rem;
        }
        
        .feed-container {
            max-width: 680px;
            margin: 0 auto;
        }
        
        .post-card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            margin-bottom: 1.25rem;
            overflow: hidden;
            transition: all 0.2s;
            border: 1px solid var(--border-color);
        }
        .post-card:hover {
            box-shadow: var(--shadow-lg);
        }
        
        .post-header {
            padding: 1.25rem;
            display: flex;
            gap: 0.75rem;
        }
        .post-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--secondary-blue), #0066cc);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        .post-meta {
            flex: 1;
            min-width: 0;
        }
        .post-author {
            font-weight: 600;
            color: var(--text-dark);
            font-size: 0.95rem;
        }
        .post-group {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        .post-group a {
            color: var(--secondary-blue);
            text-decoration: none;
        }
        .post-group a:hover {
            text-decoration: underline;
        }
        .post-time {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .post-type-badge {
            padding: 0.3rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            white-space: nowrap;
            height: fit-content;
        }
        
        .post-title {
            padding: 0 1.25rem;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 0 0 0.5rem;
        }
        .post-content {
            padding: 0 1.25rem 1.25rem;
            color: var(--text-dark);
            line-height: 1.6;
            font-size: 0.95rem;
            white-space: pre-line;
        }
        
        .post-footer {
            padding: 0.75rem 1.25rem;
            background: var(--light-gray);
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        .post-stat {
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }
        .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .empty-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        .empty-text {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }
        
        .back-nav {
            text-align: center;
            margin-top: 2rem;
            margin-bottom: 3rem;
        }
        
        @media (max-width: 768px) {
            .feed-header {
                padding: 1.5rem 1rem;
            }
            .feed-title {
                font-size: 1.4rem;
            }
            .post-header {
                padding: 1rem;
            }
            .post-title, .post-content {
                padding-left: 1rem;
                padding-right: 1rem;
            }
            .post-avatar {
                width: 40px;
                height: 40px;
                font-size: 1rem;
            }
        }
      `}</style>

      <div className="container">
        <div className="feed-header">
          <h1 className="feed-title">📰 Feed Global</h1>
          <p className="feed-subtitle">Publicações recentes de toda a comunidade ISPOTEC</p>
        </div>

        <div className="feed-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>A carregar publicações...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">Nenhuma publicação ainda</div>
              <p className="empty-text">Seja o primeiro a publicar nos seus grupos!</p>
              <Link to="/dashboard/my-groups" className="btn btn-primary">Ver Meus Grupos</Link>
            </div>
          ) : (
            <>
              {posts.map(p => {
                const tipo = p.tipo || 'discussao';
                const cor = tipoCores[tipo] || { bg: '#f3f4f6', color: '#374151' };
                const icon = tipoIcons[tipo] || '📝';

                return (
                  <article className="post-card" key={p.id}>
                    <div className="post-header">
                      <div className="post-avatar">
                        {(p.nome ? p.nome.charAt(0) : 'U').toUpperCase()}
                      </div>
                      <div className="post-meta">
                        <div className="post-author">{p.nome}</div>
                        {p.grupo_nome && p.group_id && (
                          <div className="post-group">
                            em <Link to={`/dashboard/group-view?id=${p.group_id}`}>{p.grupo_nome}</Link>
                          </div>
                        )}
                        <div className="post-time">{formatDate(p.data_criacao)}</div>
                      </div>
                      <span className="post-type-badge" style={{ background: cor.bg, color: cor.color }}>
                        {icon} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </span>
                    </div>

                    <h3 className="post-title">{p.titulo}</h3>
                    <div className="post-content">
                      {p.conteudo}
                    </div>

                    <div className="post-footer">
                      <span className="post-stat">💬 {p.total_comentarios} comentários</span>
                      {p.group_id && (
                        <Link 
                          to={`/dashboard/group-view?id=${p.group_id}`} 
                          style={{ marginLeft: 'auto', color: 'var(--secondary-blue)', textDecoration: 'none', fontWeight: 500 }}
                        >
                          Ver no grupo →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {pagina > 1 && (
                  <button 
                    onClick={() => setSearchParams({ pagina: String(pagina - 1) })}
                    className="btn btn-secondary"
                  >
                    ← Anterior
                  </button>
                )}
                <span className="btn" style={{ background: 'var(--light-gray)', cursor: 'default' }}>
                  Página {pagina}
                </span>
                {posts.length === limit && (
                  <button 
                    onClick={() => setSearchParams({ pagina: String(pagina + 1) })}
                    className="btn btn-secondary"
                  >
                    Próxima →
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="back-nav">
          <Link to="/dashboard" className="btn btn-primary">← Voltar ao Dashboard</Link>
        </div>
      </div>
    </>
  );
}
