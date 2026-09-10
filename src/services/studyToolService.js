import { api } from './api';

export const studyToolService = {
  async getAll() {
    try {
      const res = await api.get('/study-tools');
      return res.dados || [];
    } catch (error) {
      console.error('[studyToolService.getAll error]', error.message);
      return [];
    }
  },
};

export default studyToolService;
