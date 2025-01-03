import { AuthService } from '../services/auth.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';

let authService = new AuthService();

export const login = (req: Request, res: Response, next: NextFunction) => {
  try {
    return authService.login(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    return authService.logout(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};
