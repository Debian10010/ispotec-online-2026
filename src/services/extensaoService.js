import { api } from './api';

export const extensaoService = {
  // Upload helper for attachments
  async uploadAnexo(file) {
    const formData = new FormData();
    formData.append('ficheiro', file);
    const res = await api.upload('/upload', formData);
    return res.dados; // { url, nome, tamanho }
  },

  // 1. Centros de Práticas
  async getCentros() {
    try {
      const res = await api.get('/extensao/centros');
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getCentros]', error.message);
      throw error;
    }
  },

  async createCentro(data) {
    const res = await api.post('/extensao/centros', data);
    return res.dados;
  },

  async updateCentro(id, data) {
    const res = await api.put(`/extensao/centros/${id}`, data);
    return res.dados;
  },

  async deleteCentro(id) {
    const res = await api.delete(`/extensao/centros/${id}`);
    return !!res.sucesso;
  },

  // 2. Projetos Comunitários de Extensão
  async getProjetos(centroId) {
    try {
      const query = centroId && centroId !== 'all' ? `?centro_id=${encodeURIComponent(centroId)}` : '';
      const res = await api.get(`/extensao/projetos${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getProjetos]', error.message);
      throw error;
    }
  },

  async createProjeto(data) {
    const res = await api.post('/extensao/projetos', data);
    return res.dados;
  },

  async updateProjeto(id, data) {
    const res = await api.put(`/extensao/projetos/${id}`, data);
    return res.dados;
  },

  async deleteProjeto(id) {
    const res = await api.delete(`/extensao/projetos/${id}`);
    return !!res.sucesso;
  },

  // 3. Parceiros
  async getParceiros(centroId) {
    try {
      const query = centroId && centroId !== 'all' ? `?centro_id=${encodeURIComponent(centroId)}` : '';
      const res = await api.get(`/extensao/parceiros${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[extensaoService.getParceiros]', error.message);
      throw error;
    }
  },

  async createParceiro(data) {
    const res = await api.post('/extensao/parceiros', data);
    return res.dados;
  },

  async updateParceiro(id, data) {
    const res = await api.put(`/extensao/parceiros/${id}`, data);
    return res.dados;
  },

  async deleteParceiro(id) {
    const res = await api.delete(`/extensao/parceiros/${id}`);
    return !!res.sucesso;
  },

  // 4. Actividades (Legacy)
  async getAtividades() {
    try {
      const res = await api.get('/extensao/atividades');
      return res.dados || [];
    } catch (error) {
      return [];
    }
  },

  async createAtividade(data) {
    const res = await api.post('/extensao/atividades', data);
    return res.dados;
  },

  // 5. Biblioteca Digital (Legacy)
  async getBiblioteca() {
    try {
      const res = await api.get('/extensao/biblioteca');
      return res.dados || [];
    } catch (error) {
      return [];
    }
  },

  async addBibliotecaItem(data) {
    const res = await api.post('/extensao/biblioteca', data);
    return res.dados;
  },

  async deleteBibliotecaItem(id) {
    const res = await api.delete(`/extensao/biblioteca/${id}`);
    return !!res.sucesso;
  },
};

export default extensaoService;
