import { api } from './api';

export const groupService = {
  async getAllGroups() {
    try {
      const res = await api.get('/groups');
      return res.dados || [];
    } catch (error) {
      console.error('[groupService.getAllGroups error]', error.message);
      return [];
    }
  },

  async getMyGroups() {
    try {
      const res = await api.get('/groups/my');
      return res.dados || [];
    } catch (error) {
      console.error('[groupService.getMyGroups error]', error.message);
      return [];
    }
  },

  async getGroupById(groupId) {
    try {
      const res = await api.get(`/groups/${groupId}`);
      return res.dados || null;
    } catch (error) {
      console.error('[groupService.getGroupById error]', error.message);
      return null;
    }
  },

  async createGroup(data) {
    try {
      const res = await api.post('/groups', data);
      return res.dados;
    } catch (error) {
      console.error('[groupService.createGroup error]', error.message);
      throw error;
    }
  },

  async deleteGroup(groupId) {
    try {
      const res = await api.delete(`/groups/${groupId}`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[groupService.deleteGroup error]', error.message);
      return false;
    }
  },

  async joinGroup(groupId) {
    try {
      const res = await api.post(`/groups/${groupId}/join`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[groupService.joinGroup error]', error.message);
      return false;
    }
  },

  async leaveGroup(groupId) {
    try {
      const res = await api.post(`/groups/${groupId}/leave`);
      return !!res.sucesso;
    } catch (error) {
      console.error('[groupService.leaveGroup error]', error.message);
      return false;
    }
  },

  async isMember(groupId, userId) {
    try {
      const group = await this.getGroupById(groupId);
      if (!group || !group.membros) return false;
      return group.membros.some(m => String(m.id || m._id || m) === String(userId));
    } catch {
      return false;
    }
  },
};

export default groupService;
