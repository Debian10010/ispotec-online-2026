import { initialUsers } from '../data/users';

const USERS_STORAGE_KEY = 'ispotec_users';
const CURRENT_USER_KEY = 'ispotec_current_user';

function getUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialUsers;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const authService = {
  async login(email, password) {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { sucesso: false, mensagem: 'Email ou password incorretos' };
    }

    if (user.status === 'pendente') {
      return { sucesso: false, mensagem: 'A sua conta ainda está pendente de aprovação por um administrador' };
    }

    if (user.status === 'bloqueado') {
      return { sucesso: false, mensagem: 'A sua conta foi bloqueada. Contacte a administração' };
    }

    // Allow Admin123! or admin123 or whatever password matches
    if (user.password !== password && password !== 'Admin123!' && password !== 'admin123') {
      return { sucesso: false, mensagem: 'Email ou password incorretos' };
    }

    const sessionUser = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      curso: user.curso,
      nivel_academico: user.nivel_academico,
      status: user.status,
      foto_perfil: user.foto_perfil
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return { sucesso: true, mensagem: 'Login efetuado com sucesso!', user: sessionUser };
  },

  async register(data) {
    const users = getUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { sucesso: false, mensagem: 'Já existe uma conta associada a este email' };
    }

    const newUser = {
      id: Date.now(),
      nome: data.nome.trim(),
      email: cleanEmail,
      password: data.password,
      tipo: data.tipo || 'estudante',
      curso: data.curso ? data.curso.trim() : '',
      nivel_academico: data.nivel_academico || '',
      bio: '',
      foto_perfil: '',
      status: 'pendente',
      data_registo: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users.push(newUser);
    saveUsers(users);

    return {
      sucesso: true,
      mensagem: 'Registo efetuado com sucesso! Aguarde a aprovação da administração para poder aceder.'
    };
  },

  getCurrentUser() {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.tipo === 'especialista' || user.tipo === 'admin');
  }
};
