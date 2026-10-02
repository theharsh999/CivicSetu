import api from './api.js';

export const notificationService = {
  /**
   * Fetch paginated user notifications
   */
  async getNotifications(params = {}) {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  /**
   * Get unread notifications count (used for polling badge)
   */
  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data?.data?.count || 0;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export default notificationService;
