/**
 * CivicSetu AI Analysis Service
 *
 * Single centralized entry point for automated grievance categorization,
 * priority assessment, urgency detection, and geospatial duplicate identification.
 *
 * PROVIDER CONTRACT:
 * Every provider module MUST implement:
 *   analyze(input: { title: string, description: string, location: Object }) => Promise<{
 *     department: string,       // Valid DEPARTMENTS code (e.g. 'ROADS', 'WATER')
 *     category: string,         // Standard category name from DEPARTMENTS
 *     priority: string,         // 'Low' | 'Medium' | 'High' | 'Critical'
 *     confidence: number,       // Believable probability score (0.0 to 1.0)
 *     keywords: string[],       // Array of salient keywords/phrases detected
 *     urgencySignals: string[], // Heuristic triggers explaining priority
 *     needsManualReview: boolean,// Flag when confidence is below threshold
 *     summary: string,          // Short one-line summary
 *     reasoning: string,        // Transparent explanation of decision
 *     alternatives: Array<{ department: string, category: string, confidence: number }>,
 *     provider: string,         // e.g. 'rule-based-nlp-v1'
 *     isMock: boolean           // Flag identifying prototype rule engine
 *   }>
 */

import ruleBasedProvider from './providers/ruleBasedProvider.js';
import llmProviderStub from './providers/llmProviderStub.js';
import { DEPARTMENTS, PRIORITIES, PRIORITY_LIST } from '../../utils/constants.js';
import Grievance from '../../models/Grievance.js';
import Department from '../../models/Department.js';

// Provider Registry
const PROVIDERS = {
  rule: ruleBasedProvider,
  'rule-based-nlp-v1': ruleBasedProvider,
  llm: llmProviderStub,
  gemini: llmProviderStub,
};

/**
 * Validates and normalizes raw provider analysis output to guarantee
 * adherence to platform constants and schema requirements.
 */
const validateAndNormalizeOutput = (rawOutput) => {
  const validDeptCodes = DEPARTMENTS.map((d) => d.code);
  let department = rawOutput.department?.toUpperCase();
  if (!validDeptCodes.includes(department)) {
    department = 'OTHER';
  }

  const deptObj = DEPARTMENTS.find((d) => d.code === department);
  const validCategories = deptObj ? deptObj.categories : [];

  let category = rawOutput.category;
  if (!validCategories.includes(category)) {
    category = validCategories[0] || 'General Complaint';
  }

  let priority = rawOutput.priority;
  if (!PRIORITY_LIST.includes(priority)) {
    priority = PRIORITIES.MEDIUM;
  }

  let confidence = Number(rawOutput.confidence);
  if (isNaN(confidence) || confidence <= 0) {
    confidence = 0.55;
  }
  confidence = Math.min(0.96, Math.max(0.50, Number(confidence.toFixed(2))));

  return {
    department,
    category,
    priority,
    confidence,
    keywords: Array.isArray(rawOutput.keywords) ? rawOutput.keywords : [],
    urgencySignals: Array.isArray(rawOutput.urgencySignals) ? rawOutput.urgencySignals : [],
    needsManualReview: Boolean(rawOutput.needsManualReview || confidence < 0.70),
    summary: rawOutput.summary || `${category} reported`,
    reasoning: rawOutput.reasoning || `Classified as ${category} under ${department}`,
    alternatives: Array.isArray(rawOutput.alternatives) ? rawOutput.alternatives : [],
    provider: rawOutput.provider || 'rule-based-nlp-v1',
    isMock: rawOutput.isMock ?? true,
    analyzedAt: new Date(),
  };
};

/**
 * Central analysis entry point. Selects provider via env, executes analysis,
 * and transparently falls back to rule-based engine if external provider fails.
 *
 * @param {Object} input - { title, description, location }
 * @returns {Promise<Object>} Normalized analysis result
 */
export const analyzeGrievance = async ({ title = '', description = '', location = {} }) => {
  const providerKey = (process.env.AI_PROVIDER || 'rule').toLowerCase();
  const provider = PROVIDERS[providerKey] || ruleBasedProvider;

  try {
    const rawOutput = await provider.analyze({ title, description, location });
    return validateAndNormalizeOutput(rawOutput);
  } catch (error) {
    // Graceful fallback to deterministic rule-based analyzer
    if (provider !== ruleBasedProvider) {
      console.warn(`[AI Engine] Provider '${providerKey}' failed. Falling back to rule-based analyzer:`, error.message);
      const fallbackOutput = await ruleBasedProvider.analyze({ title, description, location });
      return validateAndNormalizeOutput(fallbackOutput);
    }
    throw error;
  }
};

/**
 * Calculates Haversine distance in meters between two lat/lng pairs
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Computes Jaccard word token similarity between two strings (0.0 to 1.0)
 */
export const calculateTokenSimilarity = (str1 = '', str2 = '') => {
  const getTokens = (s) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const setA = getTokens(str1);
  const setB = getTokens(str2);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : Number((intersection / union).toFixed(2));
};

/**
 * Finds open grievances within ~500m in the same department with similar keywords
 * logged in the past 30 days.
 *
 * @param {Object} params - { title, description, departmentCode, coordinates, excludeId }
 * @returns {Promise<Array>} Up to 3 duplicate candidate matches
 */
export const findSimilarGrievances = async ({
  title = '',
  description = '',
  departmentCode = null,
  coordinates = null,
  excludeId = null,
}) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const openStatuses = ['Submitted', 'AI Classified', 'Assigned', 'In Progress', 'Awaiting Verification', 'Escalated'];

    const query = {
      status: { $in: openStatuses },
      createdAt: { $gte: thirtyDaysAgo },
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    if (departmentCode) {
      const dept = await Department.findOne({ code: departmentCode.toUpperCase() });
      if (dept) {
        query.department = dept._id;
      }
    }

    const candidates = await Grievance.find(query)
      .populate('department', 'name code color')
      .select('trackingId title description category status priority location createdAt')
      .limit(25);

    const inputCombined = `${title} ${description}`;
    const matches = [];

    for (const item of candidates) {
      const itemCombined = `${item.title} ${item.description}`;
      const textSimilarity = calculateTokenSimilarity(inputCombined, itemCombined);

      let distanceMeters = null;
      if (
        coordinates?.lat &&
        coordinates?.lng &&
        item.location?.coordinates?.lat &&
        item.location?.coordinates?.lng
      ) {
        distanceMeters = calculateDistanceMeters(
          coordinates.lat,
          coordinates.lng,
          item.location.coordinates.lat,
          item.location.coordinates.lng
        );
      }

      // Check proximity criteria: within 500m AND text similarity >= 0.25, OR very high text similarity >= 0.50
      const isNearby = distanceMeters !== null && distanceMeters <= 500;
      const isSimilar = textSimilarity >= 0.25;

      if ((isNearby && isSimilar) || textSimilarity >= 0.45) {
        matches.push({
          _id: item._id,
          trackingId: item.trackingId,
          title: item.title,
          category: item.category,
          department: item.department?.name,
          departmentCode: item.department?.code,
          status: item.status,
          priority: item.priority,
          distanceMeters: isNearby ? distanceMeters : null,
          similarityScore: textSimilarity,
          createdAt: item.createdAt,
        });
      }
    }

    // Sort by highest text similarity & closest proximity
    matches.sort((a, b) => b.similarityScore - a.similarityScore);
    return matches.slice(0, 3);
  } catch (error) {
    console.error('Error finding similar grievances:', error);
    return [];
  }
};

export default {
  analyzeGrievance,
  findSimilarGrievances,
  calculateDistanceMeters,
  calculateTokenSimilarity,
};
