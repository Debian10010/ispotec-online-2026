import { api } from './api';

export const chatService = {
  async getGlobalMessages() {
    try {
      const res = await api.get('/chat/global');
      return res.dados || [];
    } catch (error) {
      console.error('[chatService.getGlobalMessages error]', error.message);
      return [];
    }
  },

  async sendGlobalMessage({ conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null }) {
    try {
      const res = await api.post('/chat/global', {
        conteudo,
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
      });
      return res.dados;
    } catch (error) {
      console.error('[chatService.sendGlobalMessage error]', error.message);
      throw error;
    }
  },

  async getGroupMessages(groupId) {
    try {
      const res = await api.get(`/chat/group/${groupId}`);
      return res.dados || [];
    } catch (error) {
      console.error('[chatService.getGroupMessages error]', error.message);
      return [];
    }
  },

  async sendGroupMessage({ groupId, conteudo, tipo_mensagem = 'texto', ficheiro_path = null, ficheiro_nome = null, ficheiro_tamanho = null }) {
    try {
      const res = await api.post(`/chat/group/${groupId}`, {
        conteudo,
        tipo_mensagem,
        ficheiro_path,
        ficheiro_nome,
        ficheiro_tamanho,
      });
      return res.dados;
    } catch (error) {
      console.error('[chatService.sendGroupMessage error]', error.message);
      throw error;
    }
  },

  async uploadAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('ficheiro', file);
      const res = await api.upload('/chat/upload', formData);
      return res.dados;
    } catch (error) {
      console.error('[chatService.uploadAttachment error]', error.message);
      throw error;
    }
  },
};

export default chatService;
