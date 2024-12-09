import Joi from 'joi';
import { validationMiddleware } from '../middleware/validation/validate';

export const validateAddRecipe = validationMiddleware(
  Joi.object({
    title: Joi.string().required(),
    ingredients: Joi.array().items(Joi.string()).required(),
    steps: Joi.array().items(Joi.string()).required(),
    image: Joi.string().optional().allow(null),
    preparationTime: Joi.number().optional().allow(null),
  }),
);

export const validateUpdateRecipe = validationMiddleware(
  Joi.object({
    recipeId: Joi.string().required(),
    title: Joi.string().optional(),
    ingredients: Joi.array().items(Joi.string()).optional(),
    steps: Joi.array().items(Joi.string()).optional(),
    image: Joi.string().optional().allow(null),
    preparationTime: Joi.number().optional().allow(null),
  }),
);
