import { api } from './api';

export const notificationService = {
  async getNotifications() {
    try {
      const res = await api.get('/notifications');
      if (res && res.dados) {
        return {
          notifications: res.dados,
          total_nao_lidas: res.total_nao_lidas || 0,
        };
      }
      return { notifications: [], total_nao_lidas: 0 };
    } catch (error) {
      console.warn('[notificationService.getNotifications fallback]', error.message);
      const local = localStorage.getItem('ispotec_user_notifications');
      const list = local ? JSON.parse(local) : [];
      const unread = list.filter((n) => !n.lida).length;
      return { notifications: list, total_nao_lidas: unread };
    }
  },

  async markAsRead(notificationId) {
    try {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      return res?.dados;
    } catch (error) {
      console.warn('[notificationService.markAsRead fallback]', error.message);
      const local = localStorage.getItem('ispotec_user_notifications');
      if (local) {
        try {
          const list = JSON.parse(local);
          const updated = list.map((n) => (n.id === notificationId || n._id === notificationId ? { ...n, lida: true } : n));
          localStorage.setItem('ispotec_user_notifications', JSON.stringify(updated));
        } catch (_) {}
      }
      return null;
    }
  },

  async markAllAsRead() {
    try {
      await api.post('/notifications/mark-all-read');
    } catch (error) {
      console.warn('[notificationService.markAllAsRead fallback]', error.message);
      const local = localStorage.getItem('ispotec_user_notifications');
      if (local) {
        try {
          const list = JSON.parse(local);
          const updated = list.map((n) => ({ ...n, lida: true }));
          localStorage.setItem('ispotec_user_notifications', JSON.stringify(updated));
        } catch (_) {}
      }
    }
  },
};

export default notificationService;
