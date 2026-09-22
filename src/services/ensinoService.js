import { api } from './api';

export const ensinoService = {
  async getCursos() {
    try {
      const res = await api.get('/ensino/cursos');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getCursos error]', error.message);
      return [];
    }
  },

  async getCursoById(id) {
    try {
      const res = await api.get(`/ensino/cursos/${id}`);
      return res.dados || null;
    } catch (error) {
      console.error('[ensinoService.getCursoById error]', error.message);
      return null;
    }
  },

  async createCurso(data) {
    try {
      const res = await api.post('/ensino/cursos', data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.createCurso error]', error.message);
      throw error;
    }
  },

  async updateCurso(id, data) {
    try {
      const res = await api.put(`/ensino/cursos/${id}`, data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.updateCurso error]', error.message);
      throw error;
    }
  },

  async deleteCurso(id) {
    try {
      const res = await api.delete(`/ensino/cursos/${id}`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[ensinoService.deleteCurso error]', error.message);
      return false;
    }
  },

  async getUnidades() {
    try {
      const res = await api.get('/ensino/unidades');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getUnidades error]', error.message);
      return [];
    }
  },

  async createUnidade(data) {
    try {
      const res = await api.post('/ensino/unidades', data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.createUnidade error]', error.message);
      throw error;
    }
  },

  async getProgresso() {
    try {
      const res = await api.get('/ensino/progresso');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getProgresso error]', error.message);
      return [];
    }
  },

  async updateProgresso(data) {
    try {
      const res = await api.put('/ensino/progresso', data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.updateProgresso error]', error.message);
      throw error;
    }
  },

  async getCertificacoes() {
    try {
      const res = await api.get('/ensino/certificacoes');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getCertificacoes error]', error.message);
      return [];
    }
  },

  async createCertificacao(data) {
    try {
      const res = await api.post('/ensino/certificacoes', data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.createCertificacao error]', error.message);
      throw error;
    }
  },

  async getAvaliacoes() {
    try {
      const res = await api.get('/ensino/avaliacoes');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getAvaliacoes error]', error.message);
      return [];
    }
  },

  async createAvaliacao(data) {
    try {
      const res = await api.post('/ensino/avaliacoes', data);
      return res.dados;
    } catch (error) {
      console.error('[ensinoService.createAvaliacao error]', error.message);
      throw error;
    }
  }
};

export default ensinoService;
