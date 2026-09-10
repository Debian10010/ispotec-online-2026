import { api } from './api';

export const chatbotService = {
  async getUserConversations() {
    try {
      const res = await api.get('/chatbot/conversations');
      return res.dados || [];
    } catch (error) {
      console.error('[chatbotService.getUserConversations error]', error.message);
      return [];
    }
  },

  async getConversation(convId) {
    try {
      const res = await api.get(`/chatbot/conversations/${convId}`);
      return res.dados || null;
    } catch (error) {
      console.error('[chatbotService.getConversation error]', error.message);
      return null;
    }
  },

  async createConversation(userId, initialQuestion = null) {
    try {
      const res = await api.post('/chatbot/conversations', {
        initialQuestion,
      });
      return res.dados;
    } catch (error) {
      console.error('[chatbotService.createConversation error]', error.message);
      throw error;
    }
  },

  async sendMessage(convId, userId, question) {
    try {
      const res = await api.post('/chatbot/message', {
        conversationId: convId,
        question,
      });
      return res.dados;
    } catch (error) {
      console.error('[chatbotService.sendMessage error]', error.message);
      throw error;
    }
  },
};

export default chatbotService;
