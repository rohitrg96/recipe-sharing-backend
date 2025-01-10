import { AuthService } from '../services/auth.service';
import { NextFunction, Request, Response } from 'express';
import { responseStatus } from '../helper/response';
import { HTTP_STATUS } from '../utils/statusCodes';
import { msg } from '../helper/messages';

const authService = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Destructure the userName and password from the request body
    const { userName, password } = req.body;

    // Call the login method from AuthService and store the result (JWT token)
    const result = await authService.login(userName, password);

    // Return a success response with the result (JWT token)
    return responseStatus(res, HTTP_STATUS.OK, msg.user.loginSuccess, result);
  } catch (error: unknown) {
    // If any error occurs, pass it to the error handler middleware
    next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrieve the JWT token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // Call the logout method from AuthService to blacklist the token
    const result = authService.logout(token!);

    // Return a success response after blacklisting the token
    return responseStatus(res, HTTP_STATUS.OK, msg.user.tokenBlacklisted, result);
  } catch (error: unknown) {
    // If any error occurs, pass it to the error handler middleware
    next(error);
  }
};
