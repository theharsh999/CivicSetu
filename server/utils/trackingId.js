import mongoose from 'mongoose';

/**
 * Generate a safe unique tracking ID with format: GRV-YYYY-NNNNNN
 * e.g., GRV-2026-000101
 */
export const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const prefix = `GRV-${year}-`;

  const Grievance = mongoose.model('Grievance');

  // Count total grievances created this year to get sequence base
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const count = await Grievance.countDocuments({
    createdAt: { $gte: startOfYear, $lt: endOfYear },
  });

  let sequence = count + 1;
  let trackingId = `${prefix}${String(sequence).padStart(6, '0')}`;

  // Collision prevention loop
  let exists = await Grievance.exists({ trackingId });
  while (exists) {
    sequence += 1;
    trackingId = `${prefix}${String(sequence).padStart(6, '0')}`;
    exists = await Grievance.exists({ trackingId });
  }

  return trackingId;
};
