import winston from 'winston';
import path from 'path';

// Custom format: timestamp first, then module, function, level, message
const customFormat = winston.format.printf(({ timestamp, level, module, func, message, ...meta }) => {
  const moduleInfo = module ? `[${module}${func ? `:${func}` : ''}]` : '';
  let msg = `${timestamp} ${moduleInfo} [${level}] ${message}`;
  
  // Add metadata if present (excluding our custom fields)
  const { logger, ...restMeta } = meta;
  if (Object.keys(restMeta).length > 0) {
    msg += ` ${JSON.stringify(restMeta)}`;
  }
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console transport - colored
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    // File transport - same format, no colors
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs', `${new Date().toISOString().split('T')[0]}.log`),
      format: customFormat
    })
  ]
});

/**
 * Create a child logger with module name
 * @param moduleName - The module/class name (e.g., 'server', 'store', 'auth')
 * @returns Logger object with info, error, warn methods that accept function name
 */
export const createLogger = (moduleName: string) => {
  return {
    info: (message: string, funcNameOrMeta?: string | object, meta?: object) => {
      if (typeof funcNameOrMeta === 'string') {
        logger.info(message, { module: moduleName, func: funcNameOrMeta, ...meta });
      } else {
        logger.info(message, { module: moduleName, ...funcNameOrMeta });
      }
    },
    error: (message: string, funcNameOrMeta?: string | object, meta?: object) => {
      if (typeof funcNameOrMeta === 'string') {
        logger.error(message, { module: moduleName, func: funcNameOrMeta, ...meta });
      } else {
        logger.error(message, { module: moduleName, ...funcNameOrMeta });
      }
    },
    warn: (message: string, funcNameOrMeta?: string | object, meta?: object) => {
      if (typeof funcNameOrMeta === 'string') {
        logger.warn(message, { module: moduleName, func: funcNameOrMeta, ...meta });
      } else {
        logger.warn(message, { module: moduleName, ...funcNameOrMeta });
      }
    }
  };
};

export default logger;