import api from './api';

export const aiService = {
  /**
   * Analyze complaint description/title in real-time
   * @param {Object} data { title, description, location, excludeId }
   */
  async analyze(data) {
    const response = await api.post('/ai/analyze', data);
    return response.data?.data || response.data;
  },

  /**
   * Get duplicate or similar nearby open complaints
   * @param {Object} params { title, description, departmentCode, lat, lng, excludeId }
   */
  async getSimilar(params) {
    const response = await api.get('/ai/similar', { params });
    return response.data?.data || response.data;
  },
};

export default aiService;
