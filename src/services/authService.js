import { api } from './api';

const CURRENT_USER_KEY = 'ispotec_current_user';

export const authService = {
  async login(email, password) {
    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.sucesso && res.token && res.user) {
        api.setToken(res.token);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
        return {
          sucesso: true,
          mensagem: res.mensagem || 'Login efetuado com sucesso!',
          user: res.user,
        };
      }

      return {
        sucesso: false,
        mensagem: res.mensagem || 'Credenciais inválidas.',
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao efetuar login. Tente novamente.',
      };
    }
  },

  async register(data) {
    try {
      const res = await api.post('/auth/register', {
        nome: data.nome?.trim(),
        email: data.email?.trim().toLowerCase(),
        password: data.password,
        tipo: data.tipo || 'estudante',
        curso: data.curso ? data.curso.trim() : '',
        nivel_academico: data.nivel_academico || '',
      });

      return {
        sucesso: true,
        mensagem: res.mensagem || 'Registo efetuado com sucesso! Aguarde a aprovação da administração para poder aceder.',
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: error.message || 'Erro ao efetuar registo. Tente novamente.',
      };
    }
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
    api.setToken(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  },

  isAuthenticated() {
    return !!(this.getCurrentUser() && api.getToken());
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return !!(user && (user.tipo === 'especialista' || user.tipo === 'admin'));
  },

  async getMe() {
    try {
      const res = await api.get('/auth/me');
      if (res.sucesso && res.user) {
        this.setCurrentUser(res.user);
        return res.user;
      }
      return null;
    } catch {
      return null;
    }
  },
};

export default authService;
