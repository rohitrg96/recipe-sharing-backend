import { Router } from 'express';
const apiRouter = Router();
import userRouter from '../routes/user.routes';

apiRouter.use('/users', userRouter);

export default apiRouter;
