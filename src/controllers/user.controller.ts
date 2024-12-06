import { UserService } from '../services/user.service';
import { Request, Response } from 'express';
import { responseStatus } from '../helper/response';
import { userValidationSchema } from '../schemas/userSchema';

let userService = new UserService();

export const AddUser = (req: Request, res: Response) => {
  try {
    return userService.addUser(req, res);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};
