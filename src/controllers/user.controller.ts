import { UserService } from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import { responseStatus } from '../helper/response';
import { IUser } from '../models/User';
import { HTTP_STATUS } from '../utils/statusCodes';
import { msg } from '../helper/messages';

const userService = new UserService();

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract user data from the request body
    const user: IUser = req.body;
    const result = await userService.addUser(user);
    return responseStatus(res, HTTP_STATUS.OK, msg.user.added, result);
  } catch (error: unknown) {
    next(error);
  }
};
