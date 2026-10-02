import { analyzeGrievance, findSimilarGrievances } from '../services/ai/aiService.js';
import { apiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Analyze grievance text (preview endpoint for live citizen form & officer tools)
 * @route   POST /api/ai/analyze
 * @access  Private (Authenticated users)
 */
export const analyzeComplaint = asyncHandler(async (req, res) => {
  const { title = '', description = '', location = {}, excludeId = null } = req.body;

  if (!description || description.trim().length < 5) {
    throw new ApiError(400, 'Description must be at least 5 characters long for AI analysis.');
  }

  // 1. Run deterministic rule-based NLP engine
  const analysis = await analyzeGrievance({
    title: title.trim(),
    description: description.trim(),
    location,
  });

  // 2. Proactively find potential duplicates (nearby in same dept within 30 days)
  let similarGrievances = [];
  try {
    similarGrievances = await findSimilarGrievances({
      title: title.trim(),
      description: description.trim(),
      departmentCode: analysis.department,
      coordinates: location?.coordinates,
      excludeId,
    });
  } catch (simErr) {
    // Non-blocking: If duplicate search encounters an error, return empty array
    console.error('Non-blocking error finding similar complaints:', simErr.message);
  }

  return apiResponse(res, 200, 'AI analysis completed successfully', {
    analysis,
    similarGrievances,
  });
});

/**
 * @desc    Find duplicate/similar complaints within proximity
 * @route   GET /api/ai/similar
 * @access  Private
 */
export const getSimilarComplaints = asyncHandler(async (req, res) => {
  const { title = '', description = '', departmentCode, lat, lng, excludeId } = req.query;

  const coordinates = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

  const similarGrievances = await findSimilarGrievances({
    title,
    description,
    departmentCode,
    coordinates,
    excludeId,
  });

  return apiResponse(res, 200, 'Similar grievances retrieved', {
    similarGrievances,
    count: similarGrievances.length,
  });
});

export default {
  analyzeComplaint,
  getSimilarComplaints,
};
