import express from 'express';
import * as authController from '../controllers/auth.controller';
import { validatelogin } from '../validator/auth.validator';
import { validateToken } from '../middleware/authorization/authFunction';

let authRouter = express.Router();

authRouter.post('/login', validatelogin, authController.login);
authRouter.post('/logout', validateToken, authController.logout);

export default authRouter;
