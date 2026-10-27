import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../logger/logger';
import { env } from '../../config/env';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (!error.isOperational) {
    logger.error({ err, req }, 'Unexpected Error');
  } else {
    logger.warn({ err }, 'Operational Error');
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let duplicateMsg = 'A record with this value already exists.';
    if (err.keyValue) {
      const keys = Object.keys(err.keyValue);
      const values = Object.values(err.keyValue);
      duplicateMsg = `Duplicate entry: '${values.join(', ')}' already exists for ${keys.join(', ')}. Please use a unique value.`;
    }
    error = new AppError(duplicateMsg, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    stack: env.nodeEnv === 'production' ? null : err.stack,
  });
};
