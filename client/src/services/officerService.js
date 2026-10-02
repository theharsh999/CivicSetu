import api from './api';

export const officerService = {
  /**
   * Get officer grievances with scope ('mine' | 'department'), search, filters, pagination
   */
  getOfficerGrievances: (params = {}) => {
    return api.get('/officer/grievances', { params });
  },

  /**
   * Get officer & department statistics for workbench & dashboard
   */
  getOfficerStats: (params = {}) => {
    return api.get('/officer/stats', { params });
  },

  /**
   * Fetch all officers in the department for reassignment
   */
  getDepartmentOfficers: (params = {}) => {
    return api.get('/officer/department-officers', { params });
  },

  /**
   * Update grievance status via workflow engine
   */
  updateGrievanceStatus: (id, { status, note }) => {
    return api.patch(`/officer/grievances/${id}/status`, { status, note });
  },

  /**
   * Add remark (internal or public)
   */
  addRemark: (id, { text, isInternal }) => {
    return api.post(`/officer/grievances/${id}/remarks`, { text, isInternal });
  },

  /**
   * Reassign grievance to an officer in the same department
   */
  reassignOfficer: (id, { officerId, note }) => {
    return api.patch(`/officer/grievances/${id}/assign`, { officerId, note });
  },

  /**
   * Correct category and optionally department
   */
  correctCategory: (id, { category, departmentId, note }) => {
    return api.patch(`/officer/grievances/${id}/category`, { category, departmentId, note });
  },

  /**
   * Resolve grievance with summary and up to 3 proof images (multipart)
   */
  resolveGrievance: (id, formData) => {
    return api.post(`/officer/grievances/${id}/resolve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default officerService;
