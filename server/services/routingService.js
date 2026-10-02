import { DEPARTMENTS } from '../utils/constants.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';

/**
 * Determine Department code based on grievance category or keywords
 * @param {string} category 
 * @param {string} [suggestedDeptCode]
 * @returns {string} Department code (e.g. 'ROADS', 'WATER', 'OTHER')
 */
export const matchDepartmentCode = (category, suggestedDeptCode = null) => {
  if (suggestedDeptCode) {
    const valid = DEPARTMENTS.some((d) => d.code === suggestedDeptCode.toUpperCase());
    if (valid) return suggestedDeptCode.toUpperCase();
  }

  if (!category || category === 'Not sure' || category === 'Other / Not sure') {
    return 'OTHER';
  }

  const cleanCategory = category.trim().toLowerCase();

  for (const dept of DEPARTMENTS) {
    for (const cat of dept.categories) {
      if (cat.toLowerCase() === cleanCategory || cleanCategory.includes(cat.toLowerCase())) {
        return dept.code;
      }
    }
  }

  // Fallback if no category matches
  return 'OTHER';
};

/**
 * Auto-route a grievance to the best-matching department and lowest-load nodal officer
 * @param {string} category 
 * @param {string} [preferredDeptCode] 
 * @returns {Promise<{ department: Object, assignedOfficer: Object|null }>}
 */
export const routeGrievance = async (category, preferredDeptCode = null) => {
  const targetCode = matchDepartmentCode(category, preferredDeptCode);

  // 1. Fetch department document
  let dept = await Department.findOne({ code: targetCode, isActive: true });
  if (!dept) {
    // Fallback to OTHER department if target code not found in DB
    dept = await Department.findOne({ code: 'OTHER' });
  }

  if (!dept) {
    // If still no department in DB (e.g. not seeded yet), return null
    return { department: null, assignedOfficer: null };
  }

  // 2. Find active officers assigned to this department
  const officers = await User.find({
    role: 'officer',
    department: dept._id,
    isActive: true,
  });

  if (!officers || officers.length === 0) {
    return {
      department: dept,
      assignedOfficer: null,
    };
  }

  // 3. Find officer with the fewest currently open grievances
  const openStatuses = ['Submitted', 'AI Classified', 'Assigned', 'In Progress', 'Awaiting Verification', 'Escalated'];

  let chosenOfficer = officers[0];
  let minWorkload = Infinity;

  for (const officer of officers) {
    const activeCount = await Grievance.countDocuments({
      assignedOfficer: officer._id,
      status: { $in: openStatuses },
    });

    if (activeCount < minWorkload) {
      minWorkload = activeCount;
      chosenOfficer = officer;
    }
  }
  return {
    department: dept,
    assignedOfficer: chosenOfficer,
  };
};

/**
 * Finds the active officer with the lowest open workload in a given department.
 * @param {string|ObjectId} departmentId
 * @returns {Promise<Object|null>}
 */
export const findLeastLoadedOfficer = async (departmentId) => {
  const officers = await User.find({
    role: 'officer',
    department: departmentId,
    isActive: true,
  });

  if (!officers || officers.length === 0) return null;

  const openStatuses = ['Submitted', 'AI Classified', 'Assigned', 'In Progress', 'Awaiting Verification', 'Escalated'];

  let chosenOfficer = officers[0];
  let minWorkload = Infinity;

  for (const officer of officers) {
    const activeCount = await Grievance.countDocuments({
      assignedOfficer: officer._id,
      status: { $in: openStatuses },
    });

    if (activeCount < minWorkload) {
      minWorkload = activeCount;
      chosenOfficer = officer;
    }
  }

  return chosenOfficer;
};

export default {
  matchDepartmentCode,
  routeGrievance,
  findLeastLoadedOfficer,
};
