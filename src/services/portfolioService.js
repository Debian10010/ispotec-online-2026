import { api } from './api';

export const portfolioService = {
  async getByUserId(userId) {
    try {
      const res = await api.get(`/portfolio/user/${userId}`);
      return res.dados || [];
    } catch (error) {
      console.error('[portfolioService.getByUserId error]', error.message);
      return [];
    }
  },

  async addItem({ titulo, descricao, categoria, ficheiro }) {
    try {
      let res;
      if (ficheiro instanceof File) {
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao || '');
        formData.append('categoria', categoria || 'outro');
        formData.append('ficheiro', ficheiro);
        res = await api.upload('/portfolio', formData);
      } else {
        res = await api.post('/portfolio', {
          titulo,
          descricao,
          categoria,
          ficheiro,
        });
      }
      return res.dados;
    } catch (error) {
      console.error('[portfolioService.addItem error]', error.message);
      throw error;
    }
  },

  async deleteItem(id) {
    try {
      const res = await api.delete(`/portfolio/${id}`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[portfolioService.deleteItem error]', error.message);
      return false;
    }
  },
};

export default portfolioService;
