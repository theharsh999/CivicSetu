import api from './api';

export const adminService = {
  // Executive Overview & Analytics
  async getOverview() {
    const res = await api.get('/admin/overview');
    return res.data?.data || res.data;
  },

  async getAnalytics(range = '30d') {
    const res = await api.get('/admin/analytics', { params: { range } });
    return res.data?.data || res.data;
  },

  // Grievance Management
  async getAllGrievances(params = {}) {
    const res = await api.get('/admin/grievances', { params });
    return res.data?.data || res.data;
  },

  async getGrievancesMap(params = {}) {
    const res = await api.get('/admin/grievances/map', { params });
    return res.data?.data || res.data;
  },

  async reassignGrievance(id, data) {
    const res = await api.patch(`/admin/grievances/${id}/reassign`, data);
    return res.data?.data || res.data;
  },

  async updateGrievanceStatus(id, data) {
    const res = await api.patch(`/admin/grievances/${id}/status`, data);
    return res.data?.data || res.data;
  },

  async updateGrievancePriority(id, data) {
    const res = await api.patch(`/admin/grievances/${id}/priority`, data);
    return res.data?.data || res.data;
  },

  // Department Management
  async getDepartments() {
    const res = await api.get('/admin/departments');
    return res.data?.data || res.data;
  },

  async createDepartment(data) {
    const res = await api.post('/admin/departments', data);
    return res.data?.data || res.data;
  },

  async updateDepartment(id, data) {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data?.data || res.data;
  },

  // User Management
  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data?.data || res.data;
  },

  async createUser(data) {
    const res = await api.post('/admin/users', data);
    return res.data?.data || res.data;
  },

  async updateUser(id, data) {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data?.data || res.data;
  },
};

export default adminService;
