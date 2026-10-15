import { api } from './api';

export const planoSessaoService = {
  async getSessoes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/planos-sessoes${query ? `?${query}` : ''}`);
    return res.dados || [];
  },

  async getLivroSumarios(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/planos-sessoes/livro-sumarios${query ? `?${query}` : ''}`);
    return res.dados || { sessoes: [], total_sessoes: 0, total_realizadas: 0, total_pendentes: 0, horas_previstas: 0, horas_efetivas: 0 };
  },

  async getSessaoById(id) {
    const res = await api.get(`/planos-sessoes/${id}`);
    return res.dados;
  },

  async createSessao(data) {
    const res = await api.post('/planos-sessoes', data);
    return res.dados;
  },

  async updateSessao(id, data) {
    const res = await api.put(`/planos-sessoes/${id}`, data);
    return res.dados;
  },

  async registrarSumario(id, sumarioData) {
    const res = await api.patch(`/planos-sessoes/${id}/sumario`, sumarioData);
    return res.dados;
  },

  async validarPedagogica(id, parecer = '') {
    const res = await api.patch(`/planos-sessoes/${id}/validar`, { parecer });
    return res.dados;
  },

  async reagendarSessao(id, reagendamentoData) {
    const res = await api.patch(`/planos-sessoes/${id}/reagendar`, reagendamentoData);
    return res.dados;
  },

  async deleteSessao(id) {
    const res = await api.delete(`/planos-sessoes/${id}`);
    return !!res.sucesso;
  },
};
