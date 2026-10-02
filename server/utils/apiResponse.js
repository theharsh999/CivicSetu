/**
 * Consistent API Response Helper
 * Shape: { success: boolean, message: string, data: any }
 */
export const apiResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data
  });
};
