import express from 'express';
import * as authController from '../controllers/auth.controller';
import { validatelogin } from '../validator/auth.validator';

let authRouter = express.Router();

authRouter.post('/login', validatelogin, authController.login);

export default authRouter;
