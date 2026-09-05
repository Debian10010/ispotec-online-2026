import { initialPosts } from '../data/posts';
import { initialUsers } from '../data/users';
import { initialGroups } from '../data/groups';

const POSTS_STORAGE_KEY = 'ispotec_posts';
const USERS_STORAGE_KEY = 'ispotec_users';
const GROUPS_STORAGE_KEY = 'ispotec_groups';

function getPosts() {
  const data = localStorage.getItem(POSTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(initialPosts));
    return initialPosts;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialPosts;
  }
}

function savePosts(posts) {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

function getUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) return initialUsers;
  try { return JSON.parse(data); } catch { return initialUsers; }
}

function getGroups() {
  const data = localStorage.getItem(GROUPS_STORAGE_KEY);
  if (!data) return initialGroups;
  try { return JSON.parse(data); } catch { return initialGroups; }
}

function enrichPost(post) {
  const users = getUsers();
  const groups = getGroups();
  const author = users.find(u => u.id === post.user_id) || { nome: 'Utilizador' };
  const group = groups.find(g => g.id === post.group_id) || null;

  return {
    ...post,
    nome: author.nome,
    grupo_nome: group ? group.nome : null,
    total_comentarios: post.comments ? post.comments.length : 0
  };
}

export const postService = {
  async getGlobalFeed(limit = 10, offset = 0) {
    const posts = getPosts();
    const sorted = [...posts].sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
    const paginated = sorted.slice(offset, offset + limit);
    return paginated.map(enrichPost);
  },

  async getTotalPostsCount() {
    const posts = getPosts();
    return posts.length;
  },

  async getPostsByGroup(groupId) {
    const posts = getPosts();
    const groupPosts = posts.filter(p => p.group_id === Number(groupId));
    return groupPosts.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao)).map(enrichPost);
  },

  async createPost({ userId, groupId, titulo, conteudo, tipo }) {
    const posts = getPosts();
    const newPost = {
      id: Date.now(),
      user_id: Number(userId),
      group_id: groupId ? Number(groupId) : null,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      tipo: tipo || 'discussao',
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      comments: []
    };
    posts.unshift(newPost);
    savePosts(posts);
    return enrichPost(newPost);
  },

  async addComment(postId, { userId, conteudo }) {
    const posts = getPosts();
    const users = getUsers();
    const user = users.find(u => u.id === Number(userId)) || { nome: 'Utilizador' };

    const post = posts.find(p => p.id === Number(postId));
    if (!post) return null;

    if (!post.comments) post.comments = [];
    const newComment = {
      id: Date.now(),
      post_id: Number(postId),
      user_id: Number(userId),
      nome: user.nome,
      conteudo: conteudo.trim(),
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    post.comments.push(newComment);
    savePosts(posts);
    return newComment;
  }
};
