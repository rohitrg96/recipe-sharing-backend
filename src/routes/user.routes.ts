import express from 'express';
import * as usersController from '../controllers/user.controller';
import { validateAddUser } from '../validator/user.validator';
const userRouter = express.Router();

userRouter.post('/', validateAddUser, usersController.addUser);

export default userRouter;
