import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Non-blocking error
    }
  }, [user]);

  // Fetch top 6 recent notifications for dropdown
  const fetchLatest = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ page: 1, limit: 6 });
      const items = res?.data?.notifications || [];
      setLatestNotifications(items);
      if (typeof res?.data?.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Non-blocking error
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Polling unread count every 30 seconds
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLatestNotifications([]);
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Optimistic mark single read
  const markAsRead = async (id) => {
    // Optimistic UI update
    setLatestNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      fetchUnreadCount();
    }
  };

  // Optimistic mark all read
  const markAllAsRead = async () => {
    setLatestNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      fetchUnreadCount();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    const target = latestNotifications.find((n) => n._id === id);
    setLatestNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      fetchUnreadCount();
    }
  };

  const value = {
    unreadCount,
    latestNotifications,
    loading,
    fetchUnreadCount,
    fetchLatest,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
