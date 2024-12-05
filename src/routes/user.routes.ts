import express from 'express';
import * as usersController from '../controllers/user.controller';

let router = express.Router();

router.post('/users', usersController.AddUser);

export { router as userRoutes };
