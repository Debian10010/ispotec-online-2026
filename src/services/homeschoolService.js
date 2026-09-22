import { api } from './api';

export const homeschoolService = {
  async getPercursos() {
    try {
      const res = await api.get('/homeschool/percursos');
      return res.dados || [];
    } catch (error) {
      console.error('[homeschoolService.getPercursos error]', error.message);
      return [];
    }
  },

  async createPercurso(data) {
    try {
      const res = await api.post('/homeschool/percursos', data);
      return res.dados;
    } catch (error) {
      console.error('[homeschoolService.createPercurso error]', error.message);
      throw error;
    }
  },

  async getMiniCursos() {
    try {
      const res = await api.get('/homeschool/minicursos');
      return res.dados || [];
    } catch (error) {
      console.error('[homeschoolService.getMiniCursos error]', error.message);
      return [];
    }
  },

  async createMiniCurso(data) {
    try {
      const res = await api.post('/homeschool/minicursos', data);
      return res.dados;
    } catch (error) {
      console.error('[homeschoolService.createMiniCurso error]', error.message);
      throw error;
    }
  },

  async getMicroCredenciais() {
    try {
      const res = await api.get('/homeschool/microcredenciais');
      return res.dados || [];
    } catch (error) {
      console.error('[homeschoolService.getMicroCredenciais error]', error.message);
      return [];
    }
  },

  async createMicroCredencial(data) {
    try {
      const res = await api.post('/homeschool/microcredenciais', data);
      return res.dados;
    } catch (error) {
      console.error('[homeschoolService.createMicroCredencial error]', error.message);
      throw error;
    }
  },

  async getConteudos() {
    try {
      const res = await api.get('/homeschool/conteudos');
      return res.dados || [];
    } catch (error) {
      console.error('[homeschoolService.getConteudos error]', error.message);
      return [];
    }
  },

  async getAtividades() {
    try {
      const res = await api.get('/homeschool/atividades');
      return res.dados || [];
    } catch (error) {
      console.error('[homeschoolService.getAtividades error]', error.message);
      return [];
    }
  }
};

export default homeschoolService;
