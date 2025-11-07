import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';
import logger from '../logger.js';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // First, log the original technical error for debugging purposes
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
    },
    req: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    statusCode: err.statusCode || 500,
  }, `Error handled: ${err.message}`);

  // Start sanitizing the error for the user response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unknown error occurred.';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `The requested resource could not be found. The ID may be incorrect.`;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Prepend a generic message to the specific validation errors
    message = "Please check your input: " + Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
      message = `${capitalizedField} is already in use. Please choose a different one.`;
  }
  
  // JWT Errors for invalid or expired tokens
  if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Your session is invalid. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Your session has expired. Please log in again.';
  }

  // For generic 500 errors in production, hide technical details
  if (statusCode === 500 && process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'An unexpected error occurred on our end. Our team has been notified. Please try again later.';
  }

  res.status(statusCode).json({
    message: message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export { notFound, errorHandler };