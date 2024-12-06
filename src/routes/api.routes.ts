import { Router } from 'express';
const apiRouter = Router();
import userRouter from '../routes/user.routes';
import authRouter from './auth.routes';
import recipeRouter from './recipe.routes';

apiRouter.use('/users', userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/recipes', recipeRouter);

export default apiRouter;
