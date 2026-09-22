import { api } from './api';

export const extensaoService = {
  async getProjetos() {
    try {
      const res = await api.get('/extensao/projetos');
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getProjetos error]', error.message);
      return [];
    }
  },

  async getProjetoById(id) {
    try {
      const res = await api.get(`/extensao/projetos/${id}`);
      return res.dados || null;
    } catch (error) {
      console.error('[extensaoService.getProjetoById error]', error.message);
      return null;
    }
  },

  async createProjeto(data) {
    try {
      const res = await api.post('/extensao/projetos', data);
      return res.dados;
    } catch (error) {
      console.error('[extensaoService.createProjeto error]', error.message);
      throw error;
    }
  },

  async updateProjeto(id, data) {
    try {
      const res = await api.put(`/extensao/projetos/${id}`, data);
      return res.dados;
    } catch (error) {
      console.error('[extensaoService.updateProjeto error]', error.message);
      throw error;
    }
  },

  async deleteProjeto(id) {
    try {
      const res = await api.delete(`/extensao/projetos/${id}`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[extensaoService.deleteProjeto error]', error.message);
      return false;
    }
  },

  async getAtividades() {
    try {
      const res = await api.get('/extensao/atividades');
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getAtividades error]', error.message);
      return [];
    }
  },

  async createAtividade(data) {
    try {
      const res = await api.post('/extensao/atividades', data);
      return res.dados;
    } catch (error) {
      console.error('[extensaoService.createAtividade error]', error.message);
      throw error;
    }
  },

  async getBiblioteca() {
    try {
      const res = await api.get('/extensao/biblioteca');
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getBiblioteca error]', error.message);
      return [];
    }
  },

  async addBibliotecaItem(data) {
    try {
      const res = await api.post('/extensao/biblioteca', data);
      return res.dados;
    } catch (error) {
      console.error('[extensaoService.addBibliotecaItem error]', error.message);
      throw error;
    }
  },

  async deleteBibliotecaItem(id) {
    try {
      const res = await api.delete(`/extensao/biblioteca/${id}`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[extensaoService.deleteBibliotecaItem error]', error.message);
      return false;
    }
  }
};

export default extensaoService;
