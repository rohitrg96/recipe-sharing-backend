import { Request, Response, NextFunction } from 'express';
import { responseStatus } from '../../helper/response';
import { CustomError } from '../../utils/customError';
import logger from '../../config/logger';

export const errorHandler = (err: Error | CustomError, req: Request, res: Response, next: NextFunction) => {
  // Check if it's a CustomError, otherwise assign default values
  const statusCode = (err as CustomError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    // Log the full stack trace in production for critical errors
    logger.error(message, { stack: err.stack });
  } else {
    // For non-critical errors, log the error message
    logger.warn(message);
  }

  return responseStatus(res, statusCode, message, null);
};
