import express from 'express';
import * as usersController from '../controllers/user.controller';
import { validateAddUser } from '../validator/user.validator';

let userRouter = express.Router();

userRouter.post('/', validateAddUser, usersController.AddUser);

export default userRouter;
