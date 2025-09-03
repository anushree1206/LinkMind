/**
 * Global error handling middleware
 * Catches all errors and formats them consistently
 */

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large', 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }

  // Rate limiting errors
  if (err.status === 429) {
    error = new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Internal Server Error';
  const errorCode = error.errorCode || err.errorCode || 'INTERNAL_ERROR';

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: errorCode,
    ...(isDevelopment && {
      stack: err.stack,
      details: err
    })
  });
};

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  Object.keys(errors).forEach(field => {
    formattedErrors[field] = errors[field].message;
  });
  
  return formattedErrors;
};

// Database connection error handler
export const handleDatabaseError = (error) => {
  console.error('Database connection error:', error);
  
  if (error.name === 'MongoNetworkError') {
    throw new AppError('Database connection failed', 500, 'DB_CONNECTION_ERROR');
  }
  
  if (error.name === 'MongoServerSelectionError') {
    throw new AppError('Database server unavailable', 500, 'DB_SERVER_UNAVAILABLE');
  }
  
  throw error;
};

// Request validation error handler
export const handleValidationError = (req, res, next) => {
  const errors = req.validationErrors();
  
  if (errors) {
    const formattedErrors = formatValidationErrors(errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      details: formattedErrors
    });
  }
  
  next();
};

export default {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  formatValidationErrors,
  handleDatabaseError,
  handleValidationError
};
