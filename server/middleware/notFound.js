import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Resource not found at ${req.originalUrl}`);
  next(error);
};
