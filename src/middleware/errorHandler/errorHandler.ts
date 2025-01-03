import { Request, Response, NextFunction } from 'express';
import { responseStatus } from '../../helper/response';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Check if it's a CustomError, otherwise assign default values
  const statusCode = 500;
  const message = err.message || 'Internal Server Error';

  return responseStatus(res, statusCode, message, null);
};
