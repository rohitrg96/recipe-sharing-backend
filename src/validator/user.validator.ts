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

export const validateUpdateUser = validationMiddleware(
  Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().when('email', {
      is: Joi.exist(),
      then: Joi.required(), // `Password` is required when `email` exists
      otherwise: Joi.optional(), // `Password` is optional when `email` is not provided
    }),
    newPassword: Joi.string()
      .when('password', {
        is: Joi.exist(),
        then: Joi.required(), // `newPassword` is required when `password` exists
        otherwise: Joi.optional(), // `newPassword` is optional when `password` is not provided
      })
      .when('email', {
        is: Joi.exist(),
        then: Joi.required(), // `newPassword` is required when `email` exists
        otherwise: Joi.optional(), // `newPassword` is optional when `email` is not provided
      }),
  }),
);
