import { api } from './api';

export const investigacaoService = {
  async getPropostas() {
    try {
      const res = await api.get('/investigacao/propostas');
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getPropostas error]', error.message);
      return [];
    }
  },

  async createProposta(data) {
    try {
      const res = await api.post('/investigacao/propostas', data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.createProposta error]', error.message);
      throw error;
    }
  },

  async updateProposta(id, data) {
    try {
      const res = await api.put(`/investigacao/propostas/${id}`, data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.updateProposta error]', error.message);
      throw error;
    }
  },

  async addFeedback(id, data) {
    try {
      const res = await api.post(`/investigacao/propostas/${id}/feedback`, data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.addFeedback error]', error.message);
      throw error;
    }
  },

  async getProjetos() {
    try {
      const res = await api.get('/investigacao/projetos');
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getProjetos error]', error.message);
      return [];
    }
  },

  async createProjeto(data) {
    try {
      const res = await api.post('/investigacao/projetos', data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.createProjeto error]', error.message);
      throw error;
    }
  },

  async updateProjeto(id, data) {
    try {
      const res = await api.put(`/investigacao/projetos/${id}`, data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.updateProjeto error]', error.message);
      throw error;
    }
  },

  async getResultados() {
    try {
      const res = await api.get('/investigacao/resultados');
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getResultados error]', error.message);
      return [];
    }
  },

  async createResultado(data) {
    try {
      const res = await api.post('/investigacao/resultados', data);
      return res.dados;
    } catch (error) {
      console.error('[investigacaoService.createResultado error]', error.message);
      throw error;
    }
  }
};

export default investigacaoService;
