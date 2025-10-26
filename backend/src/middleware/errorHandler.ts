import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logger';

// Create logger for error handler
const logger = createLogger('errorHandler');

/**
 * Global error handling middleware
 * Catches any unhandled errors and sends a generic 500 response
 * Must be placed at the end of the middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with full details
  logger.error('Unhandled error caught', 'errorHandler', {
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: err.stack,
    ip: req.ip
  });
  
  // Send generic error response
  res.status(500).json({
    error: 'An unexpected error occurred.'
  });
};