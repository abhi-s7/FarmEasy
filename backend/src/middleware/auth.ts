import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logger';

// Create logger for auth middleware
const logger = createLogger('auth');

/**
 * Optional Bearer token authentication middleware
 * Checks for Authorization header with Bearer token
 * Only enforces auth if AUTH_TOKEN is set in environment
 */
export const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authToken = process.env.AUTH_TOKEN;
  
  // If AUTH_TOKEN is not set, skip authentication
  if (!authToken) {
    logger.info('Auth check skipped - AUTH_TOKEN not configured', 'checkAuth');
    return next();
  }
  
  logger.info('Checking authentication', 'checkAuth', {
    method: req.method,
    path: req.originalUrl
  });
  
  // Get Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists
  if (!authHeader) {
    logger.warn('Authentication failed - Authorization header missing', 'checkAuth', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip
    });
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }
  
  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Authentication failed - Invalid authorization format', 'checkAuth', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip
    });
    res.status(401).json({ error: 'Invalid authorization format. Expected: Bearer <token>' });
    return;
  }
  
  const token = parts[1];
  
  // Validate token
  if (token !== authToken) {
    logger.warn('Authentication failed - Invalid token', 'checkAuth', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip
    });
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  // Token is valid, proceed
  logger.info('Authentication successful', 'checkAuth', {
    method: req.method,
    path: req.originalUrl
  });
  next();
};