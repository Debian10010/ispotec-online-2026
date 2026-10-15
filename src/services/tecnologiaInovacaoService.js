import { api } from './api';

export const tecnologiaInovacaoService = {
  async getItens(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/tecnologia-inovacao${query ? `?${query}` : ''}`);
    return res.dados || [];
  },

  async getItemById(id) {
    const res = await api.get(`/tecnologia-inovacao/${id}`);
    return res.dados;
  },

  async createItem(data) {
    const res = await api.post('/tecnologia-inovacao', data);
    return res.dados;
  },

  async updateItem(id, data) {
    const res = await api.put(`/tecnologia-inovacao/${id}`, data);
    return res.dados;
  },

  async deleteItem(id) {
    const res = await api.delete(`/tecnologia-inovacao/${id}`);
    return !!res.sucesso;
  },

  async uploadAnexo(file) {
    const formData = new FormData();
    formData.append('ficheiro', file);
    const res = await api.upload('/upload', formData);
    return res.dados; // { url, nome, tamanho }
  },
};
