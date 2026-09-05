import { initialUsers } from '../data/users';

const USERS_STORAGE_KEY = 'ispotec_users';

function getUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialUsers;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const userService = {
  async getAllUsers(filters = {}) {
    let users = getUsers();
    if (filters.tipo) {
      users = users.filter(u => u.tipo === filters.tipo);
    }
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      users = users.filter(u => 
        u.nome.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }
    return users;
  },

  async getPendingUsers() {
    const users = getUsers();
    return users.filter(u => u.status === 'pendente');
  },

  async updateStatus(userId, newStatus) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === Number(userId));
    if (index !== -1) {
      users[index].status = newStatus;
      saveUsers(users);
      return true;
    }
    return false;
  },

  async getUserById(userId) {
    const users = getUsers();
    return users.find(u => u.id === Number(userId)) || null;
  },

  async updateProfile(userId, data) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === Number(userId));
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveUsers(users);
      return users[index];
    }
    return null;
  },

  async updateAvatar(userId, avatarUrl) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === Number(userId));
    if (index !== -1) {
      users[index].foto_perfil = avatarUrl;
      saveUsers(users);
      return true;
    }
    return false;
  },

  async getCounts() {
    const users = getUsers();
    return {
      aprovados: users.filter(u => u.status === 'aprovado').length,
      pendentes: users.filter(u => u.status === 'pendente').length
    };
  }
};
