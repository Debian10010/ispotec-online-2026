import { api } from './api';

export const postService = {
  async getGlobalFeed(limit = 10, offset = 0) {
    try {
      const res = await api.get(`/posts?limit=${limit}&offset=${offset}`);
      return res.dados || [];
    } catch (error) {
      console.error('[postService.getGlobalFeed error]', error.message);
      return [];
    }
  },

  async getTotalPostsCount() {
    try {
      const res = await api.get('/posts/count');
      return res.total || 0;
    } catch (error) {
      console.error('[postService.getTotalPostsCount error]', error.message);
      return 0;
    }
  },

  async getPostsByGroup(groupId) {
    try {
      const res = await api.get(`/posts/group/${groupId}`);
      return res.dados || [];
    } catch (error) {
      console.error('[postService.getPostsByGroup error]', error.message);
      return [];
    }
  },

  async createPost({ groupId, titulo, conteudo, tipo }) {
    try {
      const res = await api.post('/posts', {
        groupId: groupId || null,
        titulo,
        conteudo,
        tipo,
      });
      return res.dados;
    } catch (error) {
      console.error('[postService.createPost error]', error.message);
      throw error;
    }
  },

  async addComment(postId, { conteudo }) {
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        conteudo,
      });
      return res.dados;
    } catch (error) {
      console.error('[postService.addComment error]', error.message);
      throw error;
    }
  },
};

export default postService;
