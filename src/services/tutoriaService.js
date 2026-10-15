import { api } from './api';

export const tutoriaService = {
  async getTutorias(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/tutoria${query ? `?${query}` : ''}`);
    return res.dados || [];
  },

  async getTutoriaById(id) {
    const res = await api.get(`/tutoria/${id}`);
    return res.dados;
  },

  async createTutoria(data) {
    const res = await api.post('/tutoria', data);
    return res.dados;
  },

  async updateTutoria(id, data) {
    const res = await api.put(`/tutoria/${id}`, data);
    return res.dados;
  },

  async addSessaoAcompanhamento(id, sessaoData) {
    const res = await api.post(`/tutoria/${id}/sessao`, sessaoData);
    return res.dados;
  },

  async solicitarAcompanhamento(id, motivo) {
    const res = await api.post(`/tutoria/${id}/solicitar`, { motivo });
    return res.dados;
  },

  async getDesempenhoEstudante(estudanteId) {
    const res = await api.get(`/tutoria/desempenho/${estudanteId}`);
    return res.dados || {};
  },

  async deleteTutoria(id) {
    const res = await api.delete(`/tutoria/${id}`);
    return !!res.sucesso;
  },
};
