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

/**
 * Determines final category, department, priority, SLA due date, and officer assignment
 * combining citizen input with AI analysis results per platform governance rules.
 *
 * Rules:
 * 1. If citizen selected "Not sure" -> Always route using AI analysis result (source: 'ai').
 * 2. If AI confidence >= 0.75 and citizen choice disagrees -> AI overrides (source: 'ai').
 * 3. Else -> Respect citizen's choice (source: 'citizen').
 * 4. Priority and SLA target are calibrated from the AI analysis.
 *
 * @param {Object} params
 * @param {string} params.citizenCategory
 * @param {string} [params.citizenDeptCode]
 * @param {string} [params.citizenPriority]
 * @param {Object} params.aiAnalysis
 * @returns {Promise<Object>}
 */
export const routeGrievanceWithAI = async ({
  citizenCategory = '',
  citizenDeptCode = null,
  citizenPriority = 'Medium',
  aiAnalysis = {},
}) => {
  const isNotSure =
    !citizenCategory ||
    citizenCategory === 'Not sure' ||
    citizenCategory === 'Other / Not sure';

  const citizenDept = citizenDeptCode || matchDepartmentCode(citizenCategory);

  const disagrees =
    !isNotSure &&
    (citizenCategory.trim().toLowerCase() !== aiAnalysis.category?.toLowerCase() ||
      citizenDept !== aiAnalysis.department);

  let finalCategory = citizenCategory;
  let finalDeptCode = citizenDept;
  let categorySource = 'citizen';
  let routingReason = '';

  if (isNotSure) {
    finalCategory = aiAnalysis.category || 'General Complaint';
    finalDeptCode = aiAnalysis.department || 'OTHER';
    categorySource = 'ai';
    routingReason = 'Auto-routed via AI classification (citizen opted for automated detection)';
  } else if (aiAnalysis.confidence >= 0.75 && disagrees) {
    finalCategory = aiAnalysis.category;
    finalDeptCode = aiAnalysis.department;
    categorySource = 'ai';
    routingReason = `AI confidence (${Math.round(aiAnalysis.confidence * 100)}%) exceeded override threshold (75%)`;
  } else {
    finalCategory = citizenCategory;
    finalDeptCode = citizenDept || aiAnalysis.department || 'OTHER';
    categorySource = 'citizen';
    routingReason = 'Citizen selection respected';
  }

  // Priority estimation: AI priority takes precedence when confidence is acceptable
  const finalPriority =
    aiAnalysis.confidence >= 0.65
      ? aiAnalysis.priority || 'Medium'
      : citizenPriority || 'Medium';

  // Compute SLA target
  const hours = SLA_HOURS[finalPriority] || 96;
  const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  // Department lookup
  let deptDoc = await Department.findOne({ code: finalDeptCode, isActive: true });
  if (!deptDoc) {
    deptDoc = await Department.findOne({ code: 'OTHER' });
  }

  // Officer assignment
  const assignedOfficer = deptDoc ? await findLeastLoadedOfficer(deptDoc._id) : null;

  return {
    department: deptDoc,
    departmentCode: finalDeptCode,
    category: finalCategory,
    categorySource,
    priority: finalPriority,
    dueAt,
    assignedOfficer,
    routingReason,
  };
};

export default {
  matchDepartmentCode,
  routeGrievance,
  findLeastLoadedOfficer,
  routeGrievanceWithAI,
};
