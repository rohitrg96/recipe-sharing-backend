import Joi from 'joi';
import { validationMiddleware } from '../middleware/validation/validate';

export const validatelogin = validationMiddleware(
  Joi.object({
    userName: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
);
