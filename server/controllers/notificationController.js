import Notification from '../models/Notification.js';
import { apiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Get paginated list of notifications for the authenticated user
 * Supports ?page=1&limit=20&unread=true
 */
export const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.unread === 'true') {
      query.isRead = false;
    }
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'grievance',
          select: 'trackingId title status priority department category',
          populate: { path: 'department', select: 'name code' }
        })
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, isRead: false })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return apiResponse(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current unread notification count for authenticated user
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return apiResponse(res, 200, 'Unread count retrieved', { count });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found or access denied');
    }

    return apiResponse(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all unread notifications as read for authenticated user
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return apiResponse(res, 200, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      throw ApiError.notFound('Notification not found or access denied');
    }

    return apiResponse(res, 200, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};
