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

export const validateAddRating = validationMiddleware(
  Joi.object({
    recipeId: Joi.string().required(),
    rating: Joi.number().integer().required().min(1).max(5),
  }),
);

export const validateAddComment = validationMiddleware(
  Joi.object({
    recipeId: Joi.string().required(),
    comment: Joi.string().required(),
  }),
);
