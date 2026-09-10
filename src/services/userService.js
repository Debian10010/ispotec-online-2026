import { api } from './api';

export const userService = {
  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get(`/users${queryStr}`);
      return res.dados || [];
    } catch (error) {
      console.error('[userService.getAllUsers error]', error.message);
      return [];
    }
  },

  async getPendingUsers() {
    try {
      const res = await api.get('/users?status=pendente');
      return res.dados || [];
    } catch (error) {
      console.error('[userService.getPendingUsers error]', error.message);
      return [];
    }
  },

  async updateStatus(userId, newStatus) {
    try {
      const res = await api.patch(`/users/${userId}/status`, { status: newStatus });
      return !!res.sucesso;
    } catch (error) {
      console.error('[userService.updateStatus error]', error.message);
      return false;
    }
  },

  async getUserById(userId) {
    try {
      const res = await api.get(`/users/${userId}`);
      return res.dados || null;
    } catch (error) {
      console.error('[userService.getUserById error]', error.message);
      return null;
    }
  },

  async updateProfile(userId, data) {
    try {
      const res = await api.put('/profile/me', data);
      return res.dados || null;
    } catch (error) {
      console.error('[userService.updateProfile error]', error.message);
      throw error;
    }
  },

  async updateAvatar(userId, avatarUrlOrFile) {
    try {
      let res;
      if (avatarUrlOrFile instanceof File) {
        const formData = new FormData();
        formData.append('avatar', avatarUrlOrFile);
        res = await api.upload('/profile/avatar', formData);
      } else {
        res = await api.post('/profile/avatar', { foto_perfil: avatarUrlOrFile });
      }
      return !!res.sucesso;
    } catch (error) {
      console.error('[userService.updateAvatar error]', error.message);
      return false;
    }
  },

  async getCounts() {
    try {
      const res = await api.get('/users/counts');
      return res.dados || { aprovados: 0, pendentes: 0 };
    } catch (error) {
      console.error('[userService.getCounts error]', error.message);
      return { aprovados: 0, pendentes: 0 };
    }
  },
};

export default userService;
