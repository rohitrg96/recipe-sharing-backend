import { UserService } from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import { responseStatus } from '../helper/response';

let userService = new UserService();

export const AddUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    return userService.addUser(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const UpdateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    return userService.updateUser(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const GetAllUsers = (req: Request, res: Response, next: NextFunction) => {
  try {
    return userService.getAllUsers(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const GetUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    return userService.getUser(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};

export const DeleteUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    return userService.deleteUser(req, res, next);
  } catch (error: any) {
    return responseStatus(res, 500, error.message, error);
  }
};
