import express from 'express';
import * as recipesController from '../controllers/recipe.controller';
import {
  validateAddRecipe,
  validateUpdateRecipe,
  validateAddRating,
  validateAddComment,
} from '../validator/recipe.validator';
import { validateToken } from '../middleware/authorization/authFunction';
import multer from 'multer';
const upload = multer();

const recipeRouter = express.Router();

recipeRouter.post(
  '/',
  validateAddRecipe,
  validateToken,
  recipesController.addRecipe,
);
recipeRouter.put(
  '/:recipeId',
  validateUpdateRecipe,
  validateToken,
  recipesController.updateRecipe,
);
recipeRouter.get('/:recipeId', validateToken, recipesController.getRecipe);
recipeRouter.get('/', recipesController.getAllRecipes);
recipeRouter.delete(
  '/:recipeId',
  validateToken,
  recipesController.deleteRecipe,
);
recipeRouter.put(
  '/rating/:recipeId',
  validateAddRating,
  validateToken,
  recipesController.addRating,
);
recipeRouter.put(
  '/comment/:recipeId',
  validateAddComment,
  validateToken,
  recipesController.addComment,
);
recipeRouter.post(
  '/upload-image',
  validateToken,
  upload.single('image'),
  recipesController.addImage,
);
recipeRouter.get(
  '/user-feedback/:recipeId',
  validateToken,
  recipesController.checkUserCommentAndRating,
);
export default recipeRouter;
