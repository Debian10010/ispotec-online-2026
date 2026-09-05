import { initialGroups } from '../data/groups';
import { initialPosts } from '../data/posts';

const GROUPS_STORAGE_KEY = 'ispotec_groups';
const POSTS_STORAGE_KEY = 'ispotec_posts';

function getGroups() {
  const data = localStorage.getItem(GROUPS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(initialGroups));
    return initialGroups;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialGroups;
  }
}

function saveGroups(groups) {
  localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

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

export const groupService = {
  async getAllGroups() {
    const groups = getGroups();
    const posts = getPosts();
    return groups.map(g => ({
      ...g,
      total_membros: g.membros ? g.membros.length : 0,
      total_posts: posts.filter(p => p.group_id === g.id).length
    }));
  },

  async getMyGroups(userId) {
    const all = await this.getAllGroups();
    return all.filter(g => g.membros && g.membros.includes(Number(userId)));
  },

  async getGroupById(groupId) {
    const all = await this.getAllGroups();
    return all.find(g => g.id === Number(groupId)) || null;
  },

  async createGroup(data, creatorId) {
    const groups = getGroups();
    const newGroup = {
      id: Date.now(),
      nome: data.nome.trim(),
      descricao: data.descricao ? data.descricao.trim() : '',
      disciplina: data.disciplina.trim(),
      modulo: data.modulo ? data.modulo.trim() : '',
      criado_por: creatorId,
      data_criacao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      membros: [creatorId]
    };
    groups.unshift(newGroup);
    saveGroups(groups);
    return newGroup;
  },

  async deleteGroup(groupId) {
    const groups = getGroups();
    const filtered = groups.filter(g => g.id !== Number(groupId));
    saveGroups(filtered);
    return true;
  },

  async joinGroup(groupId, userId) {
    const groups = getGroups();
    const g = groups.find(item => item.id === Number(groupId));
    if (g && (!g.membros || !g.membros.includes(Number(userId)))) {
      if (!g.membros) g.membros = [];
      g.membros.push(Number(userId));
      saveGroups(groups);
      return true;
    }
    return false;
  },

  async leaveGroup(groupId, userId) {
    const groups = getGroups();
    const g = groups.find(item => item.id === Number(groupId));
    if (g && g.membros) {
      g.membros = g.membros.filter(id => id !== Number(userId));
      saveGroups(groups);
      return true;
    }
    return false;
  },

  async isMember(groupId, userId) {
    const groups = getGroups();
    const g = groups.find(item => item.id === Number(groupId));
    return g && g.membros && g.membros.includes(Number(userId));
  }
};
