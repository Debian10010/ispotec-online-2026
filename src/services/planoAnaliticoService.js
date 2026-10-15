import { api } from './api';

export const planoAnaliticoService = {
  async getPlanos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/planos-analiticos${query ? `?${query}` : ''}`);
    return res.dados || [];
  },

  async getPlanoById(id) {
    const res = await api.get(`/planos-analiticos/${id}`);
    return res.dados;
  },

  async createPlano(data) {
    const res = await api.post('/planos-analiticos', data);
    return res.dados;
  },

  async updatePlano(id, data) {
    const res = await api.put(`/planos-analiticos/${id}`, data);
    return res.dados;
  },

  async updateEstado(id, estado, observacoes = '') {
    const res = await api.patch(`/planos-analiticos/${id}/estado`, { estado, observacoes });
    return res.dados;
  },

  async deletePlano(id) {
    const res = await api.delete(`/planos-analiticos/${id}`);
    return !!res.sucesso;
  },

  async uploadAnexo(file) {
    const formData = new FormData();
    formData.append('ficheiro', file);
    const res = await api.upload('/upload', formData);
    return res.dados; // { url, nome, tamanho }
  },
};
