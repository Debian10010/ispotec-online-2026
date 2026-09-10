import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/groupService';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';

const tipoCores = {
  discussao: '#3b82f6',
  material: '#10b981',
  artigo: '#8b5cf6',
  projeto: '#f59e0b'
};

export default function GroupView() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [grupo, setGrupo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [membros, setMembros] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // Post form
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [novoTipo, setNovoTipo] = useState('discussao');

  // Comment forms: map of postId -> text
  const [commentInputs, setCommentInputs] = useState({});

  const loadGroupData = async () => {
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

    // Check membership or admin
    const isAdmin = user && (user.tipo === 'especialista' || user.tipo === 'admin');
    const isMember = g.membros && g.membros.some(m => String(m.id || m._id || m) === String(user?.id));
    if (!isMember && !isAdmin) {
      navigate('/dashboard/my-groups');
      return;
    }

    const groupPosts = await postService.getPostsByGroup(groupId);
    setPosts(groupPosts);

    // Load members
    const allUsers = await userService.getAllUsers();
    const groupMembers = allUsers.filter(u => g.membros && g.membros.some(m => String(m.id || m._id || m) === String(u.id)));
    setMembros(groupMembers);
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId, user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!novoTitulo.trim() || !novoConteudo.trim()) {
      setErro('Título e conteúdo são obrigatórios');
      return;
    }

    try {
      await postService.createPost({
        userId: user.id,
        groupId: groupId,
        titulo: novoTitulo,
        conteudo: novoConteudo,
        tipo: novoTipo
      });
      setMensagem('Publicação criada com sucesso!');
      setNovoTitulo('');
      setNovoConteudo('');
      setNovoTipo('discussao');
      loadGroupData();
    } catch {
      setErro('Erro ao criar publicação');
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    await postService.addComment(postId, {
      userId: user.id,
      conteudo: commentText
    });

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    loadGroupData();
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const horas = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${horas}:${min}`;
    } catch {
      return dateString;
    }
  };

  if (!grupo) {
    return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>A carregar...</div>;
  }

  return (
    <>
      <style>{`
        .group-header {
            background: linear-gradient(135deg, var(--primary-blue) 0%, #003366 100%);
            color: white;
            padding: 1.5rem;
            border-radius: var(--radius);
            margin-bottom: 1.5rem;
        }
        .group-header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .group-breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }
        .group-breadcrumb a {
            color: white;
            text-decoration: none;
        }
        .group-breadcrumb a:hover {
            text-decoration: underline;
        }
        .group-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
        }
        .group-desc {
            opacity: 0.85;
            font-size: 0.95rem;
            margin-top: 0.25rem;
        }
        .group-actions {
            display: flex;
            gap: 0.75rem;
        }
        .btn-chat {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.6rem 1.25rem;
            border-radius: var(--radius-sm);
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
        }
        .btn-chat:hover {
            background: rgba(255,255,255,0.3);
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 1.5rem;
        }

        .post-form-card {
            background: var(--white);
            border-radius: var(--radius);
            padding: 1.5rem;
            box-shadow: var(--shadow);
            margin-bottom: 1.5rem;
            border: 1px solid var(--border-color);
        }
        .post-form-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .posts-section-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .posts-count {
            background: var(--secondary-blue);
            color: white;
            padding: 0.15rem 0.6rem;
            border-radius: 12px;
            font-size: 0.8rem;
        }

        .post-card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            margin-bottom: 1rem;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }
        .post-header {
            padding: 1.25rem 1.25rem 0;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .post-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--secondary-blue);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            margin-right: 0.75rem;
            flex-shrink: 0;
        }
        .post-meta {
            flex: 1;
        }
        .post-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-dark);
            margin: 0 0 0.25rem;
        }
        .post-author {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        .post-type-badge {
            padding: 0.25rem 0.6rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            white-space: nowrap;
        }
        .post-content {
            padding: 1rem 1.25rem;
            color: var(--text-dark);
            line-height: 1.6;
            white-space: pre-line;
        }
        .post-footer {
            padding: 0.75rem 1.25rem;
            background: var(--light-gray);
            border-top: 1px solid var(--border-color);
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .comments-section {
            padding: 1rem 1.25rem;
            background: #fafafa;
            border-top: 1px solid var(--border-color);
        }
        .comment-item {
            background: white;
            padding: 0.75rem;
            border-radius: var(--radius-sm);
            margin-bottom: 0.5rem;
            border-left: 3px solid var(--border-color);
        }
        .comment-author {
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--text-dark);
        }
        .comment-text {
            font-size: 0.9rem;
            color: var(--text-dark);
            margin-top: 0.25rem;
        }
        .comment-form {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
        }
        .comment-form input {
            flex: 1;
            padding: 0.6rem 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
        }

        .sidebar-card {
            background: var(--white);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 1.25rem;
            position: sticky;
            top: 100px;
            border: 1px solid var(--border-color);
        }
        .sidebar-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }
        .member-item {
            display: flex;
            align-items: center;
            padding: 0.6rem 0;
            border-bottom: 1px solid var(--light-gray);
        }
        .member-item:last-child {
            border-bottom: none;
        }
        .member-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--secondary-blue);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            margin-right: 0.75rem;
            flex-shrink: 0;
        }
        .member-name {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-dark);
        }
        .member-type {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1.5rem;
            color: var(--text-muted);
        }
        .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 900px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
            .sidebar-card {
                position: static;
            }
            .group-header-content {
                flex-direction: column;
                align-items: flex-start;
            }
        }
        @media (max-width: 480px) {
            .group-header {
                padding: 1rem;
            }
            .group-title {
                font-size: 1.25rem;
            }
            .post-header {
                flex-direction: column;
                gap: 0.5rem;
            }
        }
      `}</style>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* Group Header */}
        <div className="group-header">
          <div className="group-header-content">
            <div>
              <div className="group-breadcrumb">
                <Link to="/dashboard/my-groups">← Meus Grupos</Link>
                <span>/</span>
                <span>{grupo.nome}</span>
              </div>
              <h1 className="group-title">{grupo.nome}</h1>
              {grupo.descricao && (
                <p className="group-desc">{grupo.descricao}</p>
              )}
            </div>
            <div className="group-actions">
              <Link to={`/dashboard/chat-grupo?id=${groupId}`} className="btn-chat">
                💬 Chat do Grupo
              </Link>
            </div>
          </div>
        </div>

        {mensagem && <div className="alert alert-success">{mensagem}</div>}
        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="content-grid">
          {/* Main Content */}
          <div>
            {/* Post Form */}
            <div className="post-form-card">
              <div className="post-form-title">✏️ Criar Nova Publicação</div>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Título da publicação..." 
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '1rem' }}>
                  <select 
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value)}
                    style={{ padding: '0.6rem' }}
                  >
                    <option value="discussao">💬 Discussão</option>
                    <option value="material">📚 Material</option>
                    <option value="artigo">📄 Artigo</option>
                    <option value="projeto">🚀 Projeto</option>
                  </select>
                  <button type="submit" className="btn btn-success">Publicar</button>
                </div>
                <textarea 
                  rows="3" 
                  placeholder="Escreva o conteúdo..." 
                  value={novoConteudo}
                  onChange={(e) => setNovoConteudo(e.target.value)}
                  required 
                />
              </form>
            </div>

            {/* Posts */}
            <div className="posts-section-title">
              📝 Publicações <span className="posts-count">{posts.length}</span>
            </div>

            {posts.length === 0 ? (
              <div className="post-card">
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>Ainda não há publicações neste grupo.<br />Seja o primeiro a publicar!</p>
                </div>
              </div>
            ) : (
              posts.map(p => {
                const cor = tipoCores[p.tipo] || '#6b7280';
                return (
                  <div className="post-card" key={p.id}>
                    <div className="post-header">
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="post-avatar">
                          {(p.nome ? p.nome.charAt(0) : 'U').toUpperCase()}
                        </div>
                        <div className="post-meta">
                          <h4 className="post-title">{p.titulo}</h4>
                          <div className="post-author">
                            {p.nome} · {formatDate(p.data_criacao)}
                          </div>
                        </div>
                      </div>
                      <span className="post-type-badge" style={{ background: cor }}>
                        {p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)}
                      </span>
                    </div>

                    <div className="post-content">
                      {p.conteudo}
                    </div>

                    <div className="post-footer">
                      💬 {p.total_comentarios} comentário(s)
                    </div>

                    {/* Comments */}
                    <div className="comments-section">
                      {p.comments && p.comments.map(c => (
                        <div className="comment-item" key={c.id}>
                          <div className="comment-author">
                            {c.nome}{' '}
                            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                              · {formatDate(c.data_criacao)}
                            </span>
                          </div>
                          <div className="comment-text">{c.conteudo}</div>
                        </div>
                      ))}

                      <form 
                        className="comment-form" 
                        onSubmit={(e) => handleAddComment(e, p.id)}
                      >
                        <input 
                          type="text" 
                          placeholder="Escreva um comentário..." 
                          value={commentInputs[p.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                          required 
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
                          Enviar
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sidebar-card">
              <div className="sidebar-title">👥 Membros ({membros.length})</div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {membros.map(membro => (
                  <div className="member-item" key={membro.id}>
                    <div className="member-avatar">
                      {(membro.nome ? membro.nome.charAt(0) : 'U').toUpperCase()}
                    </div>
                    <div>
                      <div className="member-name">{membro.nome}</div>
                      <div className="member-type">
                        {membro.tipo ? membro.tipo.charAt(0).toUpperCase() + membro.tipo.slice(1) : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {grupo.modulo && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>📚 Módulo</p>
                  <p style={{ fontWeight: 600, margin: '0.25rem 0 0' }}>{grupo.modulo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
