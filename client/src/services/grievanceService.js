import api from './api';

export const grievanceService = {
  // Lodge a new grievance with optional image attachments (multipart)
  lodgeGrievance: async (formData) => {
    const response = await api.post('/grievances', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get grievances logged by current citizen with filtering, sorting, pagination
  getMyGrievances: async (params = {}) => {
    const response = await api.get('/grievances/my', { params });
    return response.data;
  },

  // Get full grievance details by ID or trackingId
  getGrievanceById: async (id) => {
    const response = await api.get(`/grievances/${id}`);
    return response.data;
  },

  // Public tracking lookup without authentication
  trackGrievance: async (trackingId) => {
    const response = await api.get(`/grievances/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
    return response.data;
  },

  // Get citizen grievance statistics
  getMyStats: async () => {
    const response = await api.get('/grievances/my/stats');
    return response.data;
  },
};

export default grievanceService;
