import { api } from './api';

export const ensinoService = {
  // Upload helper for attachments
  async uploadAnexo(file) {
    const formData = new FormData();
    formData.append('ficheiro', file);
    const res = await api.upload('/upload', formData);
    return res.dados; // { url, nome, tamanho }
  },

  // 1. Projetos Educativos
  async getProjetosEducativos() {
    try {
      const res = await api.get('/ensino/projetos-educativos');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getProjetosEducativos]', error.message);
      throw error;
    }
  },

  async createProjetoEducativo(data) {
    const res = await api.post('/ensino/projetos-educativos', data);
    return res.dados;
  },

  async updateProjetoEducativo(id, data) {
    const res = await api.put(`/ensino/projetos-educativos/${id}`, data);
    return res.dados;
  },

  async deleteProjetoEducativo(id) {
    const res = await api.delete(`/ensino/projetos-educativos/${id}`);
    return !!res.sucesso;
  },

  // 2. Projetos Curriculares / UCs
  async getUnidadesCurriculares(curso) {
    try {
      const query = curso && curso !== 'Todos' ? `?curso=${encodeURIComponent(curso)}` : '';
      const res = await api.get(`/ensino/unidades-curriculares${query}`);
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getUnidadesCurriculares]', error.message);
      throw error;
    }
  },

  async createUnidadeCurricular(data) {
    const res = await api.post('/ensino/unidades-curriculares', data);
    return res.dados;
  },

  async updateUnidadeCurricular(id, data) {
    const res = await api.put(`/ensino/unidades-curriculares/${id}`, data);
    return res.dados;
  },

  async deleteUnidadeCurricular(id) {
    const res = await api.delete(`/ensino/unidades-curriculares/${id}`);
    return !!res.sucesso;
  },

  // 3. Bibliotecas
  async getBibliotecas() {
    try {
      const res = await api.get('/ensino/bibliotecas');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getBibliotecas]', error.message);
      throw error;
    }
  },

  async createBiblioteca(data) {
    const res = await api.post('/ensino/bibliotecas', data);
    return res.dados;
  },

  async updateBiblioteca(id, data) {
    const res = await api.put(`/ensino/bibliotecas/${id}`, data);
    return res.dados;
  },

  async deleteBiblioteca(id) {
    const res = await api.delete(`/ensino/bibliotecas/${id}`);
    return !!res.sucesso;
  },

  // 4. Laboratórios
  async getLaboratorios() {
    try {
      const res = await api.get('/ensino/laboratorios');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getLaboratorios]', error.message);
      throw error;
    }
  },

  async createLaboratorio(data) {
    const res = await api.post('/ensino/laboratorios', data);
    return res.dados;
  },

  async updateLaboratorio(id, data) {
    const res = await api.put(`/ensino/laboratorios/${id}`, data);
    return res.dados;
  },

  async deleteLaboratorio(id) {
    const res = await api.delete(`/ensino/laboratorios/${id}`);
    return !!res.sucesso;
  },

  // 5. Eventos Científicos
  async getEventos() {
    try {
      const res = await api.get('/ensino/eventos');
      return res.dados || [];
    } catch (error) {
      console.error('[ensinoService.getEventos]', error.message);
      throw error;
    }
  },

  async createEvento(data) {
    const res = await api.post('/ensino/eventos', data);
    return res.dados;
  },

  async updateEvento(id, data) {
    const res = await api.put(`/ensino/eventos/${id}`, data);
    return res.dados;
  },

  async deleteEvento(id) {
    const res = await api.delete(`/ensino/eventos/${id}`);
    return !!res.sucesso;
  },

  // Legacy Cursos & Unidades
  async getCursos() {
    try {
      const res = await api.get('/ensino/cursos');
      return res.dados || [];
    } catch (error) {
      return [];
    }
  },
  async createCurso(data) {
    const res = await api.post('/ensino/cursos', data);
    return res.dados;
  },
  async updateCurso(id, data) {
    const res = await api.put(`/ensino/cursos/${id}`, data);
    return res.dados;
  },
  async deleteCurso(id) {
    const res = await api.delete(`/ensino/cursos/${id}`);
    return !!res.sucesso;
  },
};

export default ensinoService;
