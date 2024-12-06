import { Router } from 'express';
const apiRouter = Router();
import userRouter from '../routes/user.routes';
import authRouter from './auth.routes';

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
