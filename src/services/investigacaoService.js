import { api } from './api';

export const investigacaoService = {
  // Upload helper for attachments
  async uploadAnexo(file) {
    const formData = new FormData();
    formData.append('ficheiro', file);
    const res = await api.upload('/upload', formData);
    return res.dados; // { url, nome, tamanho }
  },

  // 1. Laboratórios de Investigação
  async getLabs() {
    try {
      const res = await api.get('/investigacao/labs');
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getLabs]', error.message);
      throw error;
    }
  },

  async createLab(data) {
    const res = await api.post('/investigacao/labs', data);
    return res.dados;
  },

  async updateLab(id, data) {
    const res = await api.put(`/investigacao/labs/${id}`, data);
    return res.dados;
  },

  async deleteLab(id) {
    const res = await api.delete(`/investigacao/labs/${id}`);
    return !!res.sucesso;
  },

  // 2. Projectos de Investigação
  async getProjetos(labId) {
    try {
      const query = labId && labId !== 'all' ? `?lab_id=${encodeURIComponent(labId)}` : '';
      const res = await api.get(`/investigacao/projetos${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getProjetos]', error.message);
      throw error;
    }
  },

  async createProjeto(data) {
    const res = await api.post('/investigacao/projetos', data);
    return res.dados;
  },

  async updateProjeto(id, data) {
    const res = await api.put(`/investigacao/projetos/${id}`, data);
    return res.dados;
  },

  async deleteProjeto(id) {
    const res = await api.delete(`/investigacao/projetos/${id}`);
    return !!res.sucesso;
  },

  // 3. Pesquisadores / Investigadores
  async getPesquisadores(labId) {
    try {
      const query = labId && labId !== 'all' ? `?lab_id=${encodeURIComponent(labId)}` : '';
      const res = await api.get(`/investigacao/pesquisadores${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getPesquisadores]', error.message);
      throw error;
    }
  },

  async createPesquisador(data) {
    const res = await api.post('/investigacao/pesquisadores', data);
    return res.dados;
  },

  async updatePesquisador(id, data) {
    const res = await api.put(`/investigacao/pesquisadores/${id}`, data);
    return res.dados;
  },

  async deletePesquisador(id) {
    const res = await api.delete(`/investigacao/pesquisadores/${id}`);
    return !!res.sucesso;
  },

  // 4. Publicações
  async getPublicacoes(labId) {
    try {
      const query = labId && labId !== 'all' ? `?lab_id=${encodeURIComponent(labId)}` : '';
      const res = await api.get(`/investigacao/publicacoes${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[investigacaoService.getPublicacoes]', error.message);
      throw error;
    }
  },

  async createPublicacao(data) {
    const res = await api.post('/investigacao/publicacoes', data);
    return res.dados;
  },

  async updatePublicacao(id, data) {
    const res = await api.put(`/investigacao/publicacoes/${id}`, data);
    return res.dados;
  },

  async deletePublicacao(id) {
    const res = await api.delete(`/investigacao/publicacoes/${id}`);
    return !!res.sucesso;
  },

  // 5. Propostas (Legacy)
  async getPropostas() {
    try {
      const res = await api.get('/investigacao/propostas');
      return res.dados || [];
    } catch (error) {
      return [];
    }
  },

  async createProposta(data) {
    const res = await api.post('/investigacao/propostas', data);
    return res.dados;
  },

  async updateProposta(id, data) {
    const res = await api.put(`/investigacao/propostas/${id}`, data);
    return res.dados;
  },

  async deleteProposta(id) {
    const res = await api.delete(`/investigacao/propostas/${id}`);
    return !!res.sucesso;
  },

  // 6. Resultados (Legacy)
  async getResultados(projetoId) {
    try {
      const query = projetoId ? `?projeto_id=${encodeURIComponent(projetoId)}` : '';
      const res = await api.get(`/investigacao/resultados${query}`);
      return res.dados || [];
    } catch (error) {
      return [];
    }
  },

  async createResultado(data) {
    const res = await api.post('/investigacao/resultados', data);
    return res.dados;
  },
};

export default investigacaoService;
