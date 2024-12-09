import express from 'express';
import * as usersController from '../controllers/user.controller';
import { validateAddUser, validateUpdateUser } from '../validator/user.validator';
import { validateToken } from '../middleware/authorization/authFunction';

let userRouter = express.Router();

userRouter.post('/', validateAddUser, usersController.AddUser);
userRouter.put('/', validateUpdateUser, validateToken, usersController.UpdateUser);
userRouter.get('/:userId', validateToken, usersController.GetUser);
userRouter.get('/', validateToken, usersController.GetAllUsers);
userRouter.delete('/:userId', validateToken, usersController.DeleteUser);

export default userRouter;
