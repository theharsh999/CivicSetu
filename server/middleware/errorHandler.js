import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    const message = `Duplicate value entered for ${fields}. Please use another value.`;
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
    error = new ApiError(400, message);
  }

  // JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  // TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
};
