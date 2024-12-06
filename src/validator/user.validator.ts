import Joi from 'joi';
import { validationMiddleware } from '../middleware/validation/validate';

export const validateAddUser = validationMiddleware(
  Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
);
